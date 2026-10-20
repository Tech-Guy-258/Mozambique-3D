import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GeoJSONFeatureCollection, ThematicMetric, LightingTheme, CameraPreset } from '../types/index.ts';
import { PROVINCES_DATA } from '../data/provincesData.ts';
import { convertGeometryToShapes, computeFeatureCentroidAndBounds } from '../utils/geoTo3d.ts';
import { getThematicColor, getProvinceExtrusionHeight } from '../utils/thematicColor.ts';

interface Map3DCanvasProps {
  geoJson: GeoJSONFeatureCollection;
  selectedProvinceId: string | null;
  hoveredProvinceId: string | null;
  onSelectProvince: (id: string | null) => void;
  onHoverProvince: (id: string | null, mouseEvent?: { x: number; y: number }) => void;
  thematicMetric: ThematicMetric;
  is3DExtruded: boolean;
  lightingTheme: LightingTheme;
  showLabels: boolean;
  cameraPreset: CameraPreset;
  onResetCameraPreset?: () => void;
}

interface ProvinceMeshGroup {
  id: string;
  name: string;
  group: THREE.Group;
  meshes: THREE.Mesh[];
  edgeLines: THREE.LineSegments[];
  centroid: [number, number, number];
  baseElevation: number;
  targetLift: number;
  currentLift: number;
  currentHeight: number;
  labelSprite?: THREE.Sprite;
}

// Pre-allocated math objects to avoid GC in animation loop
const _vec3 = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3(0, 0, 0);

