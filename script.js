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
   سیستم Toast
   ================================================================== */
const toastContainer = $('#toastContainer');

function showToast(message, type = 'info', duration = 3500) {
  if (!toastContainer) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.setAttribute('role', 'status');
  el.textContent = message;
  toastContainer.appendChild(el);

  const remove = () => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  };
  const timer = setTimeout(remove, duration);
  el.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

/* ==================================================================
   ۰) لودینگ‌اسکرین
   ================================================================== */
const preloader = $('#preloader');
function hidePreloader() {
  if (preloader) preloader.classList.add('done');
}
if (prefersReduced) {
  hidePreloader();
} else {
  window.addEventListener('load', () => setTimeout(hidePreloader, 250));
  setTimeout(hidePreloader, 1400);
}

/* ==================================================================
   ۱) تم روشن/تیره + ذخیره در localStorage
   ================================================================== */
const themeToggle = $('#themeToggle');
const savedTheme = localStorage.getItem('viana-theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

/* رنگ‌های ذرات بوم — در سطح ماژول تعریف می‌شوند تا از هر دو جا در دسترس باشند */
let neonColor = '#00D4FF';
let blueColor = '#2563EB';

function readThemeColors() {
  const cs = getComputedStyle(document.documentElement);
  neonColor = cs.getPropertyValue('--primary').trim() || neonColor;
  blueColor = cs.getPropertyValue('--secondary').trim() || blueColor;
}

function syncThemeColor() {
  const meta = $('meta[name="theme-color"]');
  if (meta) {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (bg) meta.setAttribute('content', bg);
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('viana-theme', next);
    readThemeColors();
    syncThemeColor();
  });
}
syncThemeColor();

/* ==================================================================
   ۲) شبکه‌ی ذرات (Particle Network) روی Canvas
   ================================================================== */
