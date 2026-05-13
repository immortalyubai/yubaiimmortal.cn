import * as THREE from "./vendor/three.module.min.js";

const root = document.documentElement;
const spaceCanvas = document.querySelector("#spaceScene");
const portraitCanvas = document.querySelector("#portraitParticles");
const heroImage = document.querySelector(".hero-image");
const robotElement = document.querySelector("#robotCompanion");
const robotScan = document.querySelector("#robotScan");
const planetButtons = [...document.querySelectorAll(".planet-hotspot")];
const aboutTabs = [...document.querySelectorAll(".keyword-node")];
const aboutSection = document.querySelector("#about");
const aboutConsole = document.querySelector(".about-console-v3");
const aboutKicker = document.querySelector("#aboutKicker");
const aboutTitle = document.querySelector("#aboutTitle");
const aboutBody = document.querySelector("#aboutBody");
const aboutSignal = document.querySelector("#aboutSignal");
let aboutScanTimer = 0;
const abilityStage = document.querySelector(".ability-stage");
const abilitySection = document.querySelector("#projects");
const abilityCanvas = document.querySelector("#abilityGalaxy");
const abilityCards = [...document.querySelectorAll(".ability-card")];
const abilityTitle = document.querySelector("#abilityTitle");
const abilityBody = document.querySelector("#abilityBody");
const projectSection = document.querySelector("#thinking");
const projectBlackholeCanvas = document.querySelector("#projectBlackholeFlow");
const projectCards = [...document.querySelectorAll("#thinking .project-module")];
const projectStatusIndex = document.querySelector("#projectStatusIndex");
const projectStatusTitle = document.querySelector("#projectStatusTitle");
const projectStatusBody = document.querySelector("#projectStatusBody");
const projectStatusState = document.querySelector("#projectStatusState");
const workflowSection = document.querySelector("#ai");
const workflowSteps = [...document.querySelectorAll(".workflow-step")];
const workflowIndex = document.querySelector("#workflowIndex");
const workflowTitle = document.querySelector("#workflowTitle");
const workflowBody = document.querySelector("#workflowBody");
const workflowDetailName = document.querySelector("#workflowDetailName");
const workflowDetailBody = document.querySelector("#workflowDetailBody");
const contactCopyRows = [...document.querySelectorAll("[data-copy]")];
const robotLanguageToggle = document.querySelector("#robotLanguageToggle");
const robotLanguageCode = document.querySelector("#robotLanguageCode");
const robotAudioToggle = document.querySelector("#robotAudioToggle");
const robotAudioCode = document.querySelector("#robotAudioCode");
const robotAudioHint = document.querySelector("#robotAudioHint");
const i18nNodes = [...document.querySelectorAll("[data-i18n]")];
const launchLoader = document.querySelector("#launchLoader");
const launchLoaderStatus = document.querySelector("#launchLoaderStatus");

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const lerp = (from, to, amount) => from + (to - from) * amount;
const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
const LANGUAGE_STORAGE_KEY = "immortal-language";
const BGM_TRACK_SRC = "./assets/audio/cornfield-chase.flac";
const BGM_VOLUME = 0.32;
const BGM_FADE_IN = 0.8;
const BGM_FADE_OUT = 0.45;
const requestedLanguage = new URLSearchParams(window.location.search).get("lang");

function readStoredLanguage() {
  try {
    return window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

let currentLanguage =
  requestedLanguage === "en" || requestedLanguage === "cn"
    ? requestedLanguage
    : readStoredLanguage() === "en"
      ? "en"
      : "cn";

function localizedDataset(element, key) {
  if (!element?.dataset) return "";
  const suffix = currentLanguage === "en" ? "En" : "Cn";
  return element.dataset[`${key}${suffix}`] || element.dataset[key] || "";
}

function localizedContent(content, key) {
  if (!content) return "";
  const suffix = currentLanguage === "en" ? "En" : "Cn";
  return content[`${key}${suffix}`] || content[key] || "";
}

function replaceWithLines(node, value) {
  const parts = String(value).split("|");
  node.replaceChildren();
  parts.forEach((part, index) => {
    if (index > 0) {
      node.append(document.createElement("br"));
    }
    node.append(document.createTextNode(part));
  });
}

const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  scroll: Math.max(window.scrollY, 0),
  pointer: { x: 0, y: 0 },
  targetPointer: { x: 0, y: 0 },
  cursor: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, active: false },
  hoveredPlanet: null,
  planetTargets: {},
  activeAbout: null,
  aboutVisible: false,
  aboutTargets: {},
  portrait: {
    particles: [],
    dpr: 1,
    needsBuild: true,
    buildKey: "",
  },
  robot: { x: window.innerWidth * 0.68, y: window.innerHeight * 0.5, scale: 1, tilt: 0 },
  robotVisual: {
    x: window.innerWidth * 0.68,
    y: window.innerHeight * 0.5,
    scale: 1,
    tilt: 0,
    ready: false,
  },
  robotFlight: {
    active: false,
    from: null,
    id: null,
    start: 0,
    duration: 760,
  },
};

const aboutContent = {
  taste: {
    kicker: "Taste",
    title: "Taste",
    body: "我用审美做判断，用细节识别价值，不只追求“能用”，更在意“是否值得被记住”。",
    bodyCn: "我用审美做判断，用细节识别价值，不只追求“能用”，更在意“是否值得被记住”。",
    bodyEn: "I use taste as judgment: details, rhythm, and texture help me decide what is merely usable and what deserves to be remembered.",
    signal: "Taste",
  },
  ai: {
    kicker: "AI Creator",
    title: "AI Creator",
    body: "我把 AI 当作创作伙伴，用它放大想象力、表达力和把想法变成作品的速度。",
    bodyCn: "我把 AI 当作创作伙伴，用它放大想象力、表达力和把想法变成作品的速度。",
    bodyEn: "I treat AI as a creative partner that expands imagination, expression, and the speed of turning ideas into work.",
    signal: "AI Creator",
  },
  project: {
    kicker: "Project Builder",
    title: "Project Builder",
    body: "我习惯把模糊的灵感落成具体项目，用结构、行动和迭代把想法真正建出来。",
    bodyCn: "我习惯把模糊的灵感落成具体项目，用结构、行动和迭代把想法真正建出来。",
    bodyEn: "I turn fuzzy ideas into concrete projects, using structure, action, and iteration to make them real.",
    signal: "Project Builder",
  },
  content: {
    kicker: "Content System",
    title: "Content System",
    body: "我不只生产内容，而是搭建一套能持续输出、复用和积累影响力的表达系统。",
    bodyCn: "我不只生产内容，而是搭建一套能持续输出、复用和积累影响力的表达系统。",
    bodyEn: "I do not just produce content. I build repeatable systems for output, reuse, learning, and accumulated influence.",
    signal: "Content System",
  },
  long: {
    kicker: "Long Game",
    title: "Long Game",
    body: "我相信复利式成长，愿意为长期目标持续布局，而不是只追逐短期热度。",
    bodyCn: "我相信复利式成长，愿意为长期目标持续布局，而不是只追逐短期热度。",
    bodyEn: "I believe in compound growth and keep designing for long-term goals instead of chasing short bursts of attention.",
    signal: "Long Game",
  },
  explorer: {
    kicker: "Explorer",
    title: "Explorer",
    body: "我保持探索者的好奇心，在新工具、新趋势和新领域里寻找属于自己的可能性。",
    bodyCn: "我保持探索者的好奇心，在新工具、新趋势和新领域里寻找属于自己的可能性。",
    bodyEn: "I keep the curiosity of an explorer, looking for my own possibilities inside new tools, trends, and fields.",
    signal: "Explorer",
  },
};

const portraitContext = portraitCanvas?.getContext("2d", { alpha: true });

function seededRandom(seed) {
  let current = seed;
  return () => {
    current = Math.sin(current) * 10000;
    return current - Math.floor(current);
  };
}

function createStarField(count, spread, color, size, opacity) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const random = seededRandom(count + spread.x * 10);

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (random() - 0.5) * spread.x;
    positions[index * 3 + 1] = (random() - 0.5) * spread.y;
    positions[index * 3 + 2] = -random() * spread.z - 0.5;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color,
    map: glowTexture,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  material.userData.baseOpacity = opacity;

  return new THREE.Points(geometry, material);
}

function createGalaxy() {
  const count = 900;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const random = seededRandom(42);
  const warm = new THREE.Color(0xfff2d6);
  const blue = new THREE.Color(0x9bdfff);

  for (let index = 0; index < count; index += 1) {
    const radius = 0.4 + random() * 5.4;
    const arm = Math.floor(random() * 3);
    const angle = radius * 1.15 + arm * ((Math.PI * 2) / 3) + (random() - 0.5) * 0.54;
    const jitter = (random() - 0.5) * 0.56;
    positions[index * 3] = Math.cos(angle) * radius * 0.8 + 1.45 + jitter;
    positions[index * 3 + 1] = Math.sin(angle) * radius * 0.26 + 0.85 + (random() - 0.5) * 0.16;
    positions[index * 3 + 2] = -3.2 - random() * 3.6;

    const color = random() > 0.28 ? warm : blue;
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.024,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
  });
  material.userData.baseOpacity = 0.5;

  return new THREE.Points(geometry, material);
}

function getCoverRect(containerWidth, containerHeight, imageWidth, imageHeight) {
  const scale = Math.max(containerWidth / imageWidth, containerHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    x: (containerWidth - width) * 0.5,
    y: (containerHeight - height) * 0.5,
    width,
    height,
  };
}

function isPortraitSample(x, y, width, height) {
  const mobile = width < 760;
  const nx = x / Math.max(width, 1);
  const ny = y / Math.max(height, 1);
  const cx = mobile ? 0.535 : 0.515;
  const headY = mobile ? 0.315 : 0.39;
  const headRx = mobile ? 0.12 : 0.058;
  const headRy = mobile ? 0.13 : 0.12;
  const head = Math.pow((nx - cx) / headRx, 2) + Math.pow((ny - headY) / headRy, 2) < 1;
  const shoulders = ny > (mobile ? 0.42 : 0.45) && ny < (mobile ? 0.63 : 0.62) && Math.abs(nx - cx) < (mobile ? 0.16 : 0.09);
  const torso = ny > (mobile ? 0.52 : 0.52) && ny < (mobile ? 0.76 : 0.73) && Math.abs(nx - cx) < (mobile ? 0.105 : 0.067);
  const leftArm = ny > (mobile ? 0.48 : 0.49) && ny < (mobile ? 0.73 : 0.7) && Math.abs(nx - (cx - (mobile ? 0.105 : 0.075))) < (mobile ? 0.038 : 0.026);
  const rightArm = ny > (mobile ? 0.48 : 0.49) && ny < (mobile ? 0.72 : 0.7) && Math.abs(nx - (cx + (mobile ? 0.105 : 0.075))) < (mobile ? 0.038 : 0.026);
  const leftLeg = ny > (mobile ? 0.68 : 0.66) && ny < (mobile ? 0.93 : 0.88) && Math.abs(nx - (cx - (mobile ? 0.04 : 0.03))) < (mobile ? 0.043 : 0.028);
  const rightLeg = ny > (mobile ? 0.68 : 0.66) && ny < (mobile ? 0.93 : 0.88) && Math.abs(nx - (cx + (mobile ? 0.04 : 0.03))) < (mobile ? 0.043 : 0.028);
  return head || shoulders || torso || leftArm || rightArm || leftLeg || rightLeg;
}

function resizePortraitParticles() {
  if (!portraitCanvas || !portraitContext) return;
  state.portrait.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  portraitCanvas.width = Math.round(state.width * state.portrait.dpr);
  portraitCanvas.height = Math.round(state.height * state.portrait.dpr);
  state.portrait.needsBuild = true;
}

