import * as THREE from 'three';
import { PATRIOTIC_LANDMARKS, PatrioticLandmark } from '../data/patrioticData.ts';

export interface PatrioticSceneElements {
  group: THREE.Group;
  interactiveMeshes: THREE.Mesh[];
  pulseZumboIndico: THREE.Mesh;
  curveZumboIndico: THREE.CatmullRomCurve3;
  pulseRovumaMaputo: THREE.Mesh;
  curveRovumaMaputo: THREE.CatmullRomCurve3;
  pulsingRings: THREE.Mesh[];
  update: (delta: number, elapsed: number) => void;
  dispose: () => void;
}

/**
 * Creates a rich, high-resolution Mozambican nautical compass rose texture
 * featuring the national flag colors (Green, Black, Yellow, White, Red with Gold Star)
 */
export function createMozambiqueCompassRoseTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 512;
  const cy = 512;
  const radius = 460;

  // Outer radial background glow
  const grad = ctx.createRadialGradient(cx, cy, 260, cx, cy, radius + 20);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
  grad.addColorStop(0.7, 'rgba(12, 74, 110, 0.85)');
  grad.addColorStop(0.95, 'rgba(2, 132, 199, 0.3)');
  grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2);
  ctx.fill();

  // Outermost gold border
  ctx.strokeStyle = '#FFD100';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Emerald green band
  ctx.strokeStyle = '#007A3D';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 14, 0, Math.PI * 2);
  ctx.stroke();

  // Crimson red inner border
  ctx.strokeStyle = '#DA291C';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 24, 0, Math.PI * 2);
  ctx.stroke();

  // Circular text: REPÚBLICA DE MOÇAMBIQUE • PÁTRIA AMADA • 25 DE JUNHO DE 1975 •
  ctx.save();
  ctx.translate(cx, cy);
  const text = 'REPÚBLICA DE MOÇAMBIQUE • PÁTRIA AMADA • 25 DE JUNHO 1975 • ';
  const textRadius = radius - 48;
  ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#FFD100';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const charCount = text.length;
  const step = (Math.PI * 2) / charCount;
  for (let i = 0; i < charCount; i++) {
    const angle = i * step - Math.PI / 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -textRadius);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // Degree markings (ticks)
  for (let a = 0; a < 360; a += 5) {
    const rad = (a * Math.PI) / 180;
    const isMajor = a % 30 === 0;
    const isCardinal = a % 90 === 0;
    const r1 = radius - 66;
    const r2 = r1 - (isCardinal ? 22 : isMajor ? 14 : 7);

    ctx.strokeStyle = isCardinal ? '#FFD100' : isMajor ? '#38bdf8' : 'rgba(255,255,255,0.45)';
    ctx.lineWidth = isCardinal ? 3 : isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
    ctx.stroke();
  }

  // Draw 8-point nautical star in Mozambique national colors
  const points = 8;
  const outerR = radius - 100;
  const innerR = 75;

  for (let i = 0; i < points; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const halfAngle = angle + Math.PI / 8;

    const isMajor = i % 2 === 0;
    const currentOuterR = isMajor ? outerR : outerR * 0.65;

    const tipX = cx + Math.cos(angle) * currentOuterR;
    const tipY = cy + Math.sin(angle) * currentOuterR;
    const innerX = cx + Math.cos(halfAngle) * innerR;
    const innerY = cy + Math.sin(halfAngle) * innerR;

    // Right half
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(innerX, innerY);
    ctx.closePath();

    if (isMajor) {
      // Cardinal points colored by national flag themes
      ctx.fillStyle = i === 0 ? '#DA291C' : i === 2 ? '#007A3D' : i === 4 ? '#111827' : '#FFD100';
    } else {
      ctx.fillStyle = '#0284c7';
    }
    ctx.fill();
    ctx.strokeStyle = '#FFD100';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Left half
    const prevHalfAngle = angle - Math.PI / 8;
    const prevInnerX = cx + Math.cos(prevHalfAngle) * innerR;
    const prevInnerY = cy + Math.sin(prevHalfAngle) * innerR;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(prevInnerX, prevInnerY);
    ctx.closePath();
    ctx.fillStyle = isMajor ? '#FFFFFF' : '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#FFD100';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Cardinal Labels: N, S, L (Leste/Índico), O (Oeste/Zumbo)
  const labelR = outerR + 24;
  ctx.font = 'bold 34px "Inter", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // N (North - Rovuma)
  ctx.fillStyle = '#DA291C';
  ctx.fillText('N', cx, cy - labelR);

  // S (South - Maputo)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('S', cx, cy + labelR);

  // L (East - Oceano Índico)
  ctx.fillStyle = '#007A3D';
  ctx.fillText('L', cx + labelR, cy);

  // O (West - Zumbo)
  ctx.fillStyle = '#FFD100';
  ctx.fillText('O', cx - labelR, cy);

  // Center gold medallion
  ctx.beginPath();
  ctx.arc(cx, cy, 54, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD100';
  ctx.fill();
  ctx.strokeStyle = '#DA291C';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Five-pointed star in center
  ctx.fillStyle = '#DA291C';
  ctx.beginPath();
  for (let s = 0; s < 5; s++) {
    const starAngle = (s * 4 * Math.PI) / 5 - Math.PI / 2;
    const sx = cx + Math.cos(starAngle) * 36;
    const sy = cy + Math.sin(starAngle) * 36;
    if (s === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Creates an interactive 3D billboard sprite for patriotic landmarks (Zumbo, Indico, etc.)
 */
export function createLandmarkSprite(
  landmark: PatrioticLandmark,
  extraHint = 'Clique para ver o historial'
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite();

  // Card background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = landmark.badgeColor;
  ctx.lineWidth = 4;

  const r = 24;
  const x = 16, y = 16, w = 480, h = 160;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Top color ribbon (flag accent)
  const ribbonH = 8;
  const rx = x + 16, ry = y + 10, rw = w - 32;
  ctx.fillStyle = '#007A3D';
  ctx.fillRect(rx, ry, rw * 0.35, ribbonH);
  ctx.fillStyle = '#111827';
  ctx.fillRect(rx + rw * 0.35, ry, rw * 0.2, ribbonH);
  ctx.fillStyle = '#FFD100';
  ctx.fillRect(rx + rw * 0.55, ry, rw * 0.15, ribbonH);
  ctx.fillStyle = '#DA291C';
  ctx.fillRect(rx + rw * 0.7, ry, rw * 0.3, ribbonH);

  // Badge tag
  ctx.fillStyle = `${landmark.badgeColor}25`;
  ctx.fillRect(36, 42, 180, 26);
  ctx.fillStyle = landmark.badgeColor;
  ctx.font = 'bold 16px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(landmark.referencePhrase.toUpperCase(), 44, 60);

  // Landmark Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px "Inter", sans-serif';
  ctx.fillText(landmark.name.toUpperCase(), 36, 102);

  // Landmark Subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 18px "Inter", sans-serif';
  ctx.fillText(landmark.subtitle, 36, 130);

  // Action hint prompt
  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 16px "Inter", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${extraHint} ↗`, 470, 160);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
    transparent: true,
    opacity: 0.95,
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(4.2, 1.57, 1);
  return sprite;
}

/**
 * Creates floating arc banners (e.g. "DO ZUMBO AO ÍNDICO")
 */
export function createCurvedBannerSprite(
  title: string,
  subtitle: string,
  color = '#f59e0b'
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite();

  // Rounded pill background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  const r = 24, x = 16, y = 16, w = 480, h = 128;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Title
  ctx.fillStyle = color;
  ctx.font = 'bold 30px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`✨ ${title}`, 256, 68);

  // Subtitle
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 20px "Inter", sans-serif';
  ctx.fillText(subtitle, 256, 108);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
    transparent: true,
    opacity: 0.95,
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(4.4, 1.38, 1);
  return sprite;
}

/**
 * Creates ocean geographic text billboard
 */
export function createOceanTitleSprite(): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite();

  ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 3;
  const r = 20, x = 16, y = 16, w = 480, h = 128;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 32px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌊 OCEANO ÍNDICO', 256, 68);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 20px "Inter", sans-serif';
  ctx.fillText('Canal de Moçambique • 2.700 km de Costa', 256, 108);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
    transparent: true,
    opacity: 0.9,
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(5.2, 1.62, 1);
  return sprite;
}

/**
 * Builds all 3D patriotic elements (Compass Rose, Zumbo-Indico Arc, Beacons, Rovuma-Maputo)
 */
export function buildPatrioticElements(
  scene: THREE.Scene
): PatrioticSceneElements {
  const group = new THREE.Group();
  group.name = 'patriotic_elements_root';

  const interactiveMeshes: THREE.Mesh[] = [];
  const pulsingRings: THREE.Mesh[] = [];

  // 1. Compass Rose on Indian Ocean surface
  const compassTexture = createMozambiqueCompassRoseTexture();
  const compassGeom = new THREE.PlaneGeometry(13.5, 13.5);
  const compassMat = new THREE.MeshBasicMaterial({
    map: compassTexture,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const compassMesh = new THREE.Mesh(compassGeom, compassMat);
  compassMesh.rotation.x = -Math.PI / 2;
  compassMesh.position.set(16.5, -0.035, 3.5);
  group.add(compassMesh);

  // Ocean Title Banner floating above water
  const oceanTitle = createOceanTitleSprite();
  oceanTitle.position.set(16.5, 1.8, -4.5);
  group.add(oceanTitle);

  // Helper for pulsing ground ring
  const createPulseRing = (pos: [number, number, number], color: string, radius = 0.8) => {
    const ringGeom = new THREE.RingGeometry(radius * 0.7, radius, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pos[0], pos[1] + 0.02, pos[2]);
    group.add(ring);
    pulsingRings.push(ring);
    return ring;
  };

  // Helper for interactive beacon
  const createBeacon = (
    pos: [number, number, number],
    color: string,
    landmarkId: string,
    sprite: THREE.Sprite
  ) => {
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(pos[0], pos[1], pos[2]);

    // Pedestal
    const baseGeom = new THREE.CylinderGeometry(0.28, 0.42, 0.6, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.4,
    });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = 0.3;
    baseMesh.castShadow = true;
    beaconGroup.add(baseMesh);

    // Glowing finial sphere
    const sphereGeom = new THREE.SphereGeometry(0.28, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
    });
    const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
    sphereMesh.position.y = 0.75;
    beaconGroup.add(sphereMesh);

    // Vertical light column
    const colGeom = new THREE.CylinderGeometry(0.08, 0.16, 1.8, 12);
    const colMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.35,
    });
    const colMesh = new THREE.Mesh(colGeom, colMat);
    colMesh.position.y = 1.5;
    beaconGroup.add(colMesh);

    // Click target mesh
    const clickGeom = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 8);
    const clickMat = new THREE.MeshBasicMaterial({
      visible: false,
    });
    const clickMesh = new THREE.Mesh(clickGeom, clickMat);
    clickMesh.position.set(pos[0], pos[1] + 1.2, pos[2]);
    clickMesh.userData = {
      type: 'patriotic_landmark',
      landmarkId,
    };
    group.add(clickMesh);
    interactiveMeshes.push(clickMesh);

    // Label Sprite
    sprite.position.set(pos[0], pos[1] + 2.4, pos[2]);
    group.add(sprite);

    createPulseRing(pos, color, 1.1);
    group.add(beaconGroup);
  };

  // 2. Beacon: ZUMBO (Tete)
  const zumboPos: [number, number, number] = [-11.11, 0.45, -6.69];
  const zumboSprite = createLandmarkSprite(PATRIOTIC_LANDMARKS['zumbo']);
  createBeacon(zumboPos, '#f59e0b', 'zumbo', zumboSprite);

  // 3. Beacon: OCEANO ÍNDICO
  const indicoPos: [number, number, number] = [13.86, 0.2, 0.0];
  const indicoSprite = createLandmarkSprite(PATRIOTIC_LANDMARKS['indico']);
  createBeacon(indicoPos, '#0ea5e9', 'indico', indicoSprite);

  // 4. Beacon: RIO ROVUMA (Norte)
  const rovumaPos: [number, number, number] = [11.0, 0.45, -17.99];
  const rovumaSprite = createLandmarkSprite(PATRIOTIC_LANDMARKS['rovuma']);
  createBeacon(rovumaPos, '#10b981', 'rovuma', rovumaSprite);

  // 5. Beacon: RIO MAPUTO / PONTA DO OURO (Sul)
  const maputoPos: [number, number, number] = [-5.74, 0.4, 18.06];
  const maputoSprite = createLandmarkSprite(PATRIOTIC_LANDMARKS['maputo']);
  createBeacon(maputoPos, '#ef4444', 'maputo', maputoSprite);

  // 6. Arc "DO ZUMBO AO ÍNDICO"
  const curveZumboIndico = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zumboPos[0], zumboPos[1] + 0.3, zumboPos[2]),
    new THREE.Vector3(-4.0, 2.7, -4.8),
    new THREE.Vector3(5.0, 2.4, -2.2),
    new THREE.Vector3(indicoPos[0], indicoPos[1] + 0.3, indicoPos[2]),
  ]);

  const tubeGeomZI = new THREE.TubeGeometry(curveZumboIndico, 64, 0.08, 12, false);
  const tubeMatZI = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f59e0b'),
    metalness: 0.85,
    roughness: 0.2,
    emissive: new THREE.Color('#d97706'),
    emissiveIntensity: 0.6,
  });
  const tubeMeshZI = new THREE.Mesh(tubeGeomZI, tubeMatZI);
  group.add(tubeMeshZI);

  // Glow tube
  const glowTubeGeomZI = new THREE.TubeGeometry(curveZumboIndico, 64, 0.16, 12, false);
  const glowTubeMatZI = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#fbbf24'),
    transparent: true,
    opacity: 0.35,
  });
  const glowMeshZI = new THREE.Mesh(glowTubeGeomZI, glowTubeMatZI);
  group.add(glowMeshZI);

  // Midpoint floating banner sprite for "Do Zumbo ao Índico"
  const bannerZI = createCurvedBannerSprite(
    'DO ZUMBO AO ÍNDICO',
    'Eixo Histórico da Soberania Nacional',
    '#fbbf24'
  );
  bannerZI.position.set(0.5, 3.4, -3.5);
  group.add(bannerZI);

  // Pulse particle mesh travelling along Zumbo-Índico
  const pulseGeomZI = new THREE.SphereGeometry(0.24, 16, 16);
  const pulseMatZI = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ffffff'),
  });
  const pulseZumboIndico = new THREE.Mesh(pulseGeomZI, pulseMatZI);
  group.add(pulseZumboIndico);

  // 7. Arc "DO ROVUMA AO MAPUTO"
  const curveRovumaMaputo = new THREE.CatmullRomCurve3([
    new THREE.Vector3(rovumaPos[0], rovumaPos[1] + 0.3, rovumaPos[2]),
    new THREE.Vector3(2.5, 2.3, 0.0),
    new THREE.Vector3(maputoPos[0], maputoPos[1] + 0.3, maputoPos[2]),
  ]);

  const tubeGeomRM = new THREE.TubeGeometry(curveRovumaMaputo, 64, 0.07, 12, false);
  const tubeMatRM = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#10b981'),
    metalness: 0.8,
    roughness: 0.25,
    emissive: new THREE.Color('#059669'),
    emissiveIntensity: 0.5,
  });
  const tubeMeshRM = new THREE.Mesh(tubeGeomRM, tubeMatRM);
  group.add(tubeMeshRM);

  // Midpoint floating banner sprite for "Do Rovuma ao Maputo"
  const bannerRM = createCurvedBannerSprite(
    'DO ROVUMA AO MAPUTO',
    'Unidade Nacional de Norte a Sul',
    '#34d399'
  );
  bannerRM.position.set(2.5, 3.0, 0.0);
  group.add(bannerRM);

  // Pulse particle travelling along Rovuma-Maputo
  const pulseGeomRM = new THREE.SphereGeometry(0.22, 16, 16);
  const pulseMatRM = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#a7f3d0'),
  });
  const pulseRovumaMaputo = new THREE.Mesh(pulseGeomRM, pulseMatRM);
  group.add(pulseRovumaMaputo);

  scene.add(group);

  let progressZI = 0;
  let progressRM = 0;

  const update = (delta: number, elapsed: number) => {
    // Animate Zumbo-Índico pulse
    progressZI = (progressZI + delta * 0.16) % 1;
    const ptZI = curveZumboIndico.getPoint(progressZI);
    pulseZumboIndico.position.copy(ptZI);

    // Animate Rovuma-Maputo pulse
    progressRM = (progressRM + delta * 0.14) % 1;
    const ptRM = curveRovumaMaputo.getPoint(progressRM);
    pulseRovumaMaputo.position.copy(ptRM);

    // Animate beacon rings pulsing
    const scale = 1 + Math.sin(elapsed * 2.4) * 0.2;
    const opacity = 0.5 + Math.sin(elapsed * 2.4) * 0.3;
    pulsingRings.forEach((r) => {
      r.scale.set(scale, scale, 1);
      (r.material as THREE.MeshBasicMaterial).opacity = opacity;
    });
  };

  const dispose = () => {
    scene.remove(group);
    compassTexture.dispose();
    compassGeom.dispose();
    compassMat.dispose();
    tubeGeomZI.dispose();
    tubeMatZI.dispose();
    glowTubeGeomZI.dispose();
    glowTubeMatZI.dispose();
    tubeGeomRM.dispose();
    tubeMatRM.dispose();
    pulseGeomZI.dispose();
    pulseMatZI.dispose();
    pulseGeomRM.dispose();
    pulseMatRM.dispose();
  };

  return {
    group,
    interactiveMeshes,
    pulseZumboIndico,
    curveZumboIndico,
    pulseRovumaMaputo,
    curveRovumaMaputo,
    pulsingRings,
    update,
    dispose,
  };
}
