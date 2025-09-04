/* ===== Sticky nav (mobile burger) ===== */
const nav = document.querySelector('.nav');
const burger = document.getElementById('burger');
burger?.addEventListener('click', () => nav.classList.toggle('open'));

/* ===== Starfield (canvas) ===== */
const starCanvas = document.getElementById('starsCanvas');
const shootCanvas = document.getElementById('shootingCanvas');
const sCtx = starCanvas.getContext('2d');
const shCtx = shootCanvas.getContext('2d');

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  [starCanvas, shootCanvas].forEach(cv => {
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  });
}
resize(); addEventListener('resize', resize);

/* Stars setup */
const STAR_COUNT = 420; // lots of stars, still fast
const stars = Array.from({length: STAR_COUNT}).map(() => ({
  x: Math.random()*innerWidth,
  y: Math.random()*innerHeight,
  r: Math.random()*1.6 + 0.2,
  tw: Math.random()*0.5 + 0.5,              // twinkle speed
  phase: Math.random()*Math.PI*2,
  hue: Math.random()<0.15 ? 265 : (Math.random()<0.3 ? 48 : 0) // sprinkle purple & gold
}));

function drawStars(t) {
  sCtx.clearRect(0,0,innerWidth,innerHeight);
  for (const st of stars) {
    const twinkle = 0.6 + 0.4*Math.sin(t*st.tw + st.phase);
    sCtx.beginPath();
    sCtx.arc(st.x, st.y, st.r, 0, Math.PI*2);
    if (st.hue===265) sCtx.fillStyle = `rgba(192,132,252,${0.5*twinkle})`;
    else if (st.hue===48) sCtx.fillStyle = `rgba(255,213,128,${0.5*twinkle})`;
    else sCtx.fillStyle = `rgba(255,255,255,${0.8*twinkle})`;
    sCtx.shadowBlur = 8; sCtx.shadowColor = '#ffffff';
    sCtx.fill();
  }
}

/* Shooting stars */
const SHOOT_MIN_GAP = 350; // ms between spawns (approx, randomized)
const shoots = [];
function spawnShoot() {
  // small & cute
  const len = 50 + Math.random()*40; // short tail
  const speed = 400 + Math.random()*220; // px/s
  const startX = innerWidth * (0.6 + Math.random()*0.4); // right side
  const startY = innerHeight * (Math.random()*0.6);      // top to mid
  const angle = (225 + Math.random()*15) * Math.PI/180;  // down-left
  shoots.push({
    x:startX, y:startY, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
    len, life:0, maxLife:1200 + Math.random()*500
  });
  // schedule next
  setTimeout(spawnShoot, SHOOT_MIN_GAP + Math.random()*900);
}
spawnShoot();

function drawShoots(dt) {
  shCtx.clearRect(0,0,innerWidth,innerHeight);
  shoots.forEach(s => {
    s.life += dt;
    s.x += s.vx*(dt/1000);
    s.y += s.vy*(dt/1000);
    // tail
    const tx = s.x - (s.vx/ Math.hypot(s.vx,s.vy)) * s.len;
    const ty = s.y - (s.vy/ Math.hypot(s.vx,s.vy)) * s.len;
    const grd = shCtx.createLinearGradient(tx,ty,s.x,s.y);
    grd.addColorStop(0,'rgba(255,255,255,0)');
    grd.addColorStop(1,'rgba(255,255,255,0.95)');
    shCtx.strokeStyle = grd;
    shCtx.lineWidth = 2;
    shCtx.shadowBlur = 10;
    shCtx.shadowColor = '#ffffff';
    shCtx.beginPath(); shCtx.moveTo(tx,ty); shCtx.lineTo(s.x,s.y); shCtx.stroke();
  });
  // remove old
  for (let i = shoots.length-1; i>=0; i--) if (shoots[i].life > shoots[i].maxLife) shoots.splice(i,1);
}

/* Animation loop */
let last = performance.now();
function loop(now){
  const dt = now - last; last = now;
  drawStars(now/600);     // twinkle
  drawShoots(dt);         // shooting stars
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ===== Close mobile menu after click ===== */
document.querySelectorAll('.nav nav a').forEach(a=>{
  a.addEventListener('click', ()=> nav.classList.remove('open'));
});
