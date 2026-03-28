// Pure JS Mock Backend & Frontend Logic
let currentUser = null;
let debounceTimer;
let currentCategory = '';
let currentSearch = '';

// Realistic Mock DB for Tamil Nadu Farm-to-Table with TRUE AI GENERATED IMAGES
const db = {
    products: [
        { id: 1, name: "Karuppu Kavuni Rice", category: "rice", price: 180.0, unit: "1 kg", stock: 50, rating: "4.9", reviews: 214, img: "images/mittimart_black_rice_1774717842790.png" },
        { id: 2, name: "Mapillai Samba Rice", category: "rice", price: 150.0, unit: "1 kg", stock: 80, rating: "4.8", reviews: 156, img: "images/mittimart_red_rice_1774717862093.png" },
        { id: 3, name: "Cold Pressed Groundnut Oil", category: "oils", price: 320.0, unit: "1 L", stock: 30, rating: "4.9", reviews: 342, img: "images/mittimart_groundnut_oil_1774717878748.png" },
        { id: 4, name: "Cold Pressed Sesame Oil", category: "oils", price: 450.0, unit: "1 L", stock: 25, rating: "4.9", reviews: 412, img: "images/mittimart_sesame_oil_1774717895512.png" },
        { id: 5, name: "Organic Ragi (Finger Millet)", category: "millets", price: 80.0, unit: "1 kg", stock: 100, rating: "4.7", reviews: 98, img: "images/mittimart_ragi_1774717916507.png" },
        { id: 6, name: "Organic Kambu (Pearl Millet)", category: "millets", price: 70.0, unit: "1 kg", stock: 120, rating: "4.6", reviews: 75, img: "images/mittimart_pearl_millet_1774717937515.png" },
        { id: 7, name: "Nattu Sakkarai (Organic Jaggery)", category: "sweeteners", price: 110.0, unit: "1 kg", stock: 60, rating: "4.8", reviews: 520, img: "images/mittimart_jaggery_1774717954723.png" },
        { id: 8, name: "Naattu Thakkali (Country Tomato)", category: "vegetables", price: 60.0, unit: "1 kg", stock: 150, rating: "4.5", reviews: 310, img: "images/mittimart_tomatoes_1774717972229.png" },
        { id: 9, name: "Murungakkai (Drumstick)", category: "vegetables", price: 80.0, unit: "500 g", stock: 80, rating: "4.7", reviews: 145, img: "images/mittimart_drumsticks_1774717990482.png" },
        { id: 10, name: "Sambar Vengayam (Small Onion)", category: "vegetables", price: 90.0, unit: "1 kg", stock: 200, rating: "4.8", reviews: 405, img: "images/mittimart_small_onions_1774718011186.png" },
        { id: 11, name: "Karutha Columban Mango", category: "fruits", price: 160.0, unit: "1 kg", stock: 40, rating: "5.0", reviews: 890, img: "images/mittimart_mango_1774718027608.png" },
        { id: 12, name: "Red Banana", category: "fruits", price: 80.0, unit: "6 pcs", stock: 90, rating: "4.6", reviews: 220, img: "images/mittimart_red_banana_1774718046416.png" },
        { id: 13, name: "Traditional Filter Coffee Powder", category: "beverages", price: 600.0, unit: "1 kg", stock: 50, rating: "4.9", reviews: 670, img: "images/mittimart_filter_coffee_1774718066731.png" },
        { id: 14, name: "Mankupanai (Clay Water Pot)", category: "earthenware", price: 250.0, unit: "1 pc", stock: 20, rating: "4.7", reviews: 315, img: "images/mittimart_clay_pot_1774718092274.png" },
        { id: 15, name: "Pure A2 Cow Milk", category: "dairy", price: 75.0, unit: "1 L", stock: 50, rating: "4.9", reviews: 500, img: "images/mittimart_a2_milk_1774719413119.png" },
        { id: 16, name: "Fresh Malai Paneer", category: "dairy", price: 120.0, unit: "200 g", stock: 30, rating: "4.8", reviews: 310, img: "images/mittimart_paneer_1774719431118.png" },
        { id: 17, name: "Organic Thick Curd", category: "dairy", price: 40.0, unit: "500 g", stock: 100, rating: "4.7", reviews: 290, img: "images/mittimart_curd_1774719450813.png" },
        { id: 18, name: "Pure Desi Cow Ghee", category: "dairy", price: 650.0, unit: "500 ml", stock: 20, rating: "5.0", reviews: 850, img: "images/user_desi_ghee.jpg" }
    ],
    users: [],
    carts: {},
    wishlists: {},
    orders: [],
    nextOrderId: 1001,
    nextUserId: 501,
    nextProductId: 19
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    const storedDb = localStorage.getItem('mittimart_db');
    if (storedDb) {
        try {
            const parsed = JSON.parse(storedDb);
            db.users = parsed.users || [];
            db.carts = parsed.carts || {};
            db.wishlists = parsed.wishlists || {};
            db.orders = parsed.orders || [];
            db.nextOrderId = parsed.nextOrderId || 1001;
            db.nextUserId = parsed.nextUserId || 501;
            db.nextProductId = parsed.nextProductId || 19;
            if(parsed.products) {
                db.products = parsed.products;
            }
        } catch(e) {}
    }

    const storedUser = localStorage.getItem('mittimart_user');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateNavAuth();
        } catch(e) {}
    } else {
        document.body.className = '';
    }

    refreshRouting();
});

