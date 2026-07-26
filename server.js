require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));