function buildPortraitParticles() {
  if (!portraitCanvas || !portraitContext || !heroImage?.naturalWidth || !heroImage?.naturalHeight) return;

  const buildKey = `${state.width}x${state.height}:${heroImage.naturalWidth}x${heroImage.naturalHeight}`;
  if (!state.portrait.needsBuild && state.portrait.buildKey === buildKey) return;

  const sampleWidth = Math.round(Math.max(260, Math.min(560, state.width * 0.4)));
  const sampleHeight = Math.round(sampleWidth * (state.height / Math.max(state.width, 1)));
  const scratch = document.createElement("canvas");
  scratch.width = sampleWidth;
  scratch.height = sampleHeight;
  const context = scratch.getContext("2d", { willReadFrequently: true });
  const rect = getCoverRect(sampleWidth, sampleHeight, heroImage.naturalWidth, heroImage.naturalHeight);
  context.drawImage(heroImage, rect.x, rect.y, rect.width, rect.height);

  const image = context.getImageData(0, 0, sampleWidth, sampleHeight);
  const data = image.data;
  const candidates = [];
  const step = state.width < 760 ? 3 : 4;
  const random = seededRandom(sampleWidth + sampleHeight + 101);

  for (let y = 2; y < sampleHeight - 2; y += step) {
    for (let x = 2; x < sampleWidth - 2; x += step) {
      const viewX = (x / sampleWidth) * state.width;
      const viewY = (y / sampleHeight) * state.height;
      if (!isPortraitSample(viewX, viewY, state.width, state.height)) continue;

      const offset = (y * sampleWidth + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const bright = (r + g + b) / 3;
      const nextOffset = (y * sampleWidth + x + 2) * 4;
      const downOffset = ((y + 2) * sampleWidth + x) * 4;
      const nextBright = (data[nextOffset] + data[nextOffset + 1] + data[nextOffset + 2]) / 3;
      const downBright = (data[downOffset] + data[downOffset + 1] + data[downOffset + 2]) / 3;
      const edge = Math.max(Math.abs(bright - nextBright), Math.abs(bright - downBright));

      const includeLitPixel = (bright > 72 || edge > 28) && random() > 0.18;
      const includeDarkSilhouette = bright > 10 && bright <= 72 && random() > 0.86;

      if (includeLitPixel || includeDarkSilhouette) {
        candidates.push({ x: viewX, y: viewY, r, g, b, bright, edge, dark: includeDarkSilhouette });
      }
    }
  }

  candidates.sort(() => random() - 0.5);
  const maxParticles = state.width < 760 ? 760 : 1280;
  state.portrait.particles = candidates.slice(0, maxParticles).map((candidate) => {
    const warm = candidate.dark || candidate.r + candidate.g * 0.92 > candidate.b * 1.3;
    const color = candidate.dark
      ? "rgb(220, 176, 122)"
      : warm
      ? `rgb(${Math.min(255, candidate.r + 34)}, ${Math.min(255, candidate.g + 28)}, ${Math.min(255, candidate.b + 16)})`
      : `rgb(${Math.min(255, candidate.r + 20)}, ${Math.min(255, candidate.g + 32)}, ${Math.min(255, candidate.b + 42)})`;
    return {
      homeX: candidate.x,
      homeY: candidate.y,
      x: candidate.x + (random() - 0.5) * 90,
      y: candidate.y + (random() - 0.5) * 90,
      color,
      alpha: candidate.dark ? 0.24 : clamp(candidate.bright / 255, 0.28, 0.96),
      size: (candidate.dark ? 0.56 : 0.72) + clamp((candidate.edge + candidate.bright) / 300, 0, candidate.dark ? 0.9 : 1.6),
      phase: random() * Math.PI * 2,
      drift: 3 + random() * 11,
      speed: 0.7 + random() * 1.8,
    };
  });

  state.portrait.buildKey = buildKey;
  state.portrait.needsBuild = false;
}

function drawPortraitParticles(time) {
  if (!portraitCanvas || !portraitContext) return;
  buildPortraitParticles();

  const context = portraitContext;
  const dpr = state.portrait.dpr || 1;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, state.width, state.height);

  const scrollUnit = state.scroll / Math.max(state.height, 1);
  const fade = clamp(1 - Math.max(scrollUnit - 0.82, 0) / 0.22);
  const particles = state.portrait.particles;
  if (!particles.length || fade <= 0.01) return;

  const radius = state.width < 760 ? 84 : 118;
  context.globalCompositeOperation = "lighter";

  particles.forEach((particle, index) => {
    const floatX = Math.cos(time * particle.speed + particle.phase) * particle.drift * 0.34;
    const floatY = Math.sin(time * (particle.speed * 0.78) + particle.phase) * particle.drift * 0.4;
    let targetX = particle.homeX + floatX + state.pointer.x * 5;
    let targetY = particle.homeY + floatY + state.pointer.y * 4 - scrollUnit * 24;

    if (state.cursor.active && scrollUnit < 0.9) {
      const dx = state.cursor.x - particle.homeX;
      const dy = state.cursor.y - particle.homeY;
      const distance = Math.hypot(dx, dy);
      if (distance < radius && distance > 0.1) {
        const force = Math.pow(1 - distance / radius, 2);
        targetX -= (dx / distance) * force * 58;
        targetY -= (dy / distance) * force * 58;
      }
    }

    particle.x = lerp(particle.x, targetX, 0.075);
    particle.y = lerp(particle.y, targetY, 0.075);

    context.globalAlpha = fade * particle.alpha * (0.58 + Math.sin(time * 1.7 + particle.phase) * 0.14);
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();

    if (index % 29 === 0) {
      context.globalAlpha *= 0.32;
      context.fillRect(particle.x - particle.size * 1.6, particle.y, particle.size * 4.4, 0.7);
    }
  });

  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
  context.setTransform(1, 0, 0, 1, 0, 0);
}

function randomUnitVector(random) {
  const theta = random() * Math.PI * 2;
  const y = random() * 2 - 1;
  const radius = Math.sqrt(1 - y * y);
  return new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
}

