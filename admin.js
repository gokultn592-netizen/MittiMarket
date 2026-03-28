let db = { products: [], users: [], carts: {}, wishlists: {}, orders: [] };

document.addEventListener('DOMContentLoaded', () => {
    // Check Session Auth
    if(sessionStorage.getItem('admin_auth') === 'true') {
        document.getElementById('authGate').classList.add('hidden');
        document.getElementById('adminPortal').classList.remove('hidden');
        loadDatabase();
        renderDashboard();
    }
});

function checkPasscode() {
    const code = document.getElementById('masterPasscode').value;
    if(code === 'mittimaster2026') {
        sessionStorage.setItem('admin_auth', 'true');
        document.getElementById('authGate').classList.add('hidden');
        document.getElementById('adminPortal').classList.remove('hidden');
        loadDatabase();
        renderDashboard();
    } else {
        document.getElementById('authError').style.display = 'block';
    }
}

function masterLogout() {
    sessionStorage.removeItem('admin_auth');
    location.reload();
}

function loadDatabase() {
    const storedDb = localStorage.getItem('mittimart_db');
    if (storedDb) {
        try {
            db = JSON.parse(storedDb);
            if(!db.orders) db.orders = [];
            if(!db.users) db.users = [];
            if(!db.products) db.products = [];
        } catch(e) { console.error("Admin: DB Parse Failure", e); }
    }
}

function saveGlobalDatabase() {
    localStorage.setItem('mittimart_db', JSON.stringify(db));
    showToast("Master Records Updated");
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.style.bottom = '30px';
    setTimeout(() => { toast.style.bottom = '-50px'; }, 2500);
}

// Nav Switcher
window.showAdminSection = function(id, btnElement) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('productsView').classList.add('hidden');
    document.getElementById('usersView').classList.add('hidden');
    document.getElementById('ordersView').classList.add('hidden');

    document.getElementById(id + 'View').classList.remove('hidden');

    // Load dynamic data on view switch
    loadDatabase(); // ensures we grab live updates if a buyer bought something
    
    if(id === 'dashboard') {
        document.getElementById('pageTitle').innerText = 'Platform Overview';
        renderDashboard();
    } else if(id === 'products') {
        document.getElementById('pageTitle').innerText = 'Global Catalog Oversight';
        renderProducts();
    } else if(id === 'users') {
        document.getElementById('pageTitle').innerText = 'User Management (Moderation)';
        renderUsers();
    } else if(id === 'orders') {
        document.getElementById('pageTitle').innerText = 'Central Order Tracking';
        renderOrders();
    }
};

// 1. Dashboard View
function renderDashboard() {
    // Calc rev from all completed orders
    let rev = 0;
    let completedDeliveries = 0;
    db.orders.forEach(o => { 
        if(o.status === 'completed') {
            rev += o.total; 
            completedDeliveries++;
        }
    });
    
    // Abstract Analytics
    const platformProfit = rev * 0.10; // MittiMart takes 10% commission
    const totalFleetPayouts = completedDeliveries * 40; // Total money lost to rider payouts
    
    document.getElementById('statRevenue').innerText = `₹${rev}`;
    document.getElementById('statProfit').innerText = `₹${platformProfit.toFixed(2)}`;
    document.getElementById('statPayouts').innerText = `₹${totalFleetPayouts}`;
    document.getElementById('statUsers').innerText = db.users.length;
    document.getElementById('statOrders').innerText = db.orders.length;
    document.getElementById('statProducts').innerText = db.products.length;
}

