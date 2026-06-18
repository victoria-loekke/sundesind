const w = 390;
const h = 844;

const feelings = [
  { label: "ENSOM", c1: [147, 15, 224], c2: [13, 155, 249] },
  { label: "HÅBEFULD", c1: [63, 200, 29], c2: [43, 255, 237] },
  { label: "TAKNEMMELIG", c1: [255, 213, 0], c2: [255, 0, 170] },
  { label: "BEKYMRET", c1: [13, 155, 249], c2: [180, 167, 214] },
  { label: "PRESSET", c1: [255, 0, 170], c2: [241, 129, 16] },
  { label: "SELVSIKKER", c1: [241, 129, 16], c2: [255, 213, 0] },
  { label: "STRESSET", c1: [241, 129, 16], c2: [216, 18, 33] },
  { label: "FORVIRRET", c1: [43, 255, 237], c2: [147, 15, 224] },
  { label: "OPTIMISTISK", c1: [255, 213, 0], c2: [63, 200, 29] },
];

const cols = [70, 195, 320];
const rows = [160, 325, 490];
const base_r = 58;

let circles = [];
let particles = [];

let state = "INTRO";

let selectedIdxs = [];
let transitionT = 0;
let origPos = {};

let pTimer = 0;
let particleDelay = 0;

let agrandir;
let vag;
let atight;
let grainLayer;

function preload() {
  agrandir = loadFont("./fonts/Agrandir-WideBlackItalic.otf");
  atight = loadFont("./fonts/Agrandir-Tight.otf");
  vag = loadFont("./fonts/VAG Rounded Bold_0.ttf");
}

function setup() {
  let cnv = createCanvas(w, h);
  cnv.parent("canvas-container");

  for (let i = 0; i < 9; i++) {
    circles.push({
      x: cols[i % 3],
      y: rows[floor(i / 3)],
      r: base_r,
      alpha: 255,
      labelAlpha: 0,
      pulseOff: random(TWO_PI),
      blobOff: random(TWO_PI),
      feeling: feelings[i],
    });
  }

  grainLayer = createGraphics(w, h);
  grainLayer.loadPixels();

  for (let i = 0; i < grainLayer.pixels.length; i += 4) {
    let grain = random(-8, 8);

    grainLayer.pixels[i] = 255 + grain;
    grainLayer.pixels[i + 1] = 255 + grain;
    grainLayer.pixels[i + 2] = 255 + grain;
    grainLayer.pixels[i + 3] = random(10, 25);
  }

  grainLayer.updatePixels();
}

function draw() {
  background(30, 30, 30);

  let t = frameCount * 0.018;

if (state === "INTRO") {

  drawTitle(255);

  circles.forEach((c, i) => {

    drawCircle(c, t);

    if (selectedIdxs.includes(i)) {
      drawSelectedRing(c);
    }

  });

  if (selectedIdxs.length > 0) {
    drawContinueButton();
  }
}

  else if (state === "TRANSITIONING") {
    transitionT = min(transitionT + 0.022, 1);
    let ease = easeIO(transitionT);

    drawTitle(floor(255 * (1 - ease)));

    circles.forEach((c, i) => {
      if (selectedIdxs.includes(i)) {
        let targetIndex = selectedIdxs.indexOf(i);

        let targetX = w / 2 + (targetIndex - 1) * 70;
        let targetY = h / 2;

        c.x = lerp(origPos[i].x, targetX, ease);
        c.y = lerp(origPos[i].y, targetY, ease);
        c.r = lerp(origPos[i].r, 32, ease);

        drawCircle(c, t);
      } else {
        c.alpha = floor(255 * (1 - ease));

        if (c.alpha > 0) {
          drawCircle(c, t);
        }
      }
    });

    if (transitionT >= 1) {
      state = "PARTICLES";
    }
  }

  else if (state === "PARTICLES") {
    particleDelay++;

    for (let idx of selectedIdxs) {
      drawCircle(circles[idx], t);
    }

    if (particleDelay > 50) {
      pTimer++;

      if (pTimer % 12 === 0 && particles.length < 230) {
        spawnParticle();
      }

      drawParticles(t);
    }
  }

  drawHeadspace();

  // image(grainLayer, 0, 0);
}

function drawTitle(a) {
  if (a <= 0) return;

  noStroke();
  fill(255, a);

  textAlign(CENTER, TOP);
  textSize(32);
  textStyle(BOLD);
  textFont(agrandir);
  textLeading(42);

  text("HVAD FYLDER\nHOS DIG LIGE NU?", w / 2, 600);

  textSize(20);
  textFont(atight);
  text("Du er ikke alene. Del op til tre følelser", w / 2, 690);
}

function drawHeadspace() {
  textAlign(CENTER, TOP);
  textFont(vag);
  textSize(20);
  noStroke();

  fill(120, 186, 83);
  text("headspace", 70, 790);

  fill(255, 180);
  textFont(atight);
  textAlign(RIGHT, TOP);
  textSize(16);
  text("347 FØLELSER", 370, 795);
}

