
// Admin Logic

// Initialization & Defaults
const defaultCats = ["Mobiles", "Laptops", "Headphones", "Mobile Cases", "Screen Guards", "Bluetooth Speakers", "Selfie Sticks", "Accessories", "Games", "Smart Watches (Digital)", "Wireless Headphones", "Wired Headphones"];
let editingId = null;
let editingSlideIndex = null;
let visitorLogs = JSON.parse(localStorage.getItem('visitorLogs')) || [];
let categories = JSON.parse(localStorage.getItem('categories'));
if (!categories) {
    categories = defaultCats;
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Ensure Products Exist (Loaded from app logic usually, but handled safely here)
// Note: app.js logic handles default products seeding.

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const productForm = document.getElementById('product-form');
const catForm = document.getElementById('cat-form');
const slideForm = document.getElementById('slide-form'); // Renamed to addSlideForm in new logic
const addSlideForm = document.getElementById('slide-form'); // Use this for consistency with new logic

// Check Login
if (sessionStorage.getItem('admin_logged_in') === 'true') {
    showDashboard();
}

// Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = document.getElementById('admin-pin').value;
    if (pin === "1234") {
        sessionStorage.setItem('admin_logged_in', 'true');
        showDashboard();
    } else {
        alert("Invalid PIN");
    }
});

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    populateCatDropdown();
    renderLists();
    renderAnalytics(); // Call renderAnalytics on dashboard load

    // Load Logo Preview
    const logo = localStorage.getItem('siteLogo') || 'logo.png'; // Default to file if null
    document.getElementById('current-logo-preview').src = logo;
}

window.logout = () => {
    sessionStorage.removeItem('admin_logged_in');
    location.reload();
}

window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.classList.add('active');

    // Button Active State
    const btn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
    if (btn) btn.classList.add('active');

    if (tabName === 'analytics') renderAnalytics();
}

// Attach Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    // Set initial active state
    switchTab('products');
});

// --- Helper: File to Base64 ---
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

// --- Products ---

// Populate Category Dropdown
function populateCatDropdown() {
    const select = document.getElementById('p-cat');
    select.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

// Add / Edit Product
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('p-id').value;
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const cat = document.getElementById('p-cat').value;
    const desc = document.getElementById('p-desc').value;

    // Image Handling
    const fileInput = document.getElementById('p-image-file');
    const urlInput = document.getElementById('p-image-url');
    let imageSrc = urlInput.value;

    if (fileInput.files.length > 0) {
        imageSrc = await fileToBase64(fileInput.files[0]);
    }

    let products = JSON.parse(localStorage.getItem('products')) || [];

    if (id) {
        // Edit Mode
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { ...products[index], name, price, category: cat, desc };
            if (imageSrc) products[index].image = imageSrc; // Only update img if provided
        }
        alert("Product Updated!");
    } else {
        // Create Mode
        if (!imageSrc) { alert("Please provide an image!"); return; }
        const newProduct = {
            id: Date.now(),
            name, price, category: cat, desc, image: imageSrc
        };
        products.push(newProduct);
        alert("Product Added!");
    }

    localStorage.setItem('products', JSON.stringify(products));
    resetProductForm();
    renderLists();
});

function resetProductForm() {
    productForm.reset();
    document.getElementById('p-id').value = "";
    document.getElementById('p-submit-btn').textContent = "Add Product";
}

window.editProduct = (id) => {
    const products = JSON.parse(localStorage.getItem('products'));
    const p = products.find(prod => prod.id == id);
    if (!p) return;

    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-cat').value = p.category;
    document.getElementById('p-desc').value = p.desc || "";
    document.getElementById('p-submit-btn').textContent = "Update Product";
    // Scroll to form
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
}

window.deleteProduct = (id) => {
    if (!confirm("Are you sure?")) return;
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id != id);
    localStorage.setItem('products', JSON.stringify(products));
    renderLists();
}

// --- Categories ---
catForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = document.getElementById('new-cat-name').value;
    if (val && !categories.includes(val)) {
        categories.push(val);
        localStorage.setItem('categories', JSON.stringify(categories));
        populateCatDropdown();
        renderLists();
        e.target.reset();
    }
});

window.deleteCategory = (cat) => {
    if (!confirm(`Delete category "${cat}"?`)) return;
    categories = categories.filter(c => c !== cat);
    localStorage.setItem('categories', JSON.stringify(categories));
    populateCatDropdown();
    renderLists();
}

