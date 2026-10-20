import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  GeoJSONFeatureCollection,
  ThematicMetric,
  LightingTheme,
  CameraPreset,
  ViewMode,
} from '../types/index.ts';
import { PROVINCES_DATA } from '../data/provincesData.ts';
import { TETE_DISTRICTS_GEOJSON } from '../data/teteDistrictsGeoJson.ts';
import { TETE_DISTRICTS_DATA } from '../data/teteData.ts';
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
  // Tete Detailed View props
  viewMode?: ViewMode;
  selectedDistrictId?: string | null;
  hoveredDistrictId?: string | null;
  onSelectDistrict?: (id: string | null) => void;
  onHoverDistrict?: (id: string | null, mouseEvent?: { x: number; y: number }) => void;
  onReturnToNational?: () => void;
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

interface DistrictMeshGroup {
  id: string; // CodDist e.g. '0704'
  name: string;
  group: THREE.Group;
  meshes: THREE.Mesh[];
  edgeLines: THREE.LineSegments[];
  centroid: [number, number, number];
  targetLift: number;
  currentLift: number;
  labelSprite?: THREE.Sprite;
}

const DISTRICT_COLORS: Record<string, string> = {
  '0701': '#ea580c', // Mutarara
  '0702': '#d97706', // Dôa
  '0703': '#b45309', // Changara
  '0704': '#f97316', // Moatize
  '0705': '#ef4444', // Cidade de Tete (Capital)
  '0707': '#0284c7', // Cahora Bassa
  '0708': '#0891b2', // Magoé
  '0709': '#16a34a', // Tsangano
  '0710': '#65a30d', // Chiúta
  '0711': '#0d9488', // Marávia
  '0712': '#4f46e5', // Zumbu
  '0713': '#059669', // Angónia
  '0714': '#8b5cf6', // Macanga
  '0715': '#7c3aed', // Chifunde
};

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
  viewMode = 'national',
  selectedDistrictId = null,
  hoveredDistrictId = null,
  onSelectDistrict,
  onHoverDistrict,
  onReturnToNational,
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
    viewMode,
    selectedDistrictId,
    hoveredDistrictId,
    onSelectProvince,
    onHoverProvince,
    onSelectDistrict,
    onHoverDistrict,
    onReturnToNational,
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
    stateRef.current.viewMode = viewMode;
    stateRef.current.selectedDistrictId = selectedDistrictId;
    stateRef.current.hoveredDistrictId = hoveredDistrictId;
    stateRef.current.onSelectProvince = onSelectProvince;
    stateRef.current.onHoverProvince = onHoverProvince;
    stateRef.current.onSelectDistrict = onSelectDistrict;
    stateRef.current.onHoverDistrict = onHoverDistrict;
    stateRef.current.onReturnToNational = onReturnToNational;
    stateRef.current.onResetCameraPreset = onResetCameraPreset;
  }, [
    selectedProvinceId,
    hoveredProvinceId,
    thematicMetric,
    is3DExtruded,
    lightingTheme,
    showLabels,
    cameraPreset,
    viewMode,
    selectedDistrictId,
    hoveredDistrictId,
    onSelectProvince,
    onHoverProvince,
    onSelectDistrict,
    onHoverDistrict,
    onReturnToNational,
    onResetCameraPreset,
  ]);

  const sceneContextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    provinceGroups: Map<string, ProvinceMeshGroup>;
    districtGroups: Map<string, DistrictMeshGroup>;
    teteDistrictsRootGroup: THREE.Group;
    interactiveMeshes: THREE.Mesh[];
    keyLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
    ambientLight: THREE.AmbientLight;
    oceanMesh: THREE.Mesh;
    cameraTransitionTarget: { pos: THREE.Vector3; look: THREE.Vector3 } | null;
  } | null>(null);

  // Helper to generate crisp 2D canvas label sprites for provinces
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

  // Helper to generate district label sprite
  const createDistrictLabelSprite = (name: string, info: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
    ctx.lineWidth = 4;
    const r = 20, x = 12, y = 12, w = 360, h = 104;
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

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name.toUpperCase(), 192, 58);

    ctx.fillStyle = '#fb923c';
    ctx.font = '500 22px "Inter", sans-serif';
    ctx.fillText(info, 192, 92);

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
    sprite.scale.set(2.4, 0.8, 1);
    return sprite;
  };

  // Re-build/update national province meshes
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
          type: 'province',
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
      });

      // 3D Province Floating Label
      const capital = provData ? provData.capital : 'Capital';
      const labelSprite = createLabelSprite(provName, capital);
      if (labelSprite) {
        labelSprite.position.set(centroid[0], extrudeHeight + 0.8, centroid[2]);
        labelSprite.visible = stateRef.current.showLabels && stateRef.current.viewMode === 'national';
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

    updateInteractiveMeshList();
  };

  // Build/update Tete districts 3D geometries
  const updateDistrictMeshes = () => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    const { teteDistrictsRootGroup, districtGroups } = ctx;

    // Clear previous district meshes
    districtGroups.forEach((dg) => {
      teteDistrictsRootGroup.remove(dg.group);
      dg.meshes.forEach((m) => {
        m.geometry.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else m.material.dispose();
      });
      dg.edgeLines.forEach((l) => {
        l.geometry.dispose();
        if (Array.isArray(l.material)) l.material.forEach((mat) => mat.dispose());
        else l.material.dispose();
      });
      if (dg.labelSprite) {
        dg.labelSprite.material.map?.dispose();
        dg.labelSprite.material.dispose();
      }
    });
    districtGroups.clear();

    const districtExtrudeHeight = 0.55;

    TETE_DISTRICTS_GEOJSON.features.forEach((feature) => {
      const code = String(feature.properties.CodDist || feature.id || '');
      const distName = feature.properties.Distrito || 'Distrito';
      const distData = TETE_DISTRICTS_DATA[code];

      const shapes = convertGeometryToShapes(feature.geometry);
      if (shapes.length === 0) return;

      const districtGroup = new THREE.Group();
      districtGroup.name = `district_group_${code}`;

      const { centroid } = computeFeatureCentroidAndBounds(feature);
      const baseColor = DISTRICT_COLORS[code] || '#ea580c';

      const meshes: THREE.Mesh[] = [];
      const edgeLines: THREE.LineSegments[] = [];

      shapes.forEach((shape, index) => {
        const extrudeSettings: THREE.ExtrudeGeometryOptions = {
          steps: 1,
          depth: districtExtrudeHeight,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.03,
          bevelOffset: 0,
          bevelSegments: 2,
        };

        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geom.computeVertexNormals();

        const material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(baseColor),
          roughness: 0.3,
          metalness: 0.1,
          clearcoat: 0.2,
          clearcoatRoughness: 0.15,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });

        const mesh = new THREE.Mesh(geom, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.rotation.x = -Math.PI / 2;
        mesh.userData = {
          type: 'district',
          districtCode: code,
          districtName: distName,
          baseColor: baseColor,
          index,
        };

        const edgesGeom = new THREE.EdgesGeometry(geom, 26);
        const lineMat = new THREE.LineBasicMaterial({
          color: new THREE.Color('#ffffff'),
          transparent: true,
          opacity: 0.85,
          linewidth: 1.5,
        });
        const edgeLine = new THREE.LineSegments(edgesGeom, lineMat);
        edgeLine.rotation.x = -Math.PI / 2;
        edgeLine.position.y = 0.005;

        districtGroup.add(mesh);
        districtGroup.add(edgeLine);

        meshes.push(mesh);
        edgeLines.push(edgeLine);
      });

      // 3D District Label
      const infoText = distData ? `${new Intl.NumberFormat('pt-MZ').format(distData.population2017)} hab.` : distName;
      const labelSprite = createDistrictLabelSprite(distName, infoText);
      if (labelSprite) {
        labelSprite.position.set(centroid[0], districtExtrudeHeight + 0.65, centroid[2]);
        labelSprite.visible = stateRef.current.showLabels && stateRef.current.viewMode === 'tete-detailed';
        districtGroup.add(labelSprite);
      }

      teteDistrictsRootGroup.add(districtGroup);

      districtGroups.set(code, {
        id: code,
        name: distName,
        group: districtGroup,
        meshes,
        edgeLines,
        centroid,
        targetLift: 0,
        currentLift: 0,
        labelSprite,
      });
    });

    updateInteractiveMeshList();
  };

  // Syncs interactiveMeshes with current active mode
  const updateInteractiveMeshList = () => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    ctx.interactiveMeshes.length = 0;

    if (stateRef.current.viewMode === 'tete-detailed') {
      ctx.districtGroups.forEach((dg) => {
        dg.meshes.forEach((m) => ctx.interactiveMeshes.push(m));
      });
    } else {
      ctx.provinceGroups.forEach((pg) => {
        pg.meshes.forEach((m) => ctx.interactiveMeshes.push(m));
      });
    }
  };

  // Update theme colors and lighting
  const updateLightingAndAtmosphere = () => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    const { scene, keyLight, hemiLight, ambientLight, oceanMesh } = ctx;
    const theme = stateRef.current.lightingTheme;

    switch (theme) {
      case 'day':
        scene.background = new THREE.Color('#0f172a');
        scene.fog = new THREE.FogExp2(0x0f172a, 0.012);
        keyLight.color.set('#fffbeb');
        keyLight.intensity = 2.4;
        hemiLight.color.set('#93c5fd');
        hemiLight.groundColor.set('#1e293b');
        hemiLight.intensity = 1.0;
        ambientLight.intensity = 0.5;
        (oceanMesh.material as THREE.MeshPhysicalMaterial).color.set('#0c4a6e');
        break;

      case 'night':
        scene.background = new THREE.Color('#030712');
        scene.fog = new THREE.FogExp2(0x030712, 0.015);
        keyLight.color.set('#38bdf8');
        keyLight.intensity = 1.8;
        hemiLight.color.set('#1e3a8a');
        hemiLight.groundColor.set('#030712');
        hemiLight.intensity = 0.6;
        ambientLight.intensity = 0.25;
        (oceanMesh.material as THREE.MeshPhysicalMaterial).color.set('#021a36');
        break;

      case 'studio':
        scene.background = new THREE.Color('#1e293b');
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
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 4;
    controls.maxDistance = 90;
    controls.target.set(0, 0, 0);

    // Lighting Rig
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

    // Ocean base platform & Bathymetric grid
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
    const districtGroups = new Map<string, DistrictMeshGroup>();
    const interactiveMeshes: THREE.Mesh[] = [];

    // Root group for Tete districts
    const teteDistrictsRootGroup = new THREE.Group();
    teteDistrictsRootGroup.name = 'tete_districts_root';
    teteDistrictsRootGroup.visible = false;
    scene.add(teteDistrictsRootGroup);

    sceneContextRef.current = {
      scene,
      camera,
      renderer,
      controls,
      provinceGroups,
      districtGroups,
      teteDistrictsRootGroup,
      interactiveMeshes,
      keyLight,
      hemiLight,
      ambientLight,
      oceanMesh,
      cameraTransitionTarget: null,
    };

    renderer.compile(scene, camera);

    updateProvinceMeshes();
    updateDistrictMeshes();
    updateLightingAndAtmosphere();

    // Raycasting for interaction
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

      const dist = Math.hypot(clientX - pointerDownPos.x, clientY - pointerDownPos.y);
      if (dist > 5) {
        isDragging = true;
      }

      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      if (!isDragging) {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(sceneContextRef.current?.interactiveMeshes || [], false);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          renderer.domElement.style.cursor = 'pointer';

          if (hitMesh.userData.type === 'district') {
            const code = hitMesh.userData.districtCode;
            stateRef.current.onHoverDistrict?.(code, { x: clientX, y: clientY });
          } else {
            const code = hitMesh.userData.provinceCode;
            stateRef.current.onHoverProvince(code, { x: clientX, y: clientY });
          }
        } else {
          renderer.domElement.style.cursor = 'default';
          if (stateRef.current.viewMode === 'tete-detailed') {
            stateRef.current.onHoverDistrict?.(null);
          } else {
            stateRef.current.onHoverProvince(null);
          }
        }
      }
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX =
        'changedTouches' in e && e.changedTouches[0]
          ? e.changedTouches[0].clientX
          : 'clientX' in e
            ? (e as MouseEvent).clientX
            : pointerDownPos.x;
      const clientY =
        'changedTouches' in e && e.changedTouches[0]
          ? e.changedTouches[0].clientY
          : 'clientY' in e
            ? (e as MouseEvent).clientY
            : pointerDownPos.y;

      const dist = Math.hypot(clientX - pointerDownPos.x, clientY - pointerDownPos.y);

      if (dist < 6) {
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(sceneContextRef.current?.interactiveMeshes || [], false);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          if (hitMesh.userData.type === 'district') {
            const code = hitMesh.userData.districtCode;
            stateRef.current.onSelectDistrict?.(code);
          } else {
            const code = hitMesh.userData.provinceCode;
            stateRef.current.onSelectProvince(code);
          }
        } else {
          if (stateRef.current.viewMode === 'tete-detailed') {
            stateRef.current.onSelectDistrict?.(null);
          } else {
            stateRef.current.onSelectProvince(null);
          }
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

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth camera damping
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

      const isTeteDetailed = stateRef.current.viewMode === 'tete-detailed';

      if (!isTeteDetailed) {
        // Normal national mode elevation and highlights
        const currentSelected = stateRef.current.selectedProvinceId;
        const currentHovered = stateRef.current.hoveredProvinceId;

        provinceGroups.forEach((pg, code) => {
          const isSelected = currentSelected === code;
          const isHovered = currentHovered === code;

          pg.targetLift = isSelected ? 0.45 : isHovered ? 0.25 : 0;
          pg.currentLift = THREE.MathUtils.damp(pg.currentLift, pg.targetLift, 8.0, delta);
          pg.group.position.y = pg.currentLift;

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
      } else {
        // Tete detailed mode: animate district meshes
        const currentSelectedDist = stateRef.current.selectedDistrictId;
        const currentHoveredDist = stateRef.current.hoveredDistrictId;

        districtGroups.forEach((dg, code) => {
          const isSelected = currentSelectedDist === code;
          const isHovered = currentHoveredDist === code;

          dg.targetLift = isSelected ? 0.45 : isHovered ? 0.25 : 0;
          dg.currentLift = THREE.MathUtils.damp(dg.currentLift, dg.targetLift, 8.0, delta);
          dg.group.position.y = dg.currentLift;

          dg.meshes.forEach((mesh) => {
            const mat = mesh.material as THREE.MeshPhysicalMaterial;
            if (isSelected) {
              mat.emissive.set('#ea580c');
              mat.emissiveIntensity = 0.55;
            } else if (isHovered) {
              mat.emissive.set('#ffffff');
              mat.emissiveIntensity = 0.35;
            } else {
              mat.emissive.set('#000000');
              mat.emissiveIntensity = 0;
            }
          });

          dg.edgeLines.forEach((line) => {
            const lineMat = line.material as THREE.LineBasicMaterial;
            if (isSelected) {
              lineMat.color.set('#fdba74');
              lineMat.opacity = 1.0;
            } else if (isHovered) {
              lineMat.color.set('#ffffff');
              lineMat.opacity = 1.0;
            } else {
              lineMat.color.set('#ffffff');
              lineMat.opacity = 0.75;
            }
          });
        });
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

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
  }, [geoJson]);

  // Handle ViewMode switches (National vs Tete Detailed)
  useEffect(() => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    const { provinceGroups, teteDistrictsRootGroup, districtGroups } = ctx;
    const isTeteDetailed = viewMode === 'tete-detailed';

    if (isTeteDetailed) {
      // Show Tete's 14 district meshes
      teteDistrictsRootGroup.visible = true;

      // Hide province '07' (Tete) mesh so districts replace it cleanly
      const tetePg = provinceGroups.get('07');
      if (tetePg) {
        tetePg.group.visible = false;
      }

      // Dim neighboring provinces to provide realistic geographic context
      provinceGroups.forEach((pg, code) => {
        if (code !== '07') {
          pg.group.visible = true;
          pg.meshes.forEach((mesh) => {
            const mat = mesh.material as THREE.MeshPhysicalMaterial;
            mat.transparent = true;
            mat.opacity = 0.28;
            mat.roughness = 0.7;
          });
          pg.edgeLines.forEach((line) => {
            (line.material as THREE.LineBasicMaterial).opacity = 0.25;
          });
          if (pg.labelSprite) {
            pg.labelSprite.visible = false;
          }
        }
      });

      // Show district labels if enabled
      districtGroups.forEach((dg) => {
        if (dg.labelSprite) {
          dg.labelSprite.visible = showLabels;
        }
      });

      // Fly camera close into Tete
      ctx.cameraTransitionTarget = {
        pos: new THREE.Vector3(-4.6, 9.5, 1.8),
        look: new THREE.Vector3(-4.6, 0.4, -6.8),
      };
    } else {
      // National overview mode
      teteDistrictsRootGroup.visible = false;

      // Restore all province meshes with full opacity
      provinceGroups.forEach((pg) => {
        pg.group.visible = true;
        pg.meshes.forEach((mesh) => {
          const mat = mesh.material as THREE.MeshPhysicalMaterial;
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.roughness = 0.35;
        });
        pg.edgeLines.forEach((line) => {
          (line.material as THREE.LineBasicMaterial).opacity = 0.75;
        });
        if (pg.labelSprite) {
          pg.labelSprite.visible = showLabels;
        }
      });
    }

    updateInteractiveMeshList();
  }, [viewMode, showLabels]);

  // Focus on district when selected in detailed mode
  useEffect(() => {
    const ctx = sceneContextRef.current;
    if (!ctx || viewMode !== 'tete-detailed') return;

    if (selectedDistrictId) {
      const dg = ctx.districtGroups.get(selectedDistrictId);
      if (dg) {
        const [dx, dy, dz] = dg.centroid;
        ctx.cameraTransitionTarget = {
          pos: new THREE.Vector3(dx, 5.5, dz + 4.2),
          look: new THREE.Vector3(dx, dy, dz),
        };
      }
    } else {
      // Center back on Tete province
      ctx.cameraTransitionTarget = {
        pos: new THREE.Vector3(-4.6, 9.5, 1.8),
        look: new THREE.Vector3(-4.6, 0.4, -6.8),
      };
    }
  }, [selectedDistrictId, viewMode]);

  // Geometry rebuild on thematic metric / extrusion changes (national mode)
  useEffect(() => {
    updateProvinceMeshes();
  }, [thematicMetric, is3DExtruded]);

  // Lighting theme update
  useEffect(() => {
    updateLightingAndAtmosphere();
  }, [lightingTheme]);

  // Camera presets navigation (in national mode)
  useEffect(() => {
    const ctx = sceneContextRef.current;
    if (!ctx || viewMode === 'tete-detailed') return;

    if (selectedProvinceId) {
      const pg = ctx.provinceGroups.get(selectedProvinceId);
      if (pg) {
        const [cx, cy, cz] = pg.centroid;
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
      ctx.cameraTransitionTarget = {
        pos: new THREE.Vector3(3, 20, -6),
        look: new THREE.Vector3(3, 0, -11),
      };
    } else if (cameraPreset === 'centro') {
      ctx.cameraTransitionTarget = {
        pos: new THREE.Vector3(0, 20, 10),
        look: new THREE.Vector3(0, 0, 0),
      };
    } else if (cameraPreset === 'sul') {
      ctx.cameraTransitionTarget = {
        pos: new THREE.Vector3(-2, 16, 22),
        look: new THREE.Vector3(-2, 0, 13),
      };
    }
  }, [selectedProvinceId, cameraPreset, viewMode]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    />
  );
};