function drawContinueButton() {

  rectMode(CENTER);

  fill(255);
  noStroke();

  rect(
    w / 2,
    743,
    130,
    33,
    23
  );

  fill(30);

  textAlign(CENTER, CENTER);
  textFont(atight);
  textSize(14);

  text(
    "FORTSÆT",
    w / 2,
    742
  );
}

function drawSelectedRing(c) {
  noFill();
  stroke(255, 220);
  strokeWeight(2);
  circle(c.x, c.y, c.r * 2.15);
  noStroke();
}

function drawCircle(c, t) {
  if (frameCount > 20) {
    c.labelAlpha = min(c.labelAlpha + 1.5, 255);
  }

  let pulse = 1 + 0.015 * sin(t * 2 + c.pulseOff);
  let r = c.r * pulse;

  let bt = t + c.blobOff;

  let wobbleX =
    cos(bt * 1.3) * r * 0.08 +
    sin(bt * 2.1) * r * 0.05;

  let wobbleY =
    sin(bt * 1.7) * r * 0.08 +
    cos(bt * 2.5) * r * 0.05;

  let offX = cos(bt * 0.35) * r * 0.6 + wobbleX;
  let offY = sin(bt * 0.45) * r * 0.6 + wobbleY;

  let ctx = drawingContext;

  ctx.save();
  ctx.globalAlpha = c.alpha / 255;

  ctx.beginPath();
  ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
  ctx.clip();

  let g = ctx.createRadialGradient(
    c.x + offX,
    c.y + offY,
    0,
    c.x,
    c.y,
    r
  );

  g.addColorStop(
    0,
    `rgb(${c.feeling.c1[0]},${c.feeling.c1[1]},${c.feeling.c1[2]})`
  );

  g.addColorStop(
    1,
    `rgb(${c.feeling.c2[0]},${c.feeling.c2[1]},${c.feeling.c2[2]})`
  );

  ctx.fillStyle = g;
  ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);

  ctx.restore();

  if (c.r > 22 && c.alpha > 50) {
    fill(255, min(c.alpha, c.labelAlpha));
    noStroke();

    textAlign(CENTER, CENTER);
    textFont(atight);
    textSize(12);
    textStyle(BOLD);

    text(c.feeling.label, c.x, c.y + c.r + 15);
  }
}

function spawnParticle() {

  let f = random(feelings);

  particles.push({
    x: random(-100, w + 100),
    y: random(-100, h + 100),

    vx: random(-0.5, 0.5),
    vy: random(-0.5, 0.5),

    r: random(10, 35),

    alpha: 0,
    tAlpha: 255,

    pulseOff: random(TWO_PI),
    blobOff: random(TWO_PI),

    feeling: f,
  });
}

function drawParticles(t) {
  for (let p of particles) {
    p.alpha = min(p.alpha + 2.5, p.tAlpha);

    p.x += p.vx;
    p.y += p.vy;

    if (p.x - p.r < 0 || p.x + p.r > w) {
      p.vx *= -1;
    }

    if (p.y - p.r < 0 || p.y + p.r > h) {
      p.vy *= -1;
    }

    let pulse = 1 + 0.18 * sin(t * 0.13 + p.pulseOff);
    let r = p.r * pulse;

    let bt = t + p.blobOff;

    let offX = cos(bt * 0.25) * r * 0.35;
    let offY = sin(bt * 0.3) * r * 0.35;

    let ctx = drawingContext;

    ctx.save();
    ctx.globalAlpha = p.alpha / 255;

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.clip();

    let g = ctx.createRadialGradient(
      p.x + offX,
      p.y + offY,
      0,
      p.x,
      p.y,
      r
    );

    g.addColorStop(
      0,
      `rgb(${p.feeling.c1[0]},${p.feeling.c1[1]},${p.feeling.c1[2]})`
    );

    g.addColorStop(
      1,
      `rgb(${p.feeling.c2[0]},${p.feeling.c2[1]},${p.feeling.c2[2]})`
    );

    ctx.fillStyle = g;
    ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);

    ctx.restore();
  }
}

function easeIO(t) {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
}
function selectCircle(mx, my) {

  if (state !== "INTRO") return;

  // klik på følelser

  for (let i = 0; i < circles.length; i++) {

    let c = circles[i];

    if (dist(mx, my, c.x, c.y) < c.r * 1.2) {

      if (selectedIdxs.includes(i)) {

        selectedIdxs =
          selectedIdxs.filter(
            idx => idx !== i
          );

      } else {

        if (selectedIdxs.length < 3) {

          selectedIdxs.push(i);

          origPos[i] = {
            x: c.x,
            y: c.y,
            r: c.r
          };
        }
      }

      return;
    }
  }

  // klik på fortsæt

  if (
    selectedIdxs.length > 0 &&
    mx > w/2 - 75 &&
    mx < w/2 + 75 &&
    my > 717 &&
    my < 763
  ) {

    transitionT = 0;

    pTimer = 0;

    particleDelay = 0;

    state = "TRANSITIONING";
  }
}

function mousePressed() {
  selectCircle(mouseX, mouseY);
}

function touchStarted() {
  if (touches.length > 0) {
    selectCircle(touches[0].x, touches[0].y);
  }

  return false;
}
