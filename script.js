document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initCart();
  initProductCards();
  initContactForm();
  initScrollEffects();
  initAnimations();
  initBackToTop();
});

function initHeader() {
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

let cart = [];
let cartCount = 0;
let cartTotal = 0;

function initCart() {
  const cartBtn = document.getElementById('cart-btn');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose = document.getElementById('cart-close');
  const checkoutBtn = document.getElementById('btn-checkout');

  if (cartBtn && cartSidebar) {
    cartBtn.addEventListener('click', () => {
      cartSidebar.classList.add('active');
      cartOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    const closeCart = () => {
      cartSidebar.classList.remove('active');
      cartOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
          showToast('El carrito está vacío', 'error');
        } else {
          showToast('¡Gracias por tu compra! Te contactaremos pronto.', 'success');
          cart = [];
          updateCartUI();
        }
      });
    }
  }
}

function addToCart(id, name, price) {
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  
  updateCartUI();
  showToast(`${name} agregado al carrito`, 'success');
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(id);
    } else {
      updateCartUI();
    }
  }
}

function updateCartUI() {
  const cartCountEl = document.getElementById('cart-count');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');

  cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartCountEl) {
    cartCountEl.textContent = cartCount;
    cartCountEl.style.transform = cartCount > 0 ? 'scale(1.2)' : 'scale(1)';
  }

  if (cartTotalEl) {
    cartTotalEl.textContent = `Q${cartTotal.toFixed(2)}`;
  }

  if (cartItemsEl) {
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
    } else {
      cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-img">
            <i class="fas fa-tools"></i>
          </div>
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p class="price">Q${item.price.toFixed(2)}</p>
            <div class="cart-item-quantity">
              <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                <i class="fas fa-minus"></i>
              </button>
              <span>${item.quantity}</span>
              <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('');
    }
  }
}

function initProductCards() {
  const addToCartBtns = document.querySelectorAll('.btn-add-cart');
  
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.producto-card');
      const id = parseInt(card.dataset.id);
      const name = card.dataset.name;
      const price = parseFloat(card.dataset.price);
      
      addToCart(id, name, price);
      
      this.innerHTML = '<i class="fas fa-check"></i> Agregado';
      this.style.background = 'var(--success)';
      
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar al Carrito';
        this.style.background = '';
      }, 2000);
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contacto-form');
  
  if (form) {
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      
      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      if (isValid) {
        showToast('¡Mensaje enviado! Nos pondremos en contacto contigo pronto.', 'success');
        form.reset();
        
        document.querySelectorAll('.form-group').forEach(group => {
          group.classList.remove('error');
        });
      } else {
        showToast('Por favor, completa todos los campos requeridos', 'error');
      }
    });
  }
}

function validateField(input) {
  const group = input.closest('.form-group');
  const errorEl = group.querySelector('.error-message');
  let isValid = true;

  if (input.required && !input.value.trim()) {
    isValid = false;
    if (errorEl) errorEl.textContent = 'Este campo es requerido';
  } else if (input.type === 'email' && input.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value)) {
      isValid = false;
      if (errorEl) errorEl.textContent = 'Ingresa un correo electrónico válido';
    }
  }

  if (isValid) {
    group.classList.remove('error');
  } else {
    group.classList.add('error');
  }

  return isValid;
}

function initScrollEffects() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        
        if (entry.target.classList.contains('stat-number')) {
          animateCounter(entry.target);
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.catalogo-card, .producto-card, .feature-item, .info-card, .stat-item').forEach(el => {
    observer.observe(el);
  });
}

function animateCounter(element) {
  const target = parseInt(element.dataset.count);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const updateCounter = () => {
    current += step;
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };

  updateCounter();
}

function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <p>${message}</p>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.4s ease reverse';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.showToast = showToast;