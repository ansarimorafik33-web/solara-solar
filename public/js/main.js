const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const menuButton = document.querySelector('.menu-button');
const siteMenu = document.getElementById('site-menu');
const closeMenu = document.querySelector('.close-menu');
const backToTop = document.querySelector('.back-to-top');
const faqItems = document.querySelectorAll('.faq-item');
const quoteForms = document.querySelectorAll('[data-form-type]');
const statNumbers = document.querySelectorAll('.stat-number');
const monthlyBill = document.getElementById('monthlyBill');
const roofSize = document.getElementById('roofSize');
const billValue = document.getElementById('billValue');
const roofValue = document.getElementById('roofValue');
const systemSize = document.getElementById('systemSize');
const yearlySavings = document.getElementById('yearlySavings');
const payback = document.getElementById('payback');
const co2Offset = document.getElementById('co2Offset');
const ringProgress = document.querySelector('.ring-progress');
const testimonials = document.querySelectorAll('.testimonial');
const sliderButtons = document.querySelectorAll('.slider-button');
const preloader = document.querySelector('.preloader');
const preloaderFill = document.querySelector('.preloader-fill');
const preloaderNumber = document.querySelector('.preloader-number');

function setMenu(open) {
  siteMenu.classList.toggle('is-open', open);
  siteMenu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
}

if (menuButton) {
  menuButton.addEventListener('click', () => {
    const isOpen = siteMenu.classList.contains('is-open');
    setMenu(!isOpen);
  });
}

if (closeMenu) {
  closeMenu.addEventListener('click', () => setMenu(false));
}

if (backToTop) {
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
}

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    faqItems.forEach((faq) => {
      faq.classList.remove('open');
      faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

quoteForms.forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    status.textContent = 'Sending…';

    try {
      const response = await fetch(`/api/${form.dataset.formType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        const firstError = result.errors?.[0]?.message || 'Please check your form and try again.';
        throw new Error(firstError);
      }

      status.textContent = result.message || 'Success';
      form.reset();
    } catch (error) {
      status.textContent = error.message || 'Something went wrong.';
    }
  });
});

function animateValue(element, target) {
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${value.toLocaleString()}`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

if (statNumbers.length) {
  statNumbers.forEach((stat) => {
    const target = Number(stat.dataset.target || 0);
    animateValue(stat, target);
  });
}

function calculateSavings() {
  const bill = Number(monthlyBill.value || 0);
  const roof = Number(roofSize.value || 0);
  const systemKw = (bill / 35) * (roof / 80);
  const annual = bill * 12 * 0.7;
  const paybackYears = 7.5 - (roof / 200);
  const co2 = systemKw * 1.8;

  billValue.textContent = `€${bill}`;
  roofValue.textContent = `${roof} m²`;
  systemSize.textContent = systemKw.toFixed(1);
  yearlySavings.textContent = `€${annual.toLocaleString()}`;
  payback.textContent = `${paybackYears.toFixed(1)} yrs`;
  co2Offset.textContent = `${co2.toFixed(1)} t`;

  const normalized = Math.min(Math.max(systemKw / 15, 0), 1);
  const circumference = 289;
  const dashOffset = circumference * (1 - normalized);
  ringProgress.style.strokeDasharray = `${circumference}`;
  ringProgress.style.strokeDashoffset = `${dashOffset}`;
}

if (monthlyBill && roofSize) {
  [monthlyBill, roofSize].forEach((input) => input.addEventListener('input', calculateSavings));
  calculateSavings();
}

let testimonialIndex = 0;
function showTestimonial(index) {
  testimonials.forEach((testimonial, idx) => {
    testimonial.classList.toggle('active', idx === index);
  });
}

sliderButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const direction = button.classList.contains('next') ? 1 : -1;
    testimonialIndex = (testimonialIndex + direction + testimonials.length) % testimonials.length;
    showTestimonial(testimonialIndex);
  });
});

if (preloader) {
  let progress = 0;
  const tick = () => {
    progress += 5;
    if (progress > 100) {
      preloader.classList.add('is-hidden');
      return;
    }
    preloaderFill.style.width = `${progress}%`;
    preloaderNumber.textContent = `${progress}%`;
    setTimeout(tick, 50);
  };
  setTimeout(tick, 200);
}

if (window.gsap) {
  const { gsap } = window.gsap;
  if (!prefersReducedMotion) {
    gsap.from('.hero-title span', { opacity: 0, y: 80, stagger: 0.08, duration: 1.1, ease: 'expo.out' });
    gsap.from('.hero-lead, .hero-actions', { opacity: 0, y: 30, duration: 0.9, delay: 0.5 });
  }
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});
