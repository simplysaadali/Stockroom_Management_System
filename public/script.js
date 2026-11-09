/* ==========================================================
   Stockroom SPA — stores inventory, orders, and receipts in browser localStorage.
   ========================================================== */

const ITEMS_STORAGE_KEY = 'stockroom-items-v1';
const ORDERS_STORAGE_KEY = 'stockroom-receipts-v1';
const ACTIVE_ORDER_STORAGE_KEY = 'stockroom-active-order-v1';
const CUSTOMERS_STORAGE_KEY = 'stockroom-customers-v1';
const PREP_CLEARED_STORAGE_KEY = 'stockroom-prep-cleared-at-v1';
const SUPPLIERS_STORAGE_KEY = 'stockroom-suppliers-v1';
const EXPENSES_STORAGE_KEY = 'stockroom-expenses-v1';
const MANUAL_PRICES_STORAGE_KEY = 'stockroom-manual-buying-prices-v1';
const LOW_STOCK = 12;

let items = [];
let orders = [];
let activeOrder = null;
let customers = [];
let prepClearedAt = null;
let suppliers = [];
let expenses = [];
let manualBuyingPrices = {};
let selectedExpenseListId = null;
let selectedSupplierId = null;
let activeSupplierBillDraft = null;
let editingSupplierBillId = null;
let modalContext = 'customer';
let currentTabId = 'items';

// ---------- DOM refs ----------
// Items tab
const itemList  = document.getElementById('itemList');
const statCount = document.getElementById('statCount');
const statTotal = document.getElementById('statTotal');
const statLow   = document.getElementById('statLow');
const addBtn    = document.getElementById('addBtn');
const newName   = document.getElementById('new-name');
const newQty    = document.getElementById('new-qty');

// Orders tab
const custNameInput = document.getElementById('cust-name');
const startOrderBtn = document.getElementById('startOrderBtn');
const recentOrdersList = document.getElementById('recentOrdersList');
const custSuggestions = document.getElementById('cust-suggestions');

// Placed Items tab
const placedItemsList = document.getElementById('placedItemsList');

// Billing tab
const billingActiveWrap = document.getElementById('billing-active-wrap');
const billingEmptyWrap = document.getElementById('billing-empty-wrap');
const billingBuyerName = document.getElementById('billing-buyer-name');
const cancelOrderBtn = document.getElementById('cancelOrderBtn');
const billingSearch = document.getElementById('billing-search');
const billingAddCustomBtn = document.getElementById('billingAddCustomBtn');
const searchSuggestions = document.getElementById('search-suggestions');
const billingItemsList = document.getElementById('billingItemsList');
const billingTotalVal = document.getElementById('billing-total-val');
const finalizeOrderBtn = document.getElementById('finalizeOrderBtn');
const goToOrdersBtn = document.getElementById('goToOrdersBtn');

// Receipts tab
const receiptsContainer = document.getElementById('receiptsContainer');

// Load Lists tab
const prepListContainer = document.getElementById('prepListContainer');
const clearPrepListBtn = document.getElementById('clearPrepListBtn');

// Customers tab
const customersListContainer = document.getElementById('customersListContainer');

// Suppliers tab DOM elements
const supNewName = document.getElementById('sup-new-name');
const supNewContact = document.getElementById('sup-new-contact');
const supAddBtn = document.getElementById('sup-add-btn') || document.getElementById('supAddBtn');
const suppliersListContainer = document.getElementById('suppliersListContainer');
const supplierListView = document.getElementById('supplier-list-view');
const supplierDetailView = document.getElementById('supplier-detail-view');
const supplierBackBtn = document.getElementById('supplierBackBtn');
const supplierDetailName = document.getElementById('supplier-detail-name');
const supplierDetailContact = document.getElementById('supplier-detail-contact');
const supplierDetailBilled = document.getElementById('supplier-detail-billed');
const supplierDetailPaid = document.getElementById('supplier-detail-paid');
const supplierDetailBalance = document.getElementById('supplier-detail-balance');
const supplierPayAmount = document.getElementById('supplier-pay-amount');
const supplierPayBtn = document.getElementById('supplierPayBtn');
const supplierNewBillBtn = document.getElementById('supplierNewBillBtn');
const supplierBillDraftWrap = document.getElementById('supplier-bill-draft-wrap');
const supplierDraftTitle = document.getElementById('supplier-draft-title');
const supplierCancelBillBtn = document.getElementById('supplier-cancel-bill-btn') || document.getElementById('supplierCancelBillBtn');
const supplierBillSearch = document.getElementById('supplier-bill-search');
const supplierBillAddCustomBtn = document.getElementById('supplierBillAddCustomBtn');
const supplierSearchSuggestions = document.getElementById('supplier-search-suggestions');
const supplierBillItemsList = document.getElementById('supplierBillItemsList');
const supplierBillTotalVal = document.getElementById('supplier-bill-total-val');
const supplierFinalizeBillBtn = document.getElementById('supplierFinalizeBillBtn');
const supplierBillsHistoryList = document.getElementById('supplierBillsHistoryList');
const supplierPaymentsHistoryList = document.getElementById('supplierPaymentsHistoryList');
const supplierStatCount = document.getElementById('supplierStatCount');
const supplierStatOwed = document.getElementById('supplierStatOwed');
const clearCustomersBtn = document.getElementById('clearCustomersBtn');

// Expenses Tab DOM elements
const expNewName = document.getElementById('exp-new-name');
const expNewDate = document.getElementById('exp-new-date');
const expAddBtn = document.getElementById('expAddBtn');
const expenseListsContainer = document.getElementById('expenseListsContainer');
const expenseListView = document.getElementById('expense-list-view');
const expenseDetailView = document.getElementById('expense-detail-view');
const expenseBackBtn = document.getElementById('expenseBackBtn');
const expenseDetailName = document.getElementById('expense-detail-name');
const expenseDetailDate = document.getElementById('expense-detail-date');
const expenseDetailTotal = document.getElementById('expense-detail-total');
const expItemName = document.getElementById('exp-item-name');
const expItemPrice = document.getElementById('exp-item-price');
const expAddItemBtn = document.getElementById('expAddItemBtn');
const expenseItemsContainer = document.getElementById('expenseItemsContainer');
const expenseStatCount = document.getElementById('expenseStatCount');
const expenseStatTotal = document.getElementById('expenseStatTotal');

// Profit Tab DOM elements
const profitDateInput = document.getElementById('profit-date');
const calculateProfitBtn = document.getElementById('calculateProfitBtn');
const profitStatRevenue = document.getElementById('profitStatRevenue');
const profitStatCost = document.getElementById('profitStatCost');
const profitStatGross = document.getElementById('profitStatGross');
const profitStatExpenses = document.getElementById('profitStatExpenses');
const profitStatNet = document.getElementById('profitStatNet');
const profitExpenseSelector = document.getElementById('profitExpenseSelector');
const profitBreakdownList = document.getElementById('profitBreakdownList');

// Modal
const priceQtyModal = document.getElementById('priceQtyModal');
const modalItemName = document.getElementById('modalItemName');
const modalPrice = document.getElementById('modalPrice');
const modalQty = document.getElementById('modalQty');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalAddBtn = document.getElementById('modalAddBtn');
const modalPriceLabel = document.getElementById('modalPriceLabel');

// Sidebar toggle (mobile)
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuToggle = document.getElementById('menuToggle');

// Page Header refs
const pageTitle = document.querySelector('.page-head h1');
const pageSubtitle = document.querySelector('.page-head p');

// ---------- Sidebar toggle functions (mobile) ----------
function openMenu(){ sidebar.classList.add('open'); overlay.classList.add('open'); }
function closeMenu(){ sidebar.classList.remove('open'); overlay.classList.remove('open'); }

menuToggle.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeMenu() : openMenu();
});
overlay.addEventListener('click', closeMenu);