function saveDb() {
    localStorage.setItem('mittimart_db', JSON.stringify(db));
}

// Global UI Updater
function updateUI() {
    updateCartCount();
    updateCardButtons();
    updateStickyStrip();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.bottom = '100px'; 
    setTimeout(() => { toast.style.bottom = '-50px'; }, 2500);
}

// Navigation & Sections
window.showSection = function(id, btnElement) {
    document.getElementById('productsSection').classList.add('hidden');
    document.getElementById('sellersSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('deliverySection').classList.add('hidden');
    document.getElementById('buyerHeroSection').classList.add('hidden');

    if (id === 'products') {
        document.getElementById('buyerHeroSection').classList.remove('hidden');
    }

    document.getElementById(id + 'Section').classList.remove('hidden');

    if (btnElement) {
        const bottomNavs = document.querySelectorAll('.mobile-bottom-nav .b-nav-item');
        bottomNavs.forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    } else if (id === 'products') {
        const firstNav = document.querySelector('.mobile-bottom-nav .b-nav-item:first-child');
        if(firstNav) firstNav.classList.add('active');
    }

    if (id === 'products') fetchProducts();
    if (id === 'sellers') fetchNearestSellers();
    if (id === 'dashboard') renderDashboardProducts();
    if (id === 'delivery') renderDeliveryOrders();
};

function refreshRouting() {
    if (currentUser && currentUser.role === 'seller') {
        document.body.className = 'role-seller';
        showSection('dashboard');
    } else if (currentUser && currentUser.role === 'delivery') {
        document.body.className = 'role-delivery';
        showSection('delivery');
    } else {
        document.body.className = 'role-buyer';
        showSection('products');
    }
}

window.filterProducts = function(cat, event) {
    document.querySelectorAll('.cat-bubble').forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');
    currentCategory = cat;
    fetchProducts();
};

window.debounceSearch = function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        currentSearch = document.getElementById('searchInput').value.toLowerCase();
        fetchProducts();
    }, 200);
};

window.fetchProducts = function() {
    let prods = db.products;
    if (currentCategory) prods = prods.filter(p => p.category === currentCategory);
    if (currentSearch) prods = prods.filter(p => p.name.toLowerCase().includes(currentSearch));
    renderProducts(prods, 'productsGrid');
};

function isWished(productId) {
    if (!currentUser) return false;
    return (db.wishlists[currentUser.id] || []).includes(productId);
}

