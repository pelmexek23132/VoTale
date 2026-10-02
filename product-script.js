document.addEventListener('DOMContentLoaded', () => {

    // 1. ПЕРЕМИКАННЯ ГАЛЕРЕЇ ФОТОГРАФІЙ
    const mainImg = document.getElementById('current-img');
    const thumbs = document.querySelectorAll('.thumb');

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            if (mainImg) {
                mainImg.src = thumb.src;
            }
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    // 2. ДИНАМІЧНИЙ РОЗРАХУНОК ЦІНИ ВІД ОПЦІЙ
    const basePrice = 38500;
    const totalPriceElement = document.getElementById('total-price');

    function getSelectedOptions() {
        let addedPrice = 0;
        let ramText = '';
        let ssdText = '';

        const activeRam = document.querySelector('#ram-options .option-btn.active');
        const activeSsd = document.querySelector('#ssd-options .option-btn.active');

        if (activeRam) {
            addedPrice += parseInt(activeRam.getAttribute('data-add-price')) || 0;
            ramText = activeRam.textContent.split('(')[0].trim();
        }

        if (activeSsd) {
            addedPrice += parseInt(activeSsd.getAttribute('data-add-price')) || 0;
            ssdText = activeSsd.textContent.split('(')[0].trim();
        }

        const finalPrice = basePrice + addedPrice;

        return { finalPrice, ramText, ssdText };
    }

    function updatePrice() {
        const { finalPrice } = getSelectedOptions();
        if (totalPriceElement) {
            totalPriceElement.textContent = finalPrice.toLocaleString('uk-UA') + ' ₴';
        }
    }

    // Подія для кнопок вибору конфігурації (RAM / SSD)
    document.querySelectorAll('.option-buttons').forEach(container => {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.option-btn');
            if (btn) {
                container.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updatePrice();
            }
        });
    });

    // 3. ПЕРЕМИКАННЯ ВКЛАДОК (ТАБІВ)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetTab) {
                    pane.classList.add('active');
                }
            });
        });
    });

    // 4. ЛОГІКА КОШИКА ТА LOCALSTORAGE
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const cartBtn = document.querySelector('.cart-btn');
    const cartCountElement = document.getElementById('cart-count');
    const addToCartBtn = document.getElementById('add-to-cart-page');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSum = document.getElementById('cart-total-sum');

    function updateCartUI() {
        // Оновлення лічильника
        const totalCount = cart.length;
        if (cartCountElement) {
            cartCountElement.textContent = totalCount;
        }

        // Рендер товарів у модальному вікні
        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p style="text-align: center; color: #8a8a9e;">Кошик порожній</p>';
                if (cartTotalSum) cartTotalSum.textContent = '0 ₴';
                return;
            }

            cartItemsContainer.innerHTML = '';
            let total = 0;

            cart.forEach((item, index) => {
                total += item.price;
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <p>${item.ram} / ${item.ssd}</p>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span class="cart-item-price">${item.price.toLocaleString('uk-UA')} ₴</span>
                        <button class="remove-item-btn" data-index="${index}">&times;</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });

            if (cartTotalSum) {
                cartTotalSum.textContent = total.toLocaleString('uk-UA') + ' ₴';
            }
        }

        // Збереження в localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Додавання товару в кошик
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const { finalPrice, ramText, ssdText } = getSelectedOptions();

            const product = {
                id: 'VT-89042',
                title: 'Ігровий Ноутбук VoTale X',
                price: finalPrice,
                ram: ramText,
                ssd: ssdText
            };

            cart.push(product);
            updateCartUI();

            // Анімація кнопки
            addToCartBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                addToCartBtn.style.transform = 'scale(1)';
            }, 150);
        });
    }

    // Видалення товару з кошика
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                const index = e.target.getAttribute('data-index');
                cart.splice(index, 1);
                updateCartUI();
            }
        });
    }

    // Відкриття модального вікна при кліку на кнопку в шапці
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cartModal) cartModal.classList.add('active');
        });
    }

    // Закриття модального вікна на хрестик
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartModal) cartModal.classList.remove('active');
        });
    }

    // Закриття модального вікна при кліку поза ним
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });

    // 5. КНОПКА «КУПИТИ В 1 КЛІК»
    const quickBuyBtn = document.querySelector('.quick-buy-btn');
    if (quickBuyBtn) {
        quickBuyBtn.addEventListener('click', () => {
            const phone = prompt('Введіть ваш номер телефону для швидкого замовлення:');
            if (phone) {
                alert(`Дякуємо! Ми зателефонуємо вам на номер: ${phone}`);
            }
        });
    }

    // Ініціалізація кошика при завантаженні
    updateCartUI();
});
