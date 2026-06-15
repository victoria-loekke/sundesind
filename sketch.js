const W = 390;
const H = 844;

const FEELINGS = [
  { label: 'ENSOM',       c1: [147,  15, 224], c2: [ 13, 155, 249] }, // lilla → blå
  { label: 'HÅBEFULD',    c1: [ 63, 200,  29], c2: [ 43, 255, 237] }, // grøn → turkis
  { label: 'TAKNEMMELIG', c1: [255, 213,   0], c2: [255,   0, 170] }, // gul → pink
  { label: 'BEKYMRET',    c1: [ 13, 155, 249], c2: [180, 167, 214] }, // blå → gråviolet
  { label: 'PRESSET',     c1: [255,   0, 170], c2: [241, 129,  16] }, // pink → orange
  { label: 'SELVSIKKER',  c1: [241, 129,  16], c2: [255, 213,   0] }, // orange → gul
  { label: 'STRESSET',    c1: [241, 129,  16], c2: [216,  18,  33] }, // orange → rød
  { label: 'FORVIRRET',   c1: [ 43, 255, 237], c2: [147,  15, 224] }, // turkis → lilla
  { label: 'OPTIMISTISK', c1: [255, 213,   0], c2: [ 63, 200,  29] }, // gul → grøn
];

const COLS = [75, 195, 315];
const ROWS = [270, 390, 510];
const BASE_R = 60;

let circles = [];
let particles = [];
let state = 'INTRO';
let selectedIdx = -1;
let transitionT = 0;
let origPos = {};
let pTimer = 0;

function setup() {
  let cnv = createCanvas(W, H);
  cnv.parent('canvas-container');
  textFont('Arial');

  for (let i = 0; i < 9; i++) {
    circles.push({
      x: COLS[i % 3],
      y: ROWS[floor(i / 3)],
      r: BASE_R,
      alpha: 255,
      pulseOff: random(TWO_PI),
      blobOff:  random(TWO_PI),
      feeling:  FEELINGS[i]
    });
  }
}

function draw() {
  background(24, 20, 20);
  let t = frameCount * 0.018;

  if (state === 'INTRO') {
    drawTitle(255);
    circles.forEach(c => drawCircle(c, t));
  }

  else if (state === 'TRANSITIONING') {
    transitionT = min(transitionT + 0.022, 1);
    let ease = easeIO(transitionT);

    drawTitle(floor(255 * (1 - ease)));

    circles.forEach((c, i) => {
      if (i === selectedIdx) {
        c.x = lerp(origPos.x, W / 2, ease);
        c.y = lerp(origPos.y, H / 2, ease);
        c.r = lerp(origPos.r, 32, ease);
        drawCircle(c, t);
      } else {
        c.alpha = floor(255 * (1 - ease));
        if (c.alpha > 0) drawCircle(c, t);
      }
    });

    pTimer++;
    if (transitionT > 0.35 && pTimer % 5 === 0 && particles.length < 50) {
      spawnParticle();
    }
    drawParticles(t);

    if (transitionT >= 1) state = 'PARTICLES';
  }

  else if (state === 'PARTICLES') {
    pTimer++;
    if (pTimer % 20 === 0 && particles.length < 130) spawnParticle();
    drawCircle(circles[selectedIdx], t);
    drawParticles(t);
  }
}

function drawTitle(a) {
  if (a <= 0) return;
  noStroke();
  fill(255, a);
  textAlign(CENTER, TOP);
  textSize(32);
  textStyle(BOLD);
  textLeading(42);
  text('HVAD FYLDER MEST\nHOS DIG?', W / 2, 55);
}

