/* ===== STACKLY AEROSPACE - DASHBOARD JS ===== */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initClock();
  initWelcome();
  initCounters();
  initCharts();
  initFleetGauges();
  initChartFilters();
  initUserDisplay();
  initParticles();
  initCursorGlow();
  initMagneticHover();
  initScrollReveal();
  initRippleEffect();
  initChipFilters();
  initSearchFocus();
});

/* ===== SIDEBAR ===== */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;

  const isMobile = () => window.innerWidth <= 1024;

  const lockBody = () => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  };
  const unlockBody = () => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  };

  if (toggle) toggle.addEventListener('click', () => {
    if (isMobile()) {
      if (sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        unlockBody();
      } else {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        lockBody();
      }
    } else {
      sidebar.classList.toggle('collapsed');
    }
  });
  if (mobileBtn) mobileBtn.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
    lockBody();
  });
  if (overlay) overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
    unlockBody();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
      unlockBody();
    }
  });

  window.addEventListener('resize', () => {
    if (!isMobile() && sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
      unlockBody();
    }
  });

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', e => {
      if (link.getAttribute('href') && link.getAttribute('href') !== '#') {
        if (isMobile()) {
          sidebar.classList.remove('mobile-open');
          overlay.classList.remove('active');
          unlockBody();
        }
        return;
      }
      e.preventDefault();
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ===== LIVE CLOCK ===== */
function initClock() {
  const clockEl = document.getElementById('liveClock');
  const dateEl = document.getElementById('liveDate');
  if (!clockEl || !dateEl) return;

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = h + ':' + m + ':' + s;

    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', opts);
  }
  update();
  setInterval(update, 1000);
}

/* ===== WELCOME NAME ===== */
function initWelcome() {
  const nameEl = document.getElementById('welcomeName');
  if (!nameEl) return;
  const email = localStorage.getItem('userEmail');
  if (email) {
    const name = email.split('@')[0];
    nameEl.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  }
}

/* ===== ANIMATED COUNTERS ===== */
function initCounters() {
  document.querySelectorAll('.stat-value[data-count]').forEach(el => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = parseFloat(el.getAttribute('data-count'));
        if (isNaN(target)) return;
        const isDecimal = target % 1 !== 0;
        const prefix = el.textContent.match(/^[^0-9]*/)[0] || '';
        const suffix = el.textContent.match(/[^0-9.]*$/)[0] || '';
        const dur = 1500, start = performance.now();
        function update(now) {
          const p = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          const val = target * ease;
          el.textContent = prefix + (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
          if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });
}

/* ===== CHARTS ===== */
function initCharts() {
  document.querySelectorAll('canvas[data-chart="bar"]').forEach(c => drawBarChart(c));
  document.querySelectorAll('canvas[data-chart="line"]').forEach(c => drawLineChart(c));
  document.querySelectorAll('canvas[data-chart="donut"]').forEach(c => drawDonutChart(c));
  document.querySelectorAll('canvas[data-chart="area"]').forEach(c => drawLineChart(c));
}

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}

function drawBarChart(canvas) {
  const raw = JSON.parse(canvas.dataset.values || '[]');
  const labels = JSON.parse(canvas.dataset.labels || '[]');
  if (!raw.length) return;
  let anim = 0;

  function render() {
    const { ctx, w, h } = setupCanvas(canvas);
    const pad = { t: 15, r: 15, b: 30, l: 40 };
    const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
    const max = Math.max(...raw) * 1.15;
    const bw = cw / raw.length, gap = bw * 0.3;

    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (ch / 4) * i;
      ctx.strokeStyle = 'rgba(0,212,255,0.06)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillStyle = '#495670'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(max - (max / 4) * i), pad.l - 6, y + 3);
    }

    raw.forEach((v, i) => {
      const x = pad.l + bw * i + gap / 2;
      const bh = (v / max) * ch * Math.min(anim, 1);
      const y = pad.t + ch - bh;
      const grad = ctx.createLinearGradient(x, y, x, pad.t + ch);
      grad.addColorStop(0, canvas.dataset.color || '#00d4ff');
      grad.addColorStop(1, 'rgba(0,212,255,0.05)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x + 4, y); ctx.lineTo(x + bw - gap - 4, y);
      ctx.quadraticCurveTo(x + bw - gap, y, x + bw - gap, y + 4);
      ctx.lineTo(x + bw - gap, pad.t + ch); ctx.lineTo(x, pad.t + ch);
      ctx.lineTo(x, y + 4); ctx.quadraticCurveTo(x, y, x + 4, y);
      ctx.fill();

      if (labels[i]) {
        ctx.fillStyle = '#495670'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + (bw - gap) / 2, h - pad.b + 16);
      }
    });

    if (anim < 1) { anim += 0.03; requestAnimationFrame(render); }
  }
  observeAndAnimate(canvas, render);
}

