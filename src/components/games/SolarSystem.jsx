import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Home, Pause, Play, Rotate3D, RotateCcw, Sparkles, Volume2, ZoomIn, ZoomOut } from 'lucide-react';
import { PLANETS } from '../../data/index.js';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { SoundToggle } from '../shared/index.jsx';

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
  Mercury: 0.48,
  Venus: 0.82,
  Earth: 0.88,
  Mars: 0.62,
  Jupiter: 1.72,
  Saturn: 1.48,
  Uranus: 1.08,
  Neptune: 1.04,
  Pluto: 0.4,
};

const makeOrbit = (radius) => {
  const points = [];
  for (let index = 0; index <= 128; index += 1) {
    const angle = (index / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x6b7ca8,
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

  if (planetName === 'Jupiter') {
    [-0.55, -0.18, 0.2, 0.55].forEach((y, index) => {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(mesh.geometry.parameters.radius * Math.sqrt(1 - y * y), 0.045, 8, 64),
        new THREE.MeshBasicMaterial({ color: index % 2 ? 0x8c5e3c : 0xf1d1a0 }),
      );
      band.rotation.x = Math.PI / 2;
      band.position.y = y * mesh.geometry.parameters.radius;
      mesh.add(band);
    });
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

const SolarOrrery = forwardRef(function SolarOrrery({ onSelect, paused }, ref) {
  const mountRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const pausedRef = useRef(paused);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const planetAnchorsRef = useRef(new Map());
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

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
    resetView: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      cameraRef.current.position.set(0, 22, 39);
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
      const distance = THREE.MathUtils.clamp(offset.length() * 0.72, 18, controls.maxDistance);
      if (offset.length() < 0.01) offset.set(0, 8, 24);
      offset.setLength(distance);
      controls.target.copy(target);
      camera.position.copy(target).add(offset);
      controls.update();
    },
  }), [changeZoom]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const planetAnchors = planetAnchorsRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.012);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(0, 22, 39);

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
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 22;
    controls.maxDistance = 72;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0x8ba8ff, 0.42));
    const sunlight = new THREE.PointLight(0xffe7a3, 160, 90, 1.6);
    scene.add(sunlight);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0xffc928 }),
    );
    sun.userData.planetName = 'Sun';
    scene.add(sun);
    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(2.65, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0xffa928, transparent: true, opacity: 0.14 }),
    );
    scene.add(sunGlow);

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
    const clickableMeshes = [];
    planetAnchors.clear();
    PLANETS.forEach((planet, index) => {
      const radius = 3.8 + index * 1.75;
      scene.add(makeOrbit(radius));

      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.y = index * 0.72;
      const planetRadius = PLANET_SCALES[planet.name];
      const planetAnchor = new THREE.Group();
      planetAnchor.position.x = radius;
      planetAnchor.userData.planetName = planet.name;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(planetRadius, 40, 28),
        new THREE.MeshStandardMaterial({
          color: PLANET_COLORS[planet.name],
          // The lighting is intentionally gentle for touch devices. A small
          // self-lit contribution keeps the night-facing side readable (and
          // prevents Saturn disappearing behind its ring plane) without
          // flattening the 3D shading.
          emissive: PLANET_COLORS[planet.name],
          emissiveIntensity: planet.name === 'Saturn' ? 0.34 : 0.1,
          roughness: planet.name === 'Earth' ? 0.68 : 0.88,
          metalness: 0.02,
        }),
      );
      mesh.rotation.z = planet.name === 'Uranus' ? Math.PI / 2 : 0.12;
      mesh.userData.planetName = planet.name;
      planetAnchor.add(mesh);
      const rings = addPlanetTexture(mesh, planet.name, planetAnchor);
      // Give small planets and ringed worlds a generous, invisible touch
      // target. The visible sphere should never be the only way to select it.
      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(planetRadius * 2.2, 1.05), 12, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      hitMesh.userData.planetName = planet.name;
      planetAnchor.add(hitMesh);
      orbitGroup.add(planetAnchor);
      orbitGroup.userData.speed = 0.0007 + (PLANETS.length - index) * 0.00018;
      orbitGroup.userData.mesh = mesh;
      scene.add(orbitGroup);
      orbitGroups.push(orbitGroup);
      clickableMeshes.push(hitMesh, mesh, ...mesh.children, ...(rings?.children || []));
      planetAnchors.set(planet.name, planetAnchor);
    });

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
      const hit = raycaster.intersectObjects(clickableMeshes, false)[0];
      const planetName = hit?.object?.userData?.planetName;
      if (planetName) onSelectRef.current(planetName);
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointer);

    const resize = () => {
      const width = Math.max(320, mount.clientWidth);
      const height = Math.max(360, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!pausedRef.current) {
        sun.rotation.y += 0.002;
        starField.rotation.y += 0.00008;
        orbitGroups.forEach((group) => {
          group.rotation.y += group.userData.speed;
          group.userData.mesh.rotation.y += 0.009;
        });
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointer);
      controls.dispose();
      if (controlsRef.current === controls) controlsRef.current = null;
      if (cameraRef.current === camera) cameraRef.current = null;
      renderer.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose?.();
      });
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
          <p className="mt-2 text-sm font-bold text-white/70">Choose a planet below to explore its facts and challenge.</p>
        </div>
      </div>
    );
  }

  return <div ref={mountRef} className="h-[58vh] min-h-[430px] w-full cursor-grab touch-none active:cursor-grabbing md:h-full md:min-h-0" />;
});