// ---------- Toast Notifications ----------
let toastTimer;
function showToast(msg, isError){
  let toast = document.querySelector('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.toggle('error', !!isError);
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ---------- Tab Routing System ----------
const tabMeta = {
  items: {
    title: "Items",
    subtitle: "Track what's on the shelf — add, adjust, and remove stock by hand."
  },
  orders: {
    title: "Orders",
    subtitle: "Start a new order or view recent customer orders."
  },
  'placed-items': {
    title: "Placed Items",
    subtitle: "Review all items currently added to the active order, with stock warnings."
  },
  'load-lists': {
    title: "Load Lists",
    subtitle: "View the load list for all placed orders."
  },
  billing: {
    title: "Billing",
    subtitle: "Add items to the active bill, enter prices and quantities, and finalize the order."
  },
  receipts: {
    title: "Receipts",
    subtitle: "View receipts for all finalized customer orders."
  },
  customers: {
    title: "Customers",
    subtitle: "View customer profiles, edit names, and manage custom price profiles."
  },
  suppliers: {
    title: "Suppliers",
    subtitle: "Manage suppliers, log payments, and track supply purchase bills."
  },
  expenses: {
    title: "Daily Expenses",
    subtitle: "Track operating costs and daily outgoings (Coming Soon)."
  },
  profit: {
    title: "Profit & Loss",
    subtitle: "Analyze sales, revenue, and gross profit margins (Coming Soon)."
  },
  backup: {
    title: "Backup & Restore",
    subtitle: "Export your local data to a backup file, or restore it from an existing backup."
  }
};

function switchTab(tabId) {
  currentTabId = tabId;
  // Update navigation items styling
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.dataset.tab === tabId) {
      n.classList.add('active');
    } else {
      n.classList.remove('active');
    }
  });

  // Update Page Head title and description
  if (tabMeta[tabId]) {
    pageTitle.textContent = tabMeta[tabId].title;
    pageSubtitle.textContent = tabMeta[tabId].subtitle;
  }

  // Toggle visible pane
  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.id === `tab-${tabId}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  closeMenu();

  // Load and Render tab-specific details
  loadAllData();
  if (tabId === 'items') renderItems();
  if (tabId === 'orders') renderOrders();
  if (tabId === 'placed-items') renderPlacedItems();
  if (tabId === 'load-lists') renderLoadLists();
  if (tabId === 'billing') {
    modalContext = 'customer';
    renderBilling();
  }
  if (tabId === 'receipts') renderReceipts();
  if (tabId === 'profit') {
    if (!profitDateInput.value) {
      profitDateInput.value = new Date().toISOString().split('T')[0];
    }
    renderProfit();
  }
  if (tabId === 'backup') initBackupTab();
}

document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', () => {
    const tab = el.dataset.tab;
    switchTab(tab);
  });
});

// ---------- Data Storage Helpers ----------
function loadAllData(){
  try {
    const rawItems = window.localStorage.getItem(ITEMS_STORAGE_KEY);
    items = rawItems ? JSON.parse(rawItems) : [];

    const rawOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    orders = rawOrders ? JSON.parse(rawOrders) : [];

    const rawActive = window.localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);
    activeOrder = rawActive ? JSON.parse(rawActive) : null;

    const rawCustomers = window.localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    customers = rawCustomers ? JSON.parse(rawCustomers) : [];

    const rawSuppliers = window.localStorage.getItem(SUPPLIERS_STORAGE_KEY);
    suppliers = rawSuppliers ? JSON.parse(rawSuppliers) : [];

    const rawExpenses = window.localStorage.getItem(EXPENSES_STORAGE_KEY);
    expenses = rawExpenses ? JSON.parse(rawExpenses) : [];

    const rawManual = window.localStorage.getItem(MANUAL_PRICES_STORAGE_KEY);
    manualBuyingPrices = rawManual ? JSON.parse(rawManual) : {};

    prepClearedAt = window.localStorage.getItem(PREP_CLEARED_STORAGE_KEY) || null;
  } catch (err) {
    console.error('Failed to load data from localStorage', err);
  }

  fetch('/api/items')
    .then(response => {
      if (!response.ok) throw new Error(`Inventory request failed (${response.status})`);
      return response.json();
    })
    .then(data => {
      items = data;
      if (currentTabId === 'items') renderItems();
    })
    .catch(err => {
      console.error('Failed to load inventory from MongoDB', err);
      if (currentTabId === 'items') showToast('Could not load inventory from MongoDB', true);
    });
}

function saveManualBuyingPrices() {
  try {
    window.localStorage.setItem(MANUAL_PRICES_STORAGE_KEY, JSON.stringify(manualBuyingPrices));
  } catch (err) {
    console.error('Failed to save manual buying prices', err);
  }
}

function saveExpenses(){
  try {
    window.localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save expenses data', err);
  }
}

function saveItems(){
  try {
    window.localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    fetch('/api/items', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items)
    }).then(response => {
      if (!response.ok) throw new Error(`Inventory save failed (${response.status})`);
    }).catch(err => {
      console.error('Failed to save items to MongoDB', err);
      showToast('Unable to save inventory to MongoDB', true);
    });
  } catch (err) {
    console.error('Failed to save items', err);
    showToast('Unable to save items locally', true);
  }
}

function saveOrders(){
  try {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders', err);
    showToast('Unable to save orders locally', true);
  }
}

function saveActiveOrder(){
  try {
    if (activeOrder) {
      window.localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(activeOrder));
    } else {
      window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to save active order', err);
  }
}

function saveCustomers(){
  try {
    window.localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  } catch (err) {
    console.error('Failed to save customers data', err);
  }
}

function saveSuppliers(){
  try {
    window.localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers));
  } catch (err) {
    console.error('Failed to save suppliers data', err);
  }
}

// ---------- General Utilities ----------
function pad(n){ return String(n).padStart(3, '0'); }

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ---------- TAB 1: Items Stockroom Inventory ----------
function createItem(name, qty, price){
  return {
    _id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    name: name || 'Untitled item',
    qty: Number.isFinite(Number(qty)) ? Math.max(0, Number(qty)) : 0,
    price: Number.isFinite(Number(price)) ? Math.max(0, Number(price)) : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function updateItem(id, data){
  const index = items.findIndex(item => item._id === id);
  if (index === -1) return null;
  items[index] = {
    ...items[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  saveItems();
  return items[index];
}

function deleteItem(id){
  items = items.filter(item => item._id !== id);
  saveItems();
}

function renderItems(){
  itemList.innerHTML = '';

  if(items.length === 0){
    itemList.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="glyph">&#9723;</div>
        <div>No items yet — add your first one below.</div>
      </div>`;
  } else {
    items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.dataset.id = item._id;
      row.style.gridTemplateColumns = '56px 1fr 130px 190px 80px';
      const low = Number(item.qty) <= LOW_STOCK;
      row.innerHTML = `
        <div class="item-code mono">#${pad(idx + 1)}</div>
        <div class="item-name-wrap">
          <input class="item-name" type="text" value="${escapeHtml(item.name)}" data-role="name">
          <div class="item-sub">Saved in MongoDB</div>
        </div>
        <div class="item-price-wrap">
          <span class="mobile-only-label">Buying Price:</span>
          <input class="price-input mono" type="number" min="0" step="0.01" value="${item.price !== undefined ? item.price : 0}" data-role="price" style="width: 100px; border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; font-size: 14.5px; background: var(--paper-raised); color: var(--text);">
        </div>
        <div>
          <div class="qty-control">
            <button class="qty-btn" data-role="dec">&minus;</button>
            <input class="qty-input mono" type="number" min="0" step="1" value="${item.qty}" data-role="qty">
            <button class="qty-btn" data-role="inc">&plus;</button>
          </div>
          <div class="qty-tag ${low ? 'low' : ''}">${low ? 'Low stock' : 'In stock'}</div>
        </div>
        <button class="remove-btn" data-role="remove" aria-label="Remove item">&#10005;</button>
      `;
      itemList.appendChild(row);
    });
  }

  statCount.textContent = items.length;
  statTotal.textContent = items.reduce((sum, i) => sum + Number(i.qty || 0), 0);
  statLow.textContent = items.filter(i => Number(i.qty) <= LOW_STOCK).length;
}

itemList.addEventListener('click', (e) => {
  const row = e.target.closest('.item-row');
  if(!row) return;
  const id = row.dataset.id;
  const item = items.find(i => i._id === id);
  if(!item) return;

  if(e.target.dataset.role === 'remove'){
    deleteItem(id);
    renderItems();
    showToast('Item removed');
    return;
  }

  if(e.target.dataset.role === 'inc' || e.target.dataset.role === 'dec'){
    const delta = e.target.dataset.role === 'inc' ? 1 : -1;
    const newQty = Math.max(0, Number(item.qty || 0) + delta);
    updateItem(id, { qty: newQty });
    renderItems();
    showToast('Quantity updated');
  }
});

itemList.addEventListener('change', (e) => {
  const row = e.target.closest('.item-row');
  if(!row) return;
  const id = row.dataset.id;
  const item = items.find(i => i._id === id);
  if(!item) return;

  if(e.target.dataset.role === 'qty'){
    let val = parseInt(e.target.value, 10);
    if(isNaN(val) || val < 0) val = 0;
    updateItem(id, { qty: val });
    renderItems();
    showToast('Quantity saved');
  }

  if(e.target.dataset.role === 'price'){
    let val = parseFloat(e.target.value);
    if(isNaN(val) || val < 0) val = 0;
    updateItem(id, { price: val });
    renderItems();
    showToast('Price saved');
  }

  if(e.target.dataset.role === 'name'){
    const val = e.target.value.trim();
    const finalName = val === '' ? 'Untitled item' : val;
    updateItem(id, { name: finalName });
    renderItems();
    showToast('Name saved');
  }
});

function addStockroomItem(){
  const name = newName.value.trim();
  const priceVal = parseFloat(document.getElementById('new-price').value);
  const qty = parseInt(newQty.value, 10);
  if(name === ''){
    newName.focus();
    return;
  }

  const existingIdx = items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
  const addition = isNaN(qty) || qty < 0 ? 0 : qty;
  const price = isNaN(priceVal) || priceVal < 0 ? 0 : priceVal;
  
  if (existingIdx !== -1) {
    items[existingIdx].qty = Number(items[existingIdx].qty || 0) + addition;
    items[existingIdx].price = price;
    items[existingIdx].updatedAt = new Date().toISOString();
    showToast(`Updated quantity and price for existing item: ${items[existingIdx].name}`);
  } else {
    const created = createItem(name, addition, price);
    items.push(created);
    showToast('Item added to Stockroom');
  }
  
  saveItems();
  newName.value = '';
  document.getElementById('new-price').value = '';
  newQty.value = '';
  renderItems();
  newName.focus();
}

addBtn.addEventListener('click', addStockroomItem);
newQty.addEventListener('keydown', (e) => { if(e.key === 'Enter') addStockroomItem(); });
newName.addEventListener('keydown', (e) => { if(e.key === 'Enter') addStockroomItem(); });
const newPriceInputEl = document.getElementById('new-price');
if (newPriceInputEl) {
  newPriceInputEl.addEventListener('keydown', (e) => { if(e.key === 'Enter') addStockroomItem(); });
}

// ---------- TAB 2: Orders & Customers ----------
startOrderBtn.addEventListener('click', () => {
  const name = custNameInput.value.trim();
  if (name === '') {
    custNameInput.focus();
    showToast('Please enter a customer name', true);
    return;
  }
  activeOrder = {
    customerName: name,
    items: []
  };
  saveActiveOrder();
  custNameInput.value = '';
  custSuggestions.style.display = 'none';
  showToast(`Order started for ${name}`);
  switchTab('billing');
});

custNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startOrderBtn.click();
});

const clearOrderHistoryBtn = document.getElementById('clearOrderHistoryBtn');
const clearReceiptHistoryBtn = document.getElementById('clearReceiptHistoryBtn');

function clearAllSalesHistory() {
  if (confirm('Are you sure you want to clear all order and receipts history? This cannot be undone.')) {
    orders = [];
    activeOrder = null;
    saveOrders();
    saveActiveOrder();
    if (typeof renderOrders === 'function') renderOrders();
    if (typeof renderReceipts === 'function') renderReceipts();
    if (typeof renderPlacedItems === 'function') renderPlacedItems();
    if (typeof renderLoadLists === 'function') renderLoadLists();
    if (typeof renderBilling === 'function') renderBilling();
    showToast('Sales and order history cleared');
  }
}

const clearAllItemsBtn = document.getElementById('clearAllItemsBtn');
if (clearAllItemsBtn) {
  clearAllItemsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all items in the stockroom? This will empty your inventory and cannot be undone.')) {
      items = [];
      saveItems();
      renderItems();
      showToast('All items cleared');
    }
  });
}

const clearPlacedItemsBtn = document.getElementById('clearPlacedItemsBtn');
if (clearPlacedItemsBtn) {
  clearPlacedItemsBtn.addEventListener('click', () => {
    if (activeOrder) {
      if (confirm(`Are you sure you want to cancel and clear the active order for ${activeOrder.customerName}?`)) {
        const name = activeOrder.customerName;
        activeOrder = null;
        saveActiveOrder();
        renderPlacedItems();
        if (typeof renderBilling === 'function') renderBilling();
        showToast(`Order for ${name} cleared`);
      }
    } else {
      showToast('No active order to clear');
    }
  });
}

if (clearOrderHistoryBtn) {
  clearOrderHistoryBtn.addEventListener('click', clearAllSalesHistory);
}
if (clearReceiptHistoryBtn) {
  clearReceiptHistoryBtn.addEventListener('click', clearAllSalesHistory);
}

// Customer autocomplete dropdown handler
custNameInput.addEventListener('input', () => {
  const query = custNameInput.value.trim().toLowerCase();
  if (query === '') {
    custSuggestions.style.display = 'none';
    return;
  }

  const matches = customers.filter(c => c.name.toLowerCase().includes(query));
  custSuggestions.innerHTML = '';

  if (matches.length > 0) {
    matches.forEach(cust => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.innerHTML = `<span>${escapeHtml(cust.name)}</span><span class="suggestion-qty">Customer</span>`;
      div.addEventListener('click', () => {
        custNameInput.value = cust.name;
        custSuggestions.style.display = 'none';
      });
      custSuggestions.appendChild(div);
    });
    custSuggestions.style.display = 'block';
  } else {
    custSuggestions.style.display = 'none';
  }
});

// Close suggestions on external click
document.addEventListener('click', (e) => {
  if (e.target !== custNameInput) {
    custSuggestions.style.display = 'none';
  }
});

