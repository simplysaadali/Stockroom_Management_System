const express = require('express');
const Item = require('../models/Item');
const router = express.Router();

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
    const items = await Item.find().sort({ createdAt: 1 }).lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load items' });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Item.create({
      name: ensureString(req.body.name),
      qty: ensureQty(req.body.qty),
      price: ensurePrice(req.body.price)
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Could not create item' });
  }
});

router.put('/', async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Items must be an array' });
    const items = req.body.map(item => ({
      _id: item._id,
      name: ensureString(item.name),
      qty: ensureQty(item.qty),
      price: ensurePrice(item.price),
      createdAt: item.createdAt,
      updatedAt: new Date()
    }));
    await Item.deleteMany({});
    const saved = items.length ? await Item.insertMany(items) : [];
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Could not save items' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, {
      ...(req.body.name !== undefined && { name: ensureString(req.body.name) }),
      ...(req.body.qty !== undefined && { qty: ensureQty(req.body.qty) }),
      ...(req.body.price !== undefined && { price: ensurePrice(req.body.price) })
    }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Could not update item' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Item.deleteMany({});
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not clear items' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete item' });
  }
});

module.exports = router;