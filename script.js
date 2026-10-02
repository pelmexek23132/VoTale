document.addEventListener('DOMContentLoaded', () => {

    // 1. Ініціалізація та збереження кошика у localStorage
    let cart = JSON.parse(localStorage.getItem('voTaleCart')) || [];

    const cartCountElement = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalSum = document.getElementById('cart-total-sum');

    // 2. Оновлення лічильника і підсумкової суми
    function updateCartUI() {
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (cartCountElement) {
            cartCountElement.textContent = totalCount;
        }

        if (cartTotalSum) {
            cartTotalSum.textContent = totalPrice.toLocaleString('uk-UA') + ' ₴';
        }

        localStorage.setItem('voTaleCart', JSON.stringify(cart));
    }

    // 3. Відображення товарів у модальному вікні кошика
    function renderCartItems() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #8a8a9e;">Кошик порожній</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.title}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    ${(item.color || item.warranty) ? `
                        <div style="font-size: 11px; color: #8a8a9e; margin-bottom: 3px;">
                            ${item.color ? 'Колір: ' + item.color : ''} ${item.warranty ? '| ' + item.warranty : ''}
                        </div>` : ''}
                    <div class="cart-item-price">${item.quantity} x ${item.price.toLocaleString('uk-UA')} ₴</div>
                </div>
                <button class="remove-item-btn" data-index="${index}">&times;</button>
            </div>
        `).join('');

        // Видалення товару за індексом
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCartUI();
                renderCartItems();
            });
        });
    }

    // 4. Обробка додавання товарів (як із головної сторінки, так і зі сторінки товару)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn, #add-to-cart-page, .quick-buy-btn');
        if (!btn) return;

        const productCard = e.target.closest('.product-card') || document.querySelector('.product-card');
        if (!productCard) return;

        const id = productCard.getAttribute('data-id') || '1';
        const title = productCard.getAttribute('data-title') || 'Товар';
        const price = parseInt(productCard.getAttribute('data-price')) || 0;
        const img = productCard.getAttribute('data-img') || '';
        const color = productCard.getAttribute('data-selected-color') || '';
        const warranty = productCard.getAttribute('data-selected-warranty') || '';

        // Пошук такого ж товару з однаковими опціями
        const existingItem = cart.find(item => 
            item.id === id && item.color === color && item.warranty === warranty
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, title, price, img, color, warranty, quantity: 1 });
        }

        updateCartUI();

        // Анімація бейджа кошика
        if (cartCountElement) {
            cartCountElement.style.transform = 'scale(1.4)';
            setTimeout(() => cartCountElement.style.transform = 'scale(1)', 200);
        }

        // Якщо натиснуто на сторінці детального перегляду — автоматично відкриваємо кошик
        if (btn.id === 'add-to-cart-page' || btn.classList.contains('quick-buy-btn')) {
            renderCartItems();
            if (cartModal) cartModal.classList.add('active');
        }
    });

    // 5. Робота з опціями (колір, гарантія) та галереєю на сторінках товарів
    const productCard = document.querySelector('.product-card');
    const totalPriceEl = document.getElementById('total-price');
    const currentImg = document.getElementById('current-img');
    const thumbs = document.querySelectorAll('.thumb');

    if (productCard && totalPriceEl) {
        const basePrice = parseInt(productCard.getAttribute('data-base-price')) || parseInt(productCard.getAttribute('data-price')) || 0;

        function updateDetailPagePrice() {
            let addedPrice = 0;
            let selectedColor = '';
            let selectedWarranty = '';

            document.querySelectorAll('.option-btn.active').forEach(b => {
                addedPrice += parseInt(b.getAttribute('data-add-price')) || 0;
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
                const optionBtn = e.target.closest('.option-btn');
                if (optionBtn) {
                    container.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                    optionBtn.classList.add('active');
                    updateDetailPagePrice();
                }
            });
        });

        // Перемикання мініатюр галереї
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                if (currentImg) currentImg.src = thumb.src;
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                productCard.setAttribute('data-img', thumb.src);
            });
        });

        updateDetailPagePrice();
    }

    // 6. Управління модальним вікном кошика
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            renderCartItems();
            if (cartModal) cartModal.classList.add('active');
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartModal) cartModal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });

    // 7. Оформлення замовлення
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Ваш кошик порожній!');
            } else {
                alert('Дякуємо за замовлення! Менеджер зв’яжеться з вами.');
                cart = [];
                updateCartUI();
                renderCartItems();
                if (cartModal) cartModal.classList.remove('active');
            }
        });
    }

    // Первинна ініціалізація
    updateCartUI();
});
