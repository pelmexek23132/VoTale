document.addEventListener('DOMContentLoaded', () => {

    // Зберігання кошика у localStorage (щоб товари не зникали при перезавантаженні)
    let cart = JSON.parse(localStorage.getItem('voTaleCart')) || [];

    const cartCountElement = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalSum = document.getElementById('cart-total-sum');

    // 1. Оновлення лічильника і суми
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

    // 2. Рендеринг товарів у модальному вікні
    function renderCartItems() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #8a8a9e;">Кошик порожній</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.title}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${item.quantity} x ${item.price.toLocaleString('uk-UA')} ₴</div>
                </div>
                <button class="remove-item-btn" data-id="${item.id}">&times;</button>
            </div>
        `).join('');

        // Подія видалення товару з кошика
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                cart = cart.filter(item => item.id !== id);
                updateCartUI();
                renderCartItems();
            });
        });
    }

    // 3. Додавання товару в кошик
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;

            const id = card.getAttribute('data-id');
            const title = card.getAttribute('data-title');
            const price = parseInt(card.getAttribute('data-price'));
            const img = card.getAttribute('data-img');

            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, title, price, img, quantity: 1 });
            }

            updateCartUI();

            // Анімація лічильника
            if (cartCountElement) {
                cartCountElement.style.transform = 'scale(1.4)';
                setTimeout(() => cartCountElement.style.transform = 'scale(1)', 200);
            }
        });
    });

    // 4. Відкриття / Закриття модального вікна кошика
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            renderCartItems();
            cartModal.classList.add('active');
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            cartModal.classList.remove('active');
        });
    }

    // Закриття при кліку поза вікном
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });

    // Оформлення замовлення
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
                cartModal.classList.remove('active');
            }
        });
    }

    // Початкова ініціалізація
    updateCartUI();
});