export const Map3DCanvas: React.FC<Map3DCanvasProps> = ({
  geoJson,
  selectedProvinceId,
  hoveredProvinceId,
  onSelectProvince,
  onHoverProvince,
  thematicMetric,
  is3DExtruded,
  lightingTheme,
  showLabels,
  cameraPreset,
  onResetCameraPreset,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Store mutable refs for render loop and interaction
  const stateRef = useRef({
    selectedProvinceId,
    hoveredProvinceId,
    thematicMetric,
    is3DExtruded,
    lightingTheme,
    showLabels,
    cameraPreset,
    onSelectProvince,
    onHoverProvince,
    onResetCameraPreset,
  });

  // Keep stateRef in sync with props without rebuilding scene
  useEffect(() => {
    stateRef.current.selectedProvinceId = selectedProvinceId;
    stateRef.current.hoveredProvinceId = hoveredProvinceId;
    stateRef.current.thematicMetric = thematicMetric;
    stateRef.current.is3DExtruded = is3DExtruded;
    stateRef.current.lightingTheme = lightingTheme;
    stateRef.current.showLabels = showLabels;
    stateRef.current.cameraPreset = cameraPreset;
    stateRef.current.onSelectProvince = onSelectProvince;
    stateRef.current.onHoverProvince = onHoverProvince;
    stateRef.current.onResetCameraPreset = onResetCameraPreset;
  }, [
    selectedProvinceId,
    hoveredProvinceId,
    thematicMetric,
    is3DExtruded,
    lightingTheme,
    showLabels,
    cameraPreset,
    onSelectProvince,
    onHoverProvince,
    onResetCameraPreset,
  ]);

  const sceneContextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    provinceGroups: Map<string, ProvinceMeshGroup>;
    interactiveMeshes: THREE.Mesh[];
    keyLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
    ambientLight: THREE.AmbientLight;
    oceanMesh: THREE.Mesh;
    cameraTransitionTarget: { pos: THREE.Vector3; look: THREE.Vector3 } | null;
  } | null>(null);

  // Helper to generate crisp 2D canvas label sprites
  const createLabelSprite = (name: string, capital: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    // Background rounded pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    const r = 24;
    const x = 16, y = 16, w = 480, h = 128;
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

    // Province Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name.toUpperCase(), 256, 68);

    // Capital
    ctx.fillStyle = '#38bdf8';
    ctx.font = '500 26px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(`Cap: ${capital}`, 256, 110);

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
    sprite.scale.set(3.6, 1.12, 1);
    return sprite;
  };

  // Re-build/update meshes when GeoJSON, extrusion or thematic metric changes
  const updateProvinceMeshes = () => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    const { scene, provinceGroups, interactiveMeshes } = ctx;

    // Clear previous province groups
    provinceGroups.forEach((pg) => {
      scene.remove(pg.group);
      pg.meshes.forEach((m) => {
        m.geometry.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else m.material.dispose();
      });
      pg.edgeLines.forEach((l) => {
        l.geometry.dispose();
        if (Array.isArray(l.material)) l.material.forEach((mat) => mat.dispose());
        else l.material.dispose();
      });
      if (pg.labelSprite) {
        pg.labelSprite.material.map?.dispose();
        pg.labelSprite.material.dispose();
      }
    });
    provinceGroups.clear();
    interactiveMeshes.length = 0;

    const currentMetric = stateRef.current.thematicMetric;
    const is3D = stateRef.current.is3DExtruded;

    // Build each province geometry
    geoJson.features.forEach((feature) => {
      const code = String(feature.properties.CodProv || feature.id || '01');
      const provName = feature.properties.Provincia || 'Província';
      const provData = PROVINCES_DATA[code];

      const shapes = convertGeometryToShapes(feature.geometry);
      if (shapes.length === 0) return;

      const provinceGroup = new THREE.Group();
      provinceGroup.name = `province_group_${code}`;

      const { centroid } = computeFeatureCentroidAndBounds(feature);
      const extrudeHeight = getProvinceExtrusionHeight(code, currentMetric, is3D);
      const baseColor = getThematicColor(code, currentMetric);

      const meshes: THREE.Mesh[] = [];
      const edgeLines: THREE.LineSegments[] = [];

      shapes.forEach((shape, index) => {
        const extrudeSettings: THREE.ExtrudeGeometryOptions = {
          steps: 1,
          depth: extrudeHeight,
          bevelEnabled: true,
          bevelThickness: Math.min(0.06, extrudeHeight * 0.15),
          bevelSize: 0.03,
          bevelOffset: 0,
          bevelSegments: 2,
        };

        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geom.computeVertexNormals();

        // Material with PBR shading
        const material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(baseColor),
          roughness: 0.35,
          metalness: 0.08,
          clearcoat: 0.15,
          clearcoatRoughness: 0.2,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });

        const mesh = new THREE.Mesh(geom, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.rotation.x = -Math.PI / 2;
        mesh.userData = {
          provinceCode: code,
          provinceName: provName,
          baseColor: baseColor,
          index,
        };

        // Sharp Cartographic Borders
        const edgesGeom = new THREE.EdgesGeometry(geom, 26);
        const lineMat = new THREE.LineBasicMaterial({
          color: new THREE.Color('#ffffff'),
          transparent: true,
          opacity: 0.75,
          linewidth: 1.5,
        });
        const edgeLine = new THREE.LineSegments(edgesGeom, lineMat);
        edgeLine.rotation.x = -Math.PI / 2;
        edgeLine.position.y = 0.005;

        provinceGroup.add(mesh);
        provinceGroup.add(edgeLine);

        meshes.push(mesh);
        edgeLines.push(edgeLine);
        interactiveMeshes.push(mesh);
      });

      // 3D Province Floating Label
      const capital = provData ? provData.capital : 'Capital';
      const labelSprite = createLabelSprite(provName, capital);
      if (labelSprite) {
        labelSprite.position.set(centroid[0], extrudeHeight + 0.8, centroid[2]);
        labelSprite.visible = stateRef.current.showLabels;
        provinceGroup.add(labelSprite);
      }

      scene.add(provinceGroup);

      provinceGroups.set(code, {
        id: code,
        name: provName,
        group: provinceGroup,
        meshes,
        edgeLines,
        centroid,
        baseElevation: 0,
        targetLift: 0,
        currentLift: 0,
        currentHeight: extrudeHeight,
        labelSprite,
      });
    });
  };

  // Update theme colors and lighting
  const updateLightingAndAtmosphere = () => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    const { scene, keyLight, hemiLight, ambientLight, oceanMesh } = ctx;
    const theme = stateRef.current.lightingTheme;

    switch (theme) {
      case 'day':
        scene.background = new THREE.Color('#0f172a'); // Rich deep slate
        scene.fog = new THREE.FogExp2(0x0f172a, 0.012);
        keyLight.color.set('#fffbeb'); // Warm sunlight
        keyLight.intensity = 2.4;
        hemiLight.color.set('#93c5fd'); // Cool sky
        hemiLight.groundColor.set('#1e293b'); // Warm earth
        hemiLight.intensity = 1.0;
        ambientLight.intensity = 0.5;
        (oceanMesh.material as THREE.MeshPhysicalMaterial).color.set('#0c4a6e');
        break;

      case 'night':
        scene.background = new THREE.Color('#030712'); // Midnight black
        scene.fog = new THREE.FogExp2(0x030712, 0.015);
        keyLight.color.set('#38bdf8'); // Moonlight
        keyLight.intensity = 1.8;
        hemiLight.color.set('#1e3a8a');
        hemiLight.groundColor.set('#030712');
        hemiLight.intensity = 0.6;
        ambientLight.intensity = 0.25;
        (oceanMesh.material as THREE.MeshPhysicalMaterial).color.set('#021a36');
        break;

      case 'studio':
        scene.background = new THREE.Color('#1e293b'); // Neutral studio grey
        scene.fog = new THREE.FogExp2(0x1e293b, 0.01);
        keyLight.color.set('#ffffff');
        keyLight.intensity = 2.2;
        hemiLight.color.set('#e2e8f0');
        hemiLight.groundColor.set('#334155');
        hemiLight.intensity = 1.1;
        ambientLight.intensity = 0.6;
        (oceanMesh.material as THREE.MeshPhysicalMaterial).color.set('#0f2b48');
        break;

      case 'topographic':
        scene.background = new THREE.Color('#141c24');
        scene.fog = new THREE.FogExp2(0x141c24, 0.012);
        keyLight.color.set('#fde047');
        keyLight.intensity = 2.1;
        hemiLight.color.set('#7dd3fc');
        hemiLight.groundColor.set('#27272a');
        hemiLight.intensity = 0.9;
        ambientLight.intensity = 0.45;
        (oceanMesh.material as THREE.MeshPhysicalMaterial).color.set('#0a2e38');
        break;
    }
  };

  // Main Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
    // Initial isometric view looking at Mozambique
    camera.position.set(0, 32, 28);
    camera.lookAt(0, 0, 0);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment map via PMREMGenerator & RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent flipping under ground
    controls.minDistance = 6;
    controls.maxDistance = 85;
    controls.target.set(0, 0, 0);

    // Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight('#fffbeb', 2.4);
    keyLight.position.set(18, 35, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 5;
    keyLight.shadow.camera.far = 80;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 26;
    keyLight.shadow.camera.bottom = -26;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#93c5fd', '#1e293b', 1.0);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
    scene.add(ambientLight);

    // Oceanic base platform & Bathymetric grid (Canal de Moçambique / Oceano Índico)
    const oceanGeom = new THREE.PlaneGeometry(90, 90, 40, 40);
    const oceanMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0c4a6e'),
      roughness: 0.1,
      metalness: 0.15,
      reflectivity: 0.6,
      clearcoat: 0.4,
      clearcoatRoughness: 0.1,
    });
    const oceanMesh = new THREE.Mesh(oceanGeom, oceanMat);
    oceanMesh.rotation.x = -Math.PI / 2;
    oceanMesh.position.y = -0.05;
    oceanMesh.receiveShadow = true;
    scene.add(oceanMesh);

    // Stylized cartographic grid on ocean
    const gridHelper = new THREE.GridHelper(90, 45, 0x38bdf8, 0x1e3a8a);
    gridHelper.position.y = -0.04;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.22;
    scene.add(gridHelper);

    // Neighboring continent subtle base outline
    const continentBorderGeom = new THREE.RingGeometry(24, 25, 64);
    const continentBorderMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
    });
    const continentMesh = new THREE.Mesh(continentBorderGeom, continentBorderMat);
    continentMesh.rotation.x = -Math.PI / 2;
    continentMesh.position.y = -0.045;
    scene.add(continentMesh);

    const provinceGroups = new Map<string, ProvinceMeshGroup>();
    const interactiveMeshes: THREE.Mesh[] = [];

    sceneContextRef.current = {
      scene,
      camera,
      renderer,
      controls,
      provinceGroups,
      interactiveMeshes,
      keyLight,
      hemiLight,
      ambientLight,
      oceanMesh,
      cameraTransitionTarget: null,
    };

    // Pre-compile shaders
    renderer.compile(scene, camera);

    // Initial build of province meshes
    updateProvinceMeshes();
    updateLightingAndAtmosphere();

    // Raycasting for interactive hover and click
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pointerDownPos = { x: clientX, y: clientY };
      isDragging = false;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Check if user is orbiting
      const dist = Math.hypot(clientX - pointerDownPos.x, clientY - pointerDownPos.y);
      if (dist > 5) {
        isDragging = true;
      }

      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast only if not dragging heavily
      if (!isDragging) {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes, false);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const code = hitMesh.userData.provinceCode;
          renderer.domElement.style.cursor = 'pointer';
          stateRef.current.onHoverProvince(code, { x: clientX, y: clientY });
        } else {
          renderer.domElement.style.cursor = 'default';
          stateRef.current.onHoverProvince(null);
        }
      }
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'changedTouches' in e && e.changedTouches[0] ? e.changedTouches[0].clientX : ('clientX' in e ? (e as MouseEvent).clientX : pointerDownPos.x);
      const clientY = 'changedTouches' in e && e.changedTouches[0] ? e.changedTouches[0].clientY : ('clientY' in e ? (e as MouseEvent).clientY : pointerDownPos.y);

      const dist = Math.hypot(clientX - pointerDownPos.x, clientY - pointerDownPos.y);

      // Only treat as click if pointer didn't drag
      if (dist < 6) {
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes, false);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const code = hitMesh.userData.provinceCode;
          stateRef.current.onSelectProvince(code);
        } else {
          // Clicked outside on ocean: deselect
          stateRef.current.onSelectProvince(null);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    domElement.addEventListener('mousemove', onPointerMove);
    domElement.addEventListener('mouseup', onPointerUp);
    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    domElement.addEventListener('touchmove', onPointerMove, { passive: true });
    domElement.addEventListener('touchend', onPointerUp, { passive: true });

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation & Render Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth Camera Transitions when navigating presets or province selection
      if (sceneContextRef.current?.cameraTransitionTarget) {
        const { pos, look } = sceneContextRef.current.cameraTransitionTarget;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, pos.x, 4.0, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, pos.y, 4.0, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, pos.z, 4.0, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, look.x, 4.0, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, look.y, 4.0, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, look.z, 4.0, delta);

        if (camera.position.distanceTo(pos) < 0.15 && controls.target.distanceTo(look) < 0.15) {
          sceneContextRef.current.cameraTransitionTarget = null;
        }
      }

      controls.update();

      // Dynamic hover/selection visual updates and elevation lift
      const currentSelected = stateRef.current.selectedProvinceId;
      const currentHovered = stateRef.current.hoveredProvinceId;

      provinceGroups.forEach((pg, code) => {
        const isSelected = currentSelected === code;
        const isHovered = currentHovered === code;

        // Smooth elevation lift on hover or selection
        pg.targetLift = isSelected ? 0.45 : isHovered ? 0.25 : 0;
        pg.currentLift = THREE.MathUtils.damp(pg.currentLift, pg.targetLift, 8.0, delta);
        pg.group.position.y = pg.currentLift;

        // Visual highlight via material emissive & edge colors
        pg.meshes.forEach((mesh) => {
          const mat = mesh.material as THREE.MeshPhysicalMaterial;
          if (isSelected) {
            mat.emissive.set('#38bdf8');
            mat.emissiveIntensity = 0.45;
          } else if (isHovered) {
            mat.emissive.set('#ffffff');
            mat.emissiveIntensity = 0.25;
          } else {
            mat.emissive.set('#000000');
            mat.emissiveIntensity = 0;
          }
        });

        // Edge line highlights
        pg.edgeLines.forEach((line) => {
          const lineMat = line.material as THREE.LineBasicMaterial;
          if (isSelected) {
            lineMat.color.set('#38bdf8');
            lineMat.opacity = 1.0;
          } else if (isHovered) {
            lineMat.color.set('#ffffff');
            lineMat.opacity = 0.95;
          } else {
            lineMat.color.set('#ffffff');
            lineMat.opacity = 0.65;
          }
        });
      });

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onPointerDown);
      domElement.removeEventListener('mousemove', onPointerMove);
      domElement.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('touchstart', onPointerDown);
      domElement.removeEventListener('touchmove', onPointerMove);
      domElement.removeEventListener('touchend', onPointerUp);

      controls.dispose();
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [geoJson]); // Rebuild if new GeoJSON is provided

  // Trigger geometry rebuild when thematic metric or 3D extrusion changes
  useEffect(() => {
    updateProvinceMeshes();
  }, [thematicMetric, is3DExtruded]);

  // Update lighting theme
  useEffect(() => {
    updateLightingAndAtmosphere();
  }, [lightingTheme]);

  // Update label visibility
  useEffect(() => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;
    ctx.provinceGroups.forEach((pg) => {
      if (pg.labelSprite) {
        pg.labelSprite.visible = showLabels;
      }
    });
  }, [showLabels]);

  // Camera presets and focusing when selection or preset changes
  useEffect(() => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    if (selectedProvinceId) {
      const pg = ctx.provinceGroups.get(selectedProvinceId);
      if (pg) {
        const [cx, cy, cz] = pg.centroid;
        // Fly camera directly above and at an angle to the selected province
        ctx.cameraTransitionTarget = {
          pos: new THREE.Vector3(cx, 12, cz + 10),
          look: new THREE.Vector3(cx, cy, cz),
        };
        return;
      }
    }

    if (cameraPreset === 'topdown') {
      ctx.cameraTransitionTarget = {
        pos: new THREE.Vector3(0, 42, 0.01),
        look: new THREE.Vector3(0, 0, 0),
      };
    } else if (cameraPreset === 'default') {
      ctx.cameraTransitionTarget = {
        pos: new THREE.Vector3(0, 32, 28),
        look: new THREE.Vector3(0, 0, 0),
      };
    } else if (cameraPreset === 'norte') {
      // Focus on Cabo Delgado / Nampula / Niassa
      ctx.cameraTransitionTarget = {
        pos: new THREE.Vector3(3, 20, -6),
        look: new THREE.Vector3(3, 0, -11),
      };
    } else if (cameraPreset === 'centro') {
      // Focus on Sofala / Manica / Tete / Zambézia
      ctx.cameraTransitionTarget = {
        pos: new THREE.Vector3(0, 20, 10),
        look: new THREE.Vector3(0, 0, 0),
      };
    } else if (cameraPreset === 'sul') {
      // Focus on Maputo Cidade, Maputo Província, Gaza, Inhambane
      ctx.cameraTransitionTarget = {
        pos: new THREE.Vector3(-2, 16, 22),
        look: new THREE.Vector3(-2, 0, 13),
      };
    }
  }, [selectedProvinceId, cameraPreset]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    />
  );
};