const SolarSystem = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const difficulty = useGameDifficulty('solar');
  const orreryRef = useRef(null);
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS[2]);
  const [activeFact, setActiveFact] = useState(0);
  const [discoveredFacts, setDiscoveredFacts] = useState({});
  const [badges, setBadges] = useState([]);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [completedQuizzes, setCompletedQuizzes] = useState({});
  const [paused, setPaused] = useState(false);

  const selectPlanet = useCallback((planetName) => {
    const planet = PLANETS.find((item) => item.name === planetName);
    if (!planet) return;
    setSelectedPlanet(planet);
    setActiveFact(0);
    setQuizFeedback('');
    playSfx('chime');
    speak(`${planet.name}. ${planet.subtitle}. ${planet.mission}`);
    orreryRef.current?.focusPlanet(planet.name);
  }, [playSfx, speak]);

  const handleFact = (index) => {
    const fact = selectedPlanet.facts[index];
    const key = `${selectedPlanet.name}-${index}`;
    setActiveFact(index);
    playSfx('sparkle');
    speak(`Discovery ${index + 1}. ${fact}`);

    if (discoveredFacts[key]) return;
    setDiscoveredFacts((current) => ({ ...current, [key]: true }));
    const planetCount = selectedPlanet.facts.reduce(
      (count, _item, factIndex) => count + (discoveredFacts[`${selectedPlanet.name}-${factIndex}`] ? 1 : 0),
      0,
    ) + 1;
    if (planetCount >= 3 && !badges.includes(selectedPlanet.name)) {
      setBadges((current) => [...current, selectedPlanet.name]);
      onCelebrate(`${selectedPlanet.name} badge unlocked!`, 10, 50, 'solar');
    }
  };

  const handleQuiz = (option) => {
    if (completedQuizzes[selectedPlanet.name]) return;
    if (option === selectedPlanet.quiz.answer) {
      setCompletedQuizzes((current) => ({ ...current, [selectedPlanet.name]: true }));
      setQuizFeedback('Correct — mission complete!');
      playSfx('success');
      speak(`Correct. ${selectedPlanet.quiz.answer}.`);
      onCelebrate('Space-smart!', 4, 50, 'solar');
    } else {
      setQuizFeedback('Not quite — use the facts and try again.');
      playSfx('wrong');
      speak('Not quite. Check the discoveries and try again.');
    }
  };

  const handleZoom = (direction) => {
    orreryRef.current?.[direction]();
    playSfx('click');
  };

  const discoveredForPlanet = selectedPlanet.facts.filter(
    (_fact, index) => discoveredFacts[`${selectedPlanet.name}-${index}`],
  ).length;
  const quizOptions = difficulty === 'starter'
    ? [selectedPlanet.quiz.answer, selectedPlanet.quiz.options.find((option) => option !== selectedPlanet.quiz.answer)].filter(Boolean)
    : selectedPlanet.quiz.options;

  return (
    <div className="min-h-screen overflow-y-auto bg-[#030712] text-white md:h-screen md:overflow-hidden">
      <header className="relative z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
        <button onClick={onBack} className="game-icon-button !bg-white/10 !text-white" aria-label="Back to all games"><Home /></button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300 sm:text-xs">Interactive 3D mission</p>
          <h2 className="text-xl font-black text-white sm:text-3xl">Solar System Explorer</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused((current) => !current)}
            className="game-icon-button !bg-white/10 !text-white"
            aria-label={paused ? 'Resume planet orbits' : 'Pause planet orbits'}
          >
            {paused ? <Play size={19} /> : <Pause size={19} />}
          </button>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/10 !text-white" />
        </div>
      </header>

      <main className="grid md:h-[calc(100vh-77px)] md:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.82fr)]">
        <section className="relative overflow-hidden border-b border-white/10 md:border-b-0 md:border-r">
          <SolarOrrery ref={orreryRef} onSelect={selectPlanet} paused={paused} />
          <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white/75 backdrop-blur">
            <div className="flex items-center gap-2 font-black text-white"><Rotate3D size={18} /> Drag to orbit</div>
            <div>Use zoom buttons, scroll, or pinch · tap a planet</div>
          </div>
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2" role="group" aria-label="Camera zoom controls">
            <button
              type="button"
              onClick={() => handleZoom('zoomIn')}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/35 bg-slate-950/85 text-cyan-100 shadow-lg backdrop-blur transition hover:bg-cyan-300 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              aria-label="Zoom in on the Solar System"
              title="Zoom in"
            >
              <ZoomIn size={24} strokeWidth={2.8} />
            </button>
            <button
              type="button"
              onClick={() => handleZoom('zoomOut')}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/35 bg-slate-950/85 text-cyan-100 shadow-lg backdrop-blur transition hover:bg-cyan-300 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              aria-label="Zoom out from the Solar System"
              title="Zoom out"
            >
              <ZoomOut size={24} strokeWidth={2.8} />
            </button>
            <button
              type="button"
              onClick={() => handleZoom('resetView')}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/35 bg-slate-950/85 text-cyan-100 shadow-lg backdrop-blur transition hover:bg-cyan-300 hover:text-slate-950"
              aria-label="Reset the Solar System camera"
              title="Reset view"
            >
              <RotateCcw size={22} strokeWidth={2.8} />
            </button>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/75 p-2 backdrop-blur-xl no-scrollbar">
            {PLANETS.map((planet) => (
              <button
                key={planet.name}
                onClick={() => selectPlanet(planet.name)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-black transition ${
                  selectedPlanet.name === planet.name
                    ? 'bg-cyan-300 text-slate-950'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {badges.includes(planet.name) ? '★ ' : ''}{planet.name}
              </button>
            ))}
          </div>
        </section>

        <aside className="max-h-none overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 p-4 pb-24 md:max-h-full md:pb-16">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Planet file</p>
              <h3 className="text-4xl font-black">{selectedPlanet.name}</h3>
              <p className="font-bold text-white/55">{selectedPlanet.subtitle}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-cyan-200/60">Scroll for facts and challenge ↓</p>
            </div>
            <div className="rounded-2xl bg-cyan-300/10 px-3 py-2 text-center">
              <div className="text-xl font-black text-cyan-300">{discoveredForPlanet}/3</div>
              <div className="text-[10px] font-black uppercase text-cyan-100/55">for badge</div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-violet-200"><Sparkles size={17} /> Your mission</div>
            <p className="mt-1 font-bold text-white/80">{selectedPlanet.mission}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {selectedPlanet.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-xl">{stat.emoji}</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-white/35">{stat.label}</div>
                <div className="font-black text-white/85">{stat.value}</div>
              </div>
            ))}
            <div className="col-span-2 rounded-2xl border border-orange-300/15 bg-orange-300/10 p-3">
              <div className="text-[10px] font-black uppercase tracking-wide text-orange-200/65">Temperature</div>
              <div className="font-black text-orange-100">{selectedPlanet.temperature}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <h4 className="font-black">Discovery deck</h4>
              <button
                onClick={() => speak(selectedPlanet.facts[activeFact])}
                className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70"
              >
                <Volume2 size={14} /> Listen
              </button>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {selectedPlanet.facts.map((fact, index) => (
                <button
                  key={fact}
                  onClick={() => handleFact(index)}
                  className={`relative rounded-xl border p-2 text-left text-xs font-black transition ${
                    activeFact === index
                      ? 'border-cyan-300 bg-cyan-300 text-slate-950'
                      : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10'
                  }`}
                  aria-label={`Discovery ${index + 1}: ${fact}`}
                >
                  {discoveredFacts[`${selectedPlanet.name}-${index}`] && (
                    <span className="absolute right-1 top-1 text-[10px]">★</span>
                  )}
                  Fact {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-2 min-h-24 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-sm font-black text-cyan-200">Did you know?</p>
              <p className="mt-1 font-bold leading-snug text-white/85">{selectedPlanet.facts[activeFact]}</p>
            </div>
            <div className="mt-2 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-3">
              <p className="text-xs font-black uppercase text-emerald-200/70">Compared with Earth</p>
              <p className="font-bold text-white/80">{selectedPlanet.compare}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-black">Captain’s challenge</h4>
              <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-200">{difficulty}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-white/70">{selectedPlanet.quiz.question}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quizOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleQuiz(option)}
                  disabled={Boolean(completedQuizzes[selectedPlanet.name])}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black text-white/80 transition hover:bg-cyan-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-white/10 disabled:hover:text-white/80"
                >
                  {option}
                </button>
              ))}
            </div>
            {quizFeedback && (
              <p className={`mt-3 text-sm font-black ${quizFeedback.startsWith('Correct') ? 'text-emerald-300' : 'text-amber-300'}`}>
                {quizFeedback}
              </p>
            )}
          </div>

          <div className="mt-5 text-center text-xs font-bold text-white/35">
            Planet badges collected: {badges.length}/{PLANETS.length}
          </div>
        </aside>
      </main>
    </div>
  );
};

export { SolarOrrery };
export default SolarSystem;
