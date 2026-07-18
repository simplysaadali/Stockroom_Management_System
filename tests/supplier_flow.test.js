const assert = require('assert');
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'public', 'script.js');
const content = fs.readFileSync(scriptPath, 'utf8');

assert.ok(content.includes('function findSupplierLastCost'), 'findSupplierLastCost helper is missing');
assert.ok(content.includes('function findBuyingPrice'), 'findBuyingPrice helper is missing');
assert.ok(content.includes('function clearAllSalesHistory'), 'clearAllSalesHistory helper is missing');
assert.ok(content.includes('function getMissingBuyingPriceItems'), 'getMissingBuyingPriceItems helper is missing');
assert.ok(content.includes('function clearAllCustomerProfiles'), 'clearAllCustomerProfiles helper is missing');
assert.ok(content.includes('clearCustomersBtn'), 'clear customers button hook is missing');
assert.ok(content.includes('supplierNewBillBtn'), 'supplier bill UI hook is missing');
assert.ok(content.includes('profitMissingPricesSection'), 'profit missing-prices section is missing');

console.log('Basic supplier/profit script checks passed');
