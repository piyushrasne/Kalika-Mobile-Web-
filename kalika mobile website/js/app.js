

// Initialize Data from LocalStorage (or seed defaults)

const defaultProducts = [
    { id: 1, name: "iPhone 15 Pro", category: "Mobiles", price: 134900, image: "https://images.unsplash.com/photo-1695048180490-7584d6af8088?q=80&w=500&auto=format&fit=crop" },
    { id: 2, name: "Dell XPS 15", category: "Laptops", price: 185000, image: "https://images.unsplash.com/photo-1593642632823-8f785667771b?q=80&w=500&auto=format&fit=crop" },
    { id: 3, name: "Sony WH-1000XM5", category: "Headphones", price: 29990, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=500&auto=format&fit=crop" },
    { id: 4, name: "Samsung S24 Ultra", category: "Mobiles", price: 129999, image: "https://images.unsplash.com/photo-1706606991536-e32260d85965?q=80&w=500&auto=format&fit=crop" },
    { id: 5, name: "JBL Flip 6", category: "Speakers", price: 9999, image: "https://images.unsplash.com/photo-1629214736615-680455bb3269?q=80&w=500&auto=format&fit=crop" },
    { id: 6, name: "Apple Watch Ultra", category: "Smartwatches", price: 89900, image: "https://images.unsplash.com/photo-1664743528139-4467d9834575?q=80&w=500&auto=format&fit=crop" },
    { id: 7, name: "MacBook Air M2", category: "Laptops", price: 114900, image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=500&auto=format&fit=crop" },
    { id: 8, name: "Sony Alpha a7 IV", category: "Cameras", price: 245000, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=500&auto=format&fit=crop" }
];

// Load from Main Store
let products = JSON.parse(localStorage.getItem('products'));
if (!products || products.length === 0) {
    products = defaultProducts;
    localStorage.setItem('products', JSON.stringify(defaultProducts));
}

// Hero Slider Defaults
const defaultSlides = [
    {
        subtitle: "Party Anywhere",
        title: "Unleash the Bass",
        image: "https://pngimg.com/d/headphones_PNG101967.png",
        feat1_title: "Noise Cancellation", feat1_desc: "Block out the world, tune into you.",
        feat2_title: "40h Battery", feat2_desc: "Non-stop music for your longest journeys.",
        feat3_title: "Bluetooth 5.3", feat3_desc: "Seamless connectivity, zero lag."
    },
    {
        subtitle: "Smart & Style",
        title: "Apple Watch Ultra",
        image: "https://parspng.com/wp-content/uploads/2023/02/applewatchpng.parspng.com_.png",
        feat1_title: "Retina Display", feat1_desc: "Always-on, 2000 nits brightness.",
        feat2_title: "Action Button", feat2_desc: "Customizable for instant control.",
        feat3_title: "100m Water Resist", feat3_desc: "Dive ready for your adventures."
    }
];

let heroSlides = JSON.parse(localStorage.getItem('heroSlides'));
if (!heroSlides || heroSlides.length === 0) {
    heroSlides = defaultSlides;
    localStorage.setItem('heroSlides', JSON.stringify(defaultSlides));
}

// DOM Elements
const heroSection = document.getElementById('home');

const productGrid = document.getElementById('product-grid');
const cartCount = document.querySelector('.cart-count');
const wishlistCount = document.querySelector('.wishlist-count');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');
const searchInput = document.getElementById('search-input');
const imageSearchBtn = document.getElementById('image-search-btn');
const imageUpload = document.getElementById('image-upload');

// Modal Elements
const modal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const mImage = document.getElementById('m-image');
const mCat = document.getElementById('m-cat');
const mTitle = document.getElementById('m-title');
const mPrice = document.getElementById('m-price');
const mDesc = document.getElementById('m-desc');
const mBuyBtn = document.getElementById('m-buy-btn');

// Theme Toggle
const themeBtn = document.getElementById('theme-toggle');

// Drawer Elements
const filterBtn = document.getElementById('filter-toggle-btn');
const filterDrawer = document.getElementById('filter-drawer');
const filterOverlay = document.getElementById('filter-overlay');
const closeFilter = document.getElementById('close-filter');
const dynamicCatContainer = document.getElementById('dynamic-cat-filters');

// State
let cart = 0;
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ["Mobiles", "Laptops", "Headphones", "Speakers", "Earbuds", "Smartwatches", "Cameras", "Accessories"];

// Image Search Logic Improved
imageSearchBtn.addEventListener('click', () => {
    imageUpload.click();
});

imageUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        // UI Feedback - clearer than alert
        const originalContent = imageSearchBtn.innerHTML;
        imageSearchBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i>';
        imageSearchBtn.disabled = true;

        // Ensure icon spins
        if (window.lucide) window.lucide.createIcons();
        document.querySelector('.spin').style.animation = "spin 1s linear infinite";

        setTimeout(() => {
            const randomCat = ["Headphones", "Speakers", "Earbuds"][Math.floor(Math.random() * 3)];

            // Revert Button
            imageSearchBtn.innerHTML = originalContent;
            imageSearchBtn.disabled = false;
            if (window.lucide) window.lucide.createIcons();

            alert(`Items found matching your image in: ${randomCat}`);

            // Auto filter
            document.getElementById('cat-all').checked = false;
            document.querySelectorAll('.cat-filter').forEach(cb => {
                cb.checked = (cb.value === randomCat);
            });
            filterAndRenderProducts();

            // Scroll to results
            productGrid.scrollIntoView({ behavior: 'smooth' });

        }, 1500);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateLogo();
    updateWishlistCount();
    renderHeroSlider();
    renderCategoryFilters();
    filterAndRenderProducts();
    initScrollAnimations();
    setupEventListeners();
    startAutoSlider();
    logVisit(); // Analytics
});

function logVisit() {
    const logs = JSON.parse(localStorage.getItem('visitorLogs')) || [];
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const visit = {
        time: new Date().toISOString(),
        device: isMobile ? "Mobile" : "Desktop/Laptop",
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`
    };
    logs.push(visit);
    if (logs.length > 50) logs.shift();
    localStorage.setItem('visitorLogs', JSON.stringify(logs));
}

function initTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeBtn.innerHTML = '<i data-lucide="moon"></i>';
        if (window.lucide) window.lucide.createIcons();
    }
}

function updateLogo() {
    const logoSrc = localStorage.getItem('siteLogo');
    if (logoSrc) {
        document.getElementById('nav-logo').src = logoSrc;
    }
}

function renderCategoryFilters() {
    dynamicCatContainer.innerHTML = `
        <label class="checkbox-container">
            <input type="checkbox" value="all" checked id="cat-all">
            <span class="checkmark"></span>
            All
        </label>
        ${categories.map(cat => `
            <label class="checkbox-container">
                <input type="checkbox" value="${cat}" class="cat-filter">
                <span class="checkmark"></span>
                ${cat}
            </label>
        `).join('')}
    `;
}

let currentSlide = 0;
let slideInterval;
function renderHeroSlider() {
    if (!heroSlides || heroSlides.length === 0) return;

    let sliderContainer = document.querySelector('.hero-slider');
    if (!sliderContainer) {
        heroSection.innerHTML = `
            <div class="hero-bg-glow"></div>
            <div class="hero-slider"></div>
            <div class="slider-dots"></div>
        `;
        sliderContainer = document.querySelector('.hero-slider');
    }

    const updateSlide = () => {
        const slide = heroSlides[currentSlide];
        if (!slide) return;

        sliderContainer.innerHTML = `
            <div class="container hero-content fade-up visible">
                <div class="hero-text">
                    <span class="eyebrow">${slide.subtitle}</span>
                    <h1 class="glitch" data-text="${slide.title}">${slide.title}</h1>
                    
                    <div class="features-grid" style="display: grid; gap: 15px; margin-bottom: 2rem; color: #ccc; font-size: 0.9rem; text-align: left;">
                        ${slide.feat1_title ? `<div><strong style="color: var(--accent-blue); display: block;">${slide.feat1_title}</strong>${slide.feat1_desc}</div>` : ''}
                        ${slide.feat2_title ? `<div><strong style="color: var(--accent-purple); display: block;">${slide.feat2_title}</strong>${slide.feat2_desc}</div>` : ''}
                        ${slide.feat3_title ? `<div><strong style="color: #fff; display: block;">${slide.feat3_title}</strong>${slide.feat3_desc}</div>` : ''}
                    </div>

                    <div class="cta-group">
                        <a href="#products" class="btn btn-primary">Shop Now</a>
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="circle-graphic"></div>
                    <img src="${slide.image}" alt="${slide.title}" class="hero-img floating" style="max-height: 400px; object-fit: contain;">
                </div>
            </div>
        `;

        const dotsContainer = document.querySelector('.slider-dots');
        if (dotsContainer) {
            dotsContainer.innerHTML = heroSlides.map((_, i) => `
                <span class="dot ${i === currentSlide ? 'active' : ''}" onclick="goToSlide(${i})"></span>
            `).join('');
        }
        if (window.lucide) lucide.createIcons();
    };

    updateSlide();

    window.nextSlide = () => {
        currentSlide = (currentSlide + 1) % heroSlides.length;
        updateSlide();
    };

    window.goToSlide = (i) => {
        currentSlide = i;
        updateSlide();
        resetAutoSlider();
    };
}

function startAutoSlider() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        if (window.nextSlide) window.nextSlide();
    }, 5000);
}

function resetAutoSlider() {
    startAutoSlider();
}

// Setup Event Listeners (Merged)
function setupEventListeners() {
    // Search Listener
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderProducts();
        });
    }

    // Theme Toggle
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeBtn.innerHTML = isLight ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
        lucide.createIcons();
    });

    // Drawer Logic
    const toggleDrawer = () => {
        filterDrawer.classList.toggle('open');
        filterOverlay.classList.toggle('open');
    };
    filterBtn.addEventListener('click', toggleDrawer);
    closeFilter.addEventListener('click', toggleDrawer);
    filterOverlay.addEventListener('click', toggleDrawer);

    // Price Range
    priceRange.addEventListener('input', (e) => {
        priceValue.textContent = e.target.value;
        filterAndRenderProducts();
    });

    // ... modal listeners ...
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // ... dynamic cat listeners ...
    dynamicCatContainer.addEventListener('change', (e) => {
        // ... existing logic ...
        if (e.target.id === 'cat-all') {
            const allChecked = e.target.checked;
            document.querySelectorAll('.cat-filter').forEach(cb => cb.checked = false);
            if (!allChecked) e.target.checked = true;
            filterAndRenderProducts();
        } else if (e.target.classList.contains('cat-filter')) {
            document.getElementById('cat-all').checked = false;
            const anyChecked = Array.from(document.querySelectorAll('.cat-filter')).some(c => c.checked);
            if (!anyChecked) document.getElementById('cat-all').checked = true;
            filterAndRenderProducts();
        }
    });
}

// Filter Logic
function filterAndRenderProducts() {
    const maxPrice = parseInt(priceRange.value);
    const searchTerm = searchInput.value.toLowerCase();

    // Get Selected Cats from DOM
    const catAll = document.getElementById('cat-all');
    const catCheckboxes = document.querySelectorAll('.cat-filter');
    const selectedCats = Array.from(catCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const filtered = products.filter(p => {
        const matchesPrice = p.price <= maxPrice;
        const matchesCat = catAll.checked || selectedCats.includes(p.category);
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm) ||
            (p.desc && p.desc.toLowerCase().includes(searchTerm));

        return matchesPrice && matchesCat && matchesSearch;
    });

    renderProducts(filtered);
}

// Render Products
function renderProducts(items) {
    if (items.length === 0) {
        productGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No products found matching your criteria.</div>`;
        return;
    }

    productGrid.innerHTML = items.map(product => {
        const isWishlisted = wishlist.includes(product.id);
        const heartClass = isWishlisted ? 'active' : '';
        // If active, fill the icon, else outline
        // Lucid icons are svg, so we handle class-based styling or icon replacement
        // For simplicity, we use class on button

        return `
        <div class="product-card fade-up">
            <button class="product-wishlist-btn ${heartClass}" onclick="toggleWishlist(${product.id}, this)" aria-label="Add to wishlist">
                <i data-lucide="heart" fill="${isWishlisted ? 'currentColor' : 'none'}"></i>
            </button>
            <div class="image-wrapper" onclick="openProductDetails(${product.id})" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}" class="product-img">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title" onclick="openProductDetails(${product.id})" style="cursor: pointer;">${product.name}</h3>
                <div class="product-footer">
                    <div class="product-actions">
                        <span class="price">₹${product.price}</span>
                        <button class="buy-btn" onclick="buyProduct(${product.id})" aria-label="Buy Now">
                            Buy Now <i data-lucide="message-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div >
            `}).join('');

    lucide.createIcons();
    initScrollAnimations(); // Re-observe new elements
}

// Wishlist Logic
window.toggleWishlist = (id, btn) => {
    const index = wishlist.indexOf(id);
    if (index === -1) {
        wishlist.push(id);
        btn.classList.add('active');
        // Update helper icon fill
        const icon = btn.querySelector('svg');
        if (icon) icon.setAttribute('fill', 'currentColor');
    } else {
        wishlist.splice(index, 1);
        btn.classList.remove('active');
        const icon = btn.querySelector('svg');
        if (icon) icon.setAttribute('fill', 'none');
    }

    // Save
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
}

function updateWishlistCount() {
    wishlistCount.textContent = wishlist.length;
}

// Product Details Modal
window.openProductDetails = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    mImage.src = product.image;
    mCat.textContent = product.category;
    mTitle.textContent = product.name;
    mPrice.textContent = `₹${product.price} `;
    mDesc.textContent = product.desc || "No description available for this product.";

    // Update Buy Button in modal
    mBuyBtn.onclick = () => buyProduct(id);

    modal.classList.add('active');
}

// Buy Product (WhatsApp)
window.buyProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const phoneNumber = "919545535352"; // User provided number
    const message = `Hello! I would like to buy this:
    
* Product:* ${product.name}
* Category:* ${product.category}
* Price:* ₹${product.price}
* Link:* ${window.location.href}

Please share payment details.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}

// Add to Cart Logic (Keeping it just in case, but UI now prioritizes Buy Now)
window.addToCart = (id) => {
    cart++;
    cartCount.textContent = cart;
}

// Scroll Animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });
}
