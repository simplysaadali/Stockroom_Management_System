require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const path = require('path');
const Item = require('../models/Item');

async function run() {
  const data = require(path.join(__dirname, '../data/exports/items.json'));

  console.log(`Found ${data.length} items to import`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clean the incoming data to match the schema (name, qty, price only)
  const cleaned = data.map(item => ({
    name: item.name,
    qty: item.qty ?? 0,
    price: item.price ?? 0
  }));

  const result = await Item.insertMany(cleaned);
  console.log(`Inserted ${result.length} items into the database`);

  await mongoose.disconnect();
  console.log('Done');
}

run().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});