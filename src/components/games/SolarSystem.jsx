import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PLANETS } from '../../data/index.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import { readDiscoveryPassport, saveDiscoveryPassport, seededPlanetOptions, discoveredPlanetBadges, solarPassportAwardTransitions } from '../../data/solarDiscoveryPassport.js';
import { getOfflineVoiceClip } from '../../data/offlineVoice.js';

const PLANET_COLORS = {
  Mercury: 0x8c8c8c,
  Venus: 0xd89b44,
  Earth: 0x2f80ed,
  Mars: 0xc85237,
  Jupiter: 0xd7a46d,
  Saturn: 0xe8cc83,
  Uranus: 0x86dbe3,
  Neptune: 0x315be8,
  Pluto: 0xb8a58d,
};

const PLANET_SCALES = {
  Mercury: 0.58,
  Venus: 0.84,
  Earth: 0.92,
  Mars: 0.66,
  Jupiter: 1.72,
  Saturn: 1.48,
  Uranus: 1.08,
  Neptune: 1.04,
  Pluto: 0.5,
};

const PLANET_TEXTURE_PALETTES = {
  Mercury: ['#a7a9ad', '#666b75', '#d7d9dc'],
  Venus: ['#f6c66f', '#c77a35', '#ffe2a3'],
  Earth: ['#1478b8', '#0b426d', '#5ba85b'],
  Mars: ['#b74735', '#6b2526', '#e27c4d'],
  Jupiter: ['#d9a879', '#80533f', '#f0d2a8'],
  Saturn: ['#d7b779', '#866849', '#f5e4bd'],
  Uranus: ['#67c9d5', '#2f8b9b', '#baf5ef'],
  Neptune: ['#315be8', '#17328e', '#6aa4ff'],
  Pluto: ['#bd9c8e', '#675462', '#e5c8b3'],
};

const seededNoise = (seed) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

// Dispose every PBR texture, including the normal maps in the Blender assets.
const disposePlanetObject = (root) => {
  const textures = new Set();
  const materials = new Set();
  root.traverse((object) => {
    object.geometry?.dispose?.();
    for (const material of [object.material].flat().filter(Boolean)) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
};

const makePlanetTexture = (planetName) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const [base, deep, light] = PLANET_TEXTURE_PALETTES[planetName] || ['#64748b', '#1e293b', '#cbd5e1'];
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, light);
  gradient.addColorStop(0.48, base);
  gradient.addColorStop(1, deep);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const random = seededNoise(planetName.length * 71 + planetName.charCodeAt(0));
  if (['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(planetName)) {
    const bandColours = [light, base, deep, base, light];
    bandColours.forEach((colour, index) => {
      context.fillStyle = colour;
      context.globalAlpha = index % 2 ? 0.64 : 0.38;
      context.fillRect(0, 18 + index * 45, canvas.width, 24 + (index % 2) * 14);
    });
    context.globalAlpha = 0.18;
    for (let index = 0; index < 46; index += 1) {
      context.strokeStyle = index % 2 ? light : deep;
      context.lineWidth = 1 + random() * 4;
      context.beginPath();
      context.moveTo(0, 10 + index * 5.2);
      context.bezierCurveTo(150, 4 + index * 5.2, 330, 20 + index * 5.2, 512, 8 + index * 5.2);
      context.stroke();
    }
    if (planetName === 'Jupiter') {
      context.globalAlpha = 0.9;
      context.fillStyle = '#b84f43';
      context.beginPath();
      context.ellipse(382, 158, 40, 17, -0.1, 0, Math.PI * 2);
      context.fill();
    }
  } else if (planetName === 'Earth') {
    context.globalAlpha = 0.96;
    context.fillStyle = '#4e9e5f';
    [[88, 92, 56, 32], [155, 139, 26, 66], [277, 70, 68, 24], [328, 118, 46, 54], [422, 166, 52, 29]].forEach(([x, y, width, height]) => {
      context.beginPath();
      context.ellipse(x, y, width, height, random() * 0.7, 0, Math.PI * 2);
      context.fill();
    });
    context.fillStyle = '#f8fafc';
    context.globalAlpha = 0.55;
    [[120, 45, 50, 7], [242, 154, 72, 9], [391, 74, 45, 6], [444, 194, 32, 6]].forEach(([x, y, width, height]) => {
      context.beginPath();
      context.ellipse(x, y, width, height, -0.15, 0, Math.PI * 2);
      context.fill();
    });
  } else {
    context.globalAlpha = planetName === 'Mercury' || planetName === 'Mars' ? 0.46 : 0.24;
    const craterColour = planetName === 'Mercury' ? deep : '#3f1d2a';
    context.fillStyle = craterColour;
    for (let index = 0; index < 26; index += 1) {
      const x = random() * canvas.width;
      const y = random() * canvas.height;
      const radius = 2 + random() * (planetName === 'Mars' ? 8 : 13);
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = light;
      context.lineWidth = 1;
      context.stroke();
    }
    if (planetName === 'Venus') {
      context.globalAlpha = 0.25;
      context.strokeStyle = '#fff0bd';
      context.lineWidth = 12;
      for (let index = -1; index < 7; index += 1) {
        context.beginPath();
        context.arc(130 + index * 58, 118, 120, Math.PI * 1.08, Math.PI * 1.92);
        context.stroke();
      }
    }
  }
  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const makeOrbit = (radius, colour = 0x6b7ca8) => {
  const points = [];
  for (let index = 0; index <= 128; index += 1) {
    const angle = (index / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: colour,
    transparent: true,
    opacity: 0.2,
  });
  return new THREE.LineLoop(geometry, material);
};

const addPlanetTexture = (mesh, planetName, planetAnchor = mesh) => {
  if (planetName === 'Earth') {
    const land = new THREE.Mesh(
      new THREE.SphereGeometry(mesh.geometry.parameters.radius * 1.006, 24, 16, 0.3, 1.1, 0.8, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x52a95b, roughness: 0.9 }),
    );
    land.rotation.z = 0.45;
    mesh.add(land);
  }

  if (planetName === 'Saturn') {
    const rings = new THREE.Group();
    rings.rotation.x = Math.PI / 2.35;
    rings.rotation.z = -0.16;
    rings.userData.planetName = planetName;

    const ringDisc = new THREE.Mesh(
      new THREE.RingGeometry(mesh.geometry.parameters.radius * 1.35, mesh.geometry.parameters.radius * 2.05, 80),
      new THREE.MeshBasicMaterial({
        color: 0xf4dfad,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.78,
      }),
    );
    ringDisc.userData.planetName = planetName;
    rings.add(ringDisc);

    [1.42, 1.58, 1.78, 1.97].forEach((scale, index) => {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(mesh.geometry.parameters.radius * scale, 0.035 + index * 0.008, 8, 96),
        new THREE.MeshBasicMaterial({
          color: index % 2 ? 0xc8a968 : 0xffe7b5,
          transparent: true,
          opacity: 0.92,
        }),
      );
      band.userData.planetName = planetName;
      rings.add(band);
    });
    planetAnchor.add(rings);
    return rings;
  }
  return null;
};