window.toggleWishlist = function(productId, event) {
    if (!currentUser) { openAuthModal(); return; }
    event.stopPropagation();
    
    if (!db.wishlists[currentUser.id]) db.wishlists[currentUser.id] = [];
    const list = db.wishlists[currentUser.id];
    const idx = list.indexOf(productId);
    
    if (idx > -1) {
        list.splice(idx, 1);
        event.target.classList.remove('wished');
        event.target.innerHTML = '🤍';
    } else {
        list.push(productId);
        event.target.classList.add('wished');
        event.target.innerHTML = '❤️';
        showToast("Added to Wishlist");
    }
    saveDb();
};

// Rendering Items
function renderProducts(products, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return; 
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center;width:100%;padding:40px;">No items found matching your criteria.</p>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.dataset.id = p.id;
        
        let heartIcon = isWished(p.id) ? '❤️' : '🤍';
        let heartClass = isWished(p.id) ? 'heart-wishlist wished buyer-only' : 'heart-wishlist buyer-only';
        let stockCls = p.stock <= 0 ? '<div class="pd-stock-alert">Out of Stock</div>' : '';

        let oldPrice = (p.price * 1.2).toFixed(0);

        let actionArea = containerId === 'sellerProductsGrid' ? 
            '<div class="btn-container"><button class="delete-btn" onclick="deleteProduct(' + p.id + ')">Remove</button></div>' :
            '<div class="btn-container" data-pid="' + p.id + '"></div>';

        card.innerHTML = '\
            <div class="badge-timer">⏱️ 10 MINS</div>\
            <button class="' + heartClass + '" onclick="toggleWishlist(' + p.id + ', event)">' + heartIcon + '</button>\
            <img src="' + p.img + '" alt="' + p.name + '" class="card-img" loading="lazy">\
            <div class="card-body">\
                <h3 class="pd-title">' + p.name + '</h3>\
                <div class="pd-unit">' + p.unit + '</div>\
                ' + stockCls + '\
                <div class="price-row">\
                    <div>\
                        <span class="pd-old-price buyer-only">₹' + oldPrice + '</span>\
                        <span class="pd-price">₹' + p.price + '</span>\
                    </div>\
                    ' + actionArea + '\
                </div>\
            </div>\
        ';
        grid.appendChild(card);
    });

    if (containerId === 'productsGrid') updateCardButtons();
}

function updateCardButtons() {
    const list = document.querySelectorAll('.btn-container[data-pid]');
    list.forEach(container => {
        const pid = parseInt(container.dataset.pid);
        const p = db.products.find(x => x.id === pid);
        if (!p) return;

        let cartItem = null;
        if (currentUser && db.carts[currentUser.id]) {
            cartItem = db.carts[currentUser.id].find(i => i.productId === pid);
        }

        if (p.stock <= 0) {
            container.innerHTML = '<button class="add-btn" disabled style="background:#ddd; border:none; color:#999;">OOS</button>';
            return;
        }

        if (cartItem && cartItem.quantity > 0) {
            container.innerHTML = '\
                <div class="counter-box">\
                    <button onclick="updateCartQuantity(' + pid + ', -1, event)">-</button>\
                    <span>' + cartItem.quantity + '</span>\
                    <button onclick="updateCartQuantity(' + pid + ', 1, event)">+</button>\
                </div>\
            ';
        } else {
            container.innerHTML = '<button class="add-btn" onclick="addToCart(' + pid + ', 1, event)">ADD</button>';
        }
    });
}

// Cart Logic
window.addToCart = function(productId, quantity, event) {
    if (!currentUser) { openAuthModal(); return; }
    if (currentUser.role === 'seller' || currentUser.role === 'delivery') { showToast("Sellers/Riders cannot use the cart."); return; }
    if (event) event.stopPropagation();
    
    if (!db.carts[currentUser.id]) db.carts[currentUser.id] = [];
    const cart = db.carts[currentUser.id];
    const product = db.products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return;

    cart.push({
        productId: product.id, name: product.name, price: product.price,
        img: product.img, unit: product.unit, quantity: quantity
    });
    
    saveDb();
    updateUI();
    showToast("Added to Cart");
};