function materialWithBase(material) {
  material.userData.baseOpacity = material.opacity;
  return material;
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,255,255,0.92)");
  gradient.addColorStop(0.18, "rgba(255,255,255,0.36)");
  gradient.addColorStop(0.46, "rgba(255,255,255,0.12)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const glowTexture = createGlowTexture();

function createBadgeMaterial(color, opacity = 0.74) {
  return materialWithBase(
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
}

function createOrbitParticles(definition, random) {
  const count = definition.particleCount || 88;
  const positions = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  const orbits = [];

  for (let index = 0; index < count; index += 1) {
    orbits.push({
      angle: random() * Math.PI * 2,
      radius: definition.radius * (1.45 + random() * 0.86),
      height: (random() - 0.5) * definition.radius * 0.62,
      speed: (0.12 + random() * 0.32) * (random() > 0.5 ? 1 : -1),
      pulse: random() * Math.PI * 2,
      lift: (random() - 0.5) * definition.radius * 0.26,
    });
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = materialWithBase(
    new THREE.PointsMaterial({
      map: glowTexture,
      color: definition.spark,
      size: definition.radius * 0.035,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  material.userData.hoverBoost = 1.4;

  const points = new THREE.Points(geometry, material);
  points.userData.orbits = orbits;
  points.userData.positions = positions;
  return { points, material };
}

function createParticleShell(definition, random) {
  const count = definition.shellCount || 560;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  const particles = [];
  const baseColor = new THREE.Color(definition.spark);
  const accentColor = new THREE.Color(definition.innerGlow);
  const bandChance = definition.kind === "core" ? 0.22 : definition.kind === "mind" ? 0.14 : 0.2;

  for (let index = 0; index < count; index += 1) {
    const theta = random() * Math.PI * 2;
    const y = random() * 2 - 1;
    const radius = Math.sqrt(1 - y * y);
    const mix = random();
    const color = baseColor.clone().lerp(accentColor, mix * 0.72);
    particles.push({
      theta,
      y,
      radius,
      shell: definition.radius * (1.04 + random() * 0.5),
      speed: (0.06 + random() * 0.16) * (random() > 0.5 ? 1 : -1),
      phase: random() * Math.PI * 2,
      looseness: random(),
      band: random() < bandChance,
      bandTilt: (random() - 0.5) * 0.65,
    });
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = materialWithBase(
    new THREE.PointsMaterial({
      map: glowTexture,
      size: definition.radius * 0.03,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    }),
  );
  material.userData.hoverBoost = 1.9;
  const shell = new THREE.Points(geometry, material);
  shell.userData.particles = particles;
  shell.userData.positions = positions;
  return { shell, material };
}

function updateOrbitParticles(planet, time) {
  const { points, definition } = planet;
  if (!points) return;
  const positions = points.userData.positions;
  const orbits = points.userData.orbits;
  const hover = planet.hoverLevel || 0;
  const gather = easeInOutCubic(hover);

  orbits.forEach((orbit, index) => {
    const angle = orbit.angle + time * orbit.speed * (0.45 + gather * 3.4);
    const radius = orbit.radius * (1 + gather * 0.16 * Math.sin(time * 2.1 + orbit.pulse));
    const laneTilt = definition.kind === "core" ? 0.38 : definition.kind === "mind" ? -0.22 : 0.16;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * (0.62 + gather * 0.12);
    const y = orbit.height + Math.sin(angle * 2 + time + orbit.pulse) * definition.radius * (0.07 + gather * 0.14) + orbit.lift * gather;
    positions[index * 3] = x;
    positions[index * 3 + 1] = y * Math.cos(laneTilt) - z * Math.sin(laneTilt) * 0.12;
    positions[index * 3 + 2] = z;
  });

  points.geometry.attributes.position.needsUpdate = true;
}

function updateParticleShell(planet, time) {
  const shell = planet.shell;
  if (!shell) return;
  const hover = easeInOutCubic(planet.hoverLevel || 0);
  const positions = shell.userData.positions;
  const particles = shell.userData.particles;
  const { definition } = planet;
  const kindBias = definition.kind === "core" ? 1.25 : definition.kind === "mind" ? 0.92 : 1;
  shell.rotation.y = time * (definition.speed * 0.36 + 0.035 + hover * 0.14);
  shell.rotation.z = Math.sin(time * 0.26 + definition.seed) * 0.08 + hover * 0.08;

  particles.forEach((particle, index) => {
    const theta = particle.theta + time * particle.speed * (1 + hover * 6.5);
    const ripple =
      Math.sin(theta * 2.7 + time * 1.4 + particle.phase) *
        Math.cos(particle.y * 4.1 + time * 0.7) +
      Math.sin(theta * 5.3 - time * 1.1 + particle.phase) * 0.42;
    const shellRadius =
      particle.shell *
      (1 + ripple * 0.032 + hover * (0.08 + particle.looseness * 0.16));

    let x = Math.cos(theta) * particle.radius * shellRadius * kindBias;
    let y = particle.y * shellRadius * (1 - hover * 0.12) + Math.sin(time * 1.6 + particle.phase) * definition.radius * 0.035 * hover;
    let z = Math.sin(theta) * particle.radius * shellRadius * (0.86 + hover * 0.18);

    if (particle.band) {
      const bandRadius = definition.radius * (1.46 + particle.looseness * 0.48 + hover * 0.2);
      const bandY = particle.y * definition.radius * 0.2 + Math.sin(theta * 3.2 + particle.phase) * definition.radius * 0.045;
      const tiltedY = bandY * Math.cos(particle.bandTilt) - Math.sin(theta) * bandRadius * 0.24 * Math.sin(particle.bandTilt);
      x = Math.cos(theta) * bandRadius * (1 + hover * 0.08);
      y = tiltedY;
      z = Math.sin(theta) * bandRadius * (0.42 + hover * 0.1);
    }

    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
  });

  shell.geometry.attributes.position.needsUpdate = true;
}

function createPlanetDetails(group, definition, random) {
  const details = new THREE.Group();
  const detailMaterials = [];
  group.add(details);

  if (definition.kind === "archive") {
    const orbitMaterial = createBadgeMaterial(0xffe4bd, 0.12);
    const nodeMaterial = createBadgeMaterial(0xffedd0, 0.48);
    orbitMaterial.userData.hoverBoost = 1.15;
    nodeMaterial.userData.hoverBoost = 0.92;
    detailMaterials.push(orbitMaterial, nodeMaterial);

    for (let index = 0; index < 3; index += 1) {
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(
          definition.radius * (1.1 + index * 0.13),
          definition.radius * 0.004,
          6,
          128,
        ),
        orbitMaterial,
      );
      orbit.rotation.set(
        Math.PI * (0.5 + index * 0.035),
        -0.2 + index * 0.14,
        -0.1 + index * 0.18,
      );
      details.add(orbit);
    }

    const nodeGeometry = new THREE.SphereGeometry(definition.radius * 0.026, 8, 8);
    for (let index = 0; index < 5; index += 1) {
      const angle = (index / 5) * Math.PI * 2 + random() * 0.18;
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(
        Math.cos(angle) * definition.radius * (1.12 + random() * 0.12),
        Math.sin(angle * 1.55) * definition.radius * 0.28,
        Math.sin(angle) * definition.radius * (0.74 + random() * 0.12),
      );
      details.add(node);
    }
  }

  if (definition.kind === "mind") {
    const nodeMaterial = createBadgeMaterial(0xfff0ca, 0.52);
    const lineMaterial = materialWithBase(
      new THREE.LineBasicMaterial({
        color: 0xfff0ca,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
      }),
    );
    nodeMaterial.userData.hoverBoost = 1.1;
    lineMaterial.userData.hoverBoost = 1.35;
    detailMaterials.push(nodeMaterial, lineMaterial);

    const nodeGeometry = new THREE.SphereGeometry(definition.radius * 0.028, 8, 8);
    const points = [];
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI * 2 + random() * 0.32;
      const point = new THREE.Vector3(
        Math.cos(angle) * definition.radius * (1.22 + random() * 0.34),
        (random() - 0.5) * definition.radius * 1.3,
        Math.sin(angle) * definition.radius * (1.22 + random() * 0.34),
      );
      points.push(point);
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(point);
      details.add(node);
    }

    const positions = [];
    for (let index = 0; index < points.length; index += 1) {
      const next = points[(index + 2) % points.length];
      positions.push(points[index].x, points[index].y, points[index].z, next.x, next.y, next.z);
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    details.add(new THREE.LineSegments(lineGeometry, lineMaterial));
  }

  if (definition.kind === "core") {
    const scanMaterial = createBadgeMaterial(0x9bdfff, 0.34);
    const bitMaterial = createBadgeMaterial(0xdff6ff, 0.38);
    scanMaterial.userData.hoverBoost = 1.45;
    bitMaterial.userData.hoverBoost = 0.9;
    detailMaterials.push(scanMaterial, bitMaterial);

    for (let index = 0; index < 2; index += 1) {
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(definition.radius * (1.12 + index * 0.22), definition.radius * 0.0045, 6, 128),
        scanMaterial,
      );
      torus.rotation.set(Math.PI * (0.45 + index * 0.04), 0.24 + index * 0.1, -0.14 + index * 0.18);
      details.add(torus);
    }

    const bitGeometry = new THREE.IcosahedronGeometry(definition.radius * 0.024, 1);
    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * Math.PI * 2;
      const bit = new THREE.Mesh(bitGeometry, bitMaterial);
      bit.position.set(
        Math.cos(angle) * definition.radius * 1.55,
        Math.sin(angle * 2.1) * definition.radius * 0.24,
        Math.sin(angle) * definition.radius * 1.04,
      );
      bit.rotation.set(angle, angle * 0.7, angle * 0.4);
      details.add(bit);
    }
  }

  return { details, detailMaterials };
}

function createVoxelPlanet(definition) {
  const group = new THREE.Group();
  const random = seededRandom(definition.seed);

  const coreMaterial = materialWithBase(
    new THREE.MeshStandardMaterial({
      color: definition.color,
      roughness: 0.62,
      metalness: 0.2,
      flatShading: true,
      transparent: true,
      opacity: 0.82,
    }),
  );
  coreMaterial.userData.hoverBoost = 0.34;

  const edgeMaterial = materialWithBase(
    new THREE.LineBasicMaterial({
      color: 0xfff2dc,
      transparent: true,
      opacity: definition.kind === "mind" ? 0.16 : definition.kind === "core" ? 0.11 : 0.13,
    }),
  );
  edgeMaterial.userData.hoverBoost = definition.kind === "mind" ? 1.1 : 0.78;

  const ringMaterial = materialWithBase(
    new THREE.MeshBasicMaterial({
      color: definition.ring,
      transparent: true,
      opacity: definition.kind === "mind" ? 0.34 : definition.kind === "core" ? 0.22 : 0.14,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  ringMaterial.userData.hoverBoost = definition.kind === "mind" ? 1.75 : definition.kind === "archive" ? 0.72 : 1.15;

  const accentMaterial = materialWithBase(
    new THREE.MeshStandardMaterial({
      color: definition.accent,
      roughness: 0.55,
      metalness: 0.32,
      transparent: true,
      opacity: definition.kind === "core" ? 0.2 : 0.16,
      flatShading: true,
    }),
  );
  accentMaterial.userData.hoverBoost = definition.kind === "core" ? 0.32 : 0.24;

  const softShardMaterial = materialWithBase(
    new THREE.MeshBasicMaterial({
      color: definition.spark,
      transparent: true,
      opacity: definition.kind === "core" ? 0.1 : 0.075,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  softShardMaterial.userData.hoverBoost = definition.kind === "core" ? 0.34 : 0.22;

  const coreGeometry = new THREE.IcosahedronGeometry(definition.radius, 4);
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);

  const atmosphereMaterial = materialWithBase(
    new THREE.MeshBasicMaterial({
      color: definition.spark,
      transparent: true,
      opacity: definition.kind === "mind" ? 0.08 : definition.kind === "core" ? 0.05 : 0.055,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      wireframe: true,
    }),
  );
  atmosphereMaterial.userData.hoverBoost = definition.kind === "mind" ? 1.9 : 1.15;
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(definition.radius * 1.18, 32, 18), atmosphereMaterial);
  group.add(atmosphere);

  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeometry, 15), edgeMaterial);
  edges.scale.setScalar(1.004);
  group.add(edges);

  const blockGeometry = new THREE.DodecahedronGeometry(1, 0);
  for (let index = 0; index < definition.blocks; index += 1) {
    const normal = randomUnitVector(random);
    const isSoftShard = random() <= 0.42;
    const material = isSoftShard ? softShardMaterial : accentMaterial;
    const block = new THREE.Mesh(blockGeometry, material);
    const scale = definition.radius * (isSoftShard ? 0.008 + random() * 0.012 : 0.011 + random() * 0.015);
    block.scale.set(scale * (0.82 + random() * 0.44), scale * (0.82 + random() * 0.44), scale * (0.82 + random() * 0.44));
    block.position.copy(normal.clone().multiplyScalar(definition.radius * (0.97 + random() * 0.09)));
    block.lookAt(normal.clone().multiplyScalar(definition.radius * 2));
    block.rotation.z += random() * Math.PI;
    group.add(block);
  }

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(
      definition.radius * (definition.kind === "archive" ? 1.48 : 1.58),
      definition.radius * (definition.kind === "archive" ? 0.006 : 0.011),
      8,
      180,
    ),
    ringMaterial,
  );
  ring.rotation.set(Math.PI * 0.58, definition.ringTilt, definition.ringTurn);
  group.add(ring);

  const secondRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      definition.radius * (definition.kind === "archive" ? 1.72 : 1.88),
      definition.radius * 0.006,
      6,
      180,
    ),
    ringMaterial,
  );
  secondRing.rotation.set(Math.PI * 0.6, definition.ringTilt + 0.18, definition.ringTurn + 0.28);
  group.add(secondRing);

  const sweepMaterial = createBadgeMaterial(
    definition.spark,
    definition.kind === "mind" ? 0.18 : definition.kind === "core" ? 0.08 : 0.045,
  );
  sweepMaterial.userData.hoverBoost = definition.kind === "mind" ? 3.2 : definition.kind === "core" ? 1.1 : 0.6;
  const sweepRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      definition.radius * (definition.kind === "archive" ? 1.94 : 2.08),
      definition.radius * (definition.kind === "archive" ? 0.005 : 0.008),
      6,
      80,
      definition.kind === "archive" ? Math.PI * 2 : Math.PI * 1.38,
    ),
    sweepMaterial,
  );
  sweepRing.rotation.set(Math.PI * 0.56, definition.ringTilt + 0.34, definition.ringTurn + 0.5);
  group.add(sweepRing);

  const haloMaterial = materialWithBase(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: definition.spark,
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  haloMaterial.userData.hoverBoost = 2.4;
  const halo = new THREE.Sprite(haloMaterial);
  halo.scale.set(definition.radius * 4.2, definition.radius * 4.2, 1);
  group.add(halo);

  const innerGlowMaterial = materialWithBase(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: definition.innerGlow,
      transparent: true,
      opacity: 0.065,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  innerGlowMaterial.userData.hoverBoost = 2.4;
  const innerGlow = new THREE.Sprite(innerGlowMaterial);
  innerGlow.scale.set(definition.radius * 2.1, definition.radius * 2.1, 1);
  innerGlow.position.set(definition.radius * -0.16, definition.radius * 0.12, definition.radius * 0.1);
  group.add(innerGlow);

  const { points, material: particleMaterial } = createOrbitParticles(definition, random);
  group.add(points);

  const { shell, material: shellMaterial } = createParticleShell(definition, random);
  group.add(shell);

  const { details, detailMaterials } = createPlanetDetails(group, definition, random);
  detailMaterials.forEach((material) => {
    material.userData.hoverBoost = material.userData.hoverBoost ?? 1.15;
  });
  const materials = [
    coreMaterial,
    edgeMaterial,
    atmosphereMaterial,
    ringMaterial,
    accentMaterial,
    softShardMaterial,
    sweepMaterial,
    haloMaterial,
    innerGlowMaterial,
    particleMaterial,
    shellMaterial,
    ...detailMaterials,
  ];

  return {
    group,
    materials,
    atmosphere,
    ring,
    secondRing,
    sweepRing,
    halo,
    innerGlow,
    points,
    shell,
    details,
    hoverLevel: 0,
    definition,
  };
}

function initSpaceScene() {
  if (!spaceCanvas) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: spaceCanvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
  } catch {
    spaceCanvas.style.display = "none";
    return null;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, state.width / state.height, 0.1, 100);
  camera.position.set(0, 0.18, 6.45);

  scene.add(new THREE.AmbientLight(0xfff2dc, 1.48));

  const keyLight = new THREE.PointLight(0xffe1b2, 3.8, 18);
  keyLight.position.set(0.6, 2.6, 3.8);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x9bdfff, 1.8, 16);
  rimLight.position.set(-4.2, 1.4, 2.2);
  scene.add(rimLight);

  const farStars = createStarField(1500, { x: 26, y: 14, z: 18 }, 0xbfdfff, 0.012, 0.34);
  const nearStars = createStarField(620, { x: 18, y: 9, z: 12 }, 0xffefd1, 0.022, 0.72);
  const galaxy = createGalaxy();
  scene.add(farStars, galaxy, nearStars);

  const definitions = [
    {
      id: "projects",
      kind: "archive",
      radius: 0.58,
      seed: 12,
      blocks: 8,
      color: 0x24211b,
      accent: 0xf4dfba,
      ring: 0xffe4bd,
      spark: 0xffe2b8,
      innerGlow: 0xfff3da,
      particleCount: 62,
      shellCount: 820,
      ringTilt: -0.26,
      ringTurn: -0.2,
      speed: 0.22,
      base: { x: -2.5, y: 1.02, z: -0.42 },
      mobile: { x: -0.68, y: 1.22, z: -0.25 },
      mobileScale: 0.48,
      label: { x: 138, y: 10 },
      mobileLabel: { x: 48, y: 20 },
    },
    {
      id: "thinking",
      kind: "mind",
      radius: 0.48,
      seed: 24,
      blocks: 14,
      color: 0x2b2822,
      accent: 0xfff0d8,
      ring: 0xfff0ca,
      spark: 0xfff3c9,
      innerGlow: 0xfff7df,
      particleCount: 76,
      shellCount: 880,
      ringTilt: 0.04,
      ringTurn: 0.12,
      speed: -0.18,
      base: { x: -0.08, y: 1.96, z: -0.68 },
      mobile: { x: 0.02, y: 2.06, z: -0.45 },
      mobileScale: 0.48,
      label: { x: 118, y: -4 },
      mobileLabel: { x: 52, y: 4 },
    },
    {
      id: "ai",
      kind: "core",
      radius: 0.54,
      seed: 36,
      blocks: 16,
      color: 0x1e2224,
      accent: 0xdff6ff,
      ring: 0x9bdfff,
      spark: 0x9bdfff,
      innerGlow: 0xe6fbff,
      particleCount: 116,
      shellCount: 1260,
      ringTilt: 0.28,
      ringTurn: 0.18,
      speed: 0.19,
      base: { x: 2.58, y: 1.08, z: -0.46 },
      mobile: { x: 0.68, y: 1.2, z: -0.25 },
      mobileScale: 0.48,
      label: { x: -164, y: 48 },
      mobileLabel: { x: -76, y: 32 },
    },
  ];

  const planets = definitions.map((definition) => {
    const planet = createVoxelPlanet(definition);
    planet.button = document.querySelector(`[data-planet="${definition.id}"]`);
    scene.add(planet.group);
    return planet;
  });

  const projected = new THREE.Vector3();
  const lookAt = new THREE.Vector3(0, 0.42, -1.1);

  function resize() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(state.width, state.height, false);
    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();
  }

  function setPlanetOpacity(planet, opacity, labelOpacity, hoverLevel) {
    planet.materials.forEach((material) => {
      const boost = material.userData.hoverBoost || 0;
      material.opacity = Math.min(1, material.userData.baseOpacity * opacity * (1 + hoverLevel * boost));
    });
    planet.group.visible = opacity > 0.015;
    if (planet.button) {
      planet.button.style.opacity = Math.min(1, labelOpacity * (1 + hoverLevel * 0.2)).toFixed(3);
      planet.button.style.pointerEvents = labelOpacity > 0.1 ? "auto" : "none";
    }
  }

  function projectButton(planet) {
    if (!planet.button || !planet.group.visible) return;
    projected.setFromMatrixPosition(planet.group.matrixWorld);
    projected.project(camera);

    const label = state.width < 760 ? planet.definition.mobileLabel : planet.definition.label;
    const x = (projected.x * 0.5 + 0.5) * state.width + label.x;
    const y = (-projected.y * 0.5 + 0.5) * state.height + label.y;
    const clampedX = clamp(x, 44, state.width - 44);
    const clampedY = clamp(y, 44, state.height - 44);
    state.planetTargets[planet.definition.id] = { x: clampedX, y: clampedY };
    planet.button.style.setProperty("--hotspot-x", `${clampedX.toFixed(1)}px`);
    planet.button.style.setProperty("--hotspot-y", `${clampedY.toFixed(1)}px`);
  }

  function render(time) {
    const scrollUnit = state.scroll / Math.max(state.height, 1);
    const drop = clamp(scrollUnit, 0, 1.18);
    const exit = easeInOutCubic(clamp((scrollUnit - 0.14) / 0.82));
    const mobile = state.width < 760;

    camera.position.x = state.pointer.x * 0.16;
    camera.position.y = 0.18 + state.pointer.y * -0.1 + drop * 0.06 + exit * 0.1;
    camera.position.z = 6.45 + exit * 0.42;
    camera.lookAt(lookAt);

    farStars.rotation.y = time * 0.006 + state.pointer.x * 0.018;
    farStars.rotation.x = state.pointer.y * 0.012 + exit * 0.035;
    nearStars.rotation.y = -time * 0.014 + state.pointer.x * 0.026;
    nearStars.position.y = -drop * 0.36 - exit * 0.48;
    nearStars.scale.set(1 + exit * 0.04, 1 + exit * 0.46, 1);
    farStars.scale.set(1 + exit * 0.03, 1 + exit * 0.22, 1);
    galaxy.rotation.z = time * (0.018 + exit * 0.025);
    galaxy.position.x = state.pointer.x * 0.08;
    galaxy.position.y = -exit * 0.34;
    galaxy.scale.set(1 + exit * 0.16, 1 + exit * 0.52, 1);
    galaxy.material.opacity = galaxy.material.userData.baseOpacity + Math.sin(time * 1.9) * 0.08 + exit * 0.08;
    nearStars.material.opacity = nearStars.material.userData.baseOpacity + Math.sin(time * 2.6) * 0.08 + exit * 0.05;

    planets.forEach((planet, index) => {
      const def = planet.definition;
      const base = mobile ? def.mobile : def.base;
      const bob = Math.sin(time * 1.1 + index * 1.9) * 0.045;
      const isFocused = state.hoveredPlanet === def.id;
      const isDimmed = state.hoveredPlanet && !isFocused;
      planet.hoverLevel = lerp(planet.hoverLevel || 0, isFocused ? 1 : 0, 0.075);
      const wake = easeInOutCubic(planet.hoverLevel);
      const sideWake = Math.abs(base.x) > 1 ? wake * (base.x > 0 ? -0.36 : 0.36) : 0;
      const exitSide = base.x * exit * (mobile ? 0.12 : 0.18);
      planet.group.position.set(
        base.x + exitSide + state.pointer.x * (mobile ? 0.08 : 0.18) + sideWake,
        base.y - drop * (mobile ? 1.15 : 1.42) - exit * (mobile ? 0.16 : 0.28) + state.pointer.y * 0.06 + bob,
        base.z + drop * 0.18 - exit * (mobile ? 0.9 : 1.45) + wake * (mobile ? 0.18 : 0.24) + (isDimmed ? -0.18 : 0),
      );
      planet.group.rotation.y = time * def.speed + state.pointer.x * 0.14;
      planet.group.rotation.x = Math.sin(time * 0.42 + index) * 0.08 + state.pointer.y * 0.08;
      planet.ring.rotation.z += (0.0025 + wake * 0.0062) + index * 0.0006;
      planet.secondRing.rotation.z -= 0.0018 + wake * 0.0036;
      planet.sweepRing.rotation.z += 0.004 + wake * 0.018;
      planet.sweepRing.rotation.x = Math.PI * (0.56 + Math.sin(time * 0.8 + index) * 0.015);
      const detailTempo = def.kind === "core" ? 0.55 : def.kind === "mind" ? 0.18 : 0.28;
      const detailPulse = def.kind === "core" ? Math.sin(time * 3.1) * 0.035 : def.kind === "archive" ? Math.sin(time * 1.6) * 0.018 : 0;
      planet.details.rotation.y = time * (def.speed * 0.55 + 0.08 + wake * detailTempo);
      planet.details.rotation.z = Math.sin(time * 0.45 + index) * (0.06 + wake * (def.kind === "mind" ? 0.04 : 0.08));
      planet.details.scale.setScalar(1 + wake * (def.kind === "core" ? 0.22 : 0.12) + detailPulse);
      planet.atmosphere.scale.setScalar(1 + Math.sin(time * 1.4 + index) * 0.025 + wake * 0.16);
      planet.halo.scale.setScalar(def.radius * (4.2 + wake * (1.1 + Math.sin(time * 2.2 + index) * 0.12)));
      planet.innerGlow.scale.setScalar(def.radius * (2.1 + wake * 0.72));
      updateOrbitParticles(planet, time);
      updateParticleShell(planet, time);

      const fade = clamp(1 - Math.max(scrollUnit - 0.88, 0) / 0.34);
      const labelFade = fade * clamp(1 - Math.max(scrollUnit - 0.28, 0) / 0.26);
      const depthPulse = 0.94 + Math.sin(time * 1.3 + index) * 0.04;
      const focusScale = 1 + wake * 0.07 - (isDimmed ? 0.14 : 0);
      planet.group.scale.setScalar(depthPulse * (mobile ? def.mobileScale : 1) * focusScale * (1 - exit * (mobile ? 0.24 : 0.32)));
      planet.button?.style.setProperty("--wake", wake.toFixed(3));
      setPlanetOpacity(planet, fade * (isDimmed ? 0.48 : 1), labelFade * (isDimmed ? 0.38 : 1), wake);
      planet.group.updateMatrixWorld();
      projectButton(planet);
    });

    renderer.render(scene, camera);
  }

  resize();
  return { resize, render };
}