// --- Slider ---
// --- Slider ---
slideForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('s-id').value;
    const title = document.getElementById('s-title').value;
    const subtitle = document.getElementById('s-subtitle').value;
    const fileInput = document.getElementById('slide-file');
    const urlInput = document.getElementById('slide-image');

    // Extended Features
    const f1Title = document.getElementById('slide-f1-title').value;
    const f1Desc = document.getElementById('slide-f1-desc').value;
    const f2Title = document.getElementById('slide-f2-title').value;
    const f2Desc = document.getElementById('slide-f2-desc').value;
    const f3Title = document.getElementById('slide-f3-title').value;
    const f3Desc = document.getElementById('slide-f3-desc').value;

    let imageSrc = urlInput.value;
    if (fileInput.files.length > 0) {
        imageSrc = await fileToBase64(fileInput.files[0]);
    }

    let slides = JSON.parse(localStorage.getItem('heroSlides')) || [];

    if (id) {
        // Edit Mode
        const index = slides.findIndex(s => String(s.id) === String(id));
        if (index !== -1) {
            slides[index] = {
                ...slides[index],
                title, subtitle,
                f1Title, f1Desc,
                f2Title, f2Desc,
                f3Title, f3Desc
            };
            if (imageSrc) slides[index].image = imageSrc;
            alert("Slide Updated!");
        }
    } else {
        // Add Mode
        const newSlide = {
            id: Date.now().toString(), // String ID for safety
            title, subtitle, image: imageSrc,
            f1Title, f1Desc,
            f2Title, f2Desc,
            f3Title, f3Desc
        };
        slides.push(newSlide);
        alert("Slide Added!");
    }

    localStorage.setItem('heroSlides', JSON.stringify(slides));
    renderLists();
    resetSlideForm();
});

window.editSlide = (id) => {
    const slides = JSON.parse(localStorage.getItem('heroSlides')) || [];
    const s = slides.find(slide => String(slide.id) === String(id));
    if (!s) return;

    document.getElementById('s-id').value = s.id;
    document.getElementById('s-title').value = s.title;
    document.getElementById('s-subtitle').value = s.subtitle;
    document.getElementById('slide-image').value = s.image || "";

    // Populate Extended Features
    document.getElementById('slide-f1-title').value = s.f1Title || "";
    document.getElementById('slide-f1-desc').value = s.f1Desc || "";
    document.getElementById('slide-f2-title').value = s.f2Title || "";
    document.getElementById('slide-f2-desc').value = s.f2Desc || "";
    document.getElementById('slide-f3-title').value = s.f3Title || "";
    document.getElementById('slide-f3-desc').value = s.f3Desc || "";

    document.getElementById('s-submit-btn').textContent = "Update Slide";
    document.getElementById('s-cancel-btn').style.display = "inline-block";
    slideForm.scrollIntoView({ behavior: 'smooth' });
}

window.deleteSlide = (id) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    let slides = JSON.parse(localStorage.getItem('heroSlides')) || [];
    // Robust comparison using String() to avoid type number/string mismatch
    const originalLength = slides.length;
    slides = slides.filter(s => String(s.id) !== String(id));

    if (slides.length === originalLength) {
        console.warn("Delete failed - No ID match found for:", id);
        // Fallback: try number comparison if string failed (unlikely but safe)
        slides = slides.filter(s => s.id != id);
    }

    localStorage.setItem('heroSlides', JSON.stringify(slides));
    renderLists();
}

window.resetSlideForm = () => {
    slideForm.reset();
    document.getElementById('s-id').value = "";
    document.getElementById('s-submit-btn').textContent = "Add Slide";
    document.getElementById('s-cancel-btn').style.display = "none";
}

// --- Settings (Logo) ---
window.updateLogo = async () => {
    const fileInput = document.getElementById('logo-file');
    if (fileInput.files.length > 0) {
        const base64 = await fileToBase64(fileInput.files[0]);
        localStorage.setItem('siteLogo', base64);
        document.getElementById('current-logo-preview').src = base64;
        alert("Logo Updated!");
    } else {
        alert("Please select a file.");
    }
}

window.resetLogo = () => {
    localStorage.removeItem('siteLogo');
    document.getElementById('current-logo-preview').src = "logo.png";
    alert("Logo Reset to Default.");
}


// --- Render Lists ---
window.renderLists = () => {
    // 1. Products with Search
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const searchTerm = document.getElementById('p-search').value.toLowerCase();
    const productList = document.getElementById('product-list');

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));

    productList.innerHTML = filtered.map(p => `
        <div class="list-item">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${p.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
                <div>
                    <strong>${p.name}</strong>
                    <br><span style="color:var(--text-muted); font-size:0.8rem;">₹${p.price} • ${p.category}</span>
                </div>
            </div>
            <div>
                <button class="action-btn edit" onclick="editProduct(${p.id})"><i data-lucide="edit-2"></i></button>
                <button class="action-btn delete" onclick="deleteProduct(${p.id})"><i data-lucide="trash-2"></i></button>
            </div>
        </div>
    `).join('');

    // 2. Categories
    const catList = document.getElementById('category-list');
    catList.innerHTML = categories.map(c => `
        <div class="list-item">
            <strong>${c}</strong>
            <button class="action-btn delete" onclick="deleteCategory('${c}')"><i data-lucide="trash-2"></i></button>
        </div>
    `).join('');

    // 3. Slides
    const slides = JSON.parse(localStorage.getItem('heroSlides')) || [];
    const slideList = document.getElementById('slide-list');
    slideList.innerHTML = slides.map(s => `
         <div class="list-item">
            <div>
                <strong>${s.title}</strong>
            </div>
            <div>
                <button class="action-btn edit" onclick="editSlide('${s.id}')"><i data-lucide="edit-2"></i></button>
                <!-- Use String ID in call to avoid JS number interpretation issues -->
                <button class="action-btn delete" onclick="deleteSlide('${s.id}')"><i data-lucide="trash-2"></i></button>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}
