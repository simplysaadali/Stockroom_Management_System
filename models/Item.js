const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  _id: { type: String, default: () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}` },
  name:  { type: String, required: true, trim: true },
  qty:   { type: Number, required: true, default: 0, min: 0 },
  price: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);