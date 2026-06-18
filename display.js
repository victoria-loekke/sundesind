let blobs = [];

let participants = 100;

let lastSpawn = 0;

let clusterMode = false;
let clusterTimer = 0;

let agrandir;
let vag;
let atight;

let mode = "VERTICAL";

let w;
let h;

let particleArea;

const feelings = [
  { c1: [147, 15, 224], c2: [13, 155, 249] },
  { c1: [63, 200, 29], c2: [43, 255, 237] },
  { c1: [255, 213, 0], c2: [255, 0, 170] },

  { c1: [13, 155, 249], c2: [180, 167, 214] },
  { c1: [255, 0, 170], c2: [241, 129, 16] },
  { c1: [241, 129, 16], c2: [255, 213, 0] },

  { c1: [216, 18, 33], c2: [241, 129, 16] },
  { c1: [43, 255, 237], c2: [147, 15, 224] },
  { c1: [255, 213, 0], c2: [63, 200, 29] },
];

let clusters = [];

const pos = [
  [0.15, 0.15],
  [0.5, 0.1],
  [0.85, 0.15],

  [0.15, 0.5],
  [0.5, 0.5],
  [0.85, 0.5],

  [0.15, 0.85],
  [0.5, 0.9],
  [0.85, 0.85],
];

function preload() {
  agrandir = loadFont("./fonts/Agrandir-WideBlackItalic.otf");
  atight = loadFont("./fonts/Agrandir-Tight.otf");
  vag = loadFont("./fonts/VAG Rounded Bold_0.ttf");
}

function setup() {
  createCanvas(1, 1);

  setLayout("VERTICAL");

  clusterTimer = millis();

  setStage(200);
}

function setLayout(modeName) {
  mode = modeName;

  if (mode === "VERTICAL") {
    w = 540;
    h = 960;

    particleArea = {
      x: 30,
      y: 30,
      w: 480,
      h: 670,
    };
  } else {
    w = 1280;
    h = 720;

    particleArea = {
      x: 600,
      y: 30,
      w: 650,
      h: 640,
    };
  }

  resizeCanvas(w, h);

  buildClusters();

  setStage(participants);
}

function buildClusters() {
  clusters = pos.map((p) => ({
    x: particleArea.x + particleArea.w * p[0],
    y: particleArea.y + particleArea.h * p[1],
  }));
}