function renderOrders() {
  recentOrdersList.innerHTML = '';
  
  if (orders.length === 0) {
    recentOrdersList.innerHTML = `
      <div class="empty-state">
        <div class="glyph">☺</div>
        <div>No recent customers or orders yet.</div>
      </div>`;
    return;
  }

  // Sort orders by date descending
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

  sortedOrders.forEach(order => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.style.gridTemplateColumns = '1fr 180px 140px';
    row.style.cursor = 'pointer';

    const formattedDate = new Date(order.date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    row.innerHTML = `
      <div class="item-name-wrap">
        <div style="font-weight: 600; color: var(--text);">${escapeHtml(order.customerName)}</div>
        <div class="item-sub">${order.items.length} items ordered</div>
      </div>
      <div class="mono" style="font-size: 13px; color: var(--muted);">${formattedDate}</div>
      <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end;">
        <div class="mono" style="font-weight: 700; color: var(--rust-dark);">${Number(order.total || 0).toFixed(2)}</div>
        <button class="remove-btn" data-role="delete-customer" data-name="${escapeHtml(order.customerName)}" style="padding: 6px 10px; font-size: 11px; height: auto; width: auto;">Del</button>
        <button class="add-btn" data-role="edit-order" data-id="${order.id}" style="padding: 6px 12px; font-size: 12px; height: auto; background: var(--ink);">Edit</button>
      </div>
    `;

    recentOrdersList.appendChild(row);
  });
}

// Click listener inside orders list
recentOrdersList.addEventListener('click', (e) => {
  const editBtn = e.target.closest('button[data-role="edit-order"]');
  if (editBtn) {
    e.stopPropagation();
    const orderId = editBtn.dataset.id;
    triggerEditOrder(orderId);
    return;
  }

  const deleteBtn = e.target.closest('button[data-role="delete-customer"]');
  if (deleteBtn) {
    e.stopPropagation();
    const customerName = deleteBtn.dataset.name;
    if (confirm(`Delete recent customer "${customerName}" and all matching order history?`)) {
      const normalized = customerName.toLowerCase();
      orders = orders.filter(order => order.customerName.toLowerCase() !== normalized);
      customers = customers.filter(customer => customer.name.toLowerCase() !== normalized);
      saveOrders();
      saveCustomers();
      if (activeOrder && activeOrder.customerName && activeOrder.customerName.toLowerCase() === normalized) {
        activeOrder = null;
        saveActiveOrder();
      }
      renderOrders();
      renderReceipts();
      renderPlacedItems();
      renderLoadLists();
      renderCustomers();
      renderBilling();
      showToast(`Removed customer ${customerName}`);
    }
    return;
  }

  const row = e.target.closest('.item-row');
  if (row) {
    const orderIndex = Array.from(recentOrdersList.children).indexOf(row);
    if (orderIndex !== -1) {
      const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
      const order = sortedOrders[orderIndex];
      switchTab('receipts');
      const receiptCard = document.getElementById(order.id);
      if (receiptCard) {
        receiptCard.scrollIntoView({ behavior: 'smooth' });
        receiptCard.style.outline = '2px solid var(--rust)';
        setTimeout(() => receiptCard.style.outline = 'none', 3000);
      }
    }
  }
});

// Edit order workflow
function triggerEditOrder(orderId) {
  loadAllData();
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    showToast('Order not found', true);
    return;
  }

  if (activeOrder) {
    if (!confirm('You already have an active order draft. Loading this order for editing will discard your current draft. Continue?')) {
      return;
    }
  }

  // Restore inventory stock levels (simulate returning items to stock)
  order.items.forEach(orderItem => {
    const stockItem = items.find(i => i.name.toLowerCase() === orderItem.name.toLowerCase());
    if (stockItem) {
      stockItem.qty = Number(stockItem.qty || 0) + Number(orderItem.qty || 0);
      stockItem.updatedAt = new Date().toISOString();
    }
  });
  saveItems();

  // Load into active order state
  activeOrder = {
    customerName: order.customerName,
    items: JSON.parse(JSON.stringify(order.items)), // deep clone
    editingOrderId: order.id,
    originalItems: JSON.parse(JSON.stringify(order.items)) // deep clone for reversion
  };
  saveActiveOrder();

  showToast(`Loaded order for ${order.customerName} (Stock temporarily reverted)`);
  switchTab('billing');
}

// Discard edits workflow
function discardActiveOrderEdits() {
  if (!activeOrder || !activeOrder.editingOrderId) return;

  // Re-deduct original stock from items
  activeOrder.originalItems.forEach(originalItem => {
    const stockItem = items.find(i => i.name.toLowerCase() === originalItem.name.toLowerCase());
    if (stockItem) {
      stockItem.qty = Math.max(0, Number(stockItem.qty || 0) - Number(originalItem.qty || 0));
      stockItem.updatedAt = new Date().toISOString();
    }
  });
  saveItems();

  // Clear editing state
  activeOrder = null;
  saveActiveOrder();
  renderBilling();
  showToast('Changes discarded, stock restored.');
}

// ---------- TAB 3: Placed Items Summary ----------
function renderPlacedItems() {
  placedItemsList.innerHTML = '';

  if (!activeOrder || activeOrder.items.length === 0) {
    placedItemsList.innerHTML = `
      <div class="empty-state">
        <div class="glyph">🛒</div>
        <div>No items in the active order yet.</div>
      </div>`;
    return;
  }

  activeOrder.items.forEach(orderItem => {
    const stockItem = items.find(i => i.name.toLowerCase() === orderItem.name.toLowerCase());
    const stockQty = stockItem ? Number(stockItem.qty) : 0;
    const notInStock = !stockItem || stockQty === 0 || stockQty < orderItem.qty;

    const row = document.createElement('div');
    row.className = `item-row ${notInStock ? 'out-of-stock-row' : ''}`;
    row.style.gridTemplateColumns = '1fr 140px 140px';

    let availabilityText = '';
    let badgeClass = '';

    if (!stockItem) {
      availabilityText = 'Not in Stockroom';
      badgeClass = 'out-of-stock-badge';
    } else if (stockQty === 0) {
      availabilityText = 'Out of Stock';
      badgeClass = 'out-of-stock-badge';
    } else if (stockQty < orderItem.qty) {
      availabilityText = `Low stock (${stockQty} left)`;
      badgeClass = 'out-of-stock-badge';
    } else {
      availabilityText = `In Stock (${stockQty} left)`;
      badgeClass = 'in-stock-badge';
    }

    row.innerHTML = `
      <div class="item-name-wrap">
        <div style="font-weight: 600; color: inherit;">${escapeHtml(orderItem.name)}</div>
        <div class="item-sub" style="color: inherit; opacity: 0.8;">Unit Price: ${Number(orderItem.price).toFixed(2)}</div>
      </div>
      <div class="mono" style="font-weight: 600; color: inherit;">${orderItem.qty} pcs</div>
      <div>
        <span class="${badgeClass}">${availabilityText}</span>
      </div>
    `;

    placedItemsList.appendChild(row);
  });
}

// ---------- TAB 4: Billing Section & Order Taking ----------
let modalSelectedItemName = '';

function renderBilling() {
  if (!activeOrder) {
    billingEmptyWrap.style.display = 'block';
    billingActiveWrap.style.display = 'none';
    return;
  }

  billingEmptyWrap.style.display = 'none';
  billingActiveWrap.style.display = 'block';
  billingBuyerName.textContent = activeOrder.customerName;

  // Clear any existing edit banner
  const existingBanner = billingActiveWrap.querySelector('.edit-banner');
  if (existingBanner) existingBanner.remove();

  // If in Edit Mode, prepend edit banner
  if (activeOrder.editingOrderId) {
    const banner = document.createElement('div');
    banner.className = 'edit-banner';
    banner.innerHTML = `
      <span>Currently editing order for <strong>${escapeHtml(activeOrder.customerName)}</strong>. Original stock has been temporarily reverted.</span>
      <button class="edit-banner-cancel" id="discardEditBtn">Discard Changes</button>
    `;
    billingActiveWrap.insertBefore(banner, billingActiveWrap.firstChild);

    // Bind discard action
    document.getElementById('discardEditBtn').addEventListener('click', discardActiveOrderEdits);
  }

  billingItemsList.innerHTML = '';
  let grandTotal = 0;

  if (activeOrder.items.length === 0) {
    billingItemsList.innerHTML = `
      <div class="empty-state">
        <div class="glyph">🔎</div>
        <div>No items added to the bill yet.<br>Search items or write names in the box above.</div>
      </div>`;
  } else {
    activeOrder.items.forEach((item, idx) => {
      const itemTotal = item.price * item.qty;
      grandTotal += itemTotal;

      const row = document.createElement('div');
      row.className = 'item-row';
      row.style.gridTemplateColumns = '1fr 100px 120px 120px 50px';

      row.innerHTML = `
        <div class="item-name-wrap">
          <div style="font-weight: 600; color: var(--text);">${escapeHtml(item.name)}</div>
          <div class="item-sub">Ordered Item #${idx + 1}</div>
        </div>
        <input class="price-input mono" type="number" min="0" step="0.01" value="${Number(item.price)}" data-role="edit-bill-price" data-index="${idx}" aria-label="Unit price for ${escapeHtml(item.name)}" style="width: 100px; border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; font-size: 14px; background: var(--paper-raised); color: var(--text);">
        <div class="mono" style="font-size: 14px;">${item.qty}</div>
        <div class="mono" style="text-align: right; font-weight: 600; color: var(--ink);">${itemTotal.toFixed(2)}</div>
        <button class="remove-btn" data-role="remove-bill-item" data-index="${idx}" aria-label="Remove item" style="width: 28px; height: 28px; font-size: 12px; margin-left: auto;">✕</button>
      `;

      billingItemsList.appendChild(row);
    });
  }

  billingTotalVal.textContent = `${grandTotal.toFixed(2)}`;
}

// Search bar dropdown handlers
billingSearch.addEventListener('input', () => {
  const query = billingSearch.value.trim().toLowerCase();
  if (query === '') {
    searchSuggestions.style.display = 'none';
    return;
  }

  // Filter stock items
  const matches = items.filter(item => item.name.toLowerCase().includes(query));

  searchSuggestions.innerHTML = '';

  if (matches.length > 0) {
    matches.forEach(item => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      const isOut = Number(item.qty) === 0;
      const lastCost = findBuyingPrice(item.name);
      const costStr = lastCost > 0 ? ` <span class="mono" style="color: var(--muted); font-size: 11px; margin-left: 8px;">(Cost: ${lastCost.toFixed(2)})</span>` : '';
      div.innerHTML = `
        <span style="font-weight: 500;">${escapeHtml(item.name)}${costStr}</span>
        <span class="suggestion-qty ${isOut ? 'out' : ''}">${isOut ? 'Out of Stock' : `Qty: ${item.qty}`}</span>
      `;
      div.addEventListener('click', () => {
        modalContext = 'customer';
        openPriceQtyModal(item.name);
      });
      searchSuggestions.appendChild(div);
    });
  }

  // Custom Item Suggestion (always offer to write the item for the order)
  const customDiv = document.createElement('div');
  customDiv.className = 'suggestion-item';
  customDiv.innerHTML = `
    <span style="font-style: italic; color: var(--rust-dark);">Write custom: "${escapeHtml(billingSearch.value)}"</span>
    <span class="suggestion-qty out">Non-Stock</span>
  `;
  customDiv.addEventListener('click', () => {
    modalContext = 'customer';
    openPriceQtyModal(billingSearch.value);
  });
  searchSuggestions.appendChild(customDiv);

  searchSuggestions.style.display = 'block';
});

// Close suggestions dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (e.target !== billingSearch) {
    searchSuggestions.style.display = 'none';
  }
});

billingAddCustomBtn.addEventListener('click', () => {
  const val = billingSearch.value.trim();
  if (val !== '') {
    modalContext = 'customer';
    openPriceQtyModal(val);
  } else {
    billingSearch.focus();
  }
});

billingSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = billingSearch.value.trim();
    if (val !== '') {
      modalContext = 'customer';
      openPriceQtyModal(val);
    }
  }
});