// 2. Products View
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    db.products.forEach(p => {
        tbody.innerHTML += `
            <tr id="prodRow_${p.id}">
                <td style="font-weight:bold;">${p.id}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${p.img}" style="width:30px; height:30px; border-radius:4px; object-fit:cover;">
                        <span>${p.name} <br><small style="color:#aaa;">${p.category}</small></span>
                    </div>
                </td>
                <td>${p.sellerId || 'Native'}</td>
                <td><input type="number" class="admin-input" id="price_${p.id}" value="${p.price}"></td>
                <td><input type="number" class="admin-input" id="stock_${p.id}" value="${p.stock}"></td>
                <td>
                    <button class="btn-action save" onclick="updateProduct(${p.id})">Save Edit</button>
                    <button class="btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}
window.updateProduct = function(id) {
    const newPrice = parseFloat(document.getElementById(`price_${id}`).value);
    const newStock = parseInt(document.getElementById(`stock_${id}`).value);
    const p = db.products.find(x => x.id === id);
    if(p) { p.price = newPrice; p.stock = newStock; saveGlobalDatabase(); }
};
window.deleteProduct = function(id) {
    if(confirm("Confirm destructive deletion of Product ID " + id + "?")) {
        const idx = db.products.findIndex(x => x.id === id);
        if(idx > -1) { db.products.splice(idx, 1); saveGlobalDatabase(); renderProducts(); }
    }
};

// 3. Users View
function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    db.users.forEach(u => {
        const isBlocked = !!u.isBlocked;
        const statusBadge = isBlocked ? '<span class="badge blocked">Blocked</span>' : '<span class="badge active">Active</span>';
        const actionBtn = isBlocked 
            ? `<button class="btn-success" onclick="toggleBlockUser(${u.id}, false)">Unblock</button>`
            : `<button class="btn-danger" onclick="toggleBlockUser(${u.id}, true)">Suspend</button>`;

        const deleteBtn = `<button class="btn-danger" style="background:var(--brand-primary); color:white; border:none; margin-left:5px;" onclick="masterDeleteUser(${u.id})">Nuke</button>`;

        tbody.innerHTML += `
            <tr>
                <td style="font-weight:bold;">${u.id}</td>
                <td>${u.name}</td>
                <td>${u.phone || 'N/A'}</td>
                <td style="text-transform:capitalize;">${u.role}</td>
                <td>${statusBadge}</td>
                <td style="display:flex;">${actionBtn} ${deleteBtn}</td>
            </tr>
        `;
    });
}
window.toggleBlockUser = function(id, blockState) {
    const u = db.users.find(x => x.id === id);
    if(u) {
        u.isBlocked = blockState; 
        saveGlobalDatabase(); 
        renderUsers();
    }
};
window.masterDeleteUser = function(id) {
    if(confirm("CRITICAL WARNING: This will permanently erase User ID " + id + ". This action cannot be natively undone. Proceed?")) {
        const idx = db.users.findIndex(x => x.id === id);
        if(idx > -1) {
            db.users.splice(idx, 1);
            saveGlobalDatabase();
            renderUsers();
        }
    }
}

// 4. Orders View
function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    // Reverse to show newest first conceptually
    [...db.orders].reverse().forEach(o => {
        // Safe DOM IDs without hashtag symbols
        const cleanId = String(o.id).replace('#', '');
        
        let statusOptions = ['pending', 'active', 'completed', 'canceled'].map(opt => 
            `<option value="${opt}" ${o.status === opt ? 'selected' : ''}>${opt.toUpperCase()}</option>`
        ).join('');
        
        tbody.innerHTML += `
            <tr>
                <td style="font-weight:bold;">${o.id}</td>
                <td>${o.buyerId} <br><small style="color:#aaa;">${o.buyerName}</small></td>
                <td><small style="line-height:1.4; display:block;">${o.items ? o.items.map(i => `${i.quantity}x ${i.name}`).join('<br>') : 'No items'}</small></td>
                <td style="font-weight:bold; color:var(--accent-green);">₹${o.total}</td>
                <td>${o.riderId || 'Unassigned'}</td>
                <td>
                    <select class="admin-select" id="orderStatus_${cleanId}">${statusOptions}</select>
                </td>
                <td>
                    <button class="btn-action save" onclick="updateOrder('${o.id}')">Apply Override</button>
                    ${o.status !== 'canceled' ? `<button class="btn-danger" style="margin-top:5px;" onclick="cancelOrder('${o.id}')">Force Cancel</button>` : ''}
                </td>
            </tr>
        `;
    });
}
window.updateOrder = function(id) {
    const cleanId = String(id).replace('#', '');
    const newStatus = document.getElementById(`orderStatus_${cleanId}`).value;
    const o = db.orders.find(x => x.id === id);
    if(o) { o.status = newStatus; saveGlobalDatabase(); renderOrders(); }
};
window.cancelOrder = function(id) {
    if(confirm("Force cancel order " + id + " without refunding?")) {
        const o = db.orders.find(x => x.id === id);
        if(o) { o.status = 'canceled'; saveGlobalDatabase(); renderOrders(); }
    }
};
