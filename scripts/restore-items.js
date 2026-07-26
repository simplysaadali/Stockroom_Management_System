const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../data/items.json');

const items = require('../data/exports/items.json'); // the file you already saved earlier

fs.writeFileSync(targetFile, JSON.stringify(items, null, 2), 'utf8');
console.log(`Wrote ${items.length} items to ${targetFile}`);    