const spaceScene = initSpaceScene();

function createTextSprite(text, options = {}) {
  const {
    width = 512,
    height = 192,
    fontSize = 76,
    color = "#f8f2e8",
    subtext = "",
    subSize = 28,
  } = options;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, width, height);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(245, 216, 167, 0.38)";
  context.shadowBlur = 20;
  context.fillStyle = color;
  context.font = `900 ${fontSize}px Inter, Microsoft YaHei, sans-serif`;
  context.fillText(text, width * 0.5, subtext ? height * 0.44 : height * 0.5);
  if (subtext) {
    context.shadowBlur = 10;
    context.fillStyle = "rgba(248, 242, 232, 0.62)";
    context.font = `900 ${subSize}px Inter, Microsoft YaHei, sans-serif`;
    context.letterSpacing = "2px";
    context.fillText(subtext.toUpperCase(), width * 0.5, height * 0.73);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width / 220, height / 220, 1);
  return sprite;
}

function createSkillOrbitLine(radius, color, opacity, y = 0) {
  const points = [];
  for (let index = 0; index <= 220; index += 1) {
    const angle = (index / 220) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.58));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Line(geometry, material);
}

function createSkillOrbitDust(radius, count, color, opacity, y = 0) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    const drift = Math.sin(index * 12.989) * 0.08;
    const r = radius + drift;
    positions[index * 3] = Math.cos(angle) * r;
    positions[index * 3 + 1] = y + Math.sin(index * 4.3) * 0.018;
    positions[index * 3 + 2] = Math.sin(angle) * r * 0.58;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    map: glowTexture,
    color,
    size: 0.018,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geometry, material);
}

