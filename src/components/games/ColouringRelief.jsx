import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PAPER_HEIGHT, PAPER_WIDTH } from '../../data/creativeCanvasState.js';
import { drawMarks, drawStamps, makeInkSurface } from './creativeInk.js';

const control = 'inline-flex min-h-12 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-indigo-950 disabled:opacity-40';

const artworkTexture = async (markup, picture, sheet) => {
  const blob = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  try {
    const illustration = new Image();
    illustration.src = blob;
    await illustration.decode();
    const artwork = document.createElement('canvas');
    artwork.width = PAPER_WIDTH;
    artwork.height = PAPER_HEIGHT;
    const context = artwork.getContext('2d');
    const surface = makeInkSurface(PAPER_WIDTH, PAPER_HEIGHT, 1, picture);
    context.drawImage(illustration, 0, 0);
    drawStamps(context, surface, sheet.stamps);
    // Erasers only cut into the transparent ink layer. The outline and
    // decorations beneath it remain visible on the relief.
    const ink = document.createElement('canvas');
    ink.width = artwork.width;
    ink.height = artwork.height;
    drawMarks(ink.getContext('2d'), surface, sheet.strokes);
    context.drawImage(ink, 0, 0);
    const texture = new THREE.CanvasTexture(artwork);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  } finally {
    URL.revokeObjectURL(blob);
  }
};

const buildRelief = (picture, colours, texture, resources) => {
  const paths = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg">${picture.regions.map(({ d }) => `<path d="${d}"/>`).join('')}</svg>`).paths;
  const top = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.82 });
  resources.push(top);
  const model = new THREE.Group();
  paths.forEach((path, index) => {
    const shapes = path.toShapes();
    if (!shapes.length) return;
    const geometry = new THREE.ExtrudeGeometry(shapes, { depth: 0.29, bevelEnabled: false, curveSegments: 14 });
    const vertices = geometry.getAttribute('position');
    const uv = geometry.getAttribute('uv');
    for (let i = 0; i < vertices.count; i += 1) {
      uv.setXY(i, vertices.getX(i) / PAPER_WIDTH, 1 - vertices.getY(i) / PAPER_HEIGHT);
    }
    const side = new THREE.MeshStandardMaterial({ color: colours[picture.regions[index].id] || '#b8c4d8', roughness: 0.72 });
    const mesh = new THREE.Mesh(geometry, [top, side]);
    mesh.position.set(-PAPER_WIDTH / 2, -PAPER_HEIGHT / 2, index * 0.045);
    model.add(mesh);
    resources.push(geometry, side);
  });
  model.scale.set(0.01, -0.01, 1);
  return model;
};

export default function ColouringRelief({ picture, sheet, source }) {
  const host = useRef(null);
  const handles = useRef(null);
  const [status, setStatus] = useState('loading');
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    const target = host.current;
    const resources = [];
    let renderer, controls, observer;
    let active = true;

    const setup = async () => {
      const texture = await artworkTexture(source, picture, sheet);
      if (!active) { texture.dispose(); return; }
      resources.push(texture);
      const model = buildRelief(picture, sheet.colours, texture, resources);
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setClearColor('#edf3fc');
      target.appendChild(renderer.domElement);
      renderer.domElement.setAttribute('aria-hidden', 'true');
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      const pivot = new THREE.Group();
      pivot.rotation.set(-0.16, 0.34, 0);
      pivot.add(model);
      scene.add(pivot);
      scene.add(new THREE.HemisphereLight('#ffffff', '#a1b0d1', 2.0));
      const sun = new THREE.DirectionalLight('#fff0df', 1.6);
      sun.position.set(-4, 6, 8);
      scene.add(sun);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      const render = () => renderer.render(scene, camera);
      const fit = () => {
        const { width, height } = target.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        camera.position.set(0, 0, Math.max(15, 13 / camera.aspect));
        controls.minDistance = camera.position.z * 0.72;
        controls.maxDistance = camera.position.z * 1.8;
        controls.update();
        controls.saveState();
        render();
      };
      observer = new ResizeObserver(fit);
      observer.observe(target);
      controls.addEventListener('change', render);
      handles.current = {
        rotate: (direction) => { pivot.rotation.y += direction * Math.PI / 6; render(); },
        reset: () => { pivot.rotation.set(-0.16, 0.34, 0); controls.reset(); render(); },
      };
      fit();
      setStatus('ready');
    };
    void setup().catch(() => { if (active) setStatus('unavailable'); });
    return () => {
      active = false;
      observer?.disconnect();
      controls?.dispose();
      resources.forEach((resource) => resource.dispose());
      renderer?.dispose();
      renderer?.domElement.remove();
      handles.current = null;
    };
  }, [picture, sheet, source]);

  const rotate = (direction) => {
    handles.current?.rotate(direction);
    setTurn((current) => (current + direction * 30 + 360) % 360);
  };
  return <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-white" aria-label={`${picture.label} 3D preview`}>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 p-2 sm:p-3">
      <p className="text-sm font-bold text-indigo-950">Drag to turn your artwork.</p>
      <div className="flex flex-wrap gap-1.5">
        <button className={control} type="button" onClick={() => rotate(-1)} disabled={status !== 'ready'}><ChevronLeft size={17}/> Turn left</button>
        <button className={control} type="button" onClick={() => rotate(1)} disabled={status !== 'ready'}>Turn right <ChevronRight size={17}/></button>
        <button className={control} type="button" disabled={status !== 'ready'} onClick={() => { handles.current?.reset(); setTurn(0); }}><RotateCcw size={16}/> Reset view</button>
      </div>
    </div>
    <div ref={host} data-relief-frame data-relief-state={status} className="relative h-[max(340px,53dvh)] overflow-hidden bg-[#edf3fc] sm:h-[min(62dvh,590px)]">
      {status !== 'ready' && <p className="p-5 text-center font-bold text-indigo-950" role="status">
        {status === 'loading' ? 'Building your 3D preview…' : '3D is unavailable on this browser. Use Back to colouring to continue.'}
      </p>}
    </div>
    {status === 'ready' && <p className="sr-only" role="status">3D ready. Button rotation {turn} degrees.</p>}
  </section>;
}
