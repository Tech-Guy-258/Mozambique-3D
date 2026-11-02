import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  GeoJSONFeatureCollection,
  ThematicMetric,
  LightingTheme,
  CameraPreset,
  ViewMode,
  TransportLayersState,
  TransportRoute,
  TransportNode,
} from '../types/index.ts';
import { PROVINCES_DATA } from '../data/provincesData.ts';
import { MOZAMBIQUE_DISTRICTS_GEOJSON } from '../data/allDistrictsGeoJson.ts';
import { ALL_DISTRICTS_DATA } from '../data/allDistrictsData.ts';
import {
  TRANSPORT_NODES,
  TRANSPORT_LAYERS_CONFIG,
  DEFAULT_TRANSPORT_LAYERS,
} from '../data/transportData.ts';
import {
  convertGeometryToShapes,
  computeFeatureCentroidAndBounds,
  MOZ_CENTER_LON,
  MOZ_CENTER_LAT,
  GEO_SCALE,
} from '../utils/geoTo3d.ts';
import { getThematicColor, getProvinceExtrusionHeight } from '../utils/thematicColor.ts';
import { buildPatrioticElements, PatrioticSceneElements } from '../utils/patriotic3d.ts';

export interface PanAction {
  id: number;
  type: 'up' | 'down' | 'left' | 'right' | 'in' | 'out' | 'recenter';
}

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
  // Provincial Detailed View props
  viewMode?: ViewMode;
  detailedProvinceId?: string | null;
  selectedDistrictId?: string | null;
  hoveredDistrictId?: string | null;
  onSelectDistrict?: (id: string | null) => void;
  onHoverDistrict?: (id: string | null, mouseEvent?: { x: number; y: number }) => void;
  onReturnToNational?: () => void;
  panAction?: PanAction | null;
  isDrawerOpen?: boolean;
  // Transport Network props
  transportLayers?: TransportLayersState;
  selectedTransportItem?: { type: 'route' | 'node'; item: TransportRoute | TransportNode } | null;
  hoveredTransportItem?: { type: 'route' | 'node'; item: TransportRoute | TransportNode } | null;
  onSelectTransportItem?: (item: { type: 'route' | 'node'; item: TransportRoute | TransportNode } | null) => void;
  onHoverTransportItem?: (item: { type: 'route' | 'node'; item: TransportRoute | TransportNode } | null, mouseEvent?: { x: number; y: number }) => void;
  focusTransportCoords?: [number, number] | null;
  // Patriotic Landmarks props
  onSelectPatrioticLandmark?: (landmarkId: string) => void;
  selectedPatrioticLandmarkId?: string | null;
}

