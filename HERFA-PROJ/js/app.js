/* ============================================
   HERFA - حرفة | Shared JavaScript
   ============================================ */

// --- Cart State ---
const cart = {
  items: JSON.parse(localStorage.getItem('herfa_cart') || '[]'),

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.save();
    this.updateBadge();
    showToast(`تمت الإضافة إلى السلة ✓`);
  },

  remove(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.save();
    this.updateBadge();
  },

  updateQty(productId, qty) {
    const item = this.items.find(i => i.id === productId);
    if (item) {
      item.qty = qty;
      if (item.qty <= 0) this.remove(productId);
    }
    this.save();
    this.updateBadge();
  },

  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  save() {
    localStorage.setItem('herfa_cart', JSON.stringify(this.items));
  },

  updateBadge() {
    const badge = document.querySelector('.navbar__badge');
    if (badge) {
      const count = this.count();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }
};

// --- Wishlist State ---
const wishlist = {
  items: JSON.parse(localStorage.getItem('herfa_wishlist') || '[]'),

  toggle(productId) {
    const idx = this.items.indexOf(productId);
    if (idx > -1) {
      this.items.splice(idx, 1);
      showToast('تمت الإزالة من المفضلة');
    } else {
      this.items.push(productId);
      showToast('تمت الإضافة إلى المفضلة ♡');
    }
    this.save();
    return this.has(productId);
  },

  has(productId) {
    return this.items.includes(productId);
  },

  save() {
    localStorage.setItem('herfa_wishlist', JSON.stringify(this.items));
  }
};

// --- Toast Notification ---
function showToast(message, type = 'success') {
  const existing = document.querySelector('.herfa-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'herfa-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${type === 'success' ? '#2C1A0E' : '#C0392B'};
    color: #FAF7F2;
    padding: 14px 28px;
    border-radius: 9999px;
    font-family: 'Tajawal', sans-serif;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 9999;
    opacity: 0;
    transition: all 0.3s ease;
    white-space: nowrap;
    direction: rtl;
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// --- Mobile Menu Toggle ---
function initMobileMenu() {
  const toggle = document.querySelector('.navbar__mobile-toggle');
  const nav    = document.querySelector('.navbar__nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('navbar__nav--open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar__inner')) {
      nav.classList.remove('navbar__nav--open');
    }
  });
}

// --- Active Nav Link ---
function setActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// --- Scroll Animations ---
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}

// --- Lazy Load Images ---
function initLazyImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  imgs.forEach(img => observer.observe(img));
}

// --- Search ---
function initSearch() {
  const searchBtn   = document.querySelector('[data-search-toggle]');
  const searchPanel = document.querySelector('[data-search-panel]');
  const searchClose = document.querySelector('[data-search-close]');
  const searchInput = document.querySelector('[data-search-input]');

  if (!searchBtn || !searchPanel) return;

  searchBtn.addEventListener('click', () => {
    searchPanel.classList.add('active');
    setTimeout(() => searchInput?.focus(), 100);
  });

  searchClose?.addEventListener('click', () => {
    searchPanel.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') searchPanel.classList.remove('active');
  });
}

// --- Format Price ---
function formatPrice(amount) {
  return `${amount.toLocaleString('ar-PS')} ₪`;
}

// --- Format Date ---
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ar-PS', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

// --- Init on DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  cart.updateBadge();
  initMobileMenu();
  setActiveNavLink();
  initScrollAnimations();
  initLazyImages();
  initSearch();
});

// Add animation styles
const animStyles = document.createElement('style');
animStyles.textContent = `
  [data-animate] {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  [data-animate].animated {
    opacity: 1;
    transform: translateY(0);
  }
  [data-animate][data-delay="100"] { transition-delay: 0.1s; }
  [data-animate][data-delay="200"] { transition-delay: 0.2s; }
  [data-animate][data-delay="300"] { transition-delay: 0.3s; }
  [data-animate][data-delay="400"] { transition-delay: 0.4s; }
  [data-animate][data-delay="500"] { transition-delay: 0.5s; }

  @media (max-width: 768px) {
    .navbar__nav--open {
      display: flex !important;
      flex-direction: column;
      position: absolute;
      top: 72px;
      right: 0;
      left: 0;
      background: #FAF7F2;
      border-bottom: 1px solid #E5D5C5;
      padding: 16px 24px;
      gap: 16px;
      box-shadow: 0 8px 24px rgba(44,26,14,0.1);
    }
  }
`;
document.head.appendChild(animStyles);