const canvas = $('#particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  const mouse = { x: null, y: null, active: false };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    /* تعداد ذرات در موبایل کمتر شود */
    const cap = isTouch ? 40 : 90;
    const count = Math.min(cap, Math.floor(window.innerWidth / 12));
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

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = neonColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = neonColor;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }

    if (!prefersReduced) requestAnimationFrame(draw);
  }

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
const typeIconEl = $('#typewriter-icon');
const roles = [
  { icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M2 19h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', text: 'برنامه‌نویس فول‌استک' },
  { icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', text: 'توسعه‌دهنده‌ی وب' },
  { icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 5l-2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>', text: 'برنامه‌نویس پایتون' },
  { icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="2"/><path d="M12 3c2 2.5 2 12.5 0 18M12 3c-2 2.5-2 12.5 0 18M5 9c2 1 5 1 7 1s5 0 7-1M5 15c2-1 5-1 7-1s5 0 7 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', text: 'توسعه‌دهنده‌ی ری‌اکت' },
  { icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>', text: 'برنامه‌نویس سخت‌افزار و AVR' },
  { icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M4 12h16M12 4v16" stroke="currentColor" stroke-width="2"/></svg>', text: 'طراح بردهای الکترونیکی' },
  { icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M12 2v1M12 21v1M2 12h1M21 12h1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', text: 'علاقه‌مند به UI/UX' },
  { icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>', text: 'کاوشگر ابزارهای هوش مصنوعی' },
  { icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M12 15c-2-1-4-4-4-8 3-2 7-2 10 0 0 4-2 7-4 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 15l-3 3M13 14l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.5" r="1.6" fill="currentColor"/></svg>', text: 'عاشق یادگیری و ساختن' },
];

if (typeEl && typeIconEl) {
  if (prefersReduced) {
    typeIconEl.innerHTML = roles[0].icon;
    typeEl.textContent = roles[0].text;
  } else {
    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;
    typeIconEl.innerHTML = roles[0].icon;

    function type() {
      const current = roles[roleIdx];
      typeEl.textContent = current.text.slice(0, charIdx);

      let delay = deleting ? 40 : 95;
      if (!deleting && charIdx === current.text.length) {
        deleting = true;
        delay = 2200;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        typeIconEl.innerHTML = roles[roleIdx].icon;
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
   ۵) افکت سه‌بعدی (Tilt) روی کارت‌ها + دکمه‌های مغناطیسی
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

function closeMobileMenu() {
  if (!burger || !navMenu) return;
  navMenu.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}

if (burger && navMenu) {
  burger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  });

  $$('.nav-link', navMenu).forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !burger.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

/* ==================================================================
   ۱۱) کپی ایمیل با Clipboard API + Toast
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
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand('copy');
      ta.remove();
    }
    const EMAIL_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M4 6h16v12H4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const CHECK_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    copyBtn.innerHTML = ok ? `${CHECK_SVG} کپی شد!` : `${CHECK_SVG} کپی شد!`;
    showToast(ok ? 'ایمیل با موفقیت کپی شد' : 'ایمیل کپی شد', ok ? 'success' : 'success');
    setTimeout(() => { copyBtn.innerHTML = `${EMAIL_SVG} کپی ایمیل`; }, 2000);
  });
}

/* ==================================================================
   ۱۲) دکمه‌ی دانلود رزومه (placeholder)
   ================================================================== */
$$('[data-resume]').forEach((btn) => {
  btn.addEventListener('click', () => {
    showToast('رزومه به‌زودی در دسترس قرار می‌گیرد', 'info');
  });
});

/* ==================================================================
   ۱۳) داده‌های مهارت‌ها (برای مودال)
   ================================================================== */
const SKILLS = {
  fullstack: {
    name: 'Full Stack', fa: 'برنامه‌نویس فول‌استک', level: 95,
    desc: 'توسعه‌ی وب به‌صورت کامل از سمت کاربر تا سمت سرور و دیتابیس.',
    use: 'ساخت وب‌سایت و وب‌اپلیکیشن کامل از ایده تا استقرار',
    projects: 'در حال تکمیل'
  },
  python: {
    name: 'Python', fa: 'پایتون', level: 90,
    desc: 'یک زبان برنامه‌نویسی قدرتمند و همه‌کاره برای اسکریپت، وب و ابزار.',
    use: 'نوشتن اسکریپت، اتوماسیون و برنامه‌های کاربردی',
    projects: 'در حال تکمیل'
  },
  c: {
    name: 'C', fa: 'زبان سی', level: 70,
    desc: 'زبان برنامه‌نویسی سیستمی و پایه که در سخت‌افزار و میکروکنترلر کاربرد دارد.',
    use: 'برنامه‌نویسی سیستم و میکروکنترلر',
    projects: 'در حال تکمیل'
  },
  cpp: {
    name: 'C++', fa: 'سی پلاس پلاس', level: 70,
    desc: 'زبان برنامه‌نویسی شیءگرا با کاربرد گسترده در نرم‌افزار و سخت‌افزار.',
    use: 'برنامه‌نویسی سیستمی و پروژه‌های سخت‌افزاری',
    projects: 'در حال تکمیل'
  },
  html: {
    name: 'HTML', fa: 'اچ‌تی‌ام‌ال', level: 90,
    desc: 'زبان ساختاردهی محتوای وب.',
    use: 'ساختار صفحات وب و وب‌اپلیکیشن',
    projects: 'سایت اصلی'
  },
  css: {
    name: 'CSS', fa: 'سی‌اس‌اس', level: 85,
    desc: 'زبان طراحی و استایل‌دهی به صفحات وب.',
    use: 'طراحی رابط کاربری، انیمیشن و ریسپانسیو',
    projects: 'سایت اصلی'
  },
  javascript: {
    name: 'JavaScript', fa: 'جاوااسکریپت', level: 75,
    desc: 'زبان برنامه‌نویسی وب برای تعامل و منطق سمت کاربر.',
    use: 'تعاملات، منطق وب و ساخت وب‌اپلیکیشن',
    projects: 'در حال تکمیل'
  },
  react: {
    name: 'React', fa: 'ری‌اکت', level: 75,
    desc: 'کتابخانه‌ی محبوب جاوااسکریپت برای ساخت رابط‌های کاربری.',
    use: 'ساخت وب‌اپلیکیشن‌های تعاملی و مدرن',
    projects: 'در حال تکمیل'
  },
  php: {
    name: 'PHP', fa: 'پی‌اچ‌پی', level: 70,
    desc: 'زبان برنامه‌نویسی سمت سرور برای وب.',
    use: 'توسعه‌ی بک‌اند وب‌سایت‌ها',
    projects: 'در حال تکمیل'
  },
  mysql: {
    name: 'MySQL & Database', fa: 'مای‌اس‌کیوال و دیتابیس', level: 75,
    desc: 'سیستم مدیریت پایگاه داده‌ی رابطه‌ای.',
    use: 'طراحی، ذخیره و مدیریت داده‌ها',
    projects: 'در حال تکمیل'
  },
  avr: {
    name: 'AVR', fa: 'میکروکنترلر AVR', level: 75,
    desc: 'خانواده‌ی میکروکنترلرهای Atmel برای پروژه‌های الکترونیکی.',
    use: 'برنامه‌نویسی سخت‌افزار و پروژه‌های الکترونیک',
    projects: 'در حال تکمیل'
  },
  arduino: {
    name: 'Arduino IDE', fa: 'آردوینو', level: 90,
    desc: 'پلتفرم متن‌باز سخت‌افزار و محیط برنامه‌نویسی برای پروژه‌های الکترونیک.',
    use: 'ساخت سریع پروژه‌های سخت‌افزاری و IoT',
    projects: 'در حال تکمیل'
  },
  altium: {
    name: 'Altium Designer', fa: 'طراحی برد', level: 100,
    desc: 'نرم‌افزار حرفه‌ای طراحی بردهای الکترونیکی (PCB).',
    use: 'طراحی و شبیه‌سازی بردهای الکترونیکی',
    projects: 'در حال تکمیل'
  },
  git: {
    name: 'Git', fa: 'گیت', level: 80,
    desc: 'سیستم کنترل نسخه‌ی توزیع‌شده.',
    use: 'مدیریت نسخه‌های کد و همکاری روی پروژه‌ها',
    projects: 'در حال تکمیل'
  },
  github: {
    name: 'GitHub', fa: 'گیت‌هاب', level: 80,
    desc: 'سرویس میزبانی مخازن Git و همکاری تیمی.',
    use: 'نگه‌داری کد و انتشار پروژه‌ها',
    projects: 'در حال تکمیل'
  },
  vercel: {
    name: 'Vercel & Deployment', fa: 'ورسل و استقرار', level: 75,
    desc: 'پلتفرم استقرار و میزبانی وب‌اپلیکیشن‌ها.',
    use: 'استقرار و انتشار پروژه‌های وب',
    projects: 'حساب دار، پت پلاس، جیب‌چی، Super Planner، توکن‌چی'
  },
  backend: {
    name: 'Backend & API', fa: 'بک‌اند و رابط برنامه‌نویسی', level: 72,
    desc: 'ساخت منطق سمت سرور و رابط‌های برنامه‌نویسی.',
    use: 'توسعه‌ی سرویس‌ها و API',
    projects: 'در حال تکمیل'
  },
  seo: {
    name: 'SEO', fa: 'سئوی سایت', level: 65,
    desc: 'بهینه‌سازی سایت برای موتورهای جستجو.',
    use: 'بهبود دیده‌شدن سایت در نتایج جستجو',
    projects: 'در حال تکمیل'
  },
  uiux: {
    name: 'UI/UX', fa: 'طراحی رابط کاربری', level: 68,
    desc: 'طراحی رابط کاربری و تجربه‌ی کاربری.',
    use: 'طراحی ظاهر و بهبود تجربه‌ی کاربری محصولات',
    projects: 'در حال تکمیل'
  },
  ai: {
    name: 'AI Tools', fa: 'ابزارهای هوش مصنوعی', level: 85,
    desc: 'استفاده از ابزارهای هوش مصنوعی برای سرعت و کیفیت بیشتر در توسعه.',
    use: 'کدنویسی کمکی، طراحی و اتوماسیون با هوش مصنوعی',
    projects: 'در حال تکمیل'
  }
};

/* ==================================================================
   ۱۴) داده‌های پروژه‌ها (برای مودال)
   ================================================================== */
const PROJECTS = {
  site: {
    name: 'سایت اصلی',
    desc: 'وب‌سایت شخصی و رسمی من',
    goal: 'معرفی من، مهارت‌ها، مسیر یادگیری و پروژه‌هایم',
    features: ['معرفی شخصی', 'نمایش مهارت‌ها', 'نمایش پروژه‌ها', 'در حال تکمیل'],
    tags: ['شخصی', 'وب'],
    url: 'https://www.mohammadmehdihz.ir',
    status: 'فعال'
  },
  hesabdaar: {
    name: 'برنامه مدیریت مالی حساب دار',
    desc: 'اپلیکیشن مدیریت مالی شخصی',
    goal: 'مدیریت مالی شخصی و پیگیری وضعیت مالی',
    features: ['مدیریت مالی شخصی', 'در حال تکمیل'],
    tags: ['مالی', 'وب اپلیکیشن', 'Vercel'],
    url: 'https://hesabdaar.vercel.app',
    status: 'فعال'
  },
  petyar: {
    name: 'پت پلاس',
    desc: 'برنامه مراقبت از حیوانات خانگی',
    goal: 'کمک به مراقبت از حیوانات خانگی',
    features: ['مراقبت از حیوانات خانگی', 'در حال تکمیل'],
    tags: ['وب اپلیکیشن', 'Vercel'],
    url: 'https://petyarplus.vercel.app/',
    status: 'فعال'
  },
  jibchi: {
    name: 'جیب‌چی',
    desc: 'مدیریت هوشمند پول',
    goal: 'مدیریت هوشمند هزینه‌ها و پول',
    features: ['مدیریت هوشمند پول', 'در حال تکمیل'],
    tags: ['مالی', 'وب اپلیکیشن', 'Vercel'],
    url: 'https://jibchi.vercel.app/',
    status: 'فعال'
  },
  planner: {
    name: 'Super Planner',
    desc: 'سیستم مدیریت زمان و زندگی شخصی',
    goal: 'مدیریت زمان و برنامه‌ریزی زندگی شخصی',
    features: ['مدیریت زمان', 'برنامه‌ریزی', 'در حال تکمیل'],
    tags: ['بهره‌وری', 'وب اپلیکیشن', 'Vercel'],
    url: 'https://super-planner.vercel.app/',
    status: 'فعال'
  },
  tokenchi: {
    name: 'توکن‌چی',
    desc: 'مدیریت و نگه‌داری توکن‌ها',
    goal: 'مدیریت و نگه‌داری توکن‌ها',
    features: ['مدیریت توکن‌ها', 'در حال تکمیل'],
    tags: ['مالی', 'وب اپلیکیشن', 'Vercel'],
    url: 'https://tokenchi.vercel.app/',
    status: 'فعال'
  }
};

/* ==================================================================
   ۱۵) مودال‌ها — باز و بسته شدن
   ================================================================== */
let lastFocused = null;

function openModal(overlay) {
  if (!overlay) return;
  lastFocused = document.activeElement;
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('open'));
  const closeBtn = $('.modal-close, [data-close-modal]', overlay);
  if (closeBtn) closeBtn.focus();
  document.body.classList.add('no-scroll');
}

function closeModal(overlay) {
  if (!overlay) return;
  overlay.classList.remove('open');
  setTimeout(() => { overlay.hidden = true; }, 300);
  document.body.classList.remove('no-scroll');
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

$$('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('[data-close-modal]')) {
      closeModal(overlay);
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (palette && palette.classList.contains('open')) {
      closePalette();
      return;
    }
    const openModalEl = $('.modal-overlay.open');
    if (openModalEl) closeModal(openModalEl);
  }
});

/* ==================================================================
   ۱۶) مودال جزئیات مهارت
   ================================================================== */
const skillModal = $('#skillModal');

function openSkillModal(key) {
  const data = SKILLS[key];
  if (!data || !skillModal) return;

  $('#skillModalTitle').textContent = data.name;
  $('#skillModalFa').textContent = data.fa;
  $('#skillModalDesc').textContent = data.desc;
  $('#skillModalUse').textContent = data.use;
  $('#skillModalProjects').textContent = data.projects;
  $('#skillModalPercent').textContent = toFa(data.level) + '٪';

  const card = $(`.skill-card[data-skill="${key}"]`);
  const iconEl = $('#skillModalIcon');
  iconEl.innerHTML = '';
  if (card) {
    const src = $('.skill-icon', card);
    if (src) iconEl.innerHTML = src.innerHTML;
  } else {
    iconEl.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 5l-2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  const bar = $('#skillModalBar');
  bar.style.width = '0%';
  openModal(skillModal);
  requestAnimationFrame(() => {
    setTimeout(() => { bar.style.width = `${data.level}%`; }, 60);
  });
}

$$('.skill-card[data-skill]').forEach((card) => {
  const activate = () => openSkillModal(card.dataset.skill);
  card.addEventListener('click', activate);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  });
});

/* ==================================================================
   ۱۷) مودال جزئیات پروژه
   ================================================================== */
const projectModal = $('#projectModal');

function openProjectModal(key) {
  const data = PROJECTS[key];
  if (!data || !projectModal) return;

  $('#projectModalTitle').textContent = data.name;
  $('#projectModalStatus').textContent = data.status;
  $('#projectModalDesc').textContent = data.desc;
  $('#projectModalGoal').textContent = data.goal;
  $('#projectModalFeatures').textContent = data.features.join(' — ');

  const tagsWrap = $('#projectModalTags');
  tagsWrap.innerHTML = '';
  data.tags.forEach((t) => {
    const s = document.createElement('span');
    s.textContent = t;
    tagsWrap.appendChild(s);
  });

  const actions = $('#projectModalActions');
  actions.innerHTML = '';
  if (data.url) {
    const a = document.createElement('a');
    a.href = data.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'btn btn-primary btn-sm';
    a.textContent = 'مشاهده‌ی دمو';
    actions.appendChild(a);
  }
  const note = document.createElement('span');
  note.style.cssText = 'font-size:0.82rem;color:var(--muted);align-self:center;';
  note.textContent = 'لینک گیت‌هاب این پروژه به‌زودی تکمیل می‌شود.';
  actions.appendChild(note);

  openModal(projectModal);
}

$$('.project-card[data-project]').forEach((card) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    openProjectModal(card.dataset.project);
  });
  card.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')) {
      e.preventDefault();
      openProjectModal(card.dataset.project);
    }
  });
});

/* ==================================================================
   ۱۸) فیلتر پروژه‌ها
   ================================================================== */
const filterBtns = $$('.filter-btn');
const allProjectCards = $$('#projectsGrid .project-card');

function applyFilter(filter) {
  allProjectCards.forEach((card) => {
    const cats = (card.dataset.cat || '').split(' ');
    const match = filter === 'all' || cats.includes(filter);
    card.classList.toggle('hidden', !match);
    if (match) {
      card.classList.add('visible');
      const reveal = card.closest('.reveal') || card;
      if (reveal.classList.contains('reveal')) reveal.classList.add('visible');
    }
  });
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

/* ==================================================================
   ۱۹) فرم تماس — اعتبارسنجی
   ================================================================== */
const contactForm = $('#contactForm');

function validateField(input) {
  const group = input.closest('.form-group');
  const errEl = group ? $('.form-error', group) : null;
  const val = input.value.trim();
  let msg = '';

  if (input.id === 'cf-name' && val.length < 2) msg = 'نام باید حداقل ۲ حرف باشد.';
  if (input.id === 'cf-email') {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) msg = 'ایمیل معتبر وارد کنید.';
  }
  if (input.id === 'cf-subject' && val.length < 2) msg = 'موضوع پیام را وارد کنید.';
  if (input.id === 'cf-message' && val.length < 5) msg = 'پیام باید حداقل ۵ حرف باشد.';

  if (group) group.classList.toggle('invalid', !!msg);
  if (errEl) errEl.textContent = msg;
  return !msg;
}

if (contactForm) {
  ['cf-name', 'cf-email', 'cf-subject', 'cf-message'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group && group.classList.contains('invalid')) validateField(input);
      });
    }
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = ['cf-name', 'cf-email', 'cf-subject', 'cf-message']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const allOk = fields.every(validateField);
    if (!allOk) {
      showToast('لطفاً خطاهای فرم را بررسی کنید', 'error');
      return;
    }

    const [name, email, subject, message] = fields.map((f) => f.value.trim());
    const mailto = `mailto:mohammadmehdihaj71@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`نام: ${name}\nایمیل: ${email}\n\n${message}`)}`;
    window.location.href = mailto;
    showToast('پیام شما آماده‌ی ارسال شد — در ایمیل ارسال می‌شود', 'success');
    contactForm.reset();
  });
}