// Update an item's price directly from the active bill.
billingItemsList.addEventListener('change', (e) => {
  const input = e.target.closest('input[data-role="edit-bill-price"]');
  if (!input || !activeOrder) return;

  const index = parseInt(input.dataset.index, 10);
  const price = input.value.trim() === '' ? 0 : parseFloat(input.value);
  if (!activeOrder.items[index] || isNaN(price) || price < 0) {
    showToast('Please enter a valid price (>= 0)', true);
    renderBilling();
    return;
  }

  activeOrder.items[index].price = price;
  saveActiveOrder();
  renderBilling();
});

// Remove item from active bill
billingItemsList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-role="remove-bill-item"]');
  if (!btn) return;
  const index = parseInt(btn.dataset.index, 10);
  if (activeOrder && activeOrder.items[index]) {
    const removedName = activeOrder.items[index].name;
    activeOrder.items.splice(index, 1);
    saveActiveOrder();
    renderBilling();
    showToast(`Removed ${removedName} from order`);
  }
});

// Cancel active order completely
cancelOrderBtn.addEventListener('click', () => {
  if (!activeOrder) return;
  if (confirm(`Are you sure you want to cancel the order for ${activeOrder.customerName}?`)) {
    const name = activeOrder.customerName;
    if (activeOrder.editingOrderId) {
      discardActiveOrderEdits();
    } else {
      activeOrder = null;
      saveActiveOrder();
      renderBilling();
      showToast(`Order for ${name} cancelled`);
    }
  }
});

goToOrdersBtn.addEventListener('click', () => {
  switchTab('orders');
});

