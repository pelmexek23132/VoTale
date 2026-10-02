document.addEventListener('DOMContentLoaded', () => {
    const productCard = document.querySelector('.product-card');
    const totalPriceEl = document.getElementById('total-price');
    const currentImg = document.getElementById('current-img');
    const thumbs = document.querySelectorAll('.thumb');
    
    // Елементи кошика
    const cartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalSumEl = document.getElementById('cart-total-sum');
    const addToCartBtn = document.getElementById('add-to-cart-page');
    const quickBuyBtn = document.querySelector('.quick-buy-btn');

    // Отримуємо базову ціну безпосередньо з атрибута HTML-картки
    const basePrice = productCard ? (parseInt(productCard.getAttribute('data-base-price')) || parseInt(productCard.getAttribute('data-price')) || 0) : 0;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function renderCart() {
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountEl) {
            cartCountEl.textContent = totalCount;
        }

        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #8a8a9e;">Кошик порожній</p>';
            if (cartTotalSumEl) cartTotalSumEl.textContent = '0 ₴';
            return;
        }

        let totalSum = 0;

        cart.forEach((item, index) => {
            totalSum += item.price * item.quantity;

            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <img src="${item.img}" alt="${item.title}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div style="font-size: 11px; color: #8a8a9e;">
                        ${item.color ? 'Колір: ' + item.color : ''} ${item.warranty ? '| ' + item.warranty : ''}
                    </div>
                    <div class="cart-item-price">${item.quantity} x ${item.price.toLocaleString('uk-UA')} ₴</div>
                </div>
                <button class="remove-item-btn" data-index="${index}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        if (cartTotalSumEl) {
            cartTotalSumEl.textContent = totalSum.toLocaleString('uk-UA') + ' ₴';
        }

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                cart.splice(idx, 1);
                saveCart();
                renderCart();
            });
        });
    }

    function addToCart() {
        if (!productCard) return;

        const id = productCard.getAttribute('data-id');
        const title = productCard.getAttribute('data-title');
        const price = parseInt(productCard.getAttribute('data-price'));
        const img = productCard.getAttribute('data-img');
        const color = productCard.getAttribute('data-selected-color');
        const warranty = productCard.getAttribute('data-selected-warranty');

        const existingItemIndex = cart.findIndex(item => 
            item.id === id && item.color === color && item.warranty === warranty
        );

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ id, title, price, img, color, warranty, quantity: 1 });
        }

        saveCart();
        renderCart();
    }

    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            renderCart();
            if (cartModal) cartModal.classList.add('active');
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartModal) cartModal.classList.remove('active');
        });
    }

    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) cartModal.classList.remove('active');
        });
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCart();
            if (cartModal) cartModal.classList.add('active');
        });
    }

    if (quickBuyBtn) {
        quickBuyBtn.addEventListener('click', () => {
            addToCart();
            if (cartModal) cartModal.classList.add('active');
        });
    }

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            if (currentImg) currentImg.src = thumb.src;
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            if (productCard) productCard.setAttribute('data-img', thumb.src);
        });
    });

    function updateTotalPrice() {
        if (!totalPriceEl || !productCard) return;
        let addedPrice = 0;
        let selectedColor = '';
        let selectedWarranty = '';

        document.querySelectorAll('.option-btn.active').forEach(btn => {
            addedPrice += parseInt(btn.getAttribute('data-add-price')) || 0;
        });

        const finalPrice = basePrice + addedPrice;
        totalPriceEl.textContent = finalPrice.toLocaleString('uk-UA') + ' ₴';
        productCard.setAttribute('data-price', finalPrice);

        const activeColor = document.querySelector('#color-options .option-btn.active');
        const activeWarranty = document.querySelector('#warranty-options .option-btn.active');
        if (activeColor) selectedColor = activeColor.textContent.trim();
        if (activeWarranty) selectedWarranty = activeWarranty.textContent.trim();
        productCard.setAttribute('data-selected-color', selectedColor);
        productCard.setAttribute('data-selected-warranty', selectedWarranty);
    }

    document.querySelectorAll('.option-buttons').forEach(container => {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.option-btn');
            if (btn) {
                container.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateTotalPrice();
            }
        });
    });

    updateTotalPrice();
    renderCart();
});