window.updateCartQuantity = function(productId, delta, event) {
    if (event) event.stopPropagation();
    if (!currentUser || currentUser.role !== 'buyer') return;
    
    const cart = db.carts[currentUser.id];
    if(!cart) return;
    
    const idx = cart.findIndex(i => i.productId === productId);
    if (idx > -1) {
        cart[idx].quantity += delta;
        if (cart[idx].quantity <= 0) {
            cart.splice(idx, 1);
            showToast("Item removed");
        }
        saveDb();
        updateUI();
        renderCart(cart); 
    }
};

window.updateCartCount = function() {
    let count = 0;
    if (currentUser && db.carts[currentUser.id]) {
        count = db.carts[currentUser.id].reduce((sum, item) => sum + item.quantity, 0);
    }
    
    const badge = document.getElementById('cartCount');
    if (badge) badge.innerText = count;
    
    const mBadge = document.getElementById('mobileCartBadge');
    if (mBadge) mBadge.innerText = count;
};

function updateStickyStrip() {
    const strip = document.getElementById('stickyCartStrip');
    if (!strip) return;
    
    if (!currentUser || currentUser.role !== 'buyer' || !db.carts[currentUser.id] || db.carts[currentUser.id].length === 0) {
        strip.classList.add('hidden');
        return;
    }
    
    const cart = db.carts[currentUser.id];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('stripItemCount').innerText = count + (count > 1 ? ' items' : ' item');
    document.getElementById('stripTotal').innerText = '₹' + total;
    strip.classList.remove('hidden');
}

window.openCart = function() {
    if (!currentUser) { openAuthModal(); return; }
    if (currentUser.role !== 'buyer') { showToast("Not available for sellers/riders."); return; }
    const cart = db.carts[currentUser.id] || [];
    renderCart(cart);
    document.getElementById('cartModal').classList.remove('hidden');
    document.getElementById('checkoutMsg').innerText = '';
};

window.closeCartModal = function() { document.getElementById('cartModal').classList.add('hidden'); };

function renderCart(items) {
    const container = document.getElementById('cartItems');
    if (!container) return;
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 40px 0;"><span style="font-size:3rem;display:block;">🛒</span><br><p>Your cart is empty.</p></div>';
        document.getElementById('cartSubtotal').innerText = '₹0';
        document.getElementById('cartDelivery').innerText = '₹0';
        document.getElementById('cartTotal').innerText = '₹0';
        
        let chkArea = document.getElementById('checkoutArea');
        if(chkArea) chkArea.innerHTML = '<button class="btn-checkout" id="checkoutBtn" disabled>Checkout & Assign Rider</button>';
        return;
    }

    let subtotal = 0;
    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        container.innerHTML += '\
            <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:10px; border-radius:10px; margin-bottom:10px; border:1px solid #eee;">\
                <div style="display:flex; align-items:center; gap:10px;">\
                    <img src="' + item.img + '" style="width:50px;height:50px;object-fit:cover;border-radius:8px;">\
                    <div>\
                        <div style="font-weight:600;font-size:0.9rem;">' + item.name + '</div>\
                        <div style="color:#666;font-size:0.8rem;">' + item.unit + ' • ₹' + item.price + '</div>\
                    </div>\
                </div>\
                <div style="display:flex; flex-direction:column; align-items:flex-end;">\
                    <div class="counter-box" style="transform:scale(0.8); transform-origin:right;">\
                        <button onclick="updateCartQuantity(' + item.productId + ', -1, event)">-</button>\
                        <span>' + item.quantity + '</span>\
                        <button onclick="updateCartQuantity(' + item.productId + ', 1, event)">+</button>\
                    </div>\
                    <strong style="font-size:0.95rem; margin-top:5px;">₹' + itemTotal + '</strong>\
                </div>\
            </div>\
        ';
    });

    // ETA Mock Calculation for formatting
    const delivery = subtotal > 300 ? 0 : 40;
    const total = subtotal + delivery;

    document.getElementById('cartSubtotal').innerText = '₹' + subtotal;
    document.getElementById('cartDelivery').innerText = delivery === 0 ? 'FREE' : '₹' + delivery;
    document.getElementById('cartTotal').innerText = '₹' + total;
    
    let chkArea = document.getElementById('checkoutArea');
    if(chkArea) chkArea.innerHTML = '<button class="btn-checkout" id="checkoutBtn" onclick="checkout()">Checkout & Assign Rider</button>';
}