function drawCircle(c, t) {
  let pulse = 1 + 0.012 * sin(t * 2.2 + c.pulseOff);
  let r = c.r * pulse;
  let bt = t + c.blobOff;

  // indre glødepunkt animerer svagt for at give liv
  let offX = cos(bt * 0.5) * r * 0.2;
  let offY = sin(bt * 0.7) * r * 0.2;

  let ctx = drawingContext;
  ctx.save();
  ctx.globalAlpha = c.alpha / 255;

  ctx.beginPath();
  ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
  ctx.clip();

  // radial gradient: c1 i centrum → c2 i kanten
  let g = ctx.createRadialGradient(
    c.x + offX, c.y + offY, 0,
    c.x, c.y, r
  );
  g.addColorStop(0, `rgb(${c.feeling.c1[0]},${c.feeling.c1[1]},${c.feeling.c1[2]})`);
  g.addColorStop(1, `rgb(${c.feeling.c2[0]},${c.feeling.c2[1]},${c.feeling.c2[2]})`);
  ctx.fillStyle = g;
  ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);

  ctx.restore();

  if (c.r > 22 && c.alpha > 50) {
    fill(255, c.alpha);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(max(7, c.r * 0.17));
    textStyle(BOLD);
    text(c.feeling.label, c.x, c.y);
  }
}

function spawnParticle() {
  let angle = random(TWO_PI);
  let d = random(40, 160);
  let f = random(FEELINGS);
  particles.push({
    x: W / 2 + cos(angle) * d,
    y: H / 2 + sin(angle) * d,
    vx: random(-0.22, 0.22),
    vy: random(-0.22, 0.22),
    r: random(20, 50),
    alpha: 0,
    tAlpha: random(150, 215),
    pulseOff: random(TWO_PI),
    blobOff:  random(TWO_PI),
    feeling: f
  });
}

function drawParticles(t) {
  for (let p of particles) {
    p.alpha = min(p.alpha + 2.5, p.tAlpha);
    p.x += p.vx;
    p.y += p.vy;
    if (p.x - p.r < 0 || p.x + p.r > W) p.vx *= -1;
    if (p.y - p.r < 0 || p.y + p.r > H) p.vy *= -1;

    let pulse = 1 + 0.04 * sin(t * 2.2 + p.pulseOff);
    let r = p.r * pulse;
    let bt = t + p.blobOff;
    let offX = cos(bt * 0.5) * r * 0.2;
    let offY = sin(bt * 0.7) * r * 0.2;

    let ctx = drawingContext;
    ctx.save();
    ctx.globalAlpha = p.alpha / 255;

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.clip();

    let g = ctx.createRadialGradient(
      p.x + offX, p.y + offY, 0,
      p.x, p.y, r
    );
    g.addColorStop(0, `rgb(${p.feeling.c1[0]},${p.feeling.c1[1]},${p.feeling.c1[2]})`);
    g.addColorStop(1, `rgb(${p.feeling.c2[0]},${p.feeling.c2[1]},${p.feeling.c2[2]})`);
    ctx.fillStyle = g;
    ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);

    ctx.restore();

    if (p.r > 18 && p.alpha > 40) {
      fill(255, p.alpha);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(max(7, p.r * 0.18));
      textStyle(BOLD);
      text(p.feeling.label, p.x, p.y);
    }
  }
}

function easeIO(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function mousePressed(event) {
  if (state !== 'INTRO') return;

  let cnv = document.querySelector('#canvas-container canvas');
  let rect = cnv.getBoundingClientRect();
  let mx = (event.clientX - rect.left) * (W / rect.width);
  let my = (event.clientY - rect.top)  * (H / rect.height);

  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    if (dist(mx, my, c.x, c.y) < c.r * 1.2) {
      selectedIdx = i;
      origPos = { x: c.x, y: c.y, r: c.r };
      transitionT = 0;
      pTimer = 0;
      state = 'TRANSITIONING';
      break;
    }
  }
}

function touchStarted(event) {
  if (state !== 'INTRO') return false;

  let touch = event.touches[0];
  let cnv = document.querySelector('#canvas-container canvas');
  let rect = cnv.getBoundingClientRect();
  let mx = (touch.clientX - rect.left) * (W / rect.width);
  let my = (touch.clientY - rect.top)  * (H / rect.height);

  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    if (dist(mx, my, c.x, c.y) < c.r * 1.2) {
      selectedIdx = i;
      origPos = { x: c.x, y: c.y, r: c.r };
      transitionT = 0;
      pTimer = 0;
      state = 'TRANSITIONING';
      break;
    }
  }
  return false;
}

function touchStarted() {
  mousePressed();
  return false;
}