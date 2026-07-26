const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  qty:   { type: Number, required: true, default: 0, min: 0 },
  price: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);