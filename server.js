require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Serve data folder for default items JSON
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use('/api/items', itemsRouter);
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'items.html')));

async function startServer() {
	await mongoose.connect(process.env.MONGODB_URI);
	console.log('Connected to MongoDB');
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer().catch(err => {
	console.error('Failed to connect to MongoDB:', err.message);
	process.exit(1);
});