interface ProvinceMeshGroup {
  id: string;
  name: string;
  group: THREE.Group;
  meshes: THREE.Mesh[];
  edgeLines: THREE.LineSegments[];
  centroid: [number, number, number];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
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
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
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

const VIBRANT_DISTRICT_PALETTE = [
  '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899',
  '#eab308', '#06b6d4', '#ef4444', '#14b8a6', '#6366f1',
  '#f43f5e', '#84cc16', '#a855f7', '#0284c7', '#d97706',
  '#059669', '#7c3aed', '#db2777', '#ca8a04', '#0891b2',
  '#dc2626', '#0d9488', '#4f46e5', '#e11d48'
];

function getDistrictColor(code: string, index: number): string {
  if (DISTRICT_COLORS[code]) return DISTRICT_COLORS[code];
  return VIBRANT_DISTRICT_PALETTE[index % VIBRANT_DISTRICT_PALETTE.length];
}

interface TransportMeshEntry {
  id: string;
  type: 'route' | 'node';
  data: TransportRoute | TransportNode;
  group: THREE.Group;
  primaryMesh: THREE.Mesh;
  glowMesh?: THREE.Mesh;
  bedMesh?: THREE.Mesh;
  ringMesh?: THREE.Mesh;
  labelSprite?: THREE.Sprite;
  shieldSprite?: THREE.Sprite;
  pulsePoints?: {
    mesh: THREE.Mesh;
    curve: THREE.CatmullRomCurve3;
    progress: number;
    speed: number;
  }[];
  infrastructureMeshes?: THREE.Object3D[];
}

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
  detailedProvinceId = null,
  selectedDistrictId = null,
  hoveredDistrictId = null,
  onSelectDistrict,
  onHoverDistrict,
  onReturnToNational,
  panAction = null,
  isDrawerOpen = false,
  transportLayers = DEFAULT_TRANSPORT_LAYERS,
  selectedTransportItem = null,
  hoveredTransportItem = null,
  onSelectTransportItem,
  onHoverTransportItem,
  focusTransportCoords = null,
  onSelectPatrioticLandmark,
  selectedPatrioticLandmarkId = null,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

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
    detailedProvinceId,
    selectedDistrictId,
    hoveredDistrictId,
    isDrawerOpen,
    onSelectProvince,
    onHoverProvince,
    onSelectDistrict,
    onHoverDistrict,
    onReturnToNational,
    onResetCameraPreset,
    transportLayers,
    selectedTransportItem,
    hoveredTransportItem,
    onSelectTransportItem,
    onHoverTransportItem,
    focusTransportCoords,
    onSelectPatrioticLandmark,
    selectedPatrioticLandmarkId,
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
    stateRef.current.detailedProvinceId = detailedProvinceId;
    stateRef.current.selectedDistrictId = selectedDistrictId;
    stateRef.current.hoveredDistrictId = hoveredDistrictId;
    stateRef.current.isDrawerOpen = isDrawerOpen;
    stateRef.current.onSelectProvince = onSelectProvince;
    stateRef.current.onHoverProvince = onHoverProvince;
    stateRef.current.onSelectDistrict = onSelectDistrict;
    stateRef.current.onHoverDistrict = onHoverDistrict;
    stateRef.current.onReturnToNational = onReturnToNational;
    stateRef.current.onResetCameraPreset = onResetCameraPreset;
    stateRef.current.transportLayers = transportLayers;
    stateRef.current.selectedTransportItem = selectedTransportItem;
    stateRef.current.hoveredTransportItem = hoveredTransportItem;
    stateRef.current.onSelectTransportItem = onSelectTransportItem;
    stateRef.current.onHoverTransportItem = onHoverTransportItem;
    stateRef.current.focusTransportCoords = focusTransportCoords;
    stateRef.current.onSelectPatrioticLandmark = onSelectPatrioticLandmark;
    stateRef.current.selectedPatrioticLandmarkId = selectedPatrioticLandmarkId;
  }, [
    selectedProvinceId,
    hoveredProvinceId,
    thematicMetric,
    is3DExtruded,
    lightingTheme,
    showLabels,
    cameraPreset,
    viewMode,
    detailedProvinceId,
    selectedDistrictId,
    hoveredDistrictId,
    isDrawerOpen,
    onSelectProvince,
    onHoverProvince,
    onSelectDistrict,
    onHoverDistrict,
    onReturnToNational,
    onResetCameraPreset,
    transportLayers,
    selectedTransportItem,
    hoveredTransportItem,
    onSelectTransportItem,
    onHoverTransportItem,
    focusTransportCoords,
    onSelectPatrioticLandmark,
    selectedPatrioticLandmarkId,
  ]);

  const sceneContextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    provinceGroups: Map<string, ProvinceMeshGroup>;
    districtGroups: Map<string, DistrictMeshGroup>;
    teteDistrictsRootGroup: THREE.Group;
    transportRootGroup: THREE.Group;
    transportItems: Map<string, TransportMeshEntry>;
    transportInteractiveMeshes: THREE.Mesh[];
    patrioticElements: PatrioticSceneElements;
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

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name.toUpperCase(), 256, 68);

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

    const { scene, provinceGroups } = ctx;

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

    geoJson.features.forEach((feature) => {
      const code = String(feature.properties.CodProv || feature.id || '01');
      const provName = feature.properties.Provincia || 'Província';
      const provData = PROVINCES_DATA[code];

      const shapes = convertGeometryToShapes(feature.geometry);
      if (shapes.length === 0) return;

      const provinceGroup = new THREE.Group();
      provinceGroup.name = `province_group_${code}`;

      const { centroid, bounds } = computeFeatureCentroidAndBounds(feature);
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
        bounds,
        baseElevation: 0,
        targetLift: 0,
        currentLift: 0,
        currentHeight: extrudeHeight,
        labelSprite,
      });
    });

    updateInteractiveMeshList();
  };

  // Build/update provincial districts 3D geometries for any selected province
  const updateDistrictMeshes = () => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    const { teteDistrictsRootGroup, districtGroups } = ctx;

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
    const isDetailed =
      stateRef.current.viewMode === 'province-detailed' ||
      stateRef.current.viewMode === 'tete-detailed';
    const targetProvId =
      stateRef.current.detailedProvinceId ||
      (stateRef.current.viewMode === 'tete-detailed' ? '07' : stateRef.current.selectedProvinceId || '07');

    const featuresToRender = MOZAMBIQUE_DISTRICTS_GEOJSON.features.filter(
      (feature) => String(feature.properties.CodProv || feature.properties.provinceCode) === targetProvId
    );

    featuresToRender.forEach((feature, index) => {
      const code = String(feature.properties.CodDist || feature.properties.code || feature.id || '');
      const distName = feature.properties.Distrito || feature.properties.name || 'Distrito';
      const distData = ALL_DISTRICTS_DATA[code];

      const shapes = convertGeometryToShapes(feature.geometry);
      if (shapes.length === 0) return;

      const districtGroup = new THREE.Group();
      districtGroup.name = `district_group_${code}`;

      const { centroid, bounds } = computeFeatureCentroidAndBounds(feature);
      const baseColor = getDistrictColor(code, index);

      const meshes: THREE.Mesh[] = [];
      const edgeLines: THREE.LineSegments[] = [];

      shapes.forEach((shape, sIdx) => {
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
          index: sIdx,
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

      const infoText = distData ? `${new Intl.NumberFormat('pt-MZ').format(distData.population2017)} hab.` : distName;
      const labelSprite = createDistrictLabelSprite(distName, infoText);
      if (labelSprite) {
        labelSprite.position.set(centroid[0], districtExtrudeHeight + 0.65, centroid[2]);
        labelSprite.visible = stateRef.current.showLabels && isDetailed;
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
        bounds,
        targetLift: 0,
        currentLift: 0,
        labelSprite,
      });
    });

    updateInteractiveMeshList();
  };

  // Helper to project lon/lat to 3D world coords
  const geoToWorld = (lon: number, lat: number, elev = 0.58): THREE.Vector3 => {
    return new THREE.Vector3(
      (lon - MOZ_CENTER_LON) * GEO_SCALE,
      elev,
      -(lat - MOZ_CENTER_LAT) * GEO_SCALE
    );
  };

  // Helper to generate crisp 2D canvas label sprite for transport hubs
  const createTransportLabelSprite = (text: string, subText: string, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    const r = 16, x = 8, y = 8, w = 240, h = 80;
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
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 44);

    ctx.fillStyle = color;
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText(subText, 128, 70);

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
    sprite.scale.set(1.8, 0.68, 1);
    return sprite;
  };



  // Re-build/update 3D transport network meshes (roads, railways, ports, airports, aerodromes)
  const updateTransportMeshes = () => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    const { transportRootGroup, transportItems, transportInteractiveMeshes } = ctx;

    // Clean up previous items
    transportItems.forEach((item) => {
      transportRootGroup.remove(item.group);
      item.group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        } else if (child instanceof THREE.Sprite) {
          child.material.map?.dispose();
          child.material.dispose();
        }
      });
    });
    transportItems.clear();
    transportInteractiveMeshes.length = 0;

    const layers = stateRef.current.transportLayers;
    const showLabels = stateRef.current.showLabels;

    // Estradas principais (EN), secundárias (R) e rede ferroviária (CFM) removidas do mapa 3D
    // O cálculo de itinerários e navegação rodoviária oficial opera no modo Google Estradas (Google Maps)

    // 2. Build Nodes (Ports, International Airports, National Airports, Aerodromes)
    TRANSPORT_NODES.forEach((node) => {
      if (!layers[node.layer]) return;

      const nodeGroup = new THREE.Group();
      nodeGroup.name = `node_${node.id}`;

      const worldPos = geoToWorld(node.coordinates[0], node.coordinates[1], 0.60);
      nodeGroup.position.copy(worldPos);

      let primaryMesh: THREE.Mesh;
      let ringMesh: THREE.Mesh | undefined;
      let labelSprite: THREE.Sprite | undefined;

      const conf = TRANSPORT_LAYERS_CONFIG[node.layer];
      const nodeColor = conf?.color || '#a855f7';

      if (node.layer === 'ports') {
        // Multi-part procedural Port model
        // 1. Quay Pier
        const quayGeom = new THREE.BoxGeometry(0.36, 0.08, 0.2);
        const quayMat = new THREE.MeshPhysicalMaterial({
          color: 0x1e293b,
          roughness: 0.4,
          metalness: 0.2,
        });
        const quayMesh = new THREE.Mesh(quayGeom, quayMat);
        quayMesh.position.y = 0.04;
        nodeGroup.add(quayMesh);

        // 2. Crane / Terminal Gantry
        const craneGeom = new THREE.BoxGeometry(0.12, 0.16, 0.1);
        const craneMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(nodeColor),
          roughness: 0.25,
          metalness: 0.6,
          clearcoat: 0.4,
        });
        const craneMesh = new THREE.Mesh(craneGeom, craneMat);
        craneMesh.position.set(-0.06, 0.16, 0);
        nodeGroup.add(craneMesh);

        // 3. Lighthouse Beacon
        const beaconGeom = new THREE.CylinderGeometry(0.02, 0.035, 0.26, 8);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          metalness: 0.5,
          roughness: 0.2,
        });
        const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
        beaconMesh.position.set(0.1, 0.21, 0);
        nodeGroup.add(beaconMesh);

        const lightGeom = new THREE.SphereGeometry(0.045, 8, 8);
        const lightMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(nodeColor),
        });
        const lightMesh = new THREE.Mesh(lightGeom, lightMat);
        lightMesh.position.set(0.1, 0.35, 0);
        nodeGroup.add(lightMesh);

        // 4. Water / Radar Ripple Ring
        const ringGeom = new THREE.RingGeometry(0.18, 0.28, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(nodeColor),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
        });
        ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.01;
        nodeGroup.add(ringMesh);

        // Collision hit mesh
        const hitGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.5, 12);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        primaryMesh = new THREE.Mesh(hitGeom, hitMat);
        primaryMesh.position.y = 0.25;
        nodeGroup.add(primaryMesh);

        // Label sprite
        labelSprite = createTransportLabelSprite(node.name, 'PORTO', nodeColor);
        if (labelSprite) {
          labelSprite.position.set(0, 0.62, 0);
          labelSprite.visible = showLabels;
          nodeGroup.add(labelSprite);
        }
      } else if (node.layer === 'airports') {
        const isIntl = node.category.toLowerCase().includes('internacional');
        // Multi-part procedural Airport (International or National)
        // 1. Asphalt Runway Strip
        const rwayGeom = new THREE.BoxGeometry(isIntl ? 0.65 : 0.48, 0.03, isIntl ? 0.14 : 0.11);
        const rwayMat = new THREE.MeshPhysicalMaterial({
          color: isIntl ? 0x1e293b : 0x334155,
          roughness: 0.3,
          metalness: 0.1,
        });
        const rwayMesh = new THREE.Mesh(rwayGeom, rwayMat);
        rwayMesh.rotation.y = isIntl ? 0.35 : -0.25;
        rwayMesh.position.y = 0.015;
        nodeGroup.add(rwayMesh);

        // 2. Runway Centerline Marking
        const lineGeom = new THREE.BoxGeometry(isIntl ? 0.52 : 0.38, 0.035, 0.02);
        const lineMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
        });
        const lineMesh = new THREE.Mesh(lineGeom, lineMat);
        lineMesh.rotation.y = isIntl ? 0.35 : -0.25;
        lineMesh.position.y = 0.032;
        nodeGroup.add(lineMesh);

        // 3. Control Tower
        const towerGeom = new THREE.CylinderGeometry(0.025, 0.045, isIntl ? 0.34 : 0.26, 12);
        const towerMat = new THREE.MeshPhysicalMaterial({
          color: 0xf1f5f9,
          roughness: 0.2,
          metalness: 0.2,
        });
        const towerMesh = new THREE.Mesh(towerGeom, towerMat);
        towerMesh.position.set(-0.2, 0.17, 0.1);
        nodeGroup.add(towerMesh);

        const radomeGeom = new THREE.SphereGeometry(isIntl ? 0.065 : 0.05, 12, 12);
        const radomeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(nodeColor),
          emissive: new THREE.Color(nodeColor),
          emissiveIntensity: 0.8,
        });
        const radomeMesh = new THREE.Mesh(radomeGeom, radomeMat);
        radomeMesh.position.set(-0.2, isIntl ? 0.36 : 0.28, 0.1);
        nodeGroup.add(radomeMesh);

        // 4. Radar Ring
        const ringGeom = new THREE.TorusGeometry(isIntl ? 0.24 : 0.18, 0.02, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(nodeColor),
          transparent: true,
          opacity: 0.65,
        });
        ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.02;
        nodeGroup.add(ringMesh);

        const hitGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.55, 12);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        primaryMesh = new THREE.Mesh(hitGeom, hitMat);
        primaryMesh.position.y = 0.28;
        nodeGroup.add(primaryMesh);

        labelSprite = createTransportLabelSprite(node.code, isIntl ? 'INTL' : 'ADM', nodeColor);
        if (labelSprite) {
          labelSprite.position.set(0, 0.62, 0);
          labelSprite.visible = showLabels;
          nodeGroup.add(labelSprite);
        }
      } else {
        // Aerodromes & Regional Airstrips (aerodromes)
        // 1. Dirt / compacted strip
        const rwayGeom = new THREE.BoxGeometry(0.38, 0.02, 0.09);
        const rwayMat = new THREE.MeshPhysicalMaterial({
          color: 0x92400e, // ochre
          roughness: 0.7,
        });
        const rwayMesh = new THREE.Mesh(rwayGeom, rwayMat);
        rwayMesh.rotation.y = 0.5;
        rwayMesh.position.y = 0.01;
        nodeGroup.add(rwayMesh);

        // 2. Windsock / Beacon mast
        const mastGeom = new THREE.CylinderGeometry(0.012, 0.018, 0.18, 8);
        const mastMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
        const mastMesh = new THREE.Mesh(mastGeom, mastMat);
        mastMesh.position.set(-0.12, 0.09, 0.06);
        nodeGroup.add(mastMesh);

        const tipGeom = new THREE.ConeGeometry(0.035, 0.08, 8);
        const tipMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(nodeColor),
        });
        const tipMesh = new THREE.Mesh(tipGeom, tipMat);
        tipMesh.position.set(-0.12, 0.2, 0.06);
        nodeGroup.add(tipMesh);

        // 3. Ground beacon ring
        const ringGeom = new THREE.RingGeometry(0.11, 0.16, 16);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(nodeColor),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
        });
        ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.015;
        nodeGroup.add(ringMesh);

        const hitGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.4, 10);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        primaryMesh = new THREE.Mesh(hitGeom, hitMat);
        primaryMesh.position.y = 0.2;
        nodeGroup.add(primaryMesh);

        labelSprite = createTransportLabelSprite(node.code, 'PISTA', nodeColor);
        if (labelSprite) {
          labelSprite.position.set(0, 0.48, 0);
          labelSprite.visible = showLabels;
          nodeGroup.add(labelSprite);
        }
      }

      primaryMesh.userData = {
        type: 'transport_node',
        node,
      };

      transportRootGroup.add(nodeGroup);
      transportInteractiveMeshes.push(primaryMesh);
      transportItems.set(node.id, {
        id: node.id,
        type: 'node',
        data: node,
        group: nodeGroup,
        primaryMesh,
        ringMesh,
        labelSprite,
      });
    });

    updateInteractiveMeshList();
  };

  // Sync interactiveMeshes with current viewMode and transport layers
  const updateInteractiveMeshList = () => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    ctx.interactiveMeshes.length = 0;

    // Transport network elements are always interactive
    ctx.transportInteractiveMeshes.forEach((m) => ctx.interactiveMeshes.push(m));

    // Patriotic landmark markers (Zumbo, Oceano Índico, Rovuma, Maputo)
    if (ctx.patrioticElements?.interactiveMeshes) {
      ctx.patrioticElements.interactiveMeshes.forEach((m) => ctx.interactiveMeshes.push(m));
    }

    const isDetailed =
      stateRef.current.viewMode === 'province-detailed' ||
      stateRef.current.viewMode === 'tete-detailed';

    if (isDetailed) {
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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
    camera.position.set(0, 32, 28);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err: any) {
      console.error('WebGL Renderer Error:', err);
      setWebglError(err?.message || 'WebGL não disponível no navegador.');
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.panSpeed = 1.25;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 3.5;
    controls.maxDistance = 95;
    controls.target.set(0, 0, 0);

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

    const teteDistrictsRootGroup = new THREE.Group();
    teteDistrictsRootGroup.name = 'tete_districts_root';
    teteDistrictsRootGroup.visible = false;
    scene.add(teteDistrictsRootGroup);

    const transportRootGroup = new THREE.Group();
    transportRootGroup.name = 'transport_root';
    scene.add(transportRootGroup);
    const transportItems = new Map<string, TransportMeshEntry>();
    const transportInteractiveMeshes: THREE.Mesh[] = [];

    // Patriotic 3D Background Elements (Compass Rose, Zumbo-Indico Arc, Beacons)
    const patrioticElements = buildPatrioticElements(scene);

    sceneContextRef.current = {
      scene,
      camera,
      renderer,
      controls,
      provinceGroups,
      districtGroups,
      teteDistrictsRootGroup,
      transportRootGroup,
      transportItems,
      transportInteractiveMeshes,
      patrioticElements,
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
    updateTransportMeshes();
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

          if (hitMesh.userData.type === 'patriotic_landmark') {
            stateRef.current.onHoverTransportItem?.(null);
            stateRef.current.onHoverProvince(null);
            stateRef.current.onHoverDistrict?.(null);
          } else if (hitMesh.userData.type === 'transport_route') {
            const route = hitMesh.userData.route as TransportRoute;
            stateRef.current.onHoverTransportItem?.({ type: 'route', item: route }, { x: clientX, y: clientY });
            stateRef.current.onHoverProvince(null);
            stateRef.current.onHoverDistrict?.(null);
          } else if (hitMesh.userData.type === 'transport_node') {
            const node = hitMesh.userData.node as TransportNode;
            stateRef.current.onHoverTransportItem?.({ type: 'node', item: node }, { x: clientX, y: clientY });
            stateRef.current.onHoverProvince(null);
            stateRef.current.onHoverDistrict?.(null);
          } else if (hitMesh.userData.type === 'district') {
            stateRef.current.onHoverTransportItem?.(null);
            const code = hitMesh.userData.districtCode;
            stateRef.current.onHoverDistrict?.(code, { x: clientX, y: clientY });
          } else {
            stateRef.current.onHoverTransportItem?.(null);
            const code = hitMesh.userData.provinceCode;
            stateRef.current.onHoverProvince(code, { x: clientX, y: clientY });
          }
        } else {
          renderer.domElement.style.cursor = 'default';
          stateRef.current.onHoverTransportItem?.(null);
          const isDetailed =
            stateRef.current.viewMode === 'province-detailed' ||
            stateRef.current.viewMode === 'tete-detailed';
          if (isDetailed) {
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
          if (hitMesh.userData.type === 'patriotic_landmark') {
            const landmarkId = hitMesh.userData.landmarkId;
            stateRef.current.onSelectPatrioticLandmark?.(landmarkId);
          } else if (hitMesh.userData.type === 'transport_route') {
            const route = hitMesh.userData.route as TransportRoute;
            stateRef.current.onSelectTransportItem?.({ type: 'route', item: route });
          } else if (hitMesh.userData.type === 'transport_node') {
            const node = hitMesh.userData.node as TransportNode;
            stateRef.current.onSelectTransportItem?.({ type: 'node', item: node });
          } else if (hitMesh.userData.type === 'district') {
            const code = hitMesh.userData.districtCode;
            stateRef.current.onSelectDistrict?.(code);
          } else {
            const code = hitMesh.userData.provinceCode;
            stateRef.current.onSelectProvince(code);
          }
        } else {
          const isDetailed =
            stateRef.current.viewMode === 'province-detailed' ||
            stateRef.current.viewMode === 'tete-detailed';
          if (isDetailed) {
            stateRef.current.onSelectDistrict?.(null);
          } else {
            stateRef.current.onSelectProvince(null);
          }
          stateRef.current.onSelectTransportItem?.(null);
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

    // Keyboard Pan & Zoom Support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      const ctx = sceneContextRef.current;
      if (!ctx) return;
      const { camera, controls } = ctx;
      const step = 2.8;

      if (e.key === 'ArrowUp') {
        controls.target.z -= step;
        camera.position.z -= step;
      } else if (e.key === 'ArrowDown') {
        controls.target.z += step;
        camera.position.z += step;
      } else if (e.key === 'ArrowLeft') {
        controls.target.x -= step;
        camera.position.x -= step;
      } else if (e.key === 'ArrowRight') {
        controls.target.x += step;
        camera.position.x += step;
      } else if (e.key === '+' || e.key === '=') {
        camera.position.lerp(controls.target, 0.2);
      } else if (e.key === '-' || e.key === '_') {
        const dir = camera.position.clone().sub(controls.target).normalize();
        camera.position.addScaledVector(dir, 3.5);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

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

      // Transport network animation & highlight
      const selTransport = stateRef.current.selectedTransportItem;
      const hovTransport = stateRef.current.hoveredTransportItem;

      transportItems.forEach((entry) => {
        const isSelected = selTransport?.item.id === entry.id;
        const isHovered = hovTransport?.item.id === entry.id;

        // Transport Node (Ports, Airports, Aerodromes)
        if (entry.ringMesh) {
          entry.ringMesh.rotation.z += delta * 0.75;
        }
        if (isSelected) {
          entry.group.scale.set(1.3, 1.3, 1.3);
        } else if (isHovered) {
          entry.group.scale.set(1.18, 1.18, 1.18);
        } else {
          entry.group.scale.set(1, 1, 1);
        }
      });

      const isDetailed =
        stateRef.current.viewMode === 'province-detailed' ||
        stateRef.current.viewMode === 'tete-detailed';

      if (!isDetailed) {
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

      // Update animated patriotic elements (pulse along Zumbo-Indico and Rovuma-Maputo arcs, pulsing rings)
      try {
        patrioticElements.update(delta, time * 0.001);
      } catch (err) {
        console.warn('Patriotic animation loop error:', err);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      domElement.removeEventListener('mousedown', onPointerDown);
      domElement.removeEventListener('mousemove', onPointerMove);
      domElement.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('touchstart', onPointerDown);
      domElement.removeEventListener('touchmove', onPointerMove);
      domElement.removeEventListener('touchend', onPointerUp);

      patrioticElements.dispose();
      controls.dispose();
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [geoJson]);

  // Helper to compute camera target and position keeping the feature 100% visible and unobstructed by info drawers
  const computeUnobstructedTarget = (
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    centroid: [number, number, number],
    panelWidthPx = 480,
    isDetailed = false
  ) => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerZ = (bounds.minZ + bounds.maxZ) / 2;
    const spanX = Math.max(bounds.maxX - bounds.minX, 0.4);
    const spanZ = Math.max(bounds.maxZ - bounds.minZ, 0.4);

    const isDrawerOpen = stateRef.current.isDrawerOpen;
    let offsetFraction = 0;
    let effectiveW = w;
    let effectiveH = Math.max(h - 140, 200);

    if (isDrawerOpen && w >= 640) {
      const actualPanelW = Math.min(panelWidthPx, w * 0.48);
      effectiveW = w - actualPanelW;
      // Object centers in unobstructed left-center area [0, effectiveW].
      // Distance from screen center to unobstructed center is actualPanelW / 2.
      // Offset fraction towards the left:
      offsetFraction = (actualPanelW / 2) / w;
    } else if (isDrawerOpen && w < 640) {
      effectiveH = Math.max(h * 0.48, 180);
    }

    const fovRad = (45 * Math.PI) / 180;
    const tanHalfFov = Math.tan(fovRad / 2);
    const pitchRad = (52 * Math.PI) / 180;

    // Generous margin so the entire boundary and 3D elevation fit comfortably
    const margin = 1.35;

    const reqDistX = (spanX * margin) / (2 * tanHalfFov * (effectiveW / h));
    const depthProj = spanZ * Math.sin(pitchRad) + 1.2 * Math.cos(pitchRad);
    const reqDistZ = (depthProj * margin) / (2 * tanHalfFov * (effectiveH / h));

    const minD = isDetailed ? 4.2 : 11.5;
    const dist = Math.max(reqDistX, reqDistZ, minD);

    const frustumWidth = 2 * dist * tanHalfFov * (w / h);
    const xOffsetWorld = offsetFraction * frustumWidth;

    return {
      pos: new THREE.Vector3(
        centerX + xOffsetWorld,
        0.4 + dist * Math.cos(pitchRad),
        centerZ + dist * Math.sin(pitchRad)
      ),
      look: new THREE.Vector3(centerX + xOffsetWorld, 0.4, centerZ),
    };
  };

  // Handle Pan and Zoom Actions via D-Pad and Keyboard (smooth screen-space movement)
  useEffect(() => {
    if (!panAction) return;
    const ctx = sceneContextRef.current;
    if (!ctx) return;
    const { camera, controls } = ctx;

    // Cancel automatic transition so user pan takes instant effect
    ctx.cameraTransitionTarget = null;

    // Camera basis vectors projected onto the horizontal ground plane
    const cameraRight = new THREE.Vector3();
    camera.matrix.extractBasis(cameraRight, new THREE.Vector3(), new THREE.Vector3());
    cameraRight.y = 0;
    cameraRight.normalize();

    const cameraForward = new THREE.Vector3();
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();

    const dist = camera.position.distanceTo(controls.target);
    const step = Math.max(1.2, dist * 0.12);

    const moveVec = new THREE.Vector3();
    if (panAction.type === 'up') {
      moveVec.addScaledVector(cameraForward, step);
    } else if (panAction.type === 'down') {
      moveVec.addScaledVector(cameraForward, -step);
    } else if (panAction.type === 'left') {
      moveVec.addScaledVector(cameraRight, -step);
    } else if (panAction.type === 'right') {
      moveVec.addScaledVector(cameraRight, step);
    } else if (panAction.type === 'in') {
      const dir = camera.position.clone().sub(controls.target);
      if (dir.length() > controls.minDistance + 0.8) {
        camera.position.addScaledVector(dir.normalize(), -Math.max(1.5, dist * 0.18));
      }
    } else if (panAction.type === 'out') {
      const dir = camera.position.clone().sub(controls.target);
      if (dir.length() < controls.maxDistance - 1) {
        camera.position.addScaledVector(dir.normalize(), Math.max(1.5, dist * 0.18));
      }
    } else if (panAction.type === 'recenter') {
      stateRef.current.onResetCameraPreset?.();
    }

    if (moveVec.lengthSq() > 0) {
      camera.position.add(moveVec);
      controls.target.add(moveVec);
    }
    controls.update();
  }, [panAction]);

  // Handle ViewMode switches (National vs Provincial Detailed)
  // Ensures the province and all its districts are 100% visible and NOT obstructed by the right panel
  useEffect(() => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    const { provinceGroups, teteDistrictsRootGroup, districtGroups } = ctx;
    const isDetailed = viewMode === 'province-detailed' || viewMode === 'tete-detailed';
    const targetProvId =
      detailedProvinceId ||
      (viewMode === 'tete-detailed' ? '07' : selectedProvinceId || '07');

    if (isDetailed) {
      // Rebuild 3D district geometries for the target province
      updateDistrictMeshes();
      teteDistrictsRootGroup.visible = true;

      // Hide the selected province's national mesh so only its 3D districts are shown
      provinceGroups.forEach((pg, code) => {
        if (code === targetProvId) {
          pg.group.visible = false;
        } else {
          // Other provinces provide geographic context around the focused province
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

      districtGroups.forEach((dg) => {
        if (dg.labelSprite) {
          dg.labelSprite.visible = showLabels;
        }
      });

      // Calculate the comprehensive bounding box and centroid of this province's districts
      let pMinX = Infinity;
      let pMaxX = -Infinity;
      let pMinZ = Infinity;
      let pMaxZ = -Infinity;

      districtGroups.forEach((dg) => {
        pMinX = Math.min(pMinX, dg.bounds.minX);
        pMaxX = Math.max(pMaxX, dg.bounds.maxX);
        pMinZ = Math.min(pMinZ, dg.bounds.minZ);
        pMaxZ = Math.max(pMaxZ, dg.bounds.maxZ);
      });

      if (!isFinite(pMinX)) {
        const pg = provinceGroups.get(targetProvId);
        if (pg) {
          pMinX = pg.bounds.minX;
          pMaxX = pg.bounds.maxX;
          pMinZ = pg.bounds.minZ;
          pMaxZ = pg.bounds.maxZ;
        }
      }

      const provBounds = { minX: pMinX, maxX: pMaxX, minZ: pMinZ, maxZ: pMaxZ };
      const provCentroid: [number, number, number] = [
        (pMinX + pMaxX) / 2,
        0.4,
        (pMinZ + pMaxZ) / 2,
      ];

      ctx.cameraTransitionTarget = computeUnobstructedTarget(provBounds, provCentroid, 500, false);
    } else {
      teteDistrictsRootGroup.visible = false;

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
  }, [viewMode, detailedProvinceId, showLabels]);

  // Focus on district when selected in detailed mode
  // Shifts camera target to keep the district 100% visible to the left of the right panel
  useEffect(() => {
    const ctx = sceneContextRef.current;
    const isDetailed = viewMode === 'province-detailed' || viewMode === 'tete-detailed';
    if (!ctx || !isDetailed) return;

    if (selectedDistrictId) {
      const dg = ctx.districtGroups.get(selectedDistrictId);
      if (dg && dg.bounds) {
        ctx.cameraTransitionTarget = computeUnobstructedTarget(dg.bounds, dg.centroid, 500, true);
        return;
      }
    }

    // When no district selected in detailed mode, re-frame entire province
    const targetProvId =
      detailedProvinceId ||
      (viewMode === 'tete-detailed' ? '07' : selectedProvinceId || '07');

    let pMinX = Infinity;
    let pMaxX = -Infinity;
    let pMinZ = Infinity;
    let pMaxZ = -Infinity;

    ctx.districtGroups.forEach((dg) => {
      pMinX = Math.min(pMinX, dg.bounds.minX);
      pMaxX = Math.max(pMaxX, dg.bounds.maxX);
      pMinZ = Math.min(pMinZ, dg.bounds.minZ);
      pMaxZ = Math.max(pMaxZ, dg.bounds.maxZ);
    });

    if (!isFinite(pMinX)) {
      const pg = ctx.provinceGroups.get(targetProvId);
      if (pg) {
        pMinX = pg.bounds.minX;
        pMaxX = pg.bounds.maxX;
        pMinZ = pg.bounds.minZ;
        pMaxZ = pg.bounds.maxZ;
      }
    }

    const provBounds = { minX: pMinX, maxX: pMaxX, minZ: pMinZ, maxZ: pMaxZ };
    const provCentroid: [number, number, number] = [
      (pMinX + pMaxX) / 2,
      0.4,
      (pMinZ + pMaxZ) / 2,
    ];

    ctx.cameraTransitionTarget = computeUnobstructedTarget(provBounds, provCentroid, 500, false);
  }, [selectedDistrictId, viewMode, detailedProvinceId, isDrawerOpen]);

  // Geometry rebuild on thematic metric / extrusion changes (national mode)
  useEffect(() => {
    updateProvinceMeshes();
  }, [thematicMetric, is3DExtruded]);

  // Lighting theme update
  useEffect(() => {
    updateLightingAndAtmosphere();
  }, [lightingTheme]);

  // Camera presets navigation (in national mode)
  // Shifts camera target when a province is selected so it is NEVER covered by the right drawer!
  useEffect(() => {
    const ctx = sceneContextRef.current;
    if (!ctx || viewMode === 'tete-detailed') return;

    if (selectedProvinceId) {
      const pg = ctx.provinceGroups.get(selectedProvinceId);
      if (pg && pg.bounds) {
        ctx.cameraTransitionTarget = computeUnobstructedTarget(pg.bounds, pg.centroid, 480, false);
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
  }, [selectedProvinceId, cameraPreset, viewMode, isDrawerOpen]);

  // Rebuild/toggle 3D transport network when layers or label visibility changes
  useEffect(() => {
    updateTransportMeshes();
  }, [transportLayers, showLabels]);

  // Focus on specific transport item coordinates when requested
  useEffect(() => {
    if (!focusTransportCoords) return;
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    const [lon, lat] = focusTransportCoords;
    const targetX = (lon - MOZ_CENTER_LON) * GEO_SCALE;
    const targetZ = -(lat - MOZ_CENTER_LAT) * GEO_SCALE;

    ctx.cameraTransitionTarget = {
      pos: new THREE.Vector3(targetX, 9.2, targetZ + 6.8),
      look: new THREE.Vector3(targetX, 0.6, targetZ),
    };
  }, [focusTransportCoords]);

  if (webglError) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950 text-white p-6 z-10">
        <div className="max-w-md p-6 bg-slate-900 border border-amber-500/50 rounded-2xl text-center space-y-3 shadow-2xl">
          <h3 className="text-lg font-bold text-amber-400">Suporte WebGL / Aceleração Gráfica Necessária</h3>
          <p className="text-xs text-slate-300">
            A visualização 3D requer aceleração gráfica WebGL ativa no navegador. Verifique se a aceleração de hardware está ativada nas configurações do seu navegador.
          </p>
          <span className="text-[10px] text-slate-500 font-mono block">Detalhes: {webglError}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    />
  );
};