// Finalize order & generate receipt
finalizeOrderBtn.addEventListener('click', () => {
  if (!activeOrder) return;
  if (activeOrder.items.length === 0) {
    showToast('Add at least one item to the order first!', true);
    billingSearch.focus();
    return;
  }

  // Deduct inventory quantities for matching stock items.
  // If a custom item doesn't exist, auto-add it to stock items registry with 0 quantity.
  activeOrder.items.forEach(orderItem => {
    ensureItemExistsInStock(orderItem.name, 0);
    const stockItemIndex = items.findIndex(i => i.name.toLowerCase() === orderItem.name.toLowerCase());
    if (stockItemIndex !== -1) {
      const currentQty = Number(items[stockItemIndex].qty || 0);
      items[stockItemIndex].qty = Math.max(0, currentQty - orderItem.qty);
      items[stockItemIndex].updatedAt = new Date().toISOString();
    }
  });

  // Save stock changes
  saveItems();

  // Update Customer Profile and Prices
  const custName = activeOrder.customerName.trim();
  const cIndex = customers.findIndex(c => c.name.toLowerCase() === custName.toLowerCase());
  const now = new Date().toISOString();
  
  if (cIndex === -1) {
    const newCust = {
      name: custName,
      lastOrderDate: now,
      lastPrices: {}
    };
    activeOrder.items.forEach(item => {
      newCust.lastPrices[item.name.toLowerCase()] = item.price;
    });
    customers.push(newCust);
  } else {
    customers[cIndex].lastOrderDate = now;
    if (!customers[cIndex].lastPrices) customers[cIndex].lastPrices = {};
    activeOrder.items.forEach(item => {
      customers[cIndex].lastPrices[item.name.toLowerCase()] = item.price;
    });
  }
  saveCustomers();

  if (activeOrder.editingOrderId) {
    const oIdx = orders.findIndex(o => o.id === activeOrder.editingOrderId);
    if (oIdx !== -1) {
      orders[oIdx] = {
        ...orders[oIdx],
        items: [...activeOrder.items],
        total: activeOrder.items.reduce((sum, item) => sum + (item.price * item.qty), 0),
        date: now
      };
    }
    saveOrders();
    showToast(`Order for ${custName} updated and finalized!`);
  } else {
    // Create new finalized receipt
    const receipt = {
      id: `REC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      customerName: custName,
      items: [...activeOrder.items],
      total: activeOrder.items.reduce((sum, item) => sum + (item.price * item.qty), 0),
      date: now
    };
    orders.push(receipt);
    saveOrders();
    showToast(`Receipt created for ${custName}`);
  }

  activeOrder = null;
  saveActiveOrder();
  switchTab('receipts');
});

// ---------- Interactive Price & Quantity Input Modal ----------
function ensureActiveSupplierBillDraft() {
  if (!activeSupplierBillDraft) {
    activeSupplierBillDraft = { items: [] };
    editingSupplierBillId = null;
    renderSupplierBillDraft();
  }
  return activeSupplierBillDraft;
}

function openPriceQtyModal(itemName) {
  modalContext = (currentTabId === 'suppliers') ? 'supplier' : 'customer';
  modalSelectedItemName = itemName;
  modalItemName.textContent = itemName;
  modalPrice.value = '';
  modalQty.value = '1';
  searchSuggestions.style.display = 'none';
  if (typeof supplierSearchSuggestions !== 'undefined' && supplierSearchSuggestions) {
    supplierSearchSuggestions.style.display = 'none';
  }
  billingSearch.value = '';
  if (typeof supplierBillSearch !== 'undefined' && supplierBillSearch) {
    supplierBillSearch.value = '';
  }
  
  if (modalContext === 'supplier') {
    if (!selectedSupplierId) {
      showToast('Please select a supplier first', true);
      closePriceQtyModal();
      return;
    }

    ensureActiveSupplierBillDraft();
    modalItemName.textContent = itemName;
    modalPriceLabel.innerHTML = 'Unit Cost';
    modalAddBtn.textContent = 'Add to Bill';

    let suggestedPrice = findSupplierLastCost(selectedSupplierId, itemName);
    let isSpecificSupplier = suggestedPrice !== null;

    if (suggestedPrice === null) {
      const generalBuyingPrice = findBuyingPrice(itemName);
      if (generalBuyingPrice > 0) {
        suggestedPrice = generalBuyingPrice;
      }
    }

    if (suggestedPrice !== null) {
      modalPrice.value = suggestedPrice;
      const originLabel = isSpecificSupplier ? 'Suggested' : 'Last Cost';
      modalPriceLabel.innerHTML = `Unit Cost <span class="mono" style="color: var(--rust-dark); font-weight:700; font-size:12px;">(${originLabel}: ${suggestedPrice.toFixed(2)})</span>`;
    } else {
      modalPriceLabel.innerHTML = 'Unit Cost';
    }
  } else {
    // Show buying cost next to item name in customer order modal
    const buyingPrice = findBuyingPrice(itemName);
    const buyingPriceStr = buyingPrice > 0 ? ` <span class="mono" style="color: var(--muted); font-size: 13px; margin-left: 8px;">(Buying Cost: ${buyingPrice.toFixed(2)})</span>` : ' <span class="mono" style="color: var(--muted); font-size: 13px; margin-left: 8px;">(Buying Cost: N/A)</span>';
    modalItemName.innerHTML = `${escapeHtml(itemName)}${buyingPriceStr}`;

    modalAddBtn.textContent = 'Add to Order';
    // Look up customer previous price suggestion
    if (activeOrder) {
      const custName = activeOrder.customerName.trim().toLowerCase();
      const customer = customers.find(c => c.name.toLowerCase() === custName);
      
      if (customer && customer.lastPrices && customer.lastPrices[itemName.toLowerCase()] !== undefined) {
        const prevPrice = Number(customer.lastPrices[itemName.toLowerCase()]);
        modalPrice.value = prevPrice;
        modalPriceLabel.innerHTML = `Price per unit <span class="mono" style="color: var(--rust-dark); font-weight:700; font-size:12px;">(Suggested: ${prevPrice.toFixed(2)})</span>`;
      } else {
        modalPriceLabel.innerHTML = 'Price per unit';
      }
    } else {
      modalPriceLabel.innerHTML = 'Price per unit';
    }
  }

  priceQtyModal.classList.add('open');
  modalPrice.focus();
}

function closePriceQtyModal() {
  priceQtyModal.classList.remove('open');
  modalSelectedItemName = '';
}

modalCancelBtn.addEventListener('click', closePriceQtyModal);

priceQtyModal.addEventListener('click', (e) => {
  if (e.target === priceQtyModal) closePriceQtyModal();
});

function handleModalSubmit() {
  const price = modalContext === 'customer' && modalPrice.value.trim() === ''
    ? 0
    : parseFloat(modalPrice.value);
  const qty = parseInt(modalQty.value, 10);

  if (isNaN(price) || price < 0) {
    showToast('Please enter a valid price (>= 0)', true);
    modalPrice.focus();
    return;
  }

  if (isNaN(qty) || qty < 1) {
    showToast('Please enter a valid quantity (>= 1)', true);
    modalQty.focus();
    return;
  }

  // Auto-add new custom item name to Stockroom inventory registry if not present
  ensureItemExistsInStock(modalSelectedItemName, 0);

  if (modalContext === 'supplier') {
    if (!selectedSupplierId) {
      showToast('Please select a supplier first', true);
      closePriceQtyModal();
      return;
    }

    ensureActiveSupplierBillDraft();

    const existingIdx = activeSupplierBillDraft.items.findIndex(i => i.name.toLowerCase() === modalSelectedItemName.toLowerCase());
    
    if (existingIdx !== -1) {
      activeSupplierBillDraft.items[existingIdx].qty += qty;
      activeSupplierBillDraft.items[existingIdx].price = price;
    } else {
      activeSupplierBillDraft.items.push({
        name: modalSelectedItemName,
        price: price,
        qty: qty
      });
    }

    closePriceQtyModal();
    renderSupplierBillDraft();
    showToast(`Added ${modalSelectedItemName} (Qty: ${qty})`);
  } else {
    if (!activeOrder) {
      showToast('No active order. Please start one first.', true);
      closePriceQtyModal();
      return;
    }

    // Check if item already exists in bill (case insensitive)
    const existingIdx = activeOrder.items.findIndex(i => i.name.toLowerCase() === modalSelectedItemName.toLowerCase());
    
    if (existingIdx !== -1) {
      activeOrder.items[existingIdx].qty += qty;
      activeOrder.items[existingIdx].price = price;
    } else {
      activeOrder.items.push({
        name: modalSelectedItemName,
        price: price,
        qty: qty
      });
    }

    saveActiveOrder();
    closePriceQtyModal();
    renderBilling();
    showToast(`Added ${modalSelectedItemName} (Qty: ${qty})`);
  }
}

modalAddBtn.addEventListener('click', handleModalSubmit);

modalPrice.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') modalQty.focus();
  if (e.key === 'Escape') closePriceQtyModal();
});

modalQty.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleModalSubmit();
  if (e.key === 'Escape') closePriceQtyModal();
});

// ---------- TAB 5: Receipts List & Render ----------
function renderReceipts() {
  receiptsContainer.innerHTML = '';

  if (orders.length === 0) {
    receiptsContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="glyph">🧾</div>
        <div>No receipts generated yet.</div>
      </div>`;
    return;
  }

  const sortedReceipts = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

  let lastDateKey = null;

  sortedReceipts.forEach(receipt => {
    const rDate = new Date(receipt.date);
    const today = new Date();
    const isToday = rDate.getFullYear() === today.getFullYear() &&
                    rDate.getMonth() === today.getMonth() &&
                    rDate.getDate() === today.getDate();

    const dateKey = rDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const displayHeader = isToday ? `Today — ${dateKey}` : `Receipts generated on ${dateKey}`;

    if (dateKey !== lastDateKey) {
      const header = document.createElement('div');
      header.className = 'receipt-date-group-header';
      header.textContent = displayHeader;
      receiptsContainer.appendChild(header);
      lastDateKey = dateKey;
    }

    const card = document.createElement('div');
    card.className = 'receipt-card';
    card.id = receipt.id;

    const formattedDate = rDate.toLocaleString();

    let itemsHtml = '';
    receipt.items.forEach(item => {
      const lineTotal = item.price * item.qty;
      itemsHtml += `
        <div class="receipt-item-row">
          <span>${escapeHtml(item.name)}</span>
          <span class="mono" style="text-align: center;">x${item.qty}</span>
          <span class="mono" style="text-align: right;">${lineTotal.toFixed(2)}</span>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="receipt-header">
        <div class="receipt-title">Stockroom Receipt</div>
        <div class="receipt-buyer">Buyer: ${escapeHtml(receipt.customerName)}</div>
        <div class="receipt-date">${formattedDate}</div>
        <div style="font-size: 10px; color: var(--muted); margin-top: 2px;" class="mono">${receipt.id}</div>
      </div>
      <div class="receipt-body">
        ${itemsHtml}
      </div>
      <div class="receipt-footer">
        <span>Grand Total:</span>
        <span class="mono" style="font-size: 16px; color: var(--rust-dark);">${Number(receipt.total || 0).toFixed(2)}</span>
      </div>
      <button class="add-btn" style="margin-top: 14px; width: 100%; font-size: 12px; padding: 6px; justify-content: center; background: transparent; color: var(--muted); border: 1px solid var(--line);" onclick="window.print()">Print Receipt</button>
    `;

    receiptsContainer.appendChild(card);
  });
}

// ---------- TAB 6: Load Lists ----------

function renderLoadLists() {
  prepListContainer.innerHTML = '';
  
  // Aggregate items from orders placed AFTER prepClearedAt
  const aggregates = {};
  orders.forEach(receipt => {
    if (prepClearedAt && new Date(receipt.date) <= new Date(prepClearedAt)) {
      // Skip orders placed before prepClearedAt
      return;
    }
    receipt.items.forEach(item => {
      const nameKey = item.name.toLowerCase().trim();
      if (!aggregates[nameKey]) {
        aggregates[nameKey] = {
          name: item.name,
          qtyOrdered: 0
        };
      }
      aggregates[nameKey].qtyOrdered += Number(item.qty || 0);
    });
  });

  const aggregateItems = Object.values(aggregates);

  if (aggregateItems.length === 0) {
    prepListContainer.innerHTML = `
      <div class="empty-state">
        <div class="glyph">📊</div>
        <div>No active items ordered.</div>
      </div>`;
  } else {
    aggregateItems.forEach(agg => {
      const stockItem = items.find(i => i.name.toLowerCase() === agg.name.toLowerCase());
      const stockQty = stockItem ? Number(stockItem.qty || 0) : 0;
      const shortfall = Math.max(0, agg.qtyOrdered - stockQty);

      const row = document.createElement('div');
      row.className = `item-row ${shortfall > 0 ? 'shortfall-row' : ''}`;
      row.style.gridTemplateColumns = '1fr 140px 140px 140px';

      row.innerHTML = `
        <div style="font-weight: 600; color: inherit;">${escapeHtml(agg.name)}</div>
        <div class="mono ${shortfall > 0 ? 'shortfall-alert' : ''}" style="font-weight: 700;">${agg.qtyOrdered} pcs</div>
        <div class="mono" style="color: inherit;">${stockQty} pcs</div>
        <div class="mono ${shortfall > 0 ? 'shortfall-alert' : ''}" style="text-align: right; font-weight: 700;">
          ${shortfall > 0 ? `${shortfall} needed` : '0 (Covered)'}
        </div>
      `;
      prepListContainer.appendChild(row);
    });
  }
}

// Clear load list local tracking
clearPrepListBtn.addEventListener('click', () => {
  if (confirm('Clear Load List? This does NOT affect orders, billing history, or receipts.')) {
    prepClearedAt = new Date().toISOString();
    window.localStorage.setItem(PREP_CLEARED_STORAGE_KEY, prepClearedAt);
    renderLoadLists();
    showToast('Load list cleared locally');
  }
});

// ---------- TAB 7: Customers Tab ----------

function renderCustomers() {
  customersListContainer.innerHTML = '';

  if (customers.length === 0) {
    customersListContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="glyph">👥</div>
        <div>No customer price profiles recorded yet.<br>Complete a sale in Billing to start profiles.</div>
      </div>`;
    return;
  }

  const sortedCustomers = [...customers].sort((a, b) => a.name.localeCompare(b.name));

  sortedCustomers.forEach(customer => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.style.gridTemplateColumns = '200px 180px 1fr 100px';

    const formattedDate = customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleString() : 'N/A';

    let badgesHtml = '';
    const entries = Object.entries(customer.lastPrices || {});
    if (entries.length > 0) {
      entries.forEach(([itemName, price]) => {
        badgesHtml += `<span class="price-tag-badge">${escapeHtml(itemName)}: ${Number(price).toFixed(2)}</span>`;
      });
    } else {
      badgesHtml = '<span style="color: var(--muted); font-size: 13px; font-style: italic;">No price history yet</span>';
    }

    row.innerHTML = `
      <div style="font-weight: 700; color: var(--ink);">${escapeHtml(customer.name)}</div>
      <div class="mono" style="font-size: 13.5px; color: var(--muted);">${formattedDate}</div>
      <div>${badgesHtml}</div>
      <div style="text-align: right;">
        <button class="add-btn" data-role="rename-customer" data-name="${escapeHtml(customer.name)}" style="padding: 6px 12px; font-size: 11px; height: auto; display: inline-block; background: var(--rust);">Rename</button>
      </div>
    `;

    customersListContainer.appendChild(row);
  });
}

// Customers Tab Rename click listener
customersListContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-role="rename-customer"]');
  if (!btn) return;

  const oldName = btn.dataset.name;
  const newName = prompt(`Enter new name for customer "${oldName}":`, oldName);

  if (newName === null) return; // cancel
  const trimmedNewName = newName.trim();
  if (trimmedNewName === '' || trimmedNewName.toLowerCase() === oldName.toLowerCase()) {
    showToast('Name unchanged or invalid', true);
    return;
  }

  // Rename customer workflow
  loadAllData();
  
  // 1. Update customer profile list
  const cIndex = customers.findIndex(c => c.name.toLowerCase() === oldName.toLowerCase());
  if (cIndex !== -1) {
    customers[cIndex].name = trimmedNewName;
    saveCustomers();
  }

  // 2. Update all historical orders (receipts)
  orders.forEach(order => {
    if (order.customerName.toLowerCase() === oldName.toLowerCase()) {
      order.customerName = trimmedNewName;
    }
  });
  saveOrders();

  // 3. Update active order if applicable
  if (activeOrder && activeOrder.customerName.toLowerCase() === oldName.toLowerCase()) {
    activeOrder.customerName = trimmedNewName;
    saveActiveOrder();
  }

  showToast(`Customer renamed to "${trimmedNewName}" across history.`);
  renderCustomers();
});

// ---------- TAB 8: Suppliers Tab ----------

if (supAddBtn) {
  supAddBtn.addEventListener('click', () => {
    const name = supNewName.value.trim();
    const contact = supNewContact.value.trim();
    if (name === '') {
      supNewName.focus();
      return;
    }
    const newSup = {
      id: `SUP-${Date.now()}`,
      name: name,
      contact: contact,
      bills: [],
      payments: []
    };
    suppliers.push(newSup);
    saveSuppliers();
    supNewName.value = '';
    supNewContact.value = '';
    renderSuppliers();
    showToast('Supplier added successfully');
  });
}

function renderSuppliers() {
  loadAllData();
  if (selectedSupplierId) {
    renderSupplierDetail();
  } else {
    renderSupplierList();
  }
}

function renderSupplierList() {
  supplierListView.style.display = 'block';
  supplierDetailView.style.display = 'none';
  suppliersListContainer.innerHTML = '';

  let totalOwed = 0;

  if (suppliers.length === 0) {
    suppliersListContainer.innerHTML = `
      <div class="empty-state">
        <div class="glyph">🏭</div>
        <div>No suppliers added yet. Add one below.</div>
      </div>`;
    supplierStatCount.textContent = '0';
    supplierStatOwed.textContent = '0.00';
    return;
  }

  suppliers.forEach(sup => {
    const totalPurchased = sup.bills ? sup.bills.reduce((sum, b) => sum + Number(b.total || 0), 0) : 0;
    const billsWithBalances = getSupplierBillsWithBalances(sup);
    const outstandingBalance = billsWithBalances.reduce((sum, b) => sum + Number(b.remaining || 0), 0);

    let balanceHtml = '';
    if (outstandingBalance > 0) {
      balanceHtml = `<span class="balance-owed">${outstandingBalance.toFixed(2)}</span>`;
      totalOwed += outstandingBalance;
    } else {
      balanceHtml = `<span class="balance-zero">0.00</span>`;
    }

    const row = document.createElement('div');
    row.className = 'item-row';
    row.style.gridTemplateColumns = '2fr 1.5fr 1.5fr 1.5fr 100px';
    row.innerHTML = `
      <div style="font-weight: 700; color: var(--ink);">${escapeHtml(sup.name)}</div>
      <div style="color: var(--muted); font-size: 13.5px;">${escapeHtml(sup.contact || 'N/A')}</div>
      <div class="mono" style="font-size: 14px;">${totalPurchased.toFixed(2)}</div>
      <div class="mono" style="font-size: 14px;">${balanceHtml}</div>
      <div style="text-align: right;">
        <button class="add-btn" data-role="view-supplier" data-id="${sup.id}" style="padding: 6px 12px; font-size: 11px; height: auto;">Manage</button>
      </div>
    `;
    suppliersListContainer.appendChild(row);
  });

  supplierStatCount.textContent = suppliers.length;
  supplierStatOwed.textContent = totalOwed.toFixed(2);
}

function renderSupplierDetail() {
  supplierListView.style.display = 'none';
  supplierDetailView.style.display = 'block';

  const sup = suppliers.find(s => s.id === selectedSupplierId);
  if (!sup) {
    selectedSupplierId = null;
    renderSuppliers();
    return;
  }

  supplierDetailName.textContent = sup.name;
  supplierDetailContact.textContent = sup.contact || 'No contact details';

  const billed = sup.bills ? sup.bills.reduce((sum, b) => sum + Number(b.total || 0), 0) : 0;
  const paid = sup.payments ? sup.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) : 0;
  const billsWithBalances = getSupplierBillsWithBalances(sup);
  const outstandingBalance = billsWithBalances.reduce((sum, bill) => sum + Number(bill.remaining || 0), 0);
  const balance = billed - paid;

  supplierDetailBilled.textContent = billed.toFixed(2);
  supplierDetailPaid.textContent = paid.toFixed(2);

  supplierDetailBalance.className = 'num mono';

  if (outstandingBalance > 0) {
    supplierDetailBalance.textContent = outstandingBalance.toFixed(2);
    supplierDetailBalance.classList.add('balance-owed');
  } else if (outstandingBalance < 0) {
    supplierDetailBalance.textContent = `${Math.abs(outstandingBalance).toFixed(2)} (Adv)`;
    supplierDetailBalance.classList.add('balance-advance');
  } else {
    supplierDetailBalance.textContent = '0.00';
    supplierDetailBalance.classList.add('balance-zero');
  }

  renderSupplierBillDraft();

  supplierBillsHistoryList.innerHTML = '';
  if (!sup.bills || sup.bills.length === 0) {
    supplierBillsHistoryList.innerHTML = `
      <div class="empty-state">
        <div class="glyph">🧾</div>
        <div>No bills generated yet.</div>
      </div>`;
  } else {
    const billsWithBalances = getSupplierBillsWithBalances(sup);
    billsWithBalances.forEach(bill => {
      const row = document.createElement('div');
      row.className = 'item-row';
      const dateStr = new Date(bill.date).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const itemsDetail = bill.items.map(i => `${escapeHtml(i.name)} (${i.qty} x ${Number(i.price).toFixed(2)})`).join(', ');
      
      const remainingVal = Number(bill.remaining !== undefined ? bill.remaining : bill.total);
      const isPaid = remainingVal <= 0;
      const remainingHtml = isPaid 
        ? `<br><span style="color: #2F855A; font-size: 11px; font-weight: bold;">✓ Paid</span>`
        : `<br><span style="color: var(--rust-dark); font-size: 11px;">Unpaid: ${remainingVal.toFixed(2)}</span>`;

      row.style.gridTemplateColumns = '2fr 1fr 1fr 100px';
      row.innerHTML = `
        <div style="display: flex; flex-direction: column;">
          <div class="mono" style="font-size: 13px; color: var(--text); font-weight: 600;">${dateStr}</div>
          <div style="font-size: 11.5px; color: var(--muted); margin-top: 4px; line-height: 1.4;">${itemsDetail}</div>
        </div>
        <div style="font-size: 13px; color: var(--muted); align-self: center; text-align: center;">${bill.items.length} items</div>
        <div class="mono" style="text-align: right; font-weight: 700; color: var(--rust-dark); align-self: center;">
          ${Number(bill.total || 0).toFixed(2)}
          ${remainingHtml}
        </div>
        <div style="display: flex; gap: 4px; justify-content: flex-end; align-self: center;">
          <button class="add-btn" data-role="edit-sbill" data-id="${bill.id}" style="padding: 4px 8px; font-size: 10px; height: auto; background: var(--ink);">Edit</button>
          <button class="remove-btn" data-role="delete-sbill" data-id="${bill.id}" style="padding: 4px 8px; font-size: 10px; height: auto; width: auto;">Del</button>
        </div>
      `;
      supplierBillsHistoryList.appendChild(row);
    });
  }

  supplierPaymentsHistoryList.innerHTML = '';
  if (!sup.payments || sup.payments.length === 0) {
    supplierPaymentsHistoryList.innerHTML = `
      <div class="empty-state">
        <div class="glyph">💸</div>
        <div>No payments logged yet.</div>
      </div>`;
  } else {
    sup.payments.forEach(pay => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.style.gridTemplateColumns = '1fr 130px';
      const dateStr = new Date(pay.date).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const isRefund = Number(pay.amount || 0) < 0;
      const amtColor = isRefund ? '#C53030' : '#2F855A';
      const amtLabel = isRefund ? `${Number(pay.amount).toFixed(2)} (Refund)` : Number(pay.amount).toFixed(2);
      row.innerHTML = `
        <div class="mono" style="font-size: 13px; color: var(--text);">${dateStr}</div>
        <div class="mono" style="text-align: right; font-weight: 700; color: ${amtColor};">${amtLabel}</div>
      `;
      supplierPaymentsHistoryList.appendChild(row);
    });
  }
}

if (supplierPayBtn) {
  supplierPayBtn.addEventListener('click', () => {
    const amount = parseFloat(supplierPayAmount.value);
    if (isNaN(amount) || amount === 0) {
      showToast('Please enter a valid payment amount (non-zero)', true);
      supplierPayAmount.focus();
      return;
    }
    const sup = suppliers.find(s => s.id === selectedSupplierId);
    if (!sup) return;
    if (!sup.payments) sup.payments = [];
    sup.payments.push({
      id: `SPAY-${Date.now()}`,
      date: new Date().toISOString(),
      amount: amount
    });
    saveSuppliers();
    supplierPayAmount.value = '';
    renderSuppliers();
    showToast(amount > 0 ? 'Payment applied to supplier bill' : 'Refund/Return recorded');
  });
}

if (supplierNewBillBtn) {
  supplierNewBillBtn.addEventListener('click', () => {
    activeSupplierBillDraft = {
      items: []
    };
    editingSupplierBillId = null;
    renderSupplierBillDraft();
  });
}

if (supplierCancelBillBtn) {
  supplierCancelBillBtn.addEventListener('click', () => {
    activeSupplierBillDraft = null;
    editingSupplierBillId = null;
    renderSupplierBillDraft();
    showToast('Draft cancelled');
  });
}

function renderSupplierBillDraft() {
  if (!activeSupplierBillDraft) {
    supplierBillDraftWrap.style.display = 'none';
    return;
  }
  supplierBillDraftWrap.style.display = 'block';
  supplierDraftTitle.textContent = editingSupplierBillId ? 'Edit Supplier Bill' : 'New Supplier Bill Draft';
  supplierBillItemsList.innerHTML = '';

  let total = 0;
  if (activeSupplierBillDraft.items.length === 0) {
    supplierBillItemsList.innerHTML = `
      <div class="empty-state">
        <div class="glyph">📦</div>
        <div>No items added to the bill yet.</div>
      </div>`;
  } else {
    activeSupplierBillDraft.items.forEach((item, idx) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;

      const row = document.createElement('div');
      row.className = 'item-row';
      row.style.gridTemplateColumns = '1fr 120px 120px 120px 50px';
      row.innerHTML = `
        <div style="font-weight: 600; color: var(--text);">${escapeHtml(item.name)}</div>
        <div class="mono" style="font-size: 14px;">${Number(item.price).toFixed(2)}</div>
        <div class="mono" style="font-size: 14px;">${item.qty}</div>
        <div class="mono" style="text-align: right; font-weight: 600; color: var(--ink);">${itemTotal.toFixed(2)}</div>
        <button class="remove-btn" data-role="remove-sbill-item" data-index="${idx}" aria-label="Remove item" style="width: 28px; height: 28px; font-size: 12px; margin-left: auto;">✕</button>
      `;
      supplierBillItemsList.appendChild(row);
    });
  }

  supplierBillTotalVal.textContent = total.toFixed(2);
}

if (supplierBillItemsList) {
  supplierBillItemsList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-role="remove-sbill-item"]');
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    if (activeSupplierBillDraft && activeSupplierBillDraft.items[index]) {
      const name = activeSupplierBillDraft.items[index].name;
      activeSupplierBillDraft.items.splice(index, 1);
      renderSupplierBillDraft();
      showToast(`Removed ${name}`);
    }
  });
}

if (supplierFinalizeBillBtn) {
  supplierFinalizeBillBtn.addEventListener('click', () => {
    if (!activeSupplierBillDraft) return;
    if (activeSupplierBillDraft.items.length === 0) {
      showToast('Please add at least one item', true);
      supplierBillSearch.focus();
      return;
    }

    const sup = suppliers.find(s => s.id === selectedSupplierId);
    if (!sup) return;

    if (editingSupplierBillId) {
      const originalBill = sup.bills.find(b => b.id === editingSupplierBillId);
      if (originalBill) {
        originalBill.items.forEach(oldItem => {
          const stockItem = items.find(i => i.name.toLowerCase() === oldItem.name.toLowerCase());
          if (stockItem) {
            stockItem.qty = Math.max(0, Number(stockItem.qty || 0) - Number(oldItem.qty || 0));
            stockItem.updatedAt = new Date().toISOString();
          }
        });
      }
    }

    activeSupplierBillDraft.items.forEach(newItem => {
      const stockItemIdx = items.findIndex(i => i.name.toLowerCase() === newItem.name.toLowerCase());
      if (stockItemIdx !== -1) {
        items[stockItemIdx].qty = Number(items[stockItemIdx].qty || 0) + Number(newItem.qty);
        items[stockItemIdx].updatedAt = new Date().toISOString();
      } else {
        const created = createItem(newItem.name, newItem.qty);
        items.push(created);
      }
    });
    saveItems();

    const now = new Date().toISOString();
    const billTotal = activeSupplierBillDraft.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (editingSupplierBillId) {
      const billIdx = sup.bills.findIndex(b => b.id === editingSupplierBillId);
      if (billIdx !== -1) {
        sup.bills[billIdx] = {
          ...sup.bills[billIdx],
          items: [...activeSupplierBillDraft.items],
          total: billTotal,
          date: now
        };
      }
      showToast('Supplier bill updated successfully');
    } else {
      if (!sup.bills) sup.bills = [];
      sup.bills.push({
        id: `SBILL-${Date.now()}`,
        date: now,
        items: [...activeSupplierBillDraft.items],
        total: billTotal
      });
      showToast('Supplier bill saved successfully');
    }

    saveSuppliers();
    activeSupplierBillDraft = null;
    editingSupplierBillId = null;
    renderSupplierBillDraft();
    renderSuppliers();
  });
}

if (supplierBillSearch) {
  supplierBillSearch.addEventListener('input', () => {
    const query = supplierBillSearch.value.trim().toLowerCase();
    if (query === '') {
      supplierSearchSuggestions.style.display = 'none';
      return;
    }
    const matches = items.filter(item => item.name.toLowerCase().includes(query));
    supplierSearchSuggestions.innerHTML = '';

    if (matches.length > 0) {
      matches.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        const supCost = findSupplierLastCost(selectedSupplierId, item.name);
        const lastCost = supCost !== null ? supCost : findBuyingPrice(item.name);
        const costStr = lastCost > 0 ? ` <span class="mono" style="color: var(--muted); font-size: 11px; margin-left: 8px;">(Last Cost: ${lastCost.toFixed(2)})</span>` : '';
        div.innerHTML = `
          <span style="font-weight: 500;">${escapeHtml(item.name)}${costStr}</span>
          <span class="suggestion-qty">Qty: ${item.qty}</span>
        `;
        div.addEventListener('click', () => {
          modalContext = 'supplier';
          openPriceQtyModal(item.name);
        });
        supplierSearchSuggestions.appendChild(div);
      });
    }

    const customDiv = document.createElement('div');
    customDiv.className = 'suggestion-item';
    customDiv.innerHTML = `
      <span style="font-style: italic; color: var(--rust-dark);">Write custom: "${escapeHtml(supplierBillSearch.value)}"</span>
      <span class="suggestion-qty out">Non-Stock</span>
    `;
    customDiv.addEventListener('click', () => {
      modalContext = 'supplier';
      openPriceQtyModal(supplierBillSearch.value);
    });
    supplierSearchSuggestions.appendChild(customDiv);
    supplierSearchSuggestions.style.display = 'block';
  });

  supplierBillAddCustomBtn.addEventListener('click', () => {
    const val = supplierBillSearch.value.trim();
    if (val !== '') {
      modalContext = 'supplier';
      openPriceQtyModal(val);
    } else {
      supplierBillSearch.focus();
    }
  });

  supplierBillSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = supplierBillSearch.value.trim();
      if (val !== '') {
        modalContext = 'supplier';
        openPriceQtyModal(val);
      }
    }
  });
}

if (suppliersListContainer) {
  suppliersListContainer.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('button[data-role="view-supplier"]');
    if (viewBtn) {
      selectedSupplierId = viewBtn.dataset.id;
      renderSuppliers();
    }
  });
}

if (supplierBillsHistoryList) {
  supplierBillsHistoryList.addEventListener('click', (e) => {
    const editBtn = e.target.closest('button[data-role="edit-sbill"]');
    const delBtn = e.target.closest('button[data-role="delete-sbill"]');

    if (editBtn) {
      const billId = editBtn.dataset.id;
      const sup = suppliers.find(s => s.id === selectedSupplierId);
      if (!sup) return;
      const bill = sup.bills.find(b => b.id === billId);
      if (!bill) return;

      if (activeSupplierBillDraft) {
        if (!confirm('You already have an active draft. Overwrite it?')) return;
      }

      activeSupplierBillDraft = {
        items: JSON.parse(JSON.stringify(bill.items))
      };
      editingSupplierBillId = bill.id;
      renderSupplierBillDraft();
      showToast('Loaded bill for editing');
      supplierBillDraftWrap.scrollIntoView({ behavior: 'smooth' });
    }

    if (delBtn) {
      const billId = delBtn.dataset.id;
      if (!confirm('Are you sure you want to delete this supplier bill? This will revert stock room quantities.')) return;

      const sup = suppliers.find(s => s.id === selectedSupplierId);
      if (!sup) return;
      const billIdx = sup.bills.findIndex(b => b.id === billId);
      if (billIdx === -1) return;

      const bill = sup.bills[billIdx];
      bill.items.forEach(oldItem => {
        const stockItem = items.find(i => i.name.toLowerCase() === oldItem.name.toLowerCase());
        if (stockItem) {
          stockItem.qty = Math.max(0, Number(stockItem.qty || 0) - Number(oldItem.qty || 0));
          stockItem.updatedAt = new Date().toISOString();
        }
      });
      saveItems();

      sup.bills.splice(billIdx, 1);
      saveSuppliers();
      renderSuppliers();
      showToast('Supplier bill deleted');
    }
  });
}

if (supplierBackBtn) {
  supplierBackBtn.addEventListener('click', () => {
    selectedSupplierId = null;
    activeSupplierBillDraft = null;
    editingSupplierBillId = null;
    renderSuppliers();
  });
}


// ---------- TAB 9: Daily Expenses Tab ----------

if (expAddBtn) {
  expAddBtn.addEventListener('click', () => {
    const name = expNewName.value.trim();
    const dateVal = expNewDate.value;
    if (name === '') {
      expNewName.focus();
      return;
    }
    const dateStr = dateVal ? dateVal : new Date().toISOString().split('T')[0];

    const newList = {
      id: `EXP-${Date.now()}`,
      name: name,
      date: dateStr,
      items: []
    };

    expenses.push(newList);
    saveExpenses();
    expNewName.value = '';
    expNewDate.value = '';
    renderExpenses();
    showToast('Expense list created');
  });
}

function renderExpenses() {
  loadAllData();
  if (selectedExpenseListId) {
    renderExpenseDetail();
  } else {
    renderExpenseList();
  }
}

function renderExpenseList() {
  expenseListView.style.display = 'block';
  expenseDetailView.style.display = 'none';
  expenseListsContainer.innerHTML = '';

  let totalExpenses = 0;

  if (expenses.length === 0) {
    expenseListsContainer.innerHTML = `
      <div class="empty-state">
        <div class="glyph">💸</div>
        <div>No expense lists recorded. Create one below.</div>
      </div>`;
    expenseStatCount.textContent = '0';
    expenseStatTotal.textContent = '0.00';
    return;
  }

  const sortedLists = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  sortedLists.forEach(list => {
    const listTotal = list.items ? list.items.reduce((sum, item) => sum + Number(item.price || 0), 0) : 0;
    totalExpenses += listTotal;

    const row = document.createElement('div');
    row.className = 'item-row';
    row.style.gridTemplateColumns = '2fr 1fr 1fr 100px';

    row.innerHTML = `
      <div style="font-weight: 700; color: var(--ink);">${escapeHtml(list.name)}</div>
      <div class="mono" style="font-size: 13.5px; color: var(--muted);">${list.date}</div>
      <div class="mono" style="font-size: 14px; font-weight: 700; color: var(--rust-dark);">${listTotal.toFixed(2)}</div>
      <div style="display: flex; gap: 4px; justify-content: flex-end;">
        <button class="add-btn" data-role="view-explist" data-id="${list.id}" style="padding: 6px 12px; font-size: 11px; height: auto;">Manage</button>
        <button class="remove-btn" data-role="delete-explist" data-id="${list.id}" style="padding: 6px 12px; font-size: 11px; height: auto; width: auto;">✕</button>
      </div>
    `;
    expenseListsContainer.appendChild(row);
  });

  expenseStatCount.textContent = expenses.length;
  expenseStatTotal.textContent = totalExpenses.toFixed(2);
}

if (expenseListsContainer) {
  expenseListsContainer.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('button[data-role="view-explist"]');
    const delBtn = e.target.closest('button[data-role="delete-explist"]');

    if (viewBtn) {
      selectedExpenseListId = viewBtn.dataset.id;
      renderExpenses();
    }

    if (delBtn) {
      const listId = delBtn.dataset.id;
      if (confirm('Delete this expense list?')) {
        expenses = expenses.filter(list => list.id !== listId);
        saveExpenses();
        renderExpenses();
        showToast('Expense list deleted');
      }
    }
  });
}

function renderExpenseDetail() {
  expenseListView.style.display = 'none';
  expenseDetailView.style.display = 'block';

  const list = expenses.find(l => l.id === selectedExpenseListId);
  if (!list) {
    selectedExpenseListId = null;
    renderExpenses();
    return;
  }

  expenseDetailName.textContent = list.name;
  expenseDetailDate.textContent = `Date: ${list.date}`;

  const listTotal = list.items ? list.items.reduce((sum, item) => sum + Number(item.price || 0), 0) : 0;
  expenseDetailTotal.textContent = listTotal.toFixed(2);

  expenseItemsContainer.innerHTML = '';

  if (!list.items || list.items.length === 0) {
    expenseItemsContainer.innerHTML = `
      <div class="empty-state">
        <div class="glyph">📝</div>
        <div>No items in this list yet. Add some above.</div>
      </div>`;
    return;
  }

  list.items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.style.gridTemplateColumns = '2fr 1fr 100px';

    row.innerHTML = `
      <div style="font-weight: 500; color: var(--text);">${escapeHtml(item.name)}</div>
      <div class="mono" style="font-size: 14.5px; font-weight: 600;">${Number(item.price).toFixed(2)}</div>
      <div style="text-align: right;">
        <button class="remove-btn" data-role="delete-expense-item" data-index="${idx}" style="padding: 6px 12px; font-size: 11px; height: auto; width: auto;">✕</button>
      </div>
    `;
    expenseItemsContainer.appendChild(row);
  });
}

if (expAddItemBtn) {
  expAddItemBtn.addEventListener('click', () => {
    const name = expItemName.value.trim();
    const price = parseFloat(expItemPrice.value);

    if (name === '') {
      expItemName.focus();
      return;
    }
    if (isNaN(price) || price <= 0) {
      expItemPrice.focus();
      return;
    }

    const list = expenses.find(l => l.id === selectedExpenseListId);
    if (!list) return;

    if (!list.items) list.items = [];
    list.items.push({
      name: name,
      price: price
    });

    saveExpenses();
    expItemName.value = '';
    expItemPrice.value = '';
    renderExpenseDetail();
    showToast('Expense item added');
  });
}

if (expenseItemsContainer) {
  expenseItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-role="delete-expense-item"]');
    if (!btn) return;

    const idx = parseInt(btn.dataset.index, 10);
    const list = expenses.find(l => l.id === selectedExpenseListId);
    if (list && list.items && list.items[idx]) {
      const itemName = list.items[idx].name;
      list.items.splice(idx, 1);
      saveExpenses();
      renderExpenseDetail();
      showToast(`Removed "${itemName}"`);
    }
  });
}

if (expenseBackBtn) {
  expenseBackBtn.addEventListener('click', () => {
    selectedExpenseListId = null;
    expItemName.value = '';
    expItemPrice.value = '';
    renderExpenses();
  });
}


// ---------- TAB 10: Profit Tab ----------

function ensureItemExistsInStock(name, initialQty = 0) {
  const nameKey = name.trim().toLowerCase();
  const exists = items.some(i => i.name.toLowerCase() === nameKey);
  if (!exists) {
    const newItem = createItem(name.trim(), initialQty);
    items.push(newItem);
    saveItems();
    if (typeof renderItems === 'function') renderItems();
  }
}

function getLocalDateString(dateInput) {
  const d = new Date(dateInput);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getSupplierBillsWithBalances(sup) {
  if (!sup || !sup.bills) return [];
  // Clone bills and initialize remaining unpaid balance to the total amount
  const bills = sup.bills.map(b => ({ ...b, remaining: Number(b.total || 0) }));
  
  // Total payments logged (positive = paid to supplier, negative = refund received)
  const totalPaid = sup.payments ? sup.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) : 0;
  
  let pool = totalPaid;
  if (pool > 0) {
    // Sort bills chronologically (oldest first) to apply FIFO deduction
    const sortedBills = [...bills].sort((a, b) => new Date(a.date) - new Date(b.date));
    sortedBills.forEach(bill => {
      if (pool <= 0) return;
      const deduction = Math.min(bill.remaining, pool);
      bill.remaining -= deduction;
      pool -= deduction;
    });
    // Sync the remaining balance back to our main mapped array
    sortedBills.forEach(sb => {
      const match = bills.find(b => b.id === sb.id);
      if (match) {
        match.remaining = sb.remaining;
      }
    });
  }
  return bills;
}

function findSupplierLastCost(supplierId, itemName) {
  const sup = suppliers.find(s => s.id === supplierId);
  if (sup && sup.bills) {
    let latestPrice = null;
    let latestDate = null;
    sup.bills.forEach(bill => {
      const matched = bill.items.find(item => item.name.toLowerCase() === itemName.toLowerCase());
      if (matched) {
        const billDate = new Date(bill.date);
        if (latestDate === null || billDate > latestDate) {
          latestDate = billDate;
          latestPrice = matched.price;
        }
      }
    });
    if (latestPrice !== null) return latestPrice;
  }
  return null;
}

function findBuyingPrice(itemName) {
  let latestPrice = 0;
  let latestDate = null;
  suppliers.forEach(sup => {
    if (sup.bills) {
      sup.bills.forEach(bill => {
        const matched = bill.items.find(item => item.name.toLowerCase() === itemName.toLowerCase());
        if (matched) {
          const billDate = new Date(bill.date);
          if (latestDate === null || billDate > latestDate) {
            latestDate = billDate;
            latestPrice = matched.price;
          }
        }
      });
    }
  });

  if (latestPrice === 0) {
    const nameKey = itemName.toLowerCase().trim();
    if (manualBuyingPrices && manualBuyingPrices[nameKey] !== undefined) {
      return Number(manualBuyingPrices[nameKey]);
    }
  }
  return latestPrice;
}

function hasSupplierBuyingPrice(itemName) {
  let hasPrice = false;
  suppliers.forEach(sup => {
    if (sup.bills) {
      sup.bills.forEach(bill => {
        const matched = bill.items.find(item => item.name.toLowerCase() === itemName.toLowerCase());
        if (matched && matched.price > 0) {
          hasPrice = true;
        }
      });
    }
  });
  return hasPrice;
}

function getMissingBuyingPriceItems(soldItems) {
  const missing = [];
  Object.keys(soldItems).forEach(nameKey => {
    const itemObj = soldItems[nameKey];
    const nameKeyLower = itemObj.name.toLowerCase().trim();
    const manualCost = manualBuyingPrices[nameKeyLower] !== undefined ? Number(manualBuyingPrices[nameKeyLower]) : 0;
    const hasKnownCost = manualCost > 0 || hasSupplierBuyingPrice(itemObj.name);
    if (!hasKnownCost) {
      missing.push(itemObj);
    }
  });
  return missing;
}

function renderProfitBreakdownOnly(soldItems) {
  profitBreakdownList.innerHTML = '';
  const soldItemsArr = Object.values(soldItems);
  if (soldItemsArr.length === 0) {
    profitBreakdownList.innerHTML = `
      <div class="empty-state">
        <div class="glyph">📈</div>
        <div>No sales recorded for this date.</div>
      </div>`;
  } else {
    soldItemsArr.forEach(item => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.style.gridTemplateColumns = '2fr 1fr 1fr 1fr';
      row.innerHTML = `
        <div style="font-weight: 600; color: var(--text);">${escapeHtml(item.name)}</div>
        <div class="mono" style="font-size: 14px;">${item.qtySold}</div>
        <div class="mono" style="font-size: 14px;">${item.sellingPrice.toFixed(2)}</div>
        <div class="mono" style="text-align: right; font-weight: 600; color: var(--muted);">${item.buyingPrice.toFixed(2)}</div>
      `;
      profitBreakdownList.appendChild(row);
    });
  }
}

function recalculateProfitStats(soldItems, targetDate) {
  let totalRevenue = 0;
  let totalCost = 0;
  let pendingPrices = false;

  Object.keys(soldItems).forEach(nameKey => {
    const itemObj = soldItems[nameKey];
    const nameKeyLower = itemObj.name.toLowerCase().trim();
    const manualCost = manualBuyingPrices[nameKeyLower] !== undefined ? Number(manualBuyingPrices[nameKeyLower]) : 0;
    const unitCost = manualCost > 0 ? manualCost : findBuyingPrice(itemObj.name);
    const hasKnownCost = unitCost > 0 || hasSupplierBuyingPrice(itemObj.name) || manualCost > 0;
    if (!hasKnownCost) {
      pendingPrices = true;
    }
    itemObj.buyingPrice = unitCost;
    itemObj.cost = unitCost * itemObj.qtySold;

    totalRevenue += itemObj.revenue;
    totalCost += itemObj.cost;
  });

  const grossProfit = totalRevenue - totalCost;

  profitStatRevenue.textContent = totalRevenue.toFixed(2);
  profitStatCost.textContent = totalCost.toFixed(2);
  if (pendingPrices) {
    profitStatGross.textContent = 'Pending';
    profitStatGross.style.color = 'var(--rust-dark)';
  } else {
    profitStatGross.textContent = grossProfit.toFixed(2);
    profitStatGross.style.color = 'var(--rust-dark)';
  }

  updateNetProfitCalculation(pendingPrices ? null : grossProfit);
  renderProfitBreakdownOnly(soldItems);
}

function renderProfit() {
  loadAllData();
  const targetDate = profitDateInput.value;
  if (!targetDate) return;

  const soldItems = {};
  
  orders.forEach(receipt => {
    const receiptDate = getLocalDateString(receipt.date);
    if (receiptDate === targetDate) {
      receipt.items.forEach(item => {
        const nameKey = item.name.toLowerCase().trim();
        if (!soldItems[nameKey]) {
          soldItems[nameKey] = {
            name: item.name,
            qtySold: 0,
            revenue: 0,
            sellingPrice: item.price
          };
        }
        soldItems[nameKey].qtySold += Number(item.qty);
        soldItems[nameKey].revenue += Number(item.price) * Number(item.qty);
      });
    }
  });

  const missingPricesList = getMissingBuyingPriceItems(soldItems);

  const missingPricesSection = document.getElementById('profitMissingPricesSection');
  const missingPricesListContainer = document.getElementById('profitMissingPricesList');

  if (missingPricesList.length > 0) {
    missingPricesSection.style.display = 'block';
    missingPricesListContainer.innerHTML = '';
    missingPricesList.forEach(item => {
      const nameKey = item.name.toLowerCase().trim();
      const currentManualPrice = manualBuyingPrices[nameKey] !== undefined ? manualBuyingPrices[nameKey] : '';
      
      const div = document.createElement('div');
      div.className = 'add-form';
      div.style.alignItems = 'center';
      div.style.gap = '12px';
      div.style.marginTop = '0';
      div.innerHTML = `
        <div style="flex: 2; font-weight: 600; color: var(--text);">${escapeHtml(item.name)}</div>
        <div class="field" style="flex: 1; margin: 0;">
          <label style="font-size: 11px;">Buying Price</label>
          <input type="number" step="0.01" min="0" placeholder="0.00" value="${currentManualPrice}" data-name="${nameKey}" class="missing-price-input" style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; font-size: 13.5px; background: var(--paper-raised);">
        </div>
      `;

      const input = div.querySelector('.missing-price-input');
      input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= 0) {
          manualBuyingPrices[nameKey] = val;
        } else {
          manualBuyingPrices[nameKey] = 0;
        }
        saveManualBuyingPrices();
        recalculateProfitStats(soldItems, targetDate);
      });

      missingPricesListContainer.appendChild(div);
    });
  } else {
    missingPricesSection.style.display = 'none';
  }

  if (missingPricesList.length > 0) {
    profitStatRevenue.textContent = '0.00';
    profitStatCost.textContent = '0.00';
    profitStatGross.textContent = 'Pending';
    profitStatExpenses.textContent = '0.00';
    profitStatNet.textContent = 'Pending';
    renderProfitBreakdownOnly({});
    return;
  }

  recalculateProfitStats(soldItems, targetDate);

  profitExpenseSelector.innerHTML = '';
  if (expenses.length === 0) {
    profitExpenseSelector.innerHTML = '<div style="color: var(--muted); font-size:13px; font-style: italic; padding: 10px;">No expense lists available</div>';
  } else {
    expenses.forEach(list => {
      const listTotal = list.items ? list.items.reduce((sum, i) => sum + Number(i.price || 0), 0) : 0;
      const isSameDate = (list.date === targetDate);

      const div = document.createElement('div');
      div.className = 'expense-checkbox-row';
      div.innerHTML = `
        <input type="checkbox" id="chk-exp-${list.id}" data-id="${list.id}" data-amount="${listTotal}" ${isSameDate ? 'checked' : ''}>
        <label class="lbl-wrap" for="chk-exp-${list.id}" style="cursor: pointer; display: flex; flex-direction: column;">
          <span class="lbl-name">${escapeHtml(list.name)}</span>
          <span class="lbl-sub">${list.date}</span>
        </label>
        <span class="lbl-val">${listTotal.toFixed(2)}</span>
      `;
      profitExpenseSelector.appendChild(div);
    });
  }
}

function updateNetProfitCalculation(grossProfit) {
  let deductedExpenses = 0;
  profitExpenseSelector.querySelectorAll('input[type="checkbox"]').forEach(chk => {
    if (chk.checked) {
      deductedExpenses += parseFloat(chk.dataset.amount || 0);
    }
  });
  if (grossProfit === null || Number.isNaN(grossProfit)) {
    profitStatExpenses.textContent = deductedExpenses.toFixed(2);
    profitStatNet.textContent = 'Pending';
    return;
  }
  const netProfit = grossProfit - deductedExpenses;

  profitStatExpenses.textContent = deductedExpenses.toFixed(2);
  profitStatNet.textContent = netProfit.toFixed(2);
}

if (calculateProfitBtn) {
  calculateProfitBtn.addEventListener('click', () => {
    renderProfit();
    showToast('Profit recalculated');
  });
}

if (profitExpenseSelector) {
  profitExpenseSelector.addEventListener('change', (e) => {
    if (e.target && e.target.type === 'checkbox') {
      const grossText = profitStatGross.textContent;
      const gross = grossText === 'Pending' ? null : parseFloat(grossText || 0);
      updateNetProfitCalculation(gross);
    }
  });
}

// ---------- Backup & Restore Logic ----------
let backupInitialized = false;
function initBackupTab() {
  if (backupInitialized) return;
  backupInitialized = true;

  const exportBackupBtn = document.getElementById('exportBackupBtn');
  const selectBackupFileBtn = document.getElementById('selectBackupFileBtn');
  const importBackupFile = document.getElementById('importBackupFile');
  const backupFileName = document.getElementById('backupFileName');
  const importBackupBtn = document.getElementById('importBackupBtn');

  if (exportBackupBtn) {
    exportBackupBtn.addEventListener('click', () => {
      try {
        const backupData = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          data: {
            items: JSON.parse(window.localStorage.getItem(ITEMS_STORAGE_KEY) || '[]'),
            receipts: JSON.parse(window.localStorage.getItem(ORDERS_STORAGE_KEY) || '[]'),
            activeOrder: JSON.parse(window.localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY) || 'null'),
            customers: JSON.parse(window.localStorage.getItem(CUSTOMERS_STORAGE_KEY) || '[]'),
            suppliers: JSON.parse(window.localStorage.getItem(SUPPLIERS_STORAGE_KEY) || '[]'),
            expenses: JSON.parse(window.localStorage.getItem(EXPENSES_STORAGE_KEY) || '[]'),
            manualPrices: JSON.parse(window.localStorage.getItem(MANUAL_PRICES_STORAGE_KEY) || '{}'),
            prepClearedAt: window.localStorage.getItem(PREP_CLEARED_STORAGE_KEY)
          }
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `stockroom_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Backup downloaded successfully!');
      } catch (err) {
        console.error('Backup generation failed', err);
        showToast('Failed to export backup data', true);
      }
    });
  }

  if (selectBackupFileBtn && importBackupFile) {
    selectBackupFileBtn.addEventListener('click', () => {
      importBackupFile.click();
    });

    importBackupFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        backupFileName.textContent = file.name;
        importBackupBtn.style.display = 'block';
      } else {
        backupFileName.textContent = 'No file chosen';
        importBackupBtn.style.display = 'none';
      }
    });
  }

  if (importBackupBtn) {
    importBackupBtn.addEventListener('click', () => {
      const file = importBackupFile.files[0];
      if (!file) {
        showToast('Please select a backup file first', true);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          
          if (!parsed || !parsed.data) {
            throw new Error('Invalid backup file format: missing main data wrapper');
          }

          const d = parsed.data;
          
          // Verify that at least some valid structure exists
          if (!Array.isArray(d.items || []) && !Array.isArray(d.receipts || [])) {
            throw new Error('Invalid backup file: main data elements are missing or incorrect types');
          }

          // Overwrite localStorage keys
          if (d.items) window.localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(d.items));
          if (d.receipts) window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(d.receipts));
          if (d.activeOrder !== undefined) {
            if (d.activeOrder) {
              window.localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(d.activeOrder));
            } else {
              window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
            }
          }
          if (d.customers) window.localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(d.customers));
          if (d.suppliers) window.localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(d.suppliers));
          if (d.expenses) window.localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(d.expenses));
          if (d.manualPrices) window.localStorage.setItem(MANUAL_PRICES_STORAGE_KEY, JSON.stringify(d.manualPrices));
          if (d.prepClearedAt) {
            window.localStorage.setItem(PREP_CLEARED_STORAGE_KEY, d.prepClearedAt);
          } else {
            window.localStorage.removeItem(PREP_CLEARED_STORAGE_KEY);
          }

          showToast('Data imported successfully! Reloading...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);

        } catch (err) {
          console.error('Import failed', err);
          showToast('Error restoring backup: ' + err.message, true);
        }
      };
      reader.readAsText(file);
    });
  }
}

// ---------- Init Loader ----------
function initApp(){
  loadAllData();
  switchTab('items');
  registerServiceWorker();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('Service Worker registration failed', err));
    });
  }
}

initApp();