// Distance & ETA Engine
const toRad = x => x * Math.PI / 180;
const calcDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; const dLat = toRad(lat2 - lat1); const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};
const calcETA = (lat1, lon1, lat2, lon2) => {
    const distanceKm = calcDistance(lat1, lon1, lat2, lon2);
    // Assume average city driving speed of 30 km/h (0.5 km/min). Plus 5 mins buffer.
    const timeMinutes = Math.floor(distanceKm * 2) + 5; 
    return timeMinutes; // minutes
};

window.checkout = function() {
    const cart = db.carts[currentUser.id] || [];
    if(cart.length === 0) return;
    
    const orderId = '#MM' + db.nextOrderId++;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal > 300 ? subtotal : subtotal + 40;

    // Simulate finding the nearest seller representing the "Local Farm Depot"
    let sellerLat = 13.0850; 
    let sellerLon = 80.2750;
    
    const etaMins = calcETA(currentUser.lat || 13.0827, currentUser.lon || 80.2707, sellerLat, sellerLon);

    const newOrder = {
        id: orderId,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        buyerLoc: { lat: currentUser.lat || 13.0827, lon: currentUser.lon || 80.2707 },
        sellerLoc: { lat: sellerLat, lon: sellerLon },
        items: [...cart],
        total: total,
        eta: etaMins,
        status: 'pending', // 'pending' -> 'active' -> 'completed'
        riderId: null
    };

    db.orders.push(newOrder);
    db.carts[currentUser.id] = [];
    saveDb();
    updateUI();
    
    document.getElementById('checkoutArea').innerHTML = `
        <div style="background:#e5f6e5;color:#0c831f;padding:15px;border-radius:12px;text-align:center;font-weight:bold;margin-top:10px;">
            <div style="margin-bottom:5px;">Order Placed! ID: ${orderId}</div>
            <div style="font-size:1.5rem;">⏱️ ~${etaMins} MINS</div>
            <div style="font-size:0.85rem;color:#666;font-weight:normal;">Finding nearest delivery partner...</div>
        </div>
    `;
    
    setTimeout(() => { closeCartModal(); }, 3500);
};