function rgbaFromColor(colorValue, alpha) {
  const color = new THREE.Color(colorValue);
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${alpha})`;
}

function createAbilitySpiralDust() {
  const count = 760;
  const random = seededRandom(815);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const warm = new THREE.Color(0xffe4bb);
  const cool = new THREE.Color(0x9bdfff);
  const rose = new THREE.Color(0xffb79d);
  const color = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const radius = 0.46 + Math.pow(random(), 0.72) * 4.1;
    const arm = index % 3;
    const angle =
      radius * 1.42 +
      arm * ((Math.PI * 2) / 3) +
      (random() - 0.5) * (0.36 + radius * 0.08);
    const lane = (random() - 0.5) * 0.34;
    positions[index * 3] = Math.cos(angle) * radius + lane;
    positions[index * 3 + 1] = (random() - 0.5) * (0.22 + radius * 0.05);
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.58 + (random() - 0.5) * 0.18;

    color.copy(warm).lerp(cool, random() * 0.58);
    if (arm === 2 && random() > 0.5) color.lerp(rose, 0.26);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    map: glowTexture,
    size: 0.024,
    vertexColors: true,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geometry, material);
}

function createAbilityDustField() {
  const count = 360;
  const random = seededRandom(612);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const warm = new THREE.Color(0xffe1b4);
  const cool = new THREE.Color(0x9bdfff);
  const color = new THREE.Color();
  for (let index = 0; index < count; index += 1) {
    const radius = 1.2 + random() * 4.8;
    const angle = random() * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (random() - 0.5) * 2.2;
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.72 - 0.2;
    color.copy(warm).lerp(cool, random() * 0.65);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    map: glowTexture,
    size: 0.016,
    vertexColors: true,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geometry, material);
}

function createSkillCoreHalo() {
  const count = 180;
  const random = seededRandom(731);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const warm = new THREE.Color(0xffe6bd);
  const cool = new THREE.Color(0x9bdfff);
  const color = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const normal = randomUnitVector(random);
    const radius = 0.72 + random() * 0.82;
    positions[index * 3] = normal.x * radius;
    positions[index * 3 + 1] = normal.y * radius * 0.72;
    positions[index * 3 + 2] = normal.z * radius * 0.62;
    color.copy(warm).lerp(cool, random() * 0.45);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    map: glowTexture,
    size: 0.026,
    vertexColors: true,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

function createSkillPlanetTexture(definition) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const random = seededRandom(1041 + definition.index * 47);
  const base = rgbaFromColor(definition.color, 1);
  const sparkSoft = rgbaFromColor(definition.spark, 0.3);
  const sparkStrong = rgbaFromColor(definition.spark, 0.68);

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, base);
  gradient.addColorStop(0.48, "rgba(8, 7, 6, 1)");
  gradient.addColorStop(1, sparkSoft);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalCompositeOperation = "lighter";
  for (let band = 0; band < 9; band += 1) {
    const y = 18 + random() * 92;
    const height = 3 + random() * 8;
    const offset = random() * 70;
    const bandGradient = context.createLinearGradient(0, y, canvas.width, y + height);
    bandGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    bandGradient.addColorStop(0.28, sparkSoft);
    bandGradient.addColorStop(0.72, "rgba(255, 255, 255, 0.035)");
    bandGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = bandGradient;
    context.beginPath();
    for (let x = -12; x <= canvas.width + 12; x += 8) {
      const wave = Math.sin((x + offset) * 0.032 + band) * (4 + random() * 1.2);
      if (x === -12) context.moveTo(x, y + wave);
      else context.lineTo(x, y + wave);
    }
    context.lineTo(canvas.width + 12, y + height + 12);
    context.lineTo(-12, y + height + 12);
    context.closePath();
    context.fill();
  }

  context.strokeStyle = sparkStrong;
  context.lineWidth = 1;
  for (let index = 0; index < 36; index += 1) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const length = 12 + random() * 34;
    context.globalAlpha = 0.15 + random() * 0.28;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(index) * length, y + Math.sin(index * 1.7) * length * 0.36);
    context.stroke();
  }

  for (let index = 0; index < 120; index += 1) {
    context.globalAlpha = 0.08 + random() * 0.24;
    context.fillStyle = random() > 0.72 ? sparkStrong : "rgba(255, 245, 226, 0.18)";
    context.fillRect(random() * canvas.width, random() * canvas.height, 1 + random() * 1.8, 1 + random() * 1.8);
  }

  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createSkillTrail(definition) {
  const count = 42;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    map: glowTexture,
    color: definition.spark,
    size: 0.026,
    transparent: true,
    opacity: 0.09,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const trail = new THREE.Points(geometry, material);
  trail.userData.positions = positions;
  trail.userData.count = count;
  return trail;
}

function updateSkillTrail(planet, angle, radius, time) {
  const { trail } = planet;
  if (!trail) return;

  const positions = trail.userData.positions;
  const count = trail.userData.count;
  const tailStep = 0.032 + planet.speed * 0.08;
  for (let index = 0; index < count; index += 1) {
    const falloff = index / Math.max(count - 1, 1);
    const tailAngle = angle - (index + 1) * tailStep * (1.08 + planet.focus * 0.18);
    const taper = 1 - falloff * 0.24;
    const tailRadius = radius * taper;
    positions[index * 3] = Math.cos(tailAngle) * tailRadius;
    positions[index * 3 + 1] =
      Math.sin(tailAngle * 1.3 + planet.index) * planet.yAmp +
      Math.sin(time * 1.6 + index * 0.45 + planet.index) * 0.018;
    positions[index * 3 + 2] = Math.sin(tailAngle) * tailRadius * 0.58;
  }

  trail.geometry.attributes.position.needsUpdate = true;
  trail.material.opacity = 0.07 + planet.focus * 0.15;
  trail.material.size = 0.022 + planet.focus * 0.016;
}

function createSkillPlanet(definition) {
  const group = new THREE.Group();
  const random = seededRandom(200 + definition.index * 17);
  const geometry = new THREE.SphereGeometry(definition.size, 38, 20);
  const material = new THREE.MeshStandardMaterial({
    color: definition.color,
    map: createSkillPlanetTexture(definition),
    roughness: 0.5,
    metalness: 0.24,
    emissive: definition.color,
    emissiveIntensity: 0.2,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.card = definition.card;
  group.add(mesh);

  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(definition.size * 1.08, 20, 12),
    new THREE.MeshBasicMaterial({
      color: definition.spark,
      transparent: true,
      opacity: 0.13,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(wire);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(definition.size * 1.22, 24, 12),
    new THREE.MeshBasicMaterial({
      color: definition.spark,
      transparent: true,
      opacity: 0.055,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(atmosphere);

  const chipMaterial = new THREE.MeshStandardMaterial({
    color: definition.spark,
    roughness: 0.5,
    metalness: 0.28,
    transparent: true,
    opacity: 0.44,
    flatShading: true,
  });
  const chipGeometry = new THREE.DodecahedronGeometry(definition.size * 0.09, 0);
  for (let index = 0; index < 7; index += 1) {
    const normal = randomUnitVector(random);
    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    chip.position.copy(normal.multiplyScalar(definition.size * (1.02 + random() * 0.16)));
    chip.scale.setScalar(0.72 + random() * 0.78);
    chip.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    group.add(chip);
  }

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(definition.size * 1.46, definition.size * 0.018, 6, 96),
    new THREE.MeshBasicMaterial({
      color: definition.spark,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  ring.rotation.set(Math.PI * 0.58, definition.phase * 0.18, definition.phase * 0.08);
  group.add(ring);

  const equator = new THREE.Mesh(
    new THREE.TorusGeometry(definition.size * 1.1, definition.size * 0.006, 5, 96),
    new THREE.MeshBasicMaterial({
      color: definition.spark,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  equator.rotation.set(Math.PI * 0.5, definition.phase * 0.22, definition.phase * 0.12);
  group.add(equator);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: definition.spark,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.scale.set(definition.size * 4.8, definition.size * 4.8, 1);
  group.add(glow);

  const focusBeacon = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: definition.spark,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  focusBeacon.scale.set(definition.size * 7.4, definition.size * 7.4, 1);
  group.add(focusBeacon);

  const satelliteGroup = new THREE.Group();
  const satellite = new THREE.Mesh(
    new THREE.IcosahedronGeometry(definition.size * 0.16, 1),
    new THREE.MeshBasicMaterial({
      color: definition.spark,
      transparent: true,
      opacity: 0.58,
    }),
  );
  satellite.position.set(definition.size * 1.95, 0, 0);
  satelliteGroup.add(satellite);
  satelliteGroup.rotation.x = definition.phase * 0.4;
  group.add(satelliteGroup);

  const trail = createSkillTrail(definition);

  const hitArea = new THREE.Mesh(
    new THREE.SphereGeometry(definition.size * 2.75, 18, 10),
    new THREE.MeshBasicMaterial({
      color: definition.spark,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  hitArea.userData.card = definition.card;
  group.add(hitArea);

  return {
    ...definition,
    group,
    mesh,
    wire,
    atmosphere,
    ring,
    equator,
    glow,
    focusBeacon,
    satelliteGroup,
    trail,
    hitArea,
    focus: 0,
    hover: 0,
  };
}

function initAbilityGalaxy() {
  if (!abilityCanvas || !abilityStage || !abilityCards.length) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: abilityCanvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
  } catch {
    abilityCanvas.style.display = "none";
    return null;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.setClearAlpha(0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0, 0.48, 8.4);
  const lookAt = new THREE.Vector3(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xfff0d6, 1.35));
  const sunLight = new THREE.PointLight(0xffdfad, 5.2, 16);
  sunLight.position.set(-1.2, 1.8, 3.6);
  scene.add(sunLight);
  const blueLight = new THREE.PointLight(0x9bdfff, 1.8, 14);
  blueLight.position.set(3.8, -0.4, 2.4);
  scene.add(blueLight);

  const galaxyGroup = new THREE.Group();
  galaxyGroup.rotation.x = -0.12;
  scene.add(galaxyGroup);

  const spiralDust = createAbilitySpiralDust();
  spiralDust.position.z = -0.18;
  galaxyGroup.add(spiralDust);

  const dustField = createAbilityDustField();
  dustField.position.z = -0.32;
  galaxyGroup.add(dustField);

  const centerGroup = new THREE.Group();
  galaxyGroup.add(centerGroup);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.48, 4),
    new THREE.MeshStandardMaterial({
      color: 0x1d1710,
      roughness: 0.38,
      metalness: 0.36,
      flatShading: true,
      emissive: 0x4a2c0d,
      emissiveIntensity: 0.58,
    }),
  );
  centerGroup.add(core);

  const coreWire = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 36, 18),
    new THREE.MeshBasicMaterial({
      color: 0xffe6bd,
      transparent: true,
      opacity: 0.16,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  centerGroup.add(coreWire);

  const coreGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffe1b4,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  coreGlow.scale.set(3.4, 3.4, 1);
  centerGroup.add(coreGlow);

  const coreCorona = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xfff0d0,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  coreCorona.scale.set(5.2, 5.2, 1);
  centerGroup.add(coreCorona);

  const coreHalo = createSkillCoreHalo();
  centerGroup.add(coreHalo);

  const coreRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdfad,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const coreRingOne = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.006, 6, 144), coreRingMaterial);
  coreRingOne.rotation.set(Math.PI * 0.58, 0.18, -0.18);
  centerGroup.add(coreRingOne);
  const coreRingTwo = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.004, 6, 144), coreRingMaterial.clone());
  coreRingTwo.material.opacity = 0.14;
  coreRingTwo.rotation.set(Math.PI * 0.64, -0.28, 0.38);
  centerGroup.add(coreRingTwo);

  const coreLabel = createTextSprite("immortal", {
    width: 512,
    height: 168,
    fontSize: 58,
  });
  coreLabel.position.set(0, 0.01, 0.62);
  coreLabel.scale.set(1.72, 0.56, 1);
  coreLabel.renderOrder = 6;
  galaxyGroup.add(coreLabel);

  const orbitGroup = new THREE.Group();
  orbitGroup.rotation.z = -0.1;
  galaxyGroup.add(orbitGroup);
  [
    [2.15, 0xffe3b4, 0.18, 0],
    [2.86, 0x9bdfff, 0.14, 0.02],
    [3.54, 0xfff1d6, 0.11, -0.02],
  ].forEach(([radius, color, opacity, y]) => {
    orbitGroup.add(createSkillOrbitLine(radius, color, opacity, y));
    orbitGroup.add(createSkillOrbitDust(radius, 128, color, opacity * 0.74, y));
  });
  const activeOrbitLine = createSkillOrbitLine(1, 0xffedd1, 0, 0);
  const activeOrbitDust = createSkillOrbitDust(1, 180, 0xffdfad, 0, 0);
  orbitGroup.add(activeOrbitLine);
  orbitGroup.add(activeOrbitDust);

  const colors = [
    { color: 0x2b241b, spark: 0xffdfad },
    { color: 0x1d2528, spark: 0x9bdfff },
    { color: 0x22222b, spark: 0xc7d7ff },
    { color: 0x29231c, spark: 0xffe8c4 },
    { color: 0x26201f, spark: 0xffb79d },
    { color: 0x1e2423, spark: 0xb8fff0 },
  ];
  const planets = abilityCards.map((card, index) =>
    createSkillPlanet({
      card,
      index,
      radius: index % 2 ? 2.72 : 3.42,
      phase: (index / abilityCards.length) * Math.PI * 2 + (index % 2 ? 0.28 : 0),
      speed: 0.18 + index * 0.018,
      size: index % 2 ? 0.2 : 0.24,
      yAmp: index % 2 ? 0.18 : 0.28,
      ...colors[index % colors.length],
    }),
  );
  planets.forEach((planet) => {
    galaxyGroup.add(planet.trail);
    galaxyGroup.add(planet.group);
  });
  const hitTargets = planets.flatMap((planet) => [planet.hitArea, planet.mesh]);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(99, 99);
  const projected = new THREE.Vector3();
  let width = 1;
  let height = 1;
  let hoveredCard = null;
  let focusedCard = abilityCards.find((card) => card.classList.contains("is-active")) || abilityCards[0];

  function resize() {
    const rect = abilityCanvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function focusCard(card) {
    focusedCard = card || focusedCard;
  }

  function updateMouse(event) {
    const rect = abilityCanvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    mouse.y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
  }

  function clearHover() {
    hoveredCard = null;
    abilityCanvas.style.cursor = "";
  }

  abilityCanvas.addEventListener("pointermove", (event) => {
    updateMouse(event);
  });
  abilityCanvas.addEventListener("pointerleave", () => {
    mouse.set(99, 99);
    clearHover();
  });
  abilityCanvas.addEventListener("click", () => {
    if (hoveredCard) {
      activateAbilityCard(hoveredCard);
    }
  });

  abilityStage.classList.add("is-webgl-ready");
  resize();

  function render(time) {
    if (state.width < 760) return;

    const sectionRect = abilityStage.getBoundingClientRect();
    const visible = sectionRect.top < state.height * 1.05 && sectionRect.bottom > -state.height * 0.2;
    if (!visible) return;

    const stageRect = abilityStage.getBoundingClientRect();
    const canvasRect = abilityCanvas.getBoundingClientRect();
    const activeCard = focusedCard || abilityCards[0];
    const activeIndex = abilityCards.indexOf(activeCard);

    galaxyGroup.rotation.y = state.pointer.x * 0.12;
    galaxyGroup.rotation.x = -0.12 + state.pointer.y * -0.08;
    camera.position.x = state.pointer.x * 0.22;
    camera.position.y = 0.48 + state.pointer.y * -0.12;
    camera.lookAt(lookAt);

    centerGroup.rotation.y = time * 0.18;
    spiralDust.rotation.y = -time * 0.018;
    spiralDust.rotation.z = time * 0.014;
    spiralDust.material.opacity = 0.22 + Math.sin(time * 0.9) * 0.025;
    dustField.rotation.y = time * 0.012;
    dustField.rotation.z = Math.sin(time * 0.18) * 0.018;
    core.rotation.x = time * 0.06;
    coreWire.rotation.y = -time * 0.12;
    coreHalo.rotation.y = time * 0.22;
    coreHalo.rotation.z = Math.sin(time * 0.4) * 0.08;
    coreHalo.material.opacity = 0.27 + Math.sin(time * 1.7) * 0.05;
    coreRingOne.rotation.z = time * 0.16;
    coreRingTwo.rotation.z = -time * 0.11;
    coreGlow.material.opacity = 0.16 + Math.sin(time * 1.9) * 0.025;
    coreCorona.material.opacity = 0.08 + Math.sin(time * 1.3) * 0.018;
    coreLabel.position.y = 0.02 + Math.sin(time * 1.1) * 0.012;
    orbitGroup.rotation.y = time * 0.025;
    orbitGroup.rotation.z = -0.1 + Math.sin(time * 0.22) * 0.035;

    const activePlanet = planets[activeIndex >= 0 ? activeIndex : 0];
    if (activePlanet) {
      const activeRadius = activePlanet.radius + activePlanet.focus * 0.12;
      activeOrbitLine.scale.set(activeRadius, 1, activeRadius);
      activeOrbitDust.scale.set(activeRadius, 1, activeRadius);
      activeOrbitLine.material.opacity = lerp(activeOrbitLine.material.opacity, 0.24 + activePlanet.focus * 0.08, 0.08);
      activeOrbitDust.material.opacity = lerp(activeOrbitDust.material.opacity, 0.12 + activePlanet.focus * 0.06, 0.08);
    }

    planets.forEach((planet) => {
      const angle = planet.phase + time * planet.speed;
      const isActive = activeCard === planet.card;
      const isHovered = hoveredCard === planet.card;
      const focusTarget = isActive ? 1 : isHovered ? 0.58 : 0;
      planet.focus = lerp(planet.focus, focusTarget, focusTarget > planet.focus ? 0.18 : 0.14);
      planet.hover = lerp(planet.hover, isHovered ? 1 : 0, isHovered ? 0.32 : 0.18);
      const pulse = Math.sin(time * 2.8 + planet.index) * 0.5 + 0.5;
      const radius = planet.radius + planet.focus * 0.2;
      planet.group.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.3 + planet.index) * planet.yAmp,
        Math.sin(angle) * radius * 0.58 + planet.focus * 0.18,
      );
      updateSkillTrail(planet, angle, radius, time);
      planet.mesh.rotation.y = time * (0.38 + planet.index * 0.05);
      planet.mesh.rotation.x = Math.sin(time * 0.5 + planet.index) * 0.18;
      planet.mesh.material.emissiveIntensity = 0.2 + planet.focus * 0.72 + planet.hover * 0.18 + pulse * planet.focus * 0.06;
      planet.wire.rotation.y = -time * (0.18 + planet.index * 0.02);
      planet.wire.material.opacity = 0.1 + planet.focus * 0.24 + planet.hover * 0.08;
      planet.atmosphere.scale.setScalar(1.02 + planet.focus * 0.22 + planet.hover * 0.08 + Math.sin(time * 1.5 + planet.index) * 0.035);
      planet.atmosphere.material.opacity = 0.048 + planet.focus * 0.16 + planet.hover * 0.04;
      planet.ring.rotation.z += 0.006 + planet.focus * 0.012 + planet.hover * 0.006;
      planet.ring.material.opacity = 0.22 + planet.focus * 0.34 + planet.hover * 0.1;
      planet.equator.rotation.z = -time * (0.18 + planet.index * 0.02);
      planet.equator.material.opacity = 0.12 + planet.focus * 0.22 + planet.hover * 0.08;
      planet.satelliteGroup.rotation.y = time * (1.1 + planet.index * 0.16);
      planet.satelliteGroup.rotation.z = time * (0.36 + planet.index * 0.04);
      const scale = 1 + planet.focus * 0.32 + planet.hover * 0.08 + Math.sin(time * 1.2 + planet.index) * 0.025;
      planet.group.scale.setScalar(scale);
      planet.glow.material.opacity = 0.09 + planet.focus * 0.2 + planet.hover * 0.08;
      planet.glow.scale.setScalar(planet.size * (4.4 + planet.focus * 2.4 + planet.hover * 0.8 + pulse * planet.focus * 0.4));
      planet.focusBeacon.material.opacity = planet.focus * (0.16 + pulse * 0.06) + planet.hover * 0.05;
      planet.focusBeacon.scale.setScalar(planet.size * (6.8 + planet.focus * 3.4 + planet.hover * 1.2));
    });

    galaxyGroup.updateMatrixWorld(true);
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(hitTargets, false)[0];
    hoveredCard = hit?.object?.userData?.card || null;
    abilityCanvas.style.cursor = hoveredCard ? "pointer" : "";
    if (hoveredCard && hoveredCard !== activeCard) {
      activateAbilityCard(hoveredCard);
    }

    planets.forEach((planet) => {
      projected.setFromMatrixPosition(planet.group.matrixWorld);
      projected.project(camera);
      const x = (projected.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left - stageRect.left;
      const y = (-projected.y * 0.5 + 0.5) * canvasRect.height + canvasRect.top - stageRect.top - 38;
      const depth = clamp(0.72 + planet.group.position.z * 0.08 + planet.focus * 0.16, 0.56, 1.12);
      const isActive = activeCard === planet.card;
      const labelOpacity = isActive ? 0.68 + depth * 0.24 + planet.focus * 0.18 : 0.02 + depth * 0.045;
      const card = planet.card;
      card.style.setProperty("--skill-x", `${clamp(x, 176, stageRect.width - 82).toFixed(1)}px`);
      card.style.setProperty("--skill-y", `${clamp(y, 58, stageRect.height - 58).toFixed(1)}px`);
      card.style.setProperty("--skill-depth", depth.toFixed(3));
      card.style.setProperty("--skill-wake", (isActive ? planet.focus : planet.hover * 0.42).toFixed(3));
      card.style.setProperty("--skill-opacity", clamp(labelOpacity, 0.08, 1).toFixed(3));
    });

    renderer.render(scene, camera);
  }

  return { resize, render, focusCard };
}

const abilityScene = initAbilityGalaxy();
const projectBlackholeFlow = initProjectBlackholeFlow();

function initProjectBlackholeFlow() {
  if (!projectBlackholeCanvas) return null;

  const context = projectBlackholeCanvas.getContext("2d", { alpha: true });
  if (!context) return null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const random = seededRandom(513449);
  const bands = Array.from({ length: 92 }, (_, index) => ({
    angle: random() * Math.PI * 2,
    radius: 0.5 + random() * 0.55,
    speed: (0.22 + random() * 0.38) * (index % 3 === 0 ? -1 : 1),
    length: 0.14 + random() * 0.28,
    width: 0.8 + random() * 2.4,
    alpha: 0.08 + random() * 0.16,
    warm: 185 + random() * 55,
    blur: 3 + random() * 11,
  }));
  const dust = Array.from({ length: 110 }, () => ({
    x: random(),
    y: random(),
    speed: 0.018 + random() * 0.05,
    drift: 0.8 + random() * 2.8,
    size: 0.5 + random() * 1.7,
    alpha: 0.05 + random() * 0.15,
  }));

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    const rect = projectBlackholeCanvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    projectBlackholeCanvas.width = Math.round(width * dpr);
    projectBlackholeCanvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function clear() {
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
  }

  function drawDust(time, exposure) {
    context.save();
    context.globalCompositeOperation = "lighter";
    context.lineCap = "round";
    dust.forEach((particle) => {
      const x = ((particle.x + time * particle.speed) % 1) * width;
      const y = particle.y * height + Math.sin(time * particle.drift + particle.x * 8) * 11;
      const alpha = particle.alpha * exposure;
      context.strokeStyle = `rgba(210, 238, 255, ${alpha})`;
      context.lineWidth = particle.size;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x - 12 - particle.size * 7, y + 2 + particle.size * 2);
      context.stroke();
    });
    context.restore();
  }

  function drawDisk(time, exposure) {
    const centerX = width * 0.5;
    const centerY = height * 0.56;
    const diskRadius = Math.min(width * 0.34, height * 0.86);
    const pulse = 0.5 + Math.sin(time * 1.08) * 0.5;

    context.save();
    context.globalCompositeOperation = "lighter";
    context.translate(centerX, centerY);
    context.rotate(-0.026 + Math.sin(time * 0.18) * 0.006);
    context.scale(1, 0.36);
    bands.forEach((band) => {
      const angle = band.angle + time * band.speed;
      const middle = angle + band.length * 0.5;
      const front = Math.sin(middle) > 0 ? 1 : 0.48;
      const radius = diskRadius * band.radius;
      const alpha = band.alpha * front * exposure * (0.84 + pulse * 0.22);
      context.shadowBlur = band.blur;
      context.shadowColor = `rgba(255, ${band.warm}, 130, ${alpha * 1.2})`;
      context.strokeStyle = `rgba(255, ${band.warm}, 128, ${alpha})`;
      context.lineWidth = band.width;
      context.beginPath();
      context.arc(0, 0, radius, angle, angle + band.length);
      context.stroke();
    });
    context.restore();

    context.save();
    context.globalCompositeOperation = "lighter";
    const halo = context.createRadialGradient(centerX, centerY, diskRadius * 0.22, centerX, centerY, diskRadius * 0.78);
    halo.addColorStop(0, `rgba(255, 247, 220, ${0.05 * exposure})`);
    halo.addColorStop(0.38, `rgba(255, 209, 145, ${0.16 * exposure})`);
    halo.addColorStop(0.72, `rgba(155, 223, 255, ${0.045 * exposure})`);
    halo.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  function render(time) {
    if (reducedMotion.matches) {
      clear();
      return;
    }

    const sectionRect = projectSection?.getBoundingClientRect();
    const visible = sectionRect
      ? Math.min(sectionRect.bottom, state.height) - Math.max(sectionRect.top, 0)
      : state.height;
    const exposure = clamp(visible / Math.max(1, Math.min(state.height, sectionRect?.height || state.height)), 0, 1);
    if (exposure <= 0.01) return;

    clear();
    drawDisk(time, exposure);
    drawDust(time, exposure * 0.86);
  }

  resize();
  return { resize, render };
}

function updateAboutTargets() {
  if (!aboutSection || !aboutTabs.length) {
    state.aboutVisible = false;
    return;
  }

  const sectionRect = aboutSection.getBoundingClientRect();
  state.aboutVisible = sectionRect.top < state.height * 0.78 && sectionRect.bottom > state.height * 0.18;

  aboutTabs.forEach((node) => {
    const rect = node.getBoundingClientRect();
    const labelRect = node.querySelector("strong")?.getBoundingClientRect() || rect;
    const labelX = labelRect.left + labelRect.width * 0.5;
    const labelY = labelRect.top + labelRect.height * 0.5;
    const side = labelX < state.width * 0.5 ? 1 : -1;
    const dockGap = Math.min(state.width < 760 ? 58 : 76, state.width * 0.12);
    state.aboutTargets[node.dataset.about] = {
      x: labelX,
      y: labelY,
      dockX: side > 0 ? labelRect.right + dockGap : labelRect.left - dockGap,
      dockY: labelY - Math.min(18, state.height * 0.025),
      size: clamp(labelRect.width * 0.72, state.width < 760 ? 92 : 110, state.width < 760 ? 156 : 190),
      type: "about",
    };
  });
}

function updateRobotPath() {
  const scrollUnit = state.scroll / Math.max(state.height, 1);
  const mobile = state.width < 760;
  const path = mobile
    ? [
        { p: 0, x: 0.73, y: 0.48, scale: 0.86, tilt: 4 },
        { p: 0.42, x: 0.78, y: 0.34, scale: 0.76, tilt: -4 },
        { p: 0.92, x: 0.88, y: 0.18, scale: 0.64, tilt: -7 },
        { p: 1.15, x: 0.88, y: 0.16, scale: 0.64, tilt: -6 },
        { p: 2.1, x: 0.2, y: 0.24, scale: 0.7, tilt: 5 },
        { p: 3.1, x: 0.82, y: 0.36, scale: 0.74, tilt: -4 },
        { p: 4.1, x: 0.82, y: 0.2, scale: 0.68, tilt: 3 },
      ]
    : [
        { p: 0, x: 0.65, y: 0.5, scale: 1, tilt: 3 },
        { p: 0.38, x: 0.78, y: 0.36, scale: 0.88, tilt: -3 },
        { p: 0.82, x: 0.84, y: 0.48, scale: 0.78, tilt: -8 },
        { p: 1.15, x: 0.86, y: 0.28, scale: 0.78, tilt: -5 },
        { p: 2.1, x: 0.89, y: 0.22, scale: 0.7, tilt: -6 },
        { p: 3.1, x: 0.87, y: 0.27, scale: 0.7, tilt: -5 },
        { p: 4.15, x: 0.91, y: 0.15, scale: 0.58, tilt: 3 },
      ];

  let start = path[0];
  let end = path[path.length - 1];
  for (let index = 0; index < path.length - 1; index += 1) {
    if (scrollUnit >= path[index].p && scrollUnit <= path[index + 1].p) {
      start = path[index];
      end = path[index + 1];
      break;
    }
  }

  const amount = start === end ? 1 : clamp((scrollUnit - start.p) / (end.p - start.p));
  state.robot.x = lerp(start.x, end.x, amount) * state.width;
  state.robot.y = lerp(start.y, end.y, amount) * state.height;
  state.robot.scale = lerp(start.scale, end.scale, amount);
  state.robot.tilt = lerp(start.tilt, end.tilt, amount);

  if (!state.robotVisual.ready) {
    state.robotVisual.x = state.robot.x;
    state.robotVisual.y = state.robot.y;
    state.robotVisual.scale = state.robot.scale;
    state.robotVisual.tilt = state.robot.tilt;
    state.robotVisual.ready = true;
  }
}

function syncRobotVisual() {
  state.robotVisual.x = state.robot.x;
  state.robotVisual.y = state.robot.y;
  state.robotVisual.scale = state.robot.scale;
  state.robotVisual.tilt = state.robot.tilt;
  state.robotVisual.ready = true;
}

function getRobotTarget(id = state.aboutVisible && state.activeAbout ? state.activeAbout : state.hoveredPlanet) {
  const focusTarget = id
    ? state.aboutVisible && state.aboutTargets[id]
      ? state.aboutTargets[id]
      : state.planetTargets[id] || state.aboutTargets[id]
    : null;
  if (!focusTarget) {
    if (state.aboutVisible) {
      const sectionRect = aboutSection?.getBoundingClientRect();
      const idleY = sectionRect
        ? clamp(sectionRect.top + state.height * 0.2, state.height * 0.16, state.height * 0.26)
        : state.height * 0.2;
      return {
        x: state.width < 760 ? state.width * 0.78 : state.width * 0.9,
        y: idleY,
        scale: state.robot.scale * 0.9,
        tilt: state.robot.tilt - 4,
        beam: null,
      };
    }

    return {
      x: state.robot.x,
      y: state.robot.y,
      scale: state.robot.scale,
      tilt: state.robot.tilt,
      beam: null,
    };
  }

  const side = focusTarget.x < state.width * 0.5 ? 1 : -1;
  const isAboutTarget = focusTarget.type === "about";
  return {
    x: isAboutTarget
      ? focusTarget.dockX
      : focusTarget.x + side * Math.min(92, state.width * 0.13),
    y: isAboutTarget ? focusTarget.dockY : focusTarget.y - Math.min(50, state.height * 0.065),
    scale: state.robot.scale * (isAboutTarget ? 0.92 : 1.05),
    tilt: state.robot.tilt + side * (isAboutTarget ? -6 : -9),
    beam: focusTarget,
  };
}

function startRobotFlight(id) {
  const now = performance.now();
  state.robotFlight.active = true;
  state.robotFlight.id = id;
  state.robotFlight.start = now;
  state.robotFlight.duration = id ? 820 : 620;
  state.robotFlight.from = {
    x: state.robotVisual.x,
    y: state.robotVisual.y,
    scale: state.robotVisual.scale,
    tilt: state.robotVisual.tilt,
  };
}

function setPlanetFocus(id) {
  if (state.hoveredPlanet !== id) {
    startRobotFlight(id);
  }
  state.hoveredPlanet = id;
  root.style.setProperty("--cursor-lock", id ? "1" : "0");
  planetButtons.forEach((item) => {
    const focused = item.dataset.planet === id;
    item.classList.toggle("is-focused", focused);
    item.classList.toggle("is-dimmed", Boolean(id) && !focused);
  });
}

function updatePlanetFocusFromPointer(x, y) {
  if (!planetButtons.length || state.scroll > state.height * 0.92) {
    if (state.hoveredPlanet) {
      setPlanetFocus(null);
    }
    return;
  }

  let closestPlanet = null;
  let closestDistance = Number.POSITIVE_INFINITY;
  const expandX = state.width < 760 ? 28 : 78;
  const expandY = state.width < 760 ? 18 : 38;

  planetButtons.forEach((button) => {
    const opacity = Number(button.style.opacity || window.getComputedStyle(button).opacity || 0);
    if (opacity <= 0.1) return;

    const rect = button.getBoundingClientRect();
    const inside =
      x >= rect.left - expandX &&
      x <= rect.right + expandX &&
      y >= rect.top - expandY &&
      y <= rect.bottom + expandY;
    if (!inside) return;

    const centerX = rect.left + rect.width * 0.5;
    const centerY = rect.top + rect.height * 0.5;
    const distance = Math.hypot(x - centerX, y - centerY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestPlanet = button.dataset.planet;
    }
  });

  setPlanetFocus(closestPlanet);
}

function updateScroll() {
  state.scroll = Math.max(window.scrollY, 0);
  const scrollUnit = state.scroll / Math.max(state.height, 1);
  const mobile = state.width < 760;
  const heroProgress = clamp(scrollUnit / 1.08);
  const exitProgress = easeInOutCubic(clamp((scrollUnit - 0.1) / 0.86));
  const signatureIn = clamp((scrollUnit - 0.2) / 0.36);
  const signatureOut = clamp((scrollUnit - 0.96) / 0.28);
  const signatureOpacity = clamp(Math.min(signatureIn, 1 - signatureOut));
  const signatureDraw = clamp((scrollUnit - 0.24) / 0.46);
  const signatureFlourish = clamp((signatureDraw - 0.76) / 0.24);
  const signatureFill = clamp((signatureDraw - 0.74) / 0.26) * signatureOpacity * 0.24;
  const signatureTravel = easeInOutCubic(clamp(scrollUnit, 0, 1.08) / 1.08);
  const signatureY = mobile ? 68 - signatureTravel * 38 : 78 - signatureTravel * 42;
  const signatureScale = mobile ? 0.62 + signatureTravel * 0.22 : 0.78 + signatureTravel * 0.28;
  const signatureGlow = signatureOpacity * clamp((signatureDraw - 0.28) / 0.72);
  const planetOpacity = clamp(1 - Math.max(scrollUnit - 0.88, 0) / 0.34);

  root.style.setProperty("--scroll", state.scroll.toFixed(1));
  root.style.setProperty("--hero-progress", heroProgress.toFixed(3));
  root.style.setProperty("--space-warp", exitProgress.toFixed(3));
  root.style.setProperty("--hero-dim", clamp((scrollUnit - 0.2) / 0.72).toFixed(3));
  root.style.setProperty("--signature-opacity", signatureOpacity.toFixed(3));
  root.style.setProperty("--signature-y", `${signatureY.toFixed(2)}vh`);
  root.style.setProperty("--signature-scale", signatureScale.toFixed(3));
  root.style.setProperty("--signature-mask-offset", (1 - signatureDraw).toFixed(4));
  root.style.setProperty("--signature-flourish-offset", (1 - signatureFlourish).toFixed(4));
  root.style.setProperty("--signature-flourish-opacity", (signatureFlourish * signatureOpacity).toFixed(3));
  root.style.setProperty("--signature-fill", signatureFill.toFixed(3));
  root.style.setProperty("--signature-glow", signatureGlow.toFixed(3));
  root.style.setProperty("--planet-opacity", planetOpacity.toFixed(3));
  root.style.setProperty("--foreground-opacity", clamp(1 - Math.max(scrollUnit - 0.92, 0) / 0.28).toFixed(3));
  if (scrollUnit > 0.92) {
    root.style.setProperty("--cursor-opacity", "0");
  }
  updateThinkingTransition();
  updateAboutTargets();
  updateRobotPath();
}

function updateRobotFrame(time, timeMs) {
  const bob = Math.sin(time * 2.1) * 6 + Math.sin(time * 4.6) * 1.4;
  const driftX = state.pointer.x * 18;
  const driftY = state.pointer.y * 12;
  const idleTilt = Math.sin(time * 1.32) * 1.3;
  const target = getRobotTarget();
  const previousX = state.robotVisual.x;
  const previousY = state.robotVisual.y;

  if (state.robotFlight.active) {
    const raw = clamp((timeMs - state.robotFlight.start) / state.robotFlight.duration);
    const eased = easeInOutCubic(raw);
    const from = state.robotFlight.from || state.robotVisual;
    const arc = Math.sin(Math.PI * eased) * Math.min(76, state.height * 0.095);
    state.robotVisual.x = lerp(from.x, target.x, eased);
    state.robotVisual.y = lerp(from.y, target.y, eased) - arc;
    state.robotVisual.scale = lerp(from.scale, target.scale, eased);
    state.robotVisual.tilt = lerp(from.tilt, target.tilt, eased);
    if (raw >= 1) {
      state.robotFlight.active = false;
    }
  } else {
    const follow = state.hoveredPlanet || (state.aboutVisible && state.activeAbout) ? 0.12 : 0.08;
    state.robotVisual.x = lerp(state.robotVisual.x, target.x, follow);
    state.robotVisual.y = lerp(state.robotVisual.y, target.y, follow);
    state.robotVisual.scale = lerp(state.robotVisual.scale, target.scale, follow);
    state.robotVisual.tilt = lerp(state.robotVisual.tilt, target.tilt, follow);
  }

  const x = state.robotVisual.x + driftX;
  const y = state.robotVisual.y + driftY + bob;
  const deltaX = state.robotVisual.x - previousX;
  const deltaY = state.robotVisual.y - previousY;
  const motion = Math.min(1, Math.hypot(deltaX, deltaY) / 42);
  const trailAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 180;

  root.style.setProperty("--robot-x", `${x.toFixed(1)}px`);
  root.style.setProperty("--robot-y", `${y.toFixed(1)}px`);
  root.style.setProperty("--robot-scale", state.robotVisual.scale.toFixed(3));
  root.style.setProperty("--robot-tilt", `${(state.robotVisual.tilt + state.pointer.x * 3 + idleTilt).toFixed(2)}deg`);
  root.style.setProperty("--robot-flight", state.robotFlight.active ? "1" : "0");
  root.style.setProperty("--trail-x", `${x.toFixed(1)}px`);
  root.style.setProperty("--trail-y", `${y.toFixed(1)}px`);
  root.style.setProperty("--trail-angle", `${trailAngle.toFixed(2)}deg`);
  root.style.setProperty("--trail-opacity", (state.robotFlight.active ? 0.78 : motion * 0.34).toFixed(3));
  robotElement?.classList.toggle("is-flying", state.robotFlight.active);

  if (target.beam && !state.robotFlight.active) {
    const isAboutBeam = target.beam.type === "about";
    const beamStartX = x + (target.beam.x > x ? 32 : -32);
    const beamStartY = y - 2;
    const beamX = target.beam.x - beamStartX;
    const beamY = target.beam.y - beamStartY;
    root.style.setProperty("--beam-x", `${beamStartX.toFixed(1)}px`);
    root.style.setProperty("--beam-y", `${beamStartY.toFixed(1)}px`);
    root.style.setProperty("--beam-length", `${Math.max(0, Math.hypot(beamX, beamY) - 10).toFixed(1)}px`);
    root.style.setProperty("--beam-angle", `${(Math.atan2(beamY, beamX) * (180 / Math.PI)).toFixed(2)}deg`);
    root.style.setProperty("--beam-opacity", isAboutBeam ? "0.26" : "0.76");
    root.style.setProperty("--beam-dot-opacity", isAboutBeam ? "0" : "1");
    root.style.setProperty("--scan-core-opacity", isAboutBeam ? "0" : "1");
    root.style.setProperty("--scan-x", `${target.beam.x.toFixed(1)}px`);
    root.style.setProperty("--scan-y", `${target.beam.y.toFixed(1)}px`);
    root.style.setProperty("--scan-size", `${(target.beam.size || (state.hoveredPlanet === "ai" ? 148 : 126)).toFixed(1)}px`);
    root.style.setProperty("--scan-opacity", robotScan ? (isAboutBeam ? "0.34" : "0.72") : "0");
  } else {
    root.style.setProperty("--beam-opacity", state.robotFlight.active && target.beam ? "0.18" : "0");
    root.style.setProperty("--beam-dot-opacity", "0");
    root.style.setProperty("--scan-core-opacity", "0");
    root.style.setProperty("--scan-opacity", "0");
  }
}

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  resizePortraitParticles();
  spaceScene?.resize();
  abilityScene?.resize();
  projectBlackholeFlow?.resize();
  updateProjectArchiveFocus();
  updateThinkingTransition();
  updateScroll();
}

function tick(timeMs) {
  const time = timeMs * 0.001;
  state.pointer.x += (state.targetPointer.x - state.pointer.x) * 0.08;
  state.pointer.y += (state.targetPointer.y - state.pointer.y) * 0.08;
  root.style.setProperty("--mouse-x", state.pointer.x.toFixed(3));
  root.style.setProperty("--mouse-y", state.pointer.y.toFixed(3));
  updateRobotFrame(time, timeMs);
  spaceScene?.render(time);
  abilityScene?.render(time);
  projectBlackholeFlow?.render(time);
  drawPortraitParticles(time);
  window.requestAnimationFrame(tick);
}

window.addEventListener("resize", resize);
window.addEventListener("scroll", updateScroll, { passive: true });

function scrollToSectionTarget(targetId, behavior = "smooth") {
  const section = document.getElementById(targetId);
  if (!section) return;

  section.scrollIntoView({ behavior, block: "start", inline: "nearest" });
}

function syncHashScroll(behavior = "auto") {
  const targetId = decodeURIComponent(window.location.hash.replace("#", ""));
  if (!targetId) return;

  requestAnimationFrame(() => {
    scrollToSectionTarget(targetId, behavior);
  });
}

window.addEventListener("load", () => {
  updateScroll();
  if (window.location.hash) {
    syncHashScroll("auto");
    syncRobotVisual();
  }
});
window.addEventListener("hashchange", () => syncHashScroll("smooth"));
window.addEventListener("pointermove", (event) => {
  state.cursor.x = event.clientX;
  state.cursor.y = event.clientY;
  state.cursor.active = true;
  state.targetPointer.x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
  state.targetPointer.y = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
  root.style.setProperty("--cursor-x", `${event.clientX.toFixed(1)}px`);
  root.style.setProperty("--cursor-y", `${event.clientY.toFixed(1)}px`);
  root.style.setProperty("--cursor-opacity", state.scroll < state.height * 0.92 ? "1" : "0");
  updatePlanetFocusFromPointer(event.clientX, event.clientY);
});
window.addEventListener("pointerleave", () => {
  state.targetPointer.x = 0;
  state.targetPointer.y = 0;
  state.cursor.active = false;
  root.style.setProperty("--cursor-opacity", "0");
  setPlanetFocus(null);
});

heroImage?.addEventListener("load", () => {
  state.portrait.needsBuild = true;
});

planetButtons.forEach((button) => {
  button.addEventListener("pointerenter", () => setPlanetFocus(button.dataset.planet));
  button.addEventListener("focus", () => setPlanetFocus(button.dataset.planet));
  button.addEventListener("blur", () => setPlanetFocus(null));
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    if (!targetId) return;

    const targetUrl = new URL(window.location.href);
    targetUrl.hash = targetId;
    window.history.replaceState(null, "", targetUrl);
    scrollToSectionTarget(targetId);
  });
});

function setAboutAmbientFocus(tab) {
  if (!aboutSection || !tab) return;

  const sectionRect = aboutSection.getBoundingClientRect();
  const fieldRect = tab.closest(".about-keyword-field")?.getBoundingClientRect() || sectionRect;
  const labelRect = tab.querySelector("strong")?.getBoundingClientRect() || tab.getBoundingClientRect();
  const x = ((labelRect.left + labelRect.width * 0.5 - sectionRect.left) / Math.max(sectionRect.width, 1)) * 100;
  const y = ((labelRect.top + labelRect.height * 0.5 - sectionRect.top) / Math.max(sectionRect.height, 1)) * 100;
  const noteWidth = state.width < 760 ? Math.min(state.width - 28, 372) : Math.min(680, state.width * 0.46);
  const noteMargin = state.width < 760 ? 14 : 24;
  const isLeftColumn = labelRect.left + labelRect.width * 0.5 < state.width * 0.5;
  const rawNoteLeft = isLeftColumn ? labelRect.left - fieldRect.left : labelRect.right - fieldRect.left;
  const noteLeft = isLeftColumn
    ? clamp(rawNoteLeft, noteMargin, Math.max(noteMargin, fieldRect.width - noteWidth - noteMargin))
    : clamp(rawNoteLeft, noteWidth + noteMargin, Math.max(noteWidth + noteMargin, fieldRect.width - noteMargin));
  const noteTop = labelRect.bottom - fieldRect.top + (state.width < 760 ? 8 : 10);

  aboutSection.style.setProperty("--about-focus-x", `${clamp(x, 8, 92).toFixed(1)}%`);
  aboutSection.style.setProperty("--about-focus-y", `${clamp(y, 14, 82).toFixed(1)}%`);
  aboutSection.style.setProperty("--about-note-left", `${noteLeft.toFixed(1)}px`);
  aboutSection.style.setProperty("--about-note-top", `${noteTop.toFixed(1)}px`);
  aboutSection.style.setProperty("--about-note-x", isLeftColumn ? "0" : "-100%");
  aboutSection.dataset.noteSide = isLeftColumn ? "left" : "right";
  aboutSection.classList.add("has-about-focus");
}

function activateAboutKeyword(tab) {
  const content = aboutContent[tab.dataset.about];
  if (!content) return;
  state.hoveredPlanet = null;
  root.style.setProperty("--cursor-lock", "0");
  planetButtons.forEach((item) => {
    item.classList.remove("is-focused", "is-dimmed");
  });
  state.activeAbout = tab.dataset.about;
  aboutTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
  });
  aboutKicker.textContent = content.kicker;
  aboutTitle.textContent = content.title;
  aboutBody.textContent = localizedContent(content, "body");
  if (aboutSignal && content.signal) {
    aboutSignal.textContent = content.signal;
  }
  aboutConsole?.classList.add("has-active");
  aboutConsole?.classList.remove("is-scanning");
  window.clearTimeout(aboutScanTimer);
  updateAboutTargets();
  setAboutAmbientFocus(tab);
  startRobotFlight(tab.dataset.about);
  aboutScanTimer = window.setTimeout(() => aboutConsole?.classList.add("is-scanning"), 260);
}

function clearAboutKeyword() {
  if (!window.matchMedia("(hover: hover)").matches) return;
  state.activeAbout = null;
  aboutTabs.forEach((item) => {
    item.classList.remove("is-active");
    item.setAttribute("aria-selected", "false");
  });
  aboutConsole?.classList.remove("has-active", "is-scanning");
  aboutSection?.classList.remove("has-about-focus");
  if (aboutSection) {
    delete aboutSection.dataset.noteSide;
  }
  window.clearTimeout(aboutScanTimer);
  startRobotFlight(null);
}

aboutTabs.forEach((tab) => {
  tab.addEventListener("pointerenter", () => activateAboutKeyword(tab));
  tab.addEventListener("focus", () => activateAboutKeyword(tab));
  tab.addEventListener("pointerleave", clearAboutKeyword);
  tab.addEventListener("blur", clearAboutKeyword);
  tab.addEventListener("click", () => activateAboutKeyword(tab));
});

function activateAbilityCard(card) {
  if (!card) return;
  abilityCards.forEach((item) => item.classList.toggle("is-active", item === card));
  abilityScene?.focusCard(card);
  if (abilityTitle && localizedDataset(card, "title")) {
    abilityTitle.textContent = localizedDataset(card, "title");
  }
  if (abilityBody && localizedDataset(card, "body")) {
    abilityBody.textContent = localizedDataset(card, "body");
  }
}

abilityCards.forEach((card) => {
  card.addEventListener("pointerenter", () => activateAbilityCard(card));
  card.addEventListener("focus", () => activateAbilityCard(card));
  card.addEventListener("click", () => activateAbilityCard(card));
});

function updateProjectArchiveFocus(card = projectCards.find((item) => item.classList.contains("is-active")) || projectCards[0]) {
  if (!projectSection || !card) return;
  const sectionRect = projectSection.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const x = ((cardRect.left + cardRect.width * 0.5 - sectionRect.left) / Math.max(sectionRect.width, 1)) * 100;
  const y = ((cardRect.top + cardRect.height * 0.5 - sectionRect.top) / Math.max(sectionRect.height, 1)) * 100;
  projectSection.style.setProperty("--project-focus-x", `${clamp(x, 8, 92).toFixed(1)}%`);
  projectSection.style.setProperty("--project-focus-y", `${clamp(y, 12, 88).toFixed(1)}%`);
}

function updateThinkingTransition() {
  if (!projectSection) return;

  const rect = projectSection.getBoundingClientRect();
  const viewport = Math.max(state.height, 1);
  const handoff = easeInOutCubic(clamp((viewport * 1.52 - rect.top) / (viewport * 0.68)));
  const handoffFade = easeInOutCubic(clamp((viewport * 1.18 - rect.top) / (viewport * 0.46)));
  const enter = easeInOutCubic(clamp((viewport * 1.36 - rect.top) / (viewport * 0.92)));
  const exit = easeInOutCubic(clamp((viewport * 0.12 - rect.top) / (viewport * 0.58)));
  const presence = clamp(enter * (1 - exit));
  const edge = clamp(1 - presence);
  const depth = clamp((enter - exit + 1) * 0.5);
  const contentY = (1 - enter) * 58 - exit * 38;
  const contentScale = 0.985 + presence * 0.015;
  const bgScale = 1.095 - presence * 0.055;

  root.style.setProperty("--projects-thinking-handoff", handoff.toFixed(3));
  projectSection.style.setProperty("--thinking-enter", enter.toFixed(3));
  projectSection.style.setProperty("--thinking-exit", exit.toFixed(3));
  projectSection.style.setProperty("--thinking-presence", presence.toFixed(3));
  projectSection.style.setProperty("--thinking-edge", edge.toFixed(3));
  projectSection.style.setProperty("--thinking-depth", depth.toFixed(3));
  projectSection.style.setProperty("--thinking-content-y", `${contentY.toFixed(1)}px`);
  projectSection.style.setProperty("--thinking-content-scale", contentScale.toFixed(3));
  projectSection.style.setProperty("--thinking-bg-scale", bgScale.toFixed(3));
  if (abilitySection) {
    abilitySection.style.setProperty("--projects-thinking-handoff", handoff.toFixed(3));
    abilitySection.style.setProperty("--projects-thinking-fade", handoffFade.toFixed(3));
  }
}

function activateProjectModule(card) {
  if (!card) return;
  projectCards.forEach((item) => {
    const isActive = item === card;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-current", isActive ? "true" : "false");
  });
  if (projectStatusIndex && localizedDataset(card, "index")) {
    projectStatusIndex.textContent = localizedDataset(card, "index");
  }
  if (projectStatusTitle && localizedDataset(card, "title")) {
    projectStatusTitle.textContent = localizedDataset(card, "title");
  }
  if (projectStatusBody && localizedDataset(card, "body")) {
    projectStatusBody.textContent = localizedDataset(card, "body");
  }
  if (projectStatusState && localizedDataset(card, "state")) {
    projectStatusState.textContent = localizedDataset(card, "state");
  }
  updateProjectArchiveFocus(card);
}

function openProjectLink(card) {
  const url = card?.dataset.url;
  if (!url) return;
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (opened) {
    opened.opener = null;
  }
}

projectCards.forEach((card) => {
  if (card.dataset.url) {
    card.classList.add("has-link");
    card.setAttribute("aria-label", `${localizedDataset(card, "title") || "Project"} link`);
  }
  card.addEventListener("pointerenter", () => activateProjectModule(card));
  card.addEventListener("focus", () => activateProjectModule(card));
  card.addEventListener("click", () => {
    activateProjectModule(card);
    openProjectLink(card);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateProjectModule(card);
    openProjectLink(card);
  });
});

activateProjectModule(projectCards[0]);

let workflowPulseTimer = 0;

function updateWorkflowFocus(step = workflowSteps.find((item) => item.classList.contains("is-active")) || workflowSteps[0]) {
  if (!workflowSection || !step) return;
  const sectionRect = workflowSection.getBoundingClientRect();
  const stepRect = step.getBoundingClientRect();
  const x = ((stepRect.left + stepRect.width * 0.5 - sectionRect.left) / Math.max(sectionRect.width, 1)) * 100;
  const y = ((stepRect.top + stepRect.height * 0.5 - sectionRect.top) / Math.max(sectionRect.height, 1)) * 100;
  workflowSection.style.setProperty("--workflow-focus-x", `${clamp(x, 8, 92).toFixed(1)}%`);
  workflowSection.style.setProperty("--workflow-focus-y", `${clamp(y, 12, 88).toFixed(1)}%`);
}

function activateWorkflowStep(step, showDetail = false) {
  if (!step) return;
  workflowSteps.forEach((item) => item.classList.toggle("is-active", item === step));
  if (workflowIndex && step.dataset.index) {
    workflowIndex.textContent = step.dataset.index;
  }
  if (workflowTitle && localizedDataset(step, "title")) {
    workflowTitle.textContent = localizedDataset(step, "title");
  }
  if (workflowBody && localizedDataset(step, "body")) {
    workflowBody.textContent = localizedDataset(step, "body");
  }
  if (workflowDetailName && localizedDataset(step, "title")) {
    workflowDetailName.textContent = localizedDataset(step, "title");
  }
  if (workflowDetailBody && localizedDataset(step, "body")) {
    workflowDetailBody.textContent = localizedDataset(step, "body");
  }
  if (workflowSection) {
    const activeAccent = getComputedStyle(step).getPropertyValue("--bot-accent").trim();
    if (activeAccent) {
      workflowSection.style.setProperty("--workflow-active-accent", activeAccent);
    }
    workflowSection.classList.toggle("is-workflow-detail-open", showDetail);
    workflowSection.classList.remove("is-workflow-pulse");
    void workflowSection.offsetWidth;
    workflowSection.classList.add("is-workflow-pulse");
    window.clearTimeout(workflowPulseTimer);
    workflowPulseTimer = window.setTimeout(() => {
      workflowSection.classList.remove("is-workflow-pulse");
    }, 720);
  }
  updateWorkflowFocus(step);
}

let bgmTrack = null;
let bgmFadeFrame = 0;
let bgmEnabled = false;
let bgmPulseTimer = 0;

function cancelBgmFade() {
  if (!bgmFadeFrame) return;
  window.cancelAnimationFrame(bgmFadeFrame);
  bgmFadeFrame = 0;
}

function fadeBgmTo(targetVolume, durationSeconds, onComplete) {
  if (!bgmTrack) return;

  cancelBgmFade();

  const startVolume = bgmTrack.volume;
  const startTime = performance.now();
  const duration = Math.max(durationSeconds * 1000, 1);

  const step = (time) => {
    const progress = clamp((time - startTime) / duration);
    bgmTrack.volume = lerp(startVolume, targetVolume, easeInOutCubic(progress));

    if (progress < 1) {
      bgmFadeFrame = window.requestAnimationFrame(step);
      return;
    }

    bgmFadeFrame = 0;
    bgmTrack.volume = targetVolume;
    onComplete?.();
  };

  bgmFadeFrame = window.requestAnimationFrame(step);
}

function ensureBgm() {
  if (bgmTrack) return true;

  try {
    bgmTrack = new Audio(BGM_TRACK_SRC);
    bgmTrack.preload = "metadata";
    bgmTrack.loop = true;
    bgmTrack.volume = 0;
  } catch {
    bgmTrack = null;
    return false;
  }

  return true;
}

function updateBgmUi() {
  document.body.classList.toggle("is-bgm-playing", bgmEnabled);
  robotAudioToggle?.classList.toggle("is-playing", bgmEnabled);

  if (robotAudioCode) {
    robotAudioCode.textContent = "♪";
  }

  const hintText =
    currentLanguage === "en"
      ? bgmEnabled
        ? "BGM ON"
        : "BGM OFF"
      : bgmEnabled
        ? "关闭 BGM"
        : "开启 BGM";

  if (robotAudioHint) {
    robotAudioHint.textContent = hintText;
  }

  if (robotAudioToggle) {
    robotAudioToggle.title = hintText;
  }

  robotAudioToggle?.setAttribute(
    "aria-label",
    currentLanguage === "en"
      ? bgmEnabled
        ? "Turn off background music"
        : "Turn on background music"
      : bgmEnabled
        ? "关闭背景音乐"
        : "开启背景音乐",
  );
}

async function toggleBgm(event) {
  event?.stopPropagation();

  if (!ensureBgm()) {
    robotAudioToggle?.classList.add("is-unavailable");
    if (robotAudioHint) {
      robotAudioHint.textContent = currentLanguage === "en" ? "BGM unavailable" : "BGM 不可用";
    }
    return;
  }

  robotAudioToggle?.classList.remove("is-unavailable");

  if (bgmEnabled) {
    bgmEnabled = false;
    updateBgmUi();
    fadeBgmTo(0, BGM_FADE_OUT, () => {
      bgmTrack?.pause();
    });
    return;
  }

  try {
    bgmTrack.volume = 0;
    await bgmTrack.play();
  } catch {
    bgmEnabled = false;
    robotAudioToggle?.classList.add("is-unavailable");
    if (robotAudioHint) {
      robotAudioHint.textContent = currentLanguage === "en" ? "BGM unavailable" : "BGM 不可用";
    }
    return;
  }

  bgmEnabled = true;
  fadeBgmTo(BGM_VOLUME, BGM_FADE_IN);
  updateBgmUi();

  robotElement?.classList.add("is-audio-pulse");
  window.clearTimeout(bgmPulseTimer);
  bgmPulseTimer = window.setTimeout(() => {
    robotElement?.classList.remove("is-audio-pulse");
  }, 760);
}

function applyLanguage({ animate = false } = {}) {
  document.documentElement.lang = currentLanguage === "en" ? "en" : "zh-CN";
  document.body.dataset.language = currentLanguage;

  i18nNodes.forEach((node) => {
    const value = node.dataset[currentLanguage];
    if (!value) return;
    if (Object.prototype.hasOwnProperty.call(node.dataset, "i18nLines")) {
      replaceWithLines(node, value);
      return;
    }
    node.textContent = value;
  });

  if (robotLanguageCode) {
    robotLanguageCode.textContent = currentLanguage.toUpperCase();
  }
  if (robotLanguageToggle) {
    robotLanguageToggle.setAttribute(
      "aria-label",
      currentLanguage === "en" ? "切换到中文" : "Switch to English",
    );
    const hint = robotLanguageToggle.querySelector(".robot-language-hint");
    if (hint) {
      hint.textContent = currentLanguage === "en" ? "切换到中文" : "Switch to English";
    }
  }

  updateBgmUi();

  const activeAbility = abilityCards.find((item) => item.classList.contains("is-active")) || abilityCards[0];
  if (activeAbility) {
    activateAbilityCard(activeAbility);
  }

  const activeAboutTab =
    aboutTabs.find((item) => item.classList.contains("is-active")) ||
    aboutTabs.find((item) => item.dataset.about === state.activeAbout);
  if (activeAboutTab) {
    activateAboutKeyword(activeAboutTab);
  } else if (aboutBody) {
    const defaultAbout = aboutContent.taste;
    aboutKicker.textContent = defaultAbout.kicker;
    aboutTitle.textContent = defaultAbout.title;
    aboutBody.textContent = localizedContent(defaultAbout, "body");
    if (aboutSignal) {
      aboutSignal.textContent = defaultAbout.signal;
    }
  }

  const activeProject = projectCards.find((item) => item.classList.contains("is-active")) || projectCards[0];
  if (activeProject) {
    activateProjectModule(activeProject);
  }

  const activeWorkflow = workflowSteps.find((item) => item.classList.contains("is-active")) || workflowSteps[0];
  if (activeWorkflow) {
    activateWorkflowStep(activeWorkflow, workflowSection?.classList.contains("is-workflow-detail-open"));
  }

  if (animate) {
    document.body.classList.add("is-language-switching");
    robotLanguageToggle?.classList.add("is-switching");
    window.setTimeout(() => {
      document.body.classList.remove("is-language-switching");
      robotLanguageToggle?.classList.remove("is-switching");
    }, 520);
  }
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "cn" : "en";
  try {
    window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  } catch {
    // Local files can run without storage access in some browsers.
  }
  applyLanguage({ animate: true });
}

workflowSteps.forEach((step) => {
  step.addEventListener("pointerenter", () => activateWorkflowStep(step, true));
  step.addEventListener("focus", () => activateWorkflowStep(step, true));
  step.addEventListener("click", () => activateWorkflowStep(step, true));
});

activateWorkflowStep(workflowSteps[0]);

robotLanguageToggle?.addEventListener("click", toggleLanguage);
robotAudioToggle?.addEventListener("click", toggleBgm);
applyLanguage();

const launchMessages = [
  "PROJECTS SCANNED",
  "THINKING LOCKED",
  "AI CORE ONLINE",
  "AVATAR DOCKING",
];

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function waitForImage(image) {
  if (!image || (image.complete && image.naturalWidth > 0)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
}

function waitForWindowLoad() {
  if (document.readyState === "complete") {
    return Promise.resolve();
  }
  return new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
}

function setLaunchLandingPoint() {
  const mobile = state.width < 760;
  const landingX = state.robot.x || state.width * (mobile ? 0.73 : 0.65);
  const landingY = state.robot.y || state.height * (mobile ? 0.48 : 0.5);
  const route = mobile
    ? {
        start: [-state.width * 0.08, state.height * 0.76],
        project: [state.width * 0.2, state.height * 0.42],
        thinking: [state.width * 0.5, state.height * 0.2],
        ai: [state.width * 0.79, state.height * 0.42],
        hold: [state.width * 0.79, state.height * 0.42],
        approach: [landingX + state.width * 0.16, landingY - state.height * 0.06],
        near: [landingX + state.width * 0.06, landingY - state.height * 0.025],
      }
    : {
        start: [-state.width * 0.1, state.height * 0.82],
        project: [state.width * 0.18, state.height * 0.39],
        thinking: [state.width * 0.49, state.height * 0.2],
        ai: [state.width * 0.82, state.height * 0.4],
        hold: [state.width * 0.82, state.height * 0.4],
        approach: [landingX + state.width * 0.2, landingY - state.height * 0.08],
        near: [landingX + state.width * 0.08, landingY - state.height * 0.032],
      };
  root.style.setProperty("--launch-land-x", `${landingX.toFixed(1)}px`);
  root.style.setProperty("--launch-land-y", `${landingY.toFixed(1)}px`);
  root.style.setProperty("--launch-start-x", `${route.start[0].toFixed(1)}px`);
  root.style.setProperty("--launch-start-y", `${route.start[1].toFixed(1)}px`);
  root.style.setProperty("--launch-project-x", `${route.project[0].toFixed(1)}px`);
  root.style.setProperty("--launch-project-y", `${route.project[1].toFixed(1)}px`);
  root.style.setProperty("--launch-thinking-x", `${route.thinking[0].toFixed(1)}px`);
  root.style.setProperty("--launch-thinking-y", `${route.thinking[1].toFixed(1)}px`);
  root.style.setProperty("--launch-ai-x", `${route.ai[0].toFixed(1)}px`);
  root.style.setProperty("--launch-ai-y", `${route.ai[1].toFixed(1)}px`);
  root.style.setProperty("--launch-arc-a-x", `${route.project[0].toFixed(1)}px`);
  root.style.setProperty("--launch-arc-a-y", `${route.project[1].toFixed(1)}px`);
  root.style.setProperty("--launch-arc-b-x", `${route.thinking[0].toFixed(1)}px`);
  root.style.setProperty("--launch-arc-b-y", `${route.thinking[1].toFixed(1)}px`);
  root.style.setProperty("--launch-arc-c-x", `${route.ai[0].toFixed(1)}px`);
  root.style.setProperty("--launch-arc-c-y", `${route.ai[1].toFixed(1)}px`);
  root.style.setProperty("--launch-hold-x", `${route.hold[0].toFixed(1)}px`);
  root.style.setProperty("--launch-hold-y", `${route.hold[1].toFixed(1)}px`);
  root.style.setProperty("--launch-approach-x", `${route.approach[0].toFixed(1)}px`);
  root.style.setProperty("--launch-approach-y", `${route.approach[1].toFixed(1)}px`);
  root.style.setProperty("--launch-near-x", `${route.near[0].toFixed(1)}px`);
  root.style.setProperty("--launch-near-y", `${route.near[1].toFixed(1)}px`);
}

async function runLaunchLoader() {
  if (!launchLoader) {
    document.body.classList.remove("is-launch-loading");
    return;
  }

  setLaunchLandingPoint();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const minimumDuration = reducedMotion ? 620 : 3780;
  const maximumDuration = reducedMotion ? 1400 : 6200;
  const launchRobot = launchLoader.querySelector(".launch-loader-robot");
  const messageSchedule = reducedMotion
    ? [
        [120, launchMessages[0]],
        [260, launchMessages[1]],
        [400, launchMessages[2]],
        [540, launchMessages[3]],
      ]
    : [
        [580, launchMessages[0]],
        [1480, launchMessages[1]],
        [2520, launchMessages[2]],
        [3500, launchMessages[3]],
      ];
  const messageTimers = messageSchedule.map(([wait, message]) =>
    window.setTimeout(() => {
      if (launchLoaderStatus) {
        launchLoaderStatus.textContent = message;
      }
    }, wait)
  );

  window.setTimeout(() => launchLoader.classList.add("is-fast"), reducedMotion ? 300 : 3540);

  await Promise.all([
    Promise.race([
      Promise.all([waitForWindowLoad(), waitForImage(heroImage), waitForImage(robotElement), waitForImage(launchRobot)]),
      delay(maximumDuration),
    ]),
    delay(minimumDuration),
  ]);

  messageTimers.forEach((timer) => window.clearTimeout(timer));
  if (launchLoaderStatus) {
    launchLoaderStatus.textContent = "INTERFACE READY";
  }
  setLaunchLandingPoint();
  launchLoader.classList.add("is-fast");

  await delay(reducedMotion ? 80 : 180);
  document.body.classList.add("is-launch-landing");
  launchLoader.classList.add("is-landing");

  await delay(reducedMotion ? 140 : 760);
  launchLoader.classList.add("is-revealing");

  await delay(reducedMotion ? 220 : 360);
  launchLoader.classList.add("is-hidden");
  document.body.classList.remove("is-launch-loading");

  await delay(720);
  document.body.classList.remove("is-launch-landing");
  launchLoader.setAttribute("aria-hidden", "true");
  launchLoader.style.display = "none";
}

async function copyContactValue(row) {
  const value = row.dataset.copy;
  if (!value) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    row.classList.add("is-copied");
    window.setTimeout(() => row.classList.remove("is-copied"), 1200);
  } catch {
    window.prompt("Copy this contact", value);
  }
}

contactCopyRows.forEach((row) => {
  row.addEventListener("click", (event) => {
    event.preventDefault();
    copyContactValue(row);
  });
});

resize();
runLaunchLoader();
window.requestAnimationFrame(tick);
