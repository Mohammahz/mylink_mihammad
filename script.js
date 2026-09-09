/* ==================================================================
   وب‌سایت شخصی محمدمهدی حاجی‌زاده — اسکریپت اصلی
   تمام انیمیشن‌ها با prefers-reduced-motion غیرفعال می‌شوند.
   ================================================================== */
'use strict';
 
/* ---------- ابزار انتخاب ساده ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
 
/* ---------- تنظیمات محیطی ---------- */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;
const isTouch = !canHover;

/* ---------- تبدیل عدد به ارقام فارسی ---------- */
const toFa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

/* ==================================================================
   ۱) تم روشن/تیره + ذخیره در localStorage
   ================================================================== */
const themeToggle = $('#themeToggle');
const savedTheme = localStorage.getItem('viana-theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('viana-theme', next);
  readThemeColors(); /* رنگ ذرات بوم با تم هماهنگ شود */
});

/* ==================================================================
   ۲) شبکه‌ی ذرات (Particle Network) روی Canvas
   ================================================================== */
const canvas = $('#particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let neonColor = '#00D4FF';
  let blueColor = '#2563EB';
  const mouse = { x: null, y: null, active: false };

  /* رنگ‌های نئونی را از CSS می‌خوانیم تا با تم هماهنگ بماند */
  function readThemeColors() {
    const cs = getComputedStyle(document.documentElement);
    neonColor = cs.getPropertyValue('--neon').trim() || neonColor;
    blueColor = cs.getPropertyValue('--blue').trim() || blueColor;
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    const count = Math.min(110, Math.floor(window.innerWidth / 12));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r: Math.random() * 1.8 + 0.6,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* خطوط اتصال بین ذرات */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 120) {
          ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - d / 120) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      /* اتصال به ماوس */
      if (mouse.active) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 160) {
          ctx.strokeStyle = `${hexToRgba(blueColor, (1 - d / 160) * 0.55)}`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    /* رسم ذرات */
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = neonColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = neonColor;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    /* حرکت ذرات */
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }

    if (!prefersReduced) requestAnimationFrame(draw);
  }

  /* تبدیل #RRGGBB به rgba() */
  function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  readThemeColors();
  resize();
  draw();

  window.addEventListener('resize', resize);

  if (!prefersReduced) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });
  }
}

/* ==================================================================
   ۳) هاله‌ی نور دنبال‌کننده‌ی ماوس
   ================================================================== */
const cursorGlow = $('#cursorGlow');
if (cursorGlow && canHover && !prefersReduced) {
  let gx = window.innerWidth / 2;
  let gy = window.innerHeight / 2;
  let tx = gx;
  let ty = gy;

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  (function glowLoop() {
    gx += (tx - gx) * 0.12;
    gy += (ty - gy) * 0.12;
    cursorGlow.style.transform = `translate(${gx - 200}px, ${gy - 200}px)`;
    requestAnimationFrame(glowLoop);
  })();
}

/* ==================================================================
   ۴) افکت تایپ (Typewriter)
   ================================================================== */
const typeEl = $('#typewriter');
const roles = [
  '💻 برنامه‌نویس فول‌استک',
  '🌐 توسعه‌دهنده‌ی وب',
  '⚡ برنامه‌نویس سخت‌افزار و AVR',
  '🎛️ طراح بردهای الکترونیکی',
  '🚀 عاشق یادگیری و ساختن',
];

if (typeEl) {
  if (prefersReduced) {
    typeEl.textContent = roles[0];
  } else {
    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;

    function type() {
      const current = roles[roleIdx];
      typeEl.textContent = current.slice(0, charIdx);

      let delay = deleting ? 40 : 95;
      if (!deleting && charIdx === current.length) {
        deleting = true;
        delay = 2200;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        delay = 450;
      } else {
        charIdx += deleting ? -1 : 1;
      }
      setTimeout(type, delay);
    }
    type();
  }
}

/* ==================================================================
   ۵) افکت سه‌بعدی (Tilt) روی کارت‌ها
   ================================================================== */
if (canHover && !prefersReduced) {
  $$('.tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* دکمه‌های مغناطیسی */
  $$('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${(x * 0.2).toFixed(1)}px, ${(y * 0.2).toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ==================================================================
   ۶) نمایان‌شدن بخش‌ها هنگام اسکرول (با تأخیر پلکانی)
   ================================================================== */
$$('.stagger').forEach((group) => {
  Array.from(group.children).forEach((child, i) => {
    child.style.setProperty('--d', `${i * 100}ms`);
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
$$('.reveal').forEach((el) => revealObserver.observe(el));

/* ==================================================================
   ۷) شمارنده‌ی متحرک + نوار پیشرفت مهارت‌ها
   ================================================================== */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10) || 0;
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();

  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = toFa(Math.round(target * eased)) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
$$('.counter').forEach((el) => countObserver.observe(el));

/* نوارهای پیشرفت مهارت‌ها */
const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fill = $('.skill-fill', entry.target);
        if (fill) fill.style.width = `${fill.dataset.width}%`;
        barObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);
$$('.skill-card').forEach((card) => barObserver.observe(card));

/* ==================================================================
   ۸) نوار پیشرفت اسکرول + نوار ناوبری + لینک فعال
   ================================================================== */
const scrollProgress = $('#scrollProgress');
const navbar = $('#navbar');
const backToTop = $('#backToTop');
const sections = $$('section[id]');

function updateActiveLink() {
  const pos = window.scrollY + 170;
  let current = sections.length ? sections[0].id : 'home';
  sections.forEach((s) => {
    if (s.offsetTop <= pos) current = s.id;
  });
  $$('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

function onScroll() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const p = max > 0 ? (doc.scrollTop / max) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${p}%`;
  if (navbar) navbar.classList.toggle('scrolled', doc.scrollTop > 40);
  if (backToTop) backToTop.classList.toggle('show', doc.scrollTop > 600);
  updateActiveLink();
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });
}

/* ==================================================================
   ۹) گوی‌های شناور — پارالاکس هنگام اسکرول
   ================================================================== */
const orbs = $$('.orb');
window.addEventListener(
  'scroll',
  () => {
    const y = window.scrollY;
    orbs.forEach((orb, i) => {
      orb.style.transform = `translateY(${(y * (0.03 + i * 0.02)).toFixed(1)}px)`;
    });
  },
  { passive: true }
);

/* ==================================================================
   ۱۰) منوی همبرگری (موبایل)
   ================================================================== */
const burger = $('#burger');
const navMenu = $('#navMenu');

if (burger && navMenu) {
  burger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  });

  /* با کلیک روی هر لینک، منو بسته شود */
  $$('.nav-link', navMenu).forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    });
  });
}

/* ==================================================================
   ۱۱) کپی ایمیل با Clipboard API + پیام تأیید
   ================================================================== */
const copyBtn = $('#copyEmail');
if (copyBtn) {
  const EMAIL = 'mohammadmehdihaj71@gmail.com';

  copyBtn.addEventListener('click', async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(EMAIL);
      ok = true;
    } catch {
      /* پشتیبان برای مرورگرهای قدیمی */
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand('copy');
      ta.remove();
    }
    copyBtn.textContent = ok ? '✅ کپی شد!' : '❌ خطا در کپی';
    setTimeout(() => { copyBtn.textContent = '📋 کپی ایمیل'; }, 2000);
  });
}

/* ==================================================================
   نکته: در حالت موبایل (بدون hover) انیمیشن‌های ماوس به‌صورت خودکار
   غیرفعال هستند تا تجربه‌ی لمسی روان‌تر بماند.
   ================================================================== */