// Rider Logic
window.renderDeliveryOrders = function() {
    if(!currentUser || currentUser.role !== 'delivery') return;
    
    const pendingContainer = document.getElementById('pendingOrdersList');
    const activeContainer = document.getElementById('activeDeliveriesList');
    const completedContainer = document.getElementById('completedOrdersList');

    const pendingOrders = db.orders.filter(o => o.status === 'pending');
    const myActiveOrders = db.orders.filter(o => o.status === 'active' && o.riderId === currentUser.id);
    const myCompletedOrders = db.orders.filter(o => o.status === 'completed' && o.riderId === currentUser.id);

    // Update Wallet Stats
    const totalEarnings = myCompletedOrders.length * 40;
    document.getElementById('riderWallet').innerText = `₹${totalEarnings}`;
    document.getElementById('riderPendingCount').innerText = pendingOrders.length;
    document.getElementById('riderDeliveredCount').innerText = myCompletedOrders.length;

    // Render Pending
    if(pendingOrders.length === 0) {
        pendingContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 20px 0;">No unassigned orders available.</p>';
    } else {
        pendingContainer.innerHTML = pendingOrders.map(o => `
            <div class="order-card" style="margin-bottom: 10px;">
                <div class="eta-badge">⏱️ ${o.eta} MINS</div>
                <div class="order-card-header">Order ${o.id}</div>
                <div class="order-route">
                    <div class="route-node pickup"><span class="dot"></span> Local Farm Depot</div>
                    <div class="route-node dropoff"><span class="dot"></span> Customer (${o.buyerName})</div>
                </div>
                <div class="order-items">Items: ${o.items.map(i => i.name).join(', ')}</div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:var(--brand-green);">Payout: ₹40</strong>
                    <strong>Items Total: ₹${o.total}</strong>
                </div>
                <button class="btn-accept" onclick="acceptOrder('${o.id}')">Accept Order</button>
            </div>
        `).join('');
    }

    // Render Active
    if(myActiveOrders.length === 0) {
        activeContainer.innerHTML = '<div style="background:var(--card-white); border-radius:12px; padding:20px; border:1px dotted var(--border-color); text-align:center;"><p style="color:var(--text-muted);">You have no active routes.</p></div>';
    } else {
        activeContainer.innerHTML = myActiveOrders.map(o => `
            <div class="order-card" style="border: 2px solid var(--brand-green);">
                <div class="eta-badge" style="background:var(--brand-green); color:white;">ACTIVE: ${o.eta} MINS</div>
                <div class="order-card-header">Delivery Route: ${o.id}</div>
                <div class="order-route">
                    <div class="route-node pickup"><span class="dot"></span> Pickup at: Local Farm Depot</div>
                    <div class="route-node dropoff" style="font-weight:bold; color:var(--text-dark);"><span class="dot"></span> Drop off at: Customer (${o.buyerName})</div>
                </div>
                <button class="btn-complete" onclick="markDelivered('${o.id}')">Mark as Delivered</button>
            </div>
        `).join('');
    }

    // Render Completed
    if(myCompletedOrders.length === 0) {
        completedContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 10px 0;">No completed deliveries yet.</p>';
    } else {
        completedContainer.innerHTML = myCompletedOrders.map(o => `
            <div style="background:var(--card-white); border-radius:8px; padding:12px; border:1px solid #ddd; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-weight:bold; color:var(--text-dark); font-size:0.9rem;">${o.id}</div>
                    <div style="color:var(--text-muted); font-size:0.75rem;">To: ${o.buyerName}</div>
                </div>
                <div style="text-align:right;">
                    <strong style="color:var(--brand-green);">+ ₹40</strong>
                    <div style="color:#aaa; font-size:0.75rem;">Delivered</div>
                </div>
            </div>
        `).join('');
    }
};

window.acceptOrder = function(orderId) {
    const order = db.orders.find(o => o.id === orderId);
    if(order && order.status === 'pending') {
        order.status = 'active';
        order.riderId = currentUser.id;
        saveDb();
        renderDeliveryOrders();
        showToast("Route Assigned to You!");
    }
};

window.markDelivered = function(orderId) {
    const order = db.orders.find(o => o.id === orderId);
    if(order && order.status === 'active') {
        order.status = 'completed';
        saveDb();
        renderDeliveryOrders();
        showToast("Great job! Delivery complete.");
    }
};

// Auth 
window.openAuthModal = function() {
    if(!currentUser) {
        document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('authError').innerText = '';
    } else {
        document.getElementById('userProfile').classList.toggle('hidden');
    }
};

window.closeAuthModal = function() { document.getElementById('authModal').classList.add('hidden'); };

window.switchAuthTab = function(tab) {
    document.getElementById('tabLogin').classList.remove('active');
    document.getElementById('tabRegister').classList.remove('active');
    document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    
    if (tab === 'register') {
        document.getElementById('registerFields').classList.remove('hidden');
        document.getElementById('submitAuth').innerText = 'Register';
    } else {
        document.getElementById('registerFields').classList.add('hidden');
        document.getElementById('submitAuth').innerText = 'Login';
    }
};

