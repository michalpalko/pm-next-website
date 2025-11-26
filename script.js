// 3D Carousel
const carousel = document.getElementById('phoneCarousel');
const phoneItems = carousel ? Array.from(carousel.querySelectorAll('.phone-item')) : [];
const totalItems = phoneItems.length || 0;
let currentRotation = 0;

// Auto-rotate control
let allowAutoRotate = true;
const autoRotateDelay = 5000; // ms between auto-rotations
let autoRotateInterval = null;
const resumeDelay = 5000; // ms after user interaction to resume auto-rotate

function updateCarousel() {
  if (!phoneItems.length) return;
  phoneItems.forEach((item, index) => {
    const angle = (360 / totalItems) * index + currentRotation;
    const angleRad = (angle * Math.PI) / 180;
    const radius = 500;
    const x = Math.sin(angleRad) * radius;
    const z = Math.cos(angleRad) * radius;
    const scale = 0.7 + (z + radius) / (radius * 2) * 0.4;
    const opacity = 0.4 + (z + radius) / (radius * 2) * 0.6;
    const zIndex = Math.round(z);
    item.style.transform = `translateX(${x}px) translateZ(${z}px) scale(${scale})`;
    item.style.opacity = opacity;
    item.style.zIndex = zIndex;
  });
}

function rotateCarousel(direction = 1) {
  if (!totalItems) return;
  const angleStep = 360 / totalItems;
  currentRotation += direction * angleStep;
  updateCarousel();
}

// auto rotate loop
function startAutoRotate() {
  if (autoRotateInterval) clearInterval(autoRotateInterval);
  autoRotateInterval = setInterval(() => {
    if (allowAutoRotate) rotateCarousel(1);
  }, autoRotateDelay);
}
startAutoRotate();

// controls
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');
if (prevBtn) prevBtn.addEventListener('click', () => { rotateCarousel(-1); allowAutoRotate = false; setTimeout(()=>allowAutoRotate=true, resumeDelay); });
if (nextBtn) nextBtn.addEventListener('click', () => { rotateCarousel(1); allowAutoRotate = false; setTimeout(()=>allowAutoRotate=true, resumeDelay); });

// Pause on hover
if (carousel) {
  carousel.addEventListener('mouseenter', () => allowAutoRotate = false);
  carousel.addEventListener('mouseleave', () => allowAutoRotate = true);
}

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href && href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Feature card mouse tracking (if present)
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  });
});

// Optional: cleanup on unload
window.addEventListener('beforeunload', () => {
  if (autoRotateInterval) clearInterval(autoRotateInterval);
});