const SolarOrrery = forwardRef(function SolarOrrery({ onSelect, paused, selectedPlanet }, ref) {
  const mountRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const pausedRef = useRef(paused);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const fitDistanceRef = useRef(40);
  const planetAnchorsRef = useRef(new Map());
  const selectedPlanetRef = useRef(selectedPlanet?.name || 'Earth');
  const focusedPlanetRef = useRef(selectedPlanet?.name || 'Earth');
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { selectedPlanetRef.current = selectedPlanet?.name || 'Earth'; }, [selectedPlanet]);


  const changeZoom = useCallback((scale) => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    const offset = camera.position.clone().sub(controls.target);
    const nextDistance = THREE.MathUtils.clamp(
      offset.length() * scale,
      controls.minDistance,
      controls.maxDistance,
    );
    offset.setLength(nextDistance);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  }, []);

  useImperativeHandle(ref, () => ({
    zoomIn: () => changeZoom(0.78),
    zoomOut: () => changeZoom(1.28),
    rotate: (axis, angle) => {
      const camera = cameraRef.current, controls = controlsRef.current;
      if (!camera || !controls) return;
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(axis === 'y' ? 0 : 1, axis === 'y' ? 1 : 0, 0), angle);
      camera.position.copy(controls.target).add(offset); controls.update();
    },
    resetView: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      focusedPlanetRef.current = null;
      cameraRef.current.position.set(0, -0.5 * fitDistanceRef.current, 0.87 * fitDistanceRef.current);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    },
    focusPlanet: (planetName) => {
      const anchor = planetAnchorsRef.current.get(planetName);
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!anchor || !camera || !controls) return;
      anchor.updateWorldMatrix(true, false);
      const target = new THREE.Vector3();
      anchor.getWorldPosition(target);
      const offset = camera.position.clone().sub(controls.target);
      const minFocusDistance = 1.8;
      const planetRadius = anchor.userData.planetRadius || 1;
      controls.minDistance = Math.max(0.8, planetRadius * 1.5);
      const distance = THREE.MathUtils.clamp(Math.max(planetRadius * (planetName === 'Saturn' ? 6 : 3.7), minFocusDistance), controls.minDistance, controls.maxDistance);
      offset.set(0.2, 0.15, 1);
      offset.setLength(distance);
      controls.target.copy(target);
      camera.position.copy(target).add(offset);
      focusedPlanetRef.current = planetName;
      controls.update();
    },
  }), [changeZoom]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const planetAnchors = planetAnchorsRef.current;
    let disposed = false;
    let loadedModels = 0;
    const loader = new GLTFLoader();
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.005);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(0, 0, 40);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      // Some low-end Android/WebView devices cannot create WebGL. Keep the
      // lesson usable through the planet list and fact panel instead of
      // leaving a blank screen.
      window.setTimeout(() => setWebglUnavailable(true), 0);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enabled = true;
    controls.touches.ONE = null;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controls.enableZoom = false;
    renderer.domElement.style.touchAction = 'pan-y';
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.5;
    controls.maxDistance = 72;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.78;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;
    cameraRef.current = camera;

    scene.add(new THREE.HemisphereLight(0xb8d9ff, 0x14203e, 1.05));
    scene.add(new THREE.AmbientLight(0x91b7ff, 0.32));
    // A soft camera-side fill keeps surface details legible while exploring.
    const inspectionLight = new THREE.DirectionalLight(0xe4f2ff, 2.6);
    inspectionLight.position.set(-3, 4, 6);
    inspectionLight.target.position.set(0, 0, -6);
    camera.add(inspectionLight, inspectionLight.target);
    scene.add(camera);
    const sunlight = new THREE.PointLight(0xffe7a3, 250, 100, 1.5);
    scene.add(sunlight);

    const sunGroup = new THREE.Group();
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0xffd45a }),
    );
    sun.userData.planetName = 'Sun';
    sunGroup.add(sun);
    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(2.65, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0xff9f1a, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    sunGroup.add(sunGlow);
    [2.95, 3.35].forEach((radius, index) => {
      const corona = new THREE.Mesh(
        new THREE.RingGeometry(radius, radius + 0.055, 64),
        new THREE.MeshBasicMaterial({ color: index ? 0xffd36e : 0xffa928, transparent: true, opacity: index ? 0.28 : 0.4, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      sunGroup.add(corona);
    });
    scene.add(sunGroup);

    const starPositions = [];
    for (let index = 0; index < 1400; index += 1) {
      const radius = 55 + ((index * 29) % 65);
      const theta = index * 2.39996;
      const phi = Math.acos(1 - 2 * ((index * 47) % 997) / 997);
      starPositions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      );
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starField = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.8 }),
    );
    scene.add(starField);

    const orbitGroups = [];
    const orbitLines = [];
    const clickableMeshes = [];
    const selectionRings = new Map();
    planetAnchors.clear();
    PLANETS.forEach((planet, index) => {
      const radius = 3.8 + index * 1.75;
      const orbitLine = makeOrbit(radius, PLANET_COLORS[planet.name]);
      scene.add(orbitLine);
      orbitLines.push(orbitLine);

      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.z = index * (Math.PI * 2 / PLANETS.length);
      const planetRadius = PLANET_SCALES[planet.name];
      const planetAnchor = new THREE.Group();
      planetAnchor.position.x = radius;
      planetAnchor.userData.planetName = planet.name;
      planetAnchor.userData.planetRadius = planetRadius;
      const texture = makePlanetTexture(planet.name);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(planetRadius, 40, 28),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: texture,
          // The lighting is intentionally gentle for touch devices. A small
          // self-lit contribution keeps the night-facing side readable (and
          // prevents Saturn disappearing behind its ring plane) without
          // flattening the 3D shading.
          emissive: PLANET_COLORS[planet.name],
          emissiveIntensity: planet.name === 'Saturn' ? 0.16 : 0.1,
          roughness: planet.name === 'Earth' ? 0.68 : 0.88,
          metalness: 0.02,
        }),
      );
      mesh.rotation.z = planet.name === 'Uranus' ? Math.PI / 2 : 0.12;
      mesh.userData.planetName = planet.name;
      planetAnchor.add(mesh);
      const rings = addPlanetTexture(mesh, planet.name, planetAnchor);
      if (['Earth', 'Venus', 'Uranus', 'Neptune'].includes(planet.name)) {
        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(planetRadius * 1.08, 32, 20),
          new THREE.MeshBasicMaterial({ color: PLANET_COLORS[planet.name], transparent: true, opacity: planet.name === 'Earth' ? 0.14 : 0.1, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }),
        );
        planetAnchor.add(atmosphere);
      }
      const selectionRing = new THREE.Mesh(
        new THREE.RingGeometry(planetRadius * 1.38, planetRadius * 1.4, 64),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      selectionRing.userData.planetName = planet.name;
      selectionRing.visible = planet.name === selectedPlanetRef.current;
      planetAnchor.add(selectionRing);
      selectionRings.set(planet.name, selectionRing);
      // Give small planets and ringed worlds a generous, invisible touch
      // target. The visible sphere should never be the only way to select it.
      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(planetRadius * 2.2, 1.05), 12, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      hitMesh.userData.planetName = planet.name;
      planetAnchor.add(hitMesh);
      orbitGroup.add(planetAnchor);
      orbitGroup.userData.speed = 0.000025 + (PLANETS.length - index) * 0.000003;
      orbitGroup.userData.mesh = mesh;
      scene.add(orbitGroup);
      orbitGroups.push(orbitGroup);
      clickableMeshes.push(hitMesh, mesh, ...mesh.children, ...(rings?.children || []));
      planetAnchors.set(planet.name, planetAnchor);

      // Keep the current illustrated sphere usable until its local GLB is ready.
      // A failed asset never removes the planet, hit target or lesson controls.
      loader.load(`/models/${planet.name==='Earth'?'solar-v2':'solar-v1'}/${planet.name.toLowerCase()}.glb`, (gltf) => {
        if (disposed) { disposePlanetObject(gltf.scene); return; }
        const model = gltf.scene;
        model.traverse((object) => {
          object.userData.planetName = planet.name;
          if (object.isMesh) clickableMeshes.push(object);
        });
        const retired = new Set([mesh, ...mesh.children, ...(rings?.children || [])]);
        for (let i = clickableMeshes.length - 1; i >= 0; i -= 1) {
          if (retired.has(clickableMeshes[i])) clickableMeshes.splice(i, 1);
        }
        planetAnchor.remove(mesh);
        disposePlanetObject(mesh);
        if (rings) { planetAnchor.remove(rings); disposePlanetObject(rings); }
        const tilt = new THREE.Group();
        tilt.rotation.x = planet.name === 'Saturn' ? 0.48 : 0;
        tilt.rotation.z = planet.name === 'Uranus' ? 1.7 : planet.name === 'Earth' ? 0.41 : 0.08;
        model.scale.setScalar(planetRadius);
        tilt.add(model);
        planetAnchor.add(tilt);
        orbitGroup.userData.mesh = model;
        loadedModels += 1;
        mount.dataset.planetModels = String(loadedModels);
      }, undefined, () => {
        if (!disposed) mount.dataset.planetModelFallback = 'true';
      });
    });

    const asteroidPositions = [];
    const asteroidRandom = seededNoise(411);
    for (let index = 0; index < 220; index += 1) {
      const angle = asteroidRandom() * Math.PI * 2;
      const radius = 9.45 + asteroidRandom() * 0.65;
      asteroidPositions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, (asteroidRandom() - 0.5) * 0.28);
    }
    const asteroidGeometry = new THREE.BufferGeometry();
    asteroidGeometry.setAttribute('position', new THREE.Float32BufferAttribute(asteroidPositions, 3));
    const asteroidBelt = new THREE.Points(asteroidGeometry, new THREE.PointsMaterial({ color: 0xe3b873, size: 0.075, transparent: true, opacity: 0.72 }));
    asteroidBelt.rotation.x = 0.08;
    scene.add(asteroidBelt);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = null;
    const handlePointerDown = (event) => { pointerDown = { x: event.clientX, y: event.clientY }; };
    const handlePointer = (event) => {
      if (pointerDown && Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 12) {
        pointerDown = null;
        return;
      }
      pointerDown = null;
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      // Raycaster does not exclude descendants of hidden groups by itself.
      // In close-up mode, only the world the child can see may receive taps.
      const visibleTargets = focusedPlanetRef.current
        ? clickableMeshes.filter((object) => object.userData.planetName === focusedPlanetRef.current)
        : clickableMeshes;
      const hit = raycaster.intersectObjects(visibleTargets, false)[0];
      const planetName = hit?.object?.userData?.planetName;
      if (planetName) onSelectRef.current(planetName);
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointer);

    const resize = () => {
      const width = Math.max(320, mount.clientWidth);
      const height = Math.max(360, mount.clientHeight);
      const compact = width < 640;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = compact ? 52 : 48;
      camera.updateProjectionMatrix();
      const outerOrbit = 3.8 + (PLANETS.length - 1) * 1.75;
      fitDistanceRef.current = (outerOrbit + 1.1) / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(1, camera.aspect)) * 1.08;
      if (compact && controls.target.length() < 0.01) {
        camera.position.set(0, 0, fitDistanceRef.current);
        controls.minDistance = 3.5;
      } else if (!compact && controls.target.length() < 0.01) {
        camera.position.set(0, 0, fitDistanceRef.current);
        controls.minDistance = 3.5;
      }
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();
    const initialAnchor = planetAnchors.get(selectedPlanetRef.current);
    if (initialAnchor) {
      initialAnchor.updateWorldMatrix(true, false);
      const target = initialAnchor.getWorldPosition(new THREE.Vector3());
      controls.minDistance = Math.max(0.8, initialAnchor.userData.planetRadius * 1.5);
      controls.target.copy(target);
      camera.position.copy(target).add(new THREE.Vector3(0.2, 0.15, 1).normalize().multiplyScalar(Math.max(1.8, initialAnchor.userData.planetRadius * 3.7)));
      controls.update();
    }

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      selectionRings.forEach((ring, planetName) => {
        ring.visible = !focusedPlanetRef.current && planetName === selectedPlanetRef.current;
        ring.scale.setScalar(!pausedRef.current && !motionPreference.matches && ring.visible ? 1 + Math.sin(performance.now() / 260) * 0.08 : 1);
      });
      if (!pausedRef.current) {
        sunGroup.rotation.z += 0.002;
        starField.rotation.y += 0.00008;
        asteroidBelt.rotation.z += 0.0004;
        orbitGroups.forEach((group) => {
          group.rotation.z += group.userData.speed;
          group.userData.mesh.rotation.y += 0.006;
        });
      }
      const focused = planetAnchors.get(focusedPlanetRef.current);
      controls.enablePan = false;
      orbitGroups.forEach((group) => {
        group.visible = !focused || group.children.includes(focused);
        const anchor = group.children[0];
        if (anchor) anchor.rotation.z = focused ? -group.rotation.z : 0;
      });
      orbitLines.forEach((line) => { line.visible = !focused; });
      sunGroup.visible = !focused;
      asteroidBelt.visible = !focused;
      if (focused) {
        focused.updateWorldMatrix(true, false);
        const target = focused.getWorldPosition(new THREE.Vector3());
        camera.position.add(target.clone().sub(controls.target));
        controls.target.copy(target);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointer);
      controls.dispose();
      if (controlsRef.current === controls) controlsRef.current = null;
      if (cameraRef.current === camera) cameraRef.current = null;
      renderer.dispose();
      disposePlanetObject(scene);
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      planetAnchors.clear();
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div className="grid h-full min-h-[360px] place-items-center bg-[radial-gradient(circle_at_center,#172554,#030712_72%)] p-6 text-center text-white">
        <div className="max-w-sm rounded-3xl border border-cyan-200/30 bg-slate-950/80 p-6 shadow-2xl">
          <div className="text-6xl" aria-hidden="true">🪐</div>
          <h3 className="mt-3 text-xl font-black text-cyan-200">3D view unavailable</h3>
          <p className="mt-2 text-sm font-bold text-white/70">Choose a world below to explore its facts and challenge.</p>
        </div>
      </div>
    );
  }

  return <div ref={mountRef} className="h-[min(54svh,470px)] min-h-[360px] w-full md:h-[580px]" />;
});