function drawLineChart(canvas) {
  const datasets = JSON.parse(canvas.dataset.datasets || '[]');
  const labels = JSON.parse(canvas.dataset.labels || '[]');
  if (!datasets.length) return;
  let anim = 0;

  function render() {
    const { ctx, w, h } = setupCanvas(canvas);
    const pad = { t: 15, r: 15, b: 30, l: 40 };
    const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
    const allVals = datasets.flatMap(d => d.values);
    const max = Math.max(...allVals) * 1.15;
    const step = cw / (labels.length - 1 || 1);

    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (ch / 4) * i;
      ctx.strokeStyle = 'rgba(0,212,255,0.06)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillStyle = '#495670'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(max - (max / 4) * i), pad.l - 6, y + 3);
    }

    labels.forEach((l, i) => {
      ctx.fillStyle = '#495670'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
      ctx.fillText(l, pad.l + step * i, h - pad.b + 16);
    });

    datasets.forEach(ds => {
      const pts = ds.values.map((v, i) => ({
        x: pad.l + step * i,
        y: pad.t + ch - (v / max) * ch * Math.min(anim, 1)
      }));

      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, pad.t + ch);
      ctx.lineTo(pts[0].x, pad.t + ch);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
      grad.addColorStop(0, ds.color + '28');
      grad.addColorStop(1, ds.color + '00');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = ds.color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();

      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0a1628'; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = ds.color; ctx.fill();
      });
    });

    if (anim < 1) { anim += 0.025; requestAnimationFrame(render); }
  }
  observeAndAnimate(canvas, render);
}

function drawDonutChart(canvas) {
  const raw = JSON.parse(canvas.dataset.values || '[]');
  const labels = JSON.parse(canvas.dataset.labels || '[]');
  const colors = JSON.parse(canvas.dataset.colors || '[]');
  if (!raw.length) return;
  let anim = 0;

  function render() {
    const { ctx, w, h } = setupCanvas(canvas);
    const size = Math.min(w, h);
    const cx = w / 2, cy = h / 2;
    const outerR = size / 2 - 15, innerR = outerR * 0.62;
    const total = raw.reduce((a, b) => a + b, 0);
    let angle = -Math.PI / 2;

    ctx.clearRect(0, 0, w, h);
    raw.forEach((v, i) => {
      const sweep = (v / total) * Math.PI * 2 * Math.min(anim, 1);
      const end = angle + sweep;
      ctx.beginPath(); ctx.arc(cx, cy, outerR, angle, end); ctx.arc(cx, cy, innerR, end, angle, true); ctx.closePath();
      ctx.fillStyle = colors[i] || '#00d4ff'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, outerR, end - 0.02, end + 0.02); ctx.arc(cx, cy, innerR, end + 0.02, end - 0.02, true); ctx.closePath();
      ctx.fillStyle = '#0a1628'; ctx.fill();
      angle = end;
    });

    if (anim < 1) { anim += 0.02; requestAnimationFrame(render); }
  }
  observeAndAnimate(canvas, render);
}