/* ==================================================================
   ۲۱) Command Palette + جستجو
   ================================================================== */
const palette = $('#palette');
const paletteInput = $('#paletteInput');
const paletteResults = $('#paletteResults');
const paletteCommands = $('#paletteCommands');

const COMMANDS = [
  { label: 'خانه', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 9.5V21h14V9.5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>', action: () => goTo('#home') },
  { label: 'درباره من', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', action: () => goTo('#about') },
  { label: 'مهارت‌ها', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M15 5a4 4 0 0 0-5.3 3.8L4 14.5V19a1 1 0 0 0 1 1h4.5l5.7-5.7A4 4 0 0 0 19 9l-3 3-2-2 3-3a4 4 0 0 0-2-2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>', action: () => goTo('#skills') },
  { label: 'مسیر یادگیری', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M4 5h7l4 4h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 19h-7l-4-4H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="5" r="2" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="19" r="2" stroke="currentColor" stroke-width="2"/></svg>', action: () => goTo('#journey') },
  { label: 'پروژه‌ها', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" stroke="currentColor" stroke-width="2"/></svg>', action: () => goTo('#projects') },
  { label: 'فرآیند کار', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', action: () => goTo('#process') },
  { label: 'خدمات', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="2"/><rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="2"/><rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="2"/><rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="2"/></svg>', action: () => goTo('#services') },
  { label: 'در حال یادگیری', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M12 6c-2-1.5-4-2-7-2v14c3 0 5 .5 7 2 2-1.5 4-2 7-2V4c-3 0-5 .5-7 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 6v14" stroke="currentColor" stroke-width="2"/></svg>', action: () => goTo('#learning') },
  { label: 'ارتباط با من', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 8l9 6 9-6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>', action: () => goTo('#contact') },
  { label: 'باز کردن گیت‌هاب', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1a3.6 3.6 0 0 1 .1 2.7 3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>', action: () => window.open('https://github.com/Mohammahz', '_blank', 'noopener,noreferrer') },
  { label: 'تغییر تم', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>', action: () => { if (themeToggle) themeToggle.click(); } },
  { label: 'دانلود رزومه', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M6 2h8l4 4v16H6V2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 2v4h4M9 13h6M9 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', action: () => showToast('رزومه به‌زودی در دسترس قرار می‌گیرد', 'info') },
];

const SEARCH_ITEMS = [
  ...Object.entries(PROJECTS).map(([key, p]) => ({
    label: p.name, sub: 'پروژه', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" stroke="currentColor" stroke-width="2"/></svg>',
    action: () => { openProjectModal(key); },
    hay: `${p.name} ${p.desc} ${p.tags.join(' ')}`
  })),
  ...Object.entries(SKILLS).map(([key, s]) => ({
    label: s.name, sub: 'مهارت', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M15 5a4 4 0 0 0-5.3 3.8L4 14.5V19a1 1 0 0 0 1 1h4.5l5.7-5.7A4 4 0 0 0 19 9l-3 3-2-2 3-3a4 4 0 0 0-2-2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    action: () => { openSkillModal(key); },
    hay: `${s.name} ${s.fa} ${s.desc}`
  })),
  ...COMMANDS.map((c) => ({ label: c.label, sub: 'فرمان', icon: c.icon, action: c.action, hay: c.label }))
];

function goTo(selector) {
  const el = $(selector);
  if (el) el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
}

function openPalette() {
  if (!palette) return;
  lastFocused = document.activeElement;
  palette.hidden = false;
  requestAnimationFrame(() => palette.classList.add('open'));
  document.body.classList.add('no-scroll');
  if (paletteInput) {
    paletteInput.value = '';
    setTimeout(() => paletteInput.focus(), 60);
  }
  renderPalette('');
}

function closePalette() {
  if (!palette) return;
  palette.classList.remove('open');
  setTimeout(() => { palette.hidden = true; }, 250);
  document.body.classList.remove('no-scroll');
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

function paletteItemHTML(item, kind) {
  return `
    <button type="button" class="palette-item" role="option" data-kind="${kind}">
      <span class="pi-icon" aria-hidden="true">${item.icon}</span>
      <span>${escapeHtml(item.label)}</span>
      <span class="pi-sub">${item.sub || ''}</span>
    </button>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function renderPalette(query) {
  if (!paletteResults || !paletteCommands) return;
  const q = query.trim().toLowerCase();

  if (!q) {
    paletteResults.innerHTML = `<div class="palette-group-label">فرمان‌ها</div>`;
    paletteCommands.innerHTML = COMMANDS.map((c) => paletteItemHTML(c, 'command')).join('');
    return;
  }

  const matched = SEARCH_ITEMS.filter((it) => it.hay.toLowerCase().includes(q));
  const projects = matched.filter((m) => m.sub === 'پروژه').slice(0, 5);
  const skills = matched.filter((m) => m.sub === 'مهارت').slice(0, 5);
  const commands = matched.filter((m) => m.sub === 'فرمان').slice(0, 6);

  if (projects.length + skills.length + commands.length === 0) {
    paletteResults.innerHTML = `<div class="palette-empty">نتیجه‌ای پیدا نشد.</div>`;
    paletteCommands.innerHTML = '';
    return;
  }

  let html = '';
  if (projects.length) html += `<div class="palette-group-label">پروژه‌ها</div>` + projects.map((p) => paletteItemHTML(p, 'search')).join('');
  if (skills.length) html += `<div class="palette-group-label">مهارت‌ها</div>` + skills.map((s) => paletteItemHTML(s, 'search')).join('');
  if (commands.length) html += `<div class="palette-group-label">فرمان‌ها</div>` + commands.map((c) => paletteItemHTML(c, 'command')).join('');
  paletteResults.innerHTML = html;
  paletteCommands.innerHTML = '';
}

const paletteTrigger = $('#paletteTrigger');
if (paletteTrigger) paletteTrigger.addEventListener('click', openPalette);

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    if (palette && !palette.classList.contains('open')) openPalette();
    else closePalette();
  }
});

if (palette) {
  palette.addEventListener('click', (e) => {
    if (e.target === palette) closePalette();
    const item = e.target.closest('.palette-item');
    if (item) {
      const label = item.querySelector('span:nth-of-type(2)').textContent;
      const kind = item.dataset.kind;
      let target = null;
      if (kind === 'command') target = COMMANDS.find((c) => c.label === label);
      else target = SEARCH_ITEMS.find((it) => it.label === label);
      if (target) {
        closePalette();
        setTimeout(() => target.action(), 120);
      }
    }
  });

  if (paletteInput) {
    paletteInput.addEventListener('input', () => renderPalette(paletteInput.value));
    paletteInput.addEventListener('keydown', (e) => {
      const items = $$('.palette-item', palette);
      const idx = items.findIndex((el) => el.classList.contains('highlighted'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (idx + 1) % items.length;
        items.forEach((el) => el.classList.remove('highlighted'));
        if (items[next]) items[next].classList.add('highlighted');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (idx - 1 + items.length) % items.length;
        items.forEach((el) => el.classList.remove('highlighted'));
        if (items[prev]) items[prev].classList.add('highlighted');
      } else if (e.key === 'Enter') {
        const active = items.find((el) => el.classList.contains('highlighted')) || items[0];
        if (active) active.click();
      }
    });
  }
}

/* ==================================================================
   ۲۲) Easter Egg — Konami Code
   ================================================================== */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIdx = 0;

document.addEventListener('keydown', (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === KONAMI[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === KONAMI.length) {
      konamiIdx = 0;
      activateDeveloperMode();
    }
  } else {
    konamiIdx = (key === KONAMI[0]) ? 1 : 0;
  }
});

function activateDeveloperMode() {
  showToast('حالت توسعه‌دهنده فعال شد', 'success', 4000);
  try {
    console.log('%c▸ محمدمهدی حاجی‌زاده — حالت توسعه‌دهنده', 'color:#00D4FF;font-weight:bold;font-size:14px');
    console.log('%cاین سایت با HTML/CSS/JS خالص ساخته شده و برای PWA آماده است.', 'color:#8FA0C4');
  } catch (e) { /* بی‌صدا */ }
}

/* ==================================================================
   ۲۳) ثبت Service Worker (PWA)
   ================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* اگر SW ثبت نشد، سایت بدون آن کار می‌کند */
    });
  });
}

/* ==================================================================
   نکته: در حالت موبایل (بدون hover) انیمیشن‌های ماوس به‌صورت خودکار
   غیرفعال هستند تا تجربه‌ی لمسی روان‌تر بماند.
   ================================================================== */