window.handleAuth = async function(e) {
    e.preventDefault();
    const isRegister = document.getElementById('tabRegister').classList.contains('active');
    const phone = document.getElementById('authPhone').value;
    const password = document.getElementById('authPassword').value;

    try {
        if (isRegister) {
            const name = document.getElementById('authName').value;
            const role = document.getElementById('authRole').value;
            if(!name || !phone || !password) throw new Error("Please fill all fields");
            if(db.users.find(u => u.phone === phone)) throw new Error("Number already registered.");

            // Add distinct loc bounds for fun ETA variation roughly
            let lat = 13.0827 + (Math.random() * 0.05); 
            let lon = 80.2707 + (Math.random() * 0.05);
            const newUser = { id: db.nextUserId++, name, phone, password, role, lat, lon };
            db.users.push(newUser);
            currentUser = { id: newUser.id, name: newUser.name, role: newUser.role, lat, lon };
        } else {
            const user = db.users.find(u => u.phone === phone && u.password === password);
            if (!user) throw new Error("Invalid phone or password");
            currentUser = { id: user.id, name: user.name, role: user.role, lat: user.lat, lon: user.lon };
        }
        
        saveDb();
        localStorage.setItem('mittimart_user', JSON.stringify(currentUser));
        updateNavAuth();
        closeAuthModal();
        updateUI(); 
        refreshRouting();
        showToast("Logged in successfully");
    } catch (err) {
        document.getElementById('authError').innerText = err.message;
    }
};

window.updateNavAuth = function() {
    const navAuth = document.getElementById('navAuth');
    const userProfile = document.getElementById('userProfile');
    if (!navAuth || !userProfile) return;

    if (currentUser) {
        navAuth.classList.add('hidden');
        userProfile.classList.remove('hidden');
        document.getElementById('userName').innerText = currentUser.name.split(' ')[0];
    } else {
        navAuth.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
};

window.logout = function() {
    currentUser = null;
    localStorage.removeItem('mittimart_user');
    updateNavAuth();
    document.getElementById('userProfile').classList.add('hidden');
    updateUI();
    refreshRouting();
    showToast("Logged out");
};

// Canvas Compressor to safely convert Images to tiny Base64 JPEGs for LocalStorage
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const targetW = 400; const targetH = 300;
                const ratio = img.width / img.height; const targetRatio = targetW / targetH;
                
                canvas.width = targetW; canvas.height = targetH;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#f8f8f8'; ctx.fillRect(0, 0, targetW, targetH);
                
                let sx = 0, sy = 0, sw = img.width, sh = img.height;
                if(ratio > targetRatio) { sw = img.height * targetRatio; sx = (img.width - sw) / 2; } 
                else { sh = img.width / targetRatio; sy = (img.height - sh) / 2; }

                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

window.handleAddNewProduct = async function(event) {
    event.preventDefault();
    if(!currentUser || currentUser.role !== 'seller') return;

    const name = document.getElementById('prodName').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const category = document.getElementById('prodCategory').value;
    const unit = document.getElementById('prodUnit').value;
    const stock = parseInt(document.getElementById('prodStock').value);
    
    let finalImg = "https://loremflickr.com/400/300/farm,fresh";
    
    const fileInput = document.getElementById('prodImageUpload');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
            finalImg = await compressImage(fileInput.files[0]);
        } catch(e) {
            console.error("Image processing failed:", e);
            showToast("Failed to process image nicely. Using default.");
        }
    }

    const newProd = {
        id: db.nextProductId++, sellerId: currentUser.id, name: name, category: category,
        price: price, unit: unit, stock: stock, rating: "New", reviews: 0, img: finalImg
    };

    db.products.push(newProd);
    saveDb();
    document.getElementById('addProductForm').reset();
    showToast("Product successfully published!");
    renderDashboardProducts();
};