/* ===== FLEET GAUGES ===== */
function initFleetGauges() {
  document.querySelectorAll('canvas[data-gauge]').forEach(canvas => {
    const value = parseInt(canvas.dataset.gauge) || 0;
    const color = canvas.dataset.gaugeColor || '#2ed573';
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 100 * dpr; canvas.height = 100 * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    const cx = 50, cy = 55, r = 36;
    const s = Math.PI * 0.75, e = Math.PI * 2.25, arc = e - s;
    let p = 0;

    function draw() {
      ctx.clearRect(0, 0, 100, 100);
      ctx.beginPath(); ctx.arc(cx, cy, r, s, e);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
      const fa = s + arc * (value / 100) * p;
      ctx.beginPath(); ctx.arc(cx, cy, r, s, fa);
      ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
      ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(cx, cy, r, fa - 0.1, fa);
      ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#e6f1ff'; ctx.font = 'bold 15px Orbitron'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(value * p) + '%', cx, cy - 2);
      ctx.fillStyle = '#495670'; ctx.font = '8px Inter'; ctx.fillText('READY', cx, cy + 14);
      if (p < 1) { p += 0.02; requestAnimationFrame(draw); }
    }
    observeAndAnimate(canvas, draw);
  });
}

/* ===== CHART FILTERS ===== */
function initChartFilters() {
  document.querySelectorAll('.chart-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.parentElement.querySelectorAll('.chart-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* ===== CHIP FILTERS ===== */
function initChipFilters() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.closest('.card-actions');
      if (!group) return;
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

/* ===== SEARCH FOCUS ===== */
function initSearchFocus() {
  const search = document.querySelector('.topbar-search input');
  if (!search) return;
  search.addEventListener('keydown', e => {
    if (e.key === 'Escape') search.blur();
  });
}

/* ===== USER DISPLAY ===== */
function initUserDisplay() {
  const email = localStorage.getItem('userEmail');
  if (!email) return;
  const name = email.split('@')[0];
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  const initials = name.substring(0, 2).toUpperCase();
  document.querySelectorAll('.sidebar-user-name').forEach(el => el.textContent = displayName);
  document.querySelectorAll('.topbar-name').forEach(el => el.textContent = email);
  document.querySelectorAll('.sidebar-avatar, .topbar-avatar').forEach(el => el.textContent = initials);
}

/* ===== PARTICLE BACKGROUND ===== */
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.35 + 0.08;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${this.alpha})`;
      ctx.fill();
    }
  }

  const count = Math.min(60, Math.floor((w * h) / 25000));
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.05 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();
}

/* ===== CURSOR GLOW TRAIL ===== */
function initCursorGlow() {
  if (window.innerWidth < 1024) return;
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function animate() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    glow.style.left = cx + 'px';
    glow.style.top = cy + 'px';
    requestAnimationFrame(animate);
  }
  animate();
}

/* ===== MAGNETIC HOVER ===== */
function initMagneticHover() {
  if (window.innerWidth < 1024) return;
  document.querySelectorAll('.stat-card, .card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const intensity = 0.015;
      card.style.transform = `translateY(-3px) perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ===== SCROLL REVEAL ===== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.welcome-banner, .stats-grid, .charts-grid, .bottom-grid, .card, .settings-card, .fleet-item, .ticket-item, .doc-item, .page-header');
  elements.forEach(el => el.classList.add('reveal'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
}

/* ===== RIPPLE EFFECT ===== */
function initRippleEffect() {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.className = 'sidebar-ripple';
      const rect = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/* ===== HELPER ===== */
function observeAndAnimate(canvas, fn) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { fn(); obs.unobserve(canvas); } });
  }, { threshold: 0.3 });
  obs.observe(canvas);
  window.addEventListener('resize', fn);
}

/* ===== CHART RESIZE ===== */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.querySelectorAll('canvas[data-chart]').forEach(c => {
      const event = new Event('redraw');
      c.dispatchEvent(event);
    });
    initCharts();
  }, 250);
});