const SolarSystem = ({ onBack, onLaunchGame, playSfx, soundOn, onToggleSound, speak, cancelNarration = () => {}, onCelebrate, playerId, onPhaseChange, registerDirty }) => {
  const difficulty = useGameDifficulty('solar');
  const orreryRef = useRef(null);
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS[2]);
  const [exploreSeed, setExploreSeed] = useState(() => crypto.getRandomValues(new Uint32Array(1))[0]);
  const [mission, setMission] = useState(null);
  const [activeFact, setActiveFact] = useState(0);
  const [passport, setPassport] = useState(() => readDiscoveryPassport(playerId, PLANETS));
  const passportRef = useRef(passport);
  const discoveredFacts = passport.facts;
  const completedQuizzes = passport.quizzes;
  const badges = discoveredPlanetBadges(PLANETS, discoveredFacts);
  const [saveWarning, setSaveWarning] = useState('');
  const [pendingSave, setPendingSave] = useState(null);
  const pendingSaveRef = useRef(null);
  const [panel, setPanel] = useState('play');
  const storePassport = (next, afterPersist = () => {}) => {
    const saved = saveDiscoveryPassport(playerId, PLANETS, next);
    if (saved?.persisted) {
      const persisted = saved.passport;
      passportRef.current = persisted;
      setPassport(persisted);
      pendingSaveRef.current = null;
      setPendingSave(null);
      setSaveWarning('');
      afterPersist(saved);
    } else {
      const pending = { value: next, afterPersist };
      pendingSaveRef.current = pending;
      setPendingSave(pending);
      setSaveWarning('This discovery is not saved yet. Keep this page open and retry the save.');
    }
    return Boolean(saved?.persisted);
  };
  const [quizFeedback, setQuizFeedback] = useState(() => passport.quizzes.Earth ? 'Correct — this challenge is already in your passport.' : '');
  const [paused, setPaused] = useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [overview,setOverview] = useState(false);

  const sayPackaged = useCallback((text) => {
    if (!soundOn || !text || !getOfflineVoiceClip(text, 'en-US')) return false;
    cancelNarration();
    speak(text, { premium: false, segments: [text] });
    return true;
  }, [cancelNarration, soundOn, speak]);

  const isMissionActive = Boolean(mission && mission.stage !== 'complete');
  const sessionPhase = pendingSave || isMissionActive ? 'play' : 'done';
  useEffect(() => { onPhaseChange?.(sessionPhase); }, [onPhaseChange, sessionPhase]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);
  useEffect(() => { if (!soundOn) cancelNarration(); }, [soundOn, cancelNarration]);
  useEffect(() => {
    registerDirty?.(() => Boolean(pendingSaveRef.current));
    return () => registerDirty?.(null);
  }, [registerDirty]);

  const retryPassportSave = () => {
    const pending = pendingSaveRef.current;
    if (!pending) return;
    storePassport(pending.value, pending.afterPersist);
  };


  const selectPlanet = useCallback((planetName, focus = true) => {
    if (pendingSave) return;
    const planet = PLANETS.find((item) => item.name === planetName);
    if (!planet) return;
    cancelNarration();
    setMission(null);
    setExploreSeed(crypto.getRandomValues(new Uint32Array(1))[0]);
    setOverview(false);
    setSelectedPlanet(planet);
    setActiveFact(0);
    setQuizFeedback(completedQuizzes[planet.name] ? 'Correct — this challenge is already in your passport.' : '');
    playSfx('chime');
    sayPackaged(`${planet.name}. ${planet.subtitle}. ${planet.mission}`);
    if (focus) orreryRef.current?.focusPlanet(planet.name);
    else orreryRef.current?.resetView();
  }, [cancelNarration, completedQuizzes, pendingSave, playSfx, sayPackaged]);

  const startMission = () => {
    cancelNarration();
    setQuizFeedback('');
    setMission({ planet: selectedPlanet.name, seed: crypto.getRandomValues(new Uint32Array(1))[0], difficulty, stage: 'discover', factsSeen: [] });
  };

  const continueMission = (stage) => {
    cancelNarration();
    setMission((current) => current && current.planet === selectedPlanet.name ? { ...current, stage } : current);
  };

  const markMissionFact = (index) => {
    setMission((current) => {
      if (!current || current.planet !== selectedPlanet.name || current.stage !== 'discover') return current;
      const factsSeen = [...new Set([...(current.factsSeen || []), index])];
      return { ...current, factsSeen, stage: factsSeen.length >= 3 ? 'compare' : 'discover' };
    });
  };

  const handleFact = (index) => {
    if (pendingSave) return;
    const fact = selectedPlanet.facts[index];
    const key = `${selectedPlanet.name}-${index}`;
    setActiveFact(index);
    playSfx('sparkle');
    sayPackaged(`Discovery ${index + 1}. ${fact}`);

    if (passportRef.current.facts[key]) {
      markMissionFact(index);
      return;
    }
    const next = { ...passportRef.current, facts: { ...passportRef.current.facts, [key]: true } };
    storePassport(next, (saved) => {
      const awards = solarPassportAwardTransitions(PLANETS, saved.previous, saved.passport, selectedPlanet.name);
      if (awards.planetBadgeEarned) onCelebrate(`${selectedPlanet.name} badge unlocked!`, 10, 50, 'solar');
      markMissionFact(index);
    });
  };

  const handleQuiz = (option) => {
    const isMission = mission?.planet === selectedPlanet.name;
    if (pendingSave || (passportRef.current.quizzes[selectedPlanet.name] && !isMission)) return;
    if (option === selectedPlanet.quiz.answer) {
      const next = { ...passportRef.current, quizzes: { ...passportRef.current.quizzes, [selectedPlanet.name]: true } };
      setQuizFeedback('Correct — saving your discovery…');
      storePassport(next, (saved) => {
        setQuizFeedback('Correct — mission complete!');
        if (isMission) continueMission('complete');
        playSfx('success');
        if (solarPassportAwardTransitions(PLANETS, saved.previous, saved.passport, selectedPlanet.name).challengeEarned) onCelebrate('Space-smart!', 4, 50, 'solar');
        sayPackaged(`Correct. ${selectedPlanet.quiz.answer}.`);
      });
    } else {
      setQuizFeedback('Not quite — use the facts and try again.');
      playSfx('wrong');
      sayPackaged('Not quite. Check the facts and try again.');
    }
  };

  const handleZoom = (direction) => {
    orreryRef.current?.[direction]();
    playSfx('click');
  };

  const currentMissionStage = mission?.planet === selectedPlanet.name ? mission.stage : null;
  const activeSeed = mission?.planet === selectedPlanet.name ? mission.seed : exploreSeed;
  const activeDifficulty = mission?.planet === selectedPlanet.name ? mission.difficulty : difficulty;
  const availableOptions = activeDifficulty === 'starter'
    ? [selectedPlanet.quiz.answer, selectedPlanet.quiz.options.find((option) => option !== selectedPlanet.quiz.answer)].filter(Boolean)
    : selectedPlanet.quiz.options;
  const quizOptions = seededPlanetOptions(availableOptions, activeSeed + PLANETS.indexOf(selectedPlanet));

  const rehearsalJourney = new URLSearchParams(window.location.search).get('journey') === 'discovery';
  const inMission = Boolean(currentMissionStage);
  const showScene = panel === 'play' && !inMission;
  const closeOptions = () => setPanel('play');
  const leave = () => { cancelNarration(); onBack?.(); };
  const orbitAction = action => { action(); closeOptions(); };
  const toggleOverview = () => {
    if (overview) orreryRef.current?.focusPlanet(selectedPlanet.name);
    else orreryRef.current?.resetView();
    setOverview(value => !value);
  };
  const options = [
    ...(!inMission ? [
      { label: overview ? `Inspect ${selectedPlanet.name}` : 'Show all planets', action: () => orbitAction(toggleOverview) },
      { label: 'Turn left', action: () => orbitAction(() => orreryRef.current?.rotate('y',-.35)) },
      { label: 'Turn right', action: () => orbitAction(() => orreryRef.current?.rotate('y',.35)) },
      { label: 'Tilt up', action: () => orbitAction(() => orreryRef.current?.rotate('x',.25)) },
      { label: 'Tilt down', action: () => orbitAction(() => orreryRef.current?.rotate('x',-.25)) },
      { label: 'Zoom in', action: () => orbitAction(() => handleZoom('zoomIn')) },
      { label: 'Zoom out', action: () => orbitAction(() => handleZoom('zoomOut')) },
      { label: paused ? 'Resume rotation' : 'Pause rotation', action: () => orbitAction(() => setPaused(value => !value)) },
    ] : [{ label: 'Back to the planets', disabled: Boolean(pendingSave), action: () => { cancelNarration(); setMission(null); closeOptions(); } }]),
    { label: `About ${selectedPlanet.name}`, action: () => setPanel('details') },
    ...(soundOn && getOfflineVoiceClip(selectedPlanet.facts[activeFact], 'en-US') ? [{ label: 'Hear the fact', action: () => orbitAction(() => sayPackaged(selectedPlanet.facts[activeFact])) }] : []),
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => orbitAction(() => onToggleSound?.()) },
    { label: 'Back to Explore & Languages', action: leave },
  ];

  return <div className="focus-game solar-focus" data-board-focus="">
    <main className={`focus-game-body${panel !== 'play' ? ' is-menu' : ''}`}>
      <header className="focus-game-heading">
        {inMission && panel === 'play' && <p>Solar System Explorer · {selectedPlanet.name}</p>}
        <h1>{panel === 'details' ? `About ${selectedPlanet.name}` : inMission && panel === 'play' ? currentMissionStage === 'complete' ? 'Mission saved!' : `${selectedPlanet.name} mission` : 'Solar System Explorer'}</h1>
      </header>
      <div className={showScene ? 'solar-focus-model' : 'hidden'} data-solar-view={overview ? 'overview' : selectedPlanet.name}>
        <SolarOrrery ref={orreryRef} onSelect={selectPlanet} paused={paused} selectedPlanet={selectedPlanet} />
      </div>
      {panel === 'options' ? <FocusMenu choices={options} onBack={closeOptions} /> : panel === 'details' ? <>
        <p className="focus-game-message">{selectedPlanet.subtitle}</p>
        <p>{selectedPlanet.mission}</p>
        <dl className="solar-focus-stats">{selectedPlanet.stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}<div><dt>Temperature</dt><dd>{selectedPlanet.temperature}</dd></div></dl>
        <p>{selectedPlanet.compare}</p>
        <button type="button" className="focus-game-button mt-3" onClick={closeOptions}>Back to exploration</button>
      </> : <>
        {!inMission ? <>
          <label className="focus-game-menu solar-focus-world">Choose a world
            <select value={selectedPlanet.name} disabled={Boolean(pendingSave)} onChange={event => selectPlanet(event.target.value)}>
              {PLANETS.map(planet => <option key={planet.name} value={planet.name}>{planet.name}{planet.name === 'Pluto' ? ' (dwarf planet)' : ''}{badges.includes(planet.name) ? ' ★' : ''}</option>)}
            </select>
          </label>
          <p className="focus-game-message">Drag to turn the model. Sizes and distances are simplified.</p>
          <div className="focus-game-actions">
            <button type="button" className="focus-game-button is-primary" disabled={Boolean(pendingSave)} onClick={startMission}>{completedQuizzes[selectedPlanet.name] ? 'Replay' : 'Start'} {selectedPlanet.name} mission</button>
            <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
            <button type="button" className="focus-game-button" onClick={leave}>Back</button>
          </div>
        </> : <>
          {currentMissionStage === 'discover' && <>
            <p className="focus-game-message">Choose three discoveries · {mission.factsSeen.length} of 3 seen</p>
            <div className="solar-focus-facts" aria-label="Discovery facts">
              {selectedPlanet.facts.map((fact,index) => <button key={fact} type="button" className="focus-game-button" disabled={Boolean(pendingSave)} onClick={() => handleFact(index)} aria-pressed={mission.factsSeen.includes(index)}>
                {mission.factsSeen.includes(index) ? '✓ ' : ''}{fact}
              </button>)}
            </div>
          </>}
          {currentMissionStage === 'compare' && <p className="pattern-focus-explanation">{selectedPlanet.compare}</p>}
          {currentMissionStage === 'challenge' && <>
            <p className="focus-game-message">{selectedPlanet.quiz.question}</p>
            <div className="solar-focus-facts" aria-label="Choose your answer">
              {quizOptions.map(option => <button key={option} type="button" className="focus-game-button" disabled={Boolean(pendingSave)} onClick={() => handleQuiz(option)}>{option}</button>)}
            </div>
            {quizFeedback && <p role="status" className="focus-game-message">{quizFeedback}</p>}
          </>}
          {currentMissionStage === 'complete' && <p role="status" className="pattern-focus-explanation">Your {selectedPlanet.name} mission is saved in the discovery passport.</p>}
          {saveWarning && <p role="alert" className="focus-game-message">{saveWarning}</p>}
          <div className="focus-game-actions mt-3">
            {saveWarning && pendingSave
              ? <button type="button" className="focus-game-button is-primary" onClick={retryPassportSave}>Retry save</button>
              : currentMissionStage === 'compare' ? <button type="button" className="focus-game-button is-primary" onClick={() => continueMission('challenge')}>Next: Challenge</button>
                : currentMissionStage === 'complete' && <button type="button" className="focus-game-button is-primary" onClick={() => setMission(null)}>Explore another world</button>}
            <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
          </div>
        </>}
        <p className="mt-3 text-sm font-bold" aria-label="Discovery passport">Passport · {Object.keys(discoveredFacts).length} facts · {Object.keys(completedQuizzes).length} missions · {badges.length} badges</p>
        {rehearsalJourney && <nav aria-label="Continue your discovery" className="mt-3 flex flex-wrap gap-3">
          <a href="#/play/codecadets" onClick={event => { event.preventDefault(); onLaunchGame?.('codecadets'); }}>Next: Code Cadets</a>
          <a href="#/play/writingdesk" onClick={event => { event.preventDefault(); onLaunchGame?.('writingdesk'); }}>Write a discovery report</a>
        </nav>}
      </>}
    </main>
  </div>;
};

export default SolarSystem;