window.renderDashboardProducts = function() {
    if(!currentUser || currentUser.role !== 'seller') return;
    
    const myProductsList = db.products.filter(p => p.sellerId === currentUser.id);
    const myProductIds = myProductsList.map(p => p.id);

    let pendingCount = 0;
    let deliveredCount = 0;
    let wallet = 0;
    let relevantOrdersHTML = '';

    db.orders.forEach(o => {
        const myItemsInOrder = o.items.filter(item => myProductIds.includes(item.productId));
        if (myItemsInOrder.length > 0) {
            const orderTotalForMe = myItemsInOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            if (o.status === 'completed') {
                deliveredCount++;
                wallet += orderTotalForMe;
            } else {
                pendingCount++;
            }

            const statusColor = o.status === 'completed' ? 'var(--brand-green)' : 'var(--badge-bg)';
            const statusTextColor = o.status === 'completed' ? 'white' : 'black';

            relevantOrdersHTML += `
                <div style="background:var(--card-white); border-radius:12px; padding:15px; border:1px solid var(--border-color); margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <strong style="font-size:1rem; color:var(--text-dark);">${o.id}</strong>
                        <span style="background:${statusColor}; color:${statusTextColor}; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight:bold; text-transform:uppercase;">${o.status}</span>
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px;">
                        To: Customer (${o.buyerName}) 
                        <span style="margin-left:10px; opacity:0.7;">Route ETA: ~${o.eta} MINS</span>
                    </div>
                    <div style="background:var(--bg-gray); padding:10px; border-radius:8px; font-size:0.85rem; color:var(--text-dark); margin-bottom:10px; line-height: 1.6;">
                        ${myItemsInOrder.map(i => `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:5px;"><span>${i.quantity}x ${i.name}</span><span>₹${i.price * i.quantity}</span></div>`).join('')}
                    </div>
                    <div style="text-align:right; font-weight:800; color:var(--brand-green); font-size:1.1rem;">
                        My Earnings: ₹${orderTotalForMe}
                    </div>
                </div>
            `;
        }
    });

    document.getElementById('sellerWallet').innerText = `₹${wallet}`;
    document.getElementById('sellerPendingCount').innerText = pendingCount;
    document.getElementById('sellerDeliveredCount').innerText = deliveredCount;

    const ordersContainer = document.getElementById('sellerOrdersList');
    if (relevantOrdersHTML === '') {
        ordersContainer.innerHTML = '<div style="background:white; border:1px dashed #ccc; border-radius:12px; text-align:center; color:var(--text-muted); padding:20px; font-size:0.9rem;">You have no customer orders yet. Add products to get started!</div>';
    } else {
        ordersContainer.innerHTML = relevantOrdersHTML;
    }

    renderProducts(myProductsList, 'sellerProductsGrid');
};

window.deleteProduct = function(prodId) {
    const idx = db.products.findIndex(p => p.id === prodId && p.sellerId === currentUser.id);
    if(idx > -1) {
        db.products.splice(idx, 1);
        saveDb();
        renderDashboardProducts();
        showToast("Product removed");
    }
};

// GPS Sellers
window.fetchNearestSellers = function() {
    const status = document.getElementById('gpsStatus');
    status.innerText = "Locating your position...";
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude; const lon = pos.coords.longitude;
                status.innerText = "GPS Located! Fetching sellers...";
                calculateSellers(lat, lon);
            },
            (err) => {
                status.innerText = "GPS Denied. Showing defaults.";
                calculateSellers(13.0827, 80.2707);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        status.innerText = "Geolocation not supported.";
        calculateSellers(13.0827, 80.2707);
    }
};

function calculateSellers(lat, lon) {
    let sellers = db.users.filter(u => u.role === 'seller');
    if (sellers.length === 0) {
        sellers = [
            { name: "Global Farmers Co-op", lat: 13.0827, lon: 80.2707 },
            { name: "Velanmai Farms", lat: 13.1, lon: 80.2 }
        ];
    }
    
    const results = sellers.map(s => ({ ...s, distanceKm: calcDistance(lat, lon, s.lat, s.lon).toFixed(1) }))
                           .sort((a,b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));
    
    const container = document.getElementById('sellersList');
    container.innerHTML = '';
    results.forEach(s => {
        container.innerHTML += '\
            <div style="background:#fff;border-radius:12px;padding:15px;margin-bottom:15px;border:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;">\
                <div><strong style="color:var(--text-dark);font-size:1.1rem;">' + s.name + '</strong><br><small style="color:var(--text-muted);">Farmer</small></div>\
                <div style="background:var(--brand-light-green);color:var(--brand-green);font-weight:700;padding:5px 12px;border-radius:20px;font-size:0.9rem;">📍 ' + s.distanceKm + ' km</div>\
            </div>';
    });
}
