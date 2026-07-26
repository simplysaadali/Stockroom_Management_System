const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const dataFile = path.resolve(__dirname, '..', 'data', 'items.json');

async function ensureDataFile() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch (err) {
    await fs.writeFile(dataFile, '[]', 'utf8');
  }
}

async function loadItems() {
  await ensureDataFile();
  const json = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(json || '[]');
}

async function saveItems(items) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(items, null, 2), 'utf8');
}

function ensureString(value, fallback = 'Untitled item') {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

function ensureQty(value) {
  const qty = Number(value);
  return Number.isFinite(qty) && qty >= 0 ? qty : 0;
}

function ensurePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : 0;
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

router.get('/', async (req, res) => {
  try {
    const items = await loadItems();
    res.json(items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load items' });
  }
});

router.post('/', async (req, res) => {
  try {
    const items = await loadItems();
    const item = {
      _id: generateId(),
      name: ensureString(req.body.name),
      qty: ensureQty(req.body.qty),
      price: ensurePrice(req.body.price),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(item);
    await saveItems(items);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Could not create item' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const items = await loadItems();
    const index = items.findIndex(item => item._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });

    const existing = items[index];
    const updated = {
      ...existing,
      name: req.body.name !== undefined ? ensureString(req.body.name, existing.name) : existing.name,
      qty: req.body.qty !== undefined ? ensureQty(req.body.qty) : existing.qty,
      price: req.body.price !== undefined ? ensurePrice(req.body.price) : (existing.price !== undefined ? existing.price : 0),
      updatedAt: new Date().toISOString()
    };

    items[index] = updated;
    await saveItems(items);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Could not update item' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await saveItems([]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not clear items' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const items = await loadItems();
    const nextItems = items.filter(item => item._id !== req.params.id);
    await saveItems(nextItems);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete item' });
  }
});

module.exports = router;