function draw() {
  background(30);

  fill(30);
  noStroke();

  rect(particleArea.x, particleArea.y, particleArea.w, particleArea.h, 20);
  drawingContext.save();

  drawingContext.beginPath();

  drawingContext.roundRect(
    particleArea.x,
    particleArea.y,
    particleArea.w,
    particleArea.h,
    20,
  );

  drawingContext.clip();

  let t = frameCount * 0.01;

  if (millis() - lastSpawn > 2000) {
    //hvor ofte der kommer nye blobs

    spawnBlob((alpha = 0));

    participants++;

    lastSpawn = millis();
  }

  if (
    !clusterMode &&
    millis() - clusterTimer > 20000 //hvor længe blobs flyder frit
  ) {
    clusterMode = true;
    clusterTimer = millis();
  }

  if (
    clusterMode &&
    millis() - clusterTimer > 8000 //hvor længe blobs bliver i klynger
  ) {
    clusterMode = false;
    clusterTimer = millis();
  }

  for (let b of blobs) {
    b.alpha = min(b.alpha + 4, 255);

    if (!clusterMode) {
      b.x += b.vx;
      b.y += b.vy;

      b.x += sin(t * 0.3 + b.off) * 0.25; //ændre blobs svævelse første tal hastinghed
      b.y += cos(t * 0.25 + b.off) * 0.25; //ændre blobs svævelse andet tal udsving
      if (
        b.x < particleArea.x + b.r ||
        b.x > particleArea.x + particleArea.w - b.r
      )
        b.vx *= -1;

      if (
        b.y < particleArea.y + b.r ||
        b.y > particleArea.y + particleArea.h - b.r
      )
        b.vy *= -1;
    } else {
      let c = clusters[b.cluster];

      let tx = c.x + b.clusterOffsetX;

      let ty = c.y + b.clusterOffsetY;

      tx = constrain(
        tx,
        particleArea.x + b.r,
        particleArea.x + particleArea.w - b.r,
      );

      ty = constrain(
        ty,
        particleArea.y + b.r,
        particleArea.y + particleArea.h - b.r,
      );

      b.x += (tx - b.x) * 0.008; //hvor hurtigt blobs samler sig
      b.y += (ty - b.y) * 0.008;
    }

    let pulse = 1 + 0.04 * sin(t * 0.5 + b.off);

    drawBlob(b.x, b.y, b.r * pulse, b.feeling, b.alpha, t, b.off);
  }

  drawingContext.restore();

  drawHeader();
}
function drawHeader() {
  fill(255);
  noStroke();

  if (mode === "VERTICAL") {
    textAlign(CENTER);
    textFont(agrandir);
    textSize(42);

    text("HVORDAN HAR VI\nDET EGENTLIGT?", w / 2, 760);

    textFont(atight);
    textSize(14);

    text(
      "HER SER DU DE FØLELSER, MENNESKER DELER LIGE NU.\nUANSET HVAD DER FYLDER HOS DIG, ER DU IKKE ALENE.",
      w / 2,
      840,
    );
  } else {
    textAlign(RIGHT);
    textFont(agrandir);
    textSize(52);

    text("HVORDAN HAR VI\nDET EGENTLIGT?", 580, 100);

    textFont(atight);
    textSize(20);

    text(
      "HER SER DU DE FØLELSER, ANDRE MENNESKER DELER LIGE NU.\nUANSET HVAD DER FYLDER HOS DIG, ER DU IKKE ALENE.",
      580,
      210,
    );
  }

  fill(120, 186, 83);

  textAlign(LEFT);

  textFont(vag);
  textSize(20);

  text("headspace", 20, h - 20);

  fill(255, 180);

  textAlign(RIGHT);

  textFont(atight);
  textSize(17);

  text(nf(participants, 0) + " FØLELSER", w - 20, h - 20);
}

function spawnBlob(initial) {
  let clusterIndex = floor(random(feelings.length));

  blobs.push({
    x: random(particleArea.x, particleArea.x + particleArea.w),

    y: random(particleArea.y, particleArea.y + particleArea.h),

    vx: random(-0.4, 0.4), //hvor hurtigt blobs bevæger sig
    vy: random(-0.4, 0.4),

    cluster: clusterIndex,

    feeling: feelings[clusterIndex],

    clusterOffsetX: random(-180, 180), //klynge størrelser, hvor tæt blobs er

    clusterOffsetY: random(-150, 150), //klynge størrelser, hvor tæt blobs er

    r: random(8, 15), //størrelsen på blobs

    off: random(TWO_PI),
  });
}

function drawBlob(x, y, r, feeling, alpha, t, off) {
  let ctx = drawingContext;

  let ox = cos(t * 0.2 + off) * r * 0.5;

  let oy = sin(t * 0.25 + off) * r * 0.5;

  ctx.save();

  ctx.globalAlpha = alpha / 255;

  ctx.beginPath();

  ctx.arc(x, y, r, 0, TWO_PI);

  ctx.clip();

  let g = ctx.createRadialGradient(x + ox, y + oy, 0, x, y, r);

  g.addColorStop(0, `rgb(${feeling.c1[0]},${feeling.c1[1]},${feeling.c1[2]})`);

  g.addColorStop(1, `rgb(${feeling.c2[0]},${feeling.c2[1]},${feeling.c2[2]})`);

  ctx.fillStyle = g;

  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  ctx.restore();
}

function setStage(value) {
  participants = value;

  blobs = [];

  for (let i = 0; i < value; i++) {
    spawnBlob(true);
  }
}

function setVertical() {
  setLayout("VERTICAL");
}

function setLandscape() {
  setLayout("LANDSCAPE");
}

function mousePressed() {
  if (mouseX > w / 2 - 70 && mouseX < w / 2 - 10 && mouseY > h - 25) {
    setLayout("LANDSCAPE");
  }

  if (mouseX > w / 2 + 10 && mouseX < w / 2 + 70 && mouseY > h - 25) {
    setLayout("VERTICAL");
  }
}
