import {
  Vector3, MeshPhysicalMaterial, InstancedMesh, Clock,
  AmbientLight, SphereGeometry, Scene, Color, Object3D,
  SRGBColorSpace, MathUtils, WebGLRenderer,
  PerspectiveCamera, PointLight, ACESFilmicToneMapping,
  Plane, Raycaster, Vector2, DirectionalLight
} from 'https://esm.sh/three@0.167.0';

const { randFloat: rf, randFloatSpread: rfs } = MathUtils;

class PhysicsWorld {
  constructor(cfg) {
    this.cfg = cfg;
    this.pos = new Float32Array(3 * cfg.count).fill(0);
    this.vel = new Float32Array(3 * cfg.count).fill(0);
    this.sizes = new Float32Array(cfg.count).fill(1);
    this.target = new Vector3();
    this._initPos();
    this._initSizes();
  }

  _initPos() {
    const { cfg, pos } = this;
    this.target.toArray(pos, 0);
    for (let i = 1; i < cfg.count; i++) {
      const b = 3 * i;
      pos[b]     = rfs(2 * cfg.maxX);
      pos[b + 1] = rfs(2 * cfg.maxY);
      pos[b + 2] = rfs(2 * cfg.maxZ);
    }
  }

  _initSizes() {
    const { cfg, sizes } = this;
    sizes[0] = cfg.size0;
    for (let i = 1; i < cfg.count; i++) sizes[i] = rf(cfg.minSize, cfg.maxSize);
  }

  update(dt) {
    const { cfg, target, pos, vel, sizes } = this;
    const p  = new Vector3(), v  = new Vector3();
    const pj = new Vector3(), vj = new Vector3();
    const d  = new Vector3(), imp = new Vector3();

    // Sphere 0 follows mouse target
    if (cfg.controlSphere0) {
      new Vector3().fromArray(pos, 0).lerp(target, 0.12).toArray(pos, 0);
      new Vector3(0, 0, 0).toArray(vel, 0);
    }

    const start = cfg.controlSphere0 ? 1 : 0;

    // Integrate velocity
    for (let i = start; i < cfg.count; i++) {
      const b = 3 * i;
      p.fromArray(pos, b);
      v.fromArray(vel, b);
      v.y -= dt * cfg.gravity * sizes[i];
      v.multiplyScalar(cfg.friction);
      v.clampLength(0, cfg.maxVelocity);
      p.add(v);
      p.toArray(pos, b);
      v.toArray(vel, b);
    }

    // Sphere-sphere collisions
    for (let i = start; i < cfg.count; i++) {
      const bi = 3 * i;
      p.fromArray(pos, bi); v.fromArray(vel, bi);
      const ri = sizes[i];

      for (let j = i + 1; j < cfg.count; j++) {
        const bj = 3 * j;
        pj.fromArray(pos, bj); vj.fromArray(vel, bj);
        const rj = sizes[j];
        d.copy(pj).sub(p);
        const dist = d.length();
        const sum  = ri + rj;
        if (dist > 0 && dist < sum) {
          const ov = sum - dist;
          imp.copy(d).normalize().multiplyScalar(0.5 * ov);
          p.sub(imp); v.sub(imp.clone().multiplyScalar(Math.max(v.length(), 1)));
          p.toArray(pos, bi); v.toArray(vel, bi);
          pj.add(imp); vj.add(imp.clone().multiplyScalar(Math.max(vj.length(), 1)));
          pj.toArray(pos, bj); vj.toArray(vel, bj);
        }
      }

      // Sphere-0 pushes others
      if (cfg.controlSphere0) {
        const p0 = new Vector3().fromArray(pos, 0);
        d.copy(p0).sub(p);
        const dist = d.length(), sum = sizes[0] + ri;
        if (dist > 0 && dist < sum) {
          imp.copy(d).normalize().multiplyScalar(sum - dist);
          p.sub(imp); v.sub(imp.clone().multiplyScalar(0.5));
          p.toArray(pos, bi); v.toArray(vel, bi);
        }
      }

      // Bounds
      const { maxX, maxY, maxZ } = cfg;
      p.fromArray(pos, bi); v.fromArray(vel, bi);
      if (p.y < -maxY) { p.y = -maxY; v.y = Math.abs(v.y) * 0.4; }
      if (p.y >  maxY) { p.y =  maxY; v.y = -Math.abs(v.y) * 0.4; }
      if (p.x < -maxX) { p.x = -maxX; v.x = Math.abs(v.x) * 0.4; }
      if (p.x >  maxX) { p.x =  maxX; v.x = -Math.abs(v.x) * 0.4; }
      if (p.z < -maxZ) { p.z = -maxZ; v.z = Math.abs(v.z) * 0.4; }
      if (p.z >  maxZ) { p.z =  maxZ; v.z = -Math.abs(v.z) * 0.4; }
      p.toArray(pos, bi); v.toArray(vel, bi);
    }
  }
}

export function initBlobBackground(container, options = {}) {
  const cfg = {
    count:          options.count          ?? 14,
    maxX:           options.maxX           ?? 4.5,
    maxY:           options.maxY           ?? 3,
    maxZ:           options.maxZ           ?? 1.5,
    gravity:        options.gravity        ?? 0.6,
    friction:       options.friction       ?? 0.975,
    maxVelocity:    options.maxVelocity    ?? 0.08,
    minSize:        options.minSize        ?? 0.25,
    maxSize:        options.maxSize        ?? 0.75,
    size0:          options.size0          ?? 1.1,
    controlSphere0: options.controlSphere0 ?? true,
    colors:         options.colors         ?? ['#f472b6', '#c4844a', '#e879a8', '#d4925e'],
  };

  // Renderer
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new Scene();

  // Camera
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  // Lights
  const ambient = new AmbientLight(0xffffff, 1.2);
  scene.add(ambient);
  const pl1 = new PointLight(0xf472b6, 80, 25);
  pl1.position.set(4, 5, 6);
  scene.add(pl1);
  const pl2 = new PointLight(0xc4844a, 60, 25);
  pl2.position.set(-4, -3, 4);
  scene.add(pl2);
  const pl3 = new PointLight(0xffffff, 30, 20);
  pl3.position.set(0, 0, 8);
  scene.add(pl3);
  const dl = new DirectionalLight(0xfdf2f8, 0.8);
  dl.position.set(2, 4, 5);
  scene.add(dl);

  // Materials — one InstancedMesh per color group
  const palette = cfg.colors;
  const countPerColor = Math.ceil(cfg.count / palette.length);
  const meshes = palette.map(hex => {
    const mat = new MeshPhysicalMaterial({
      color: new Color(hex),
      roughness: 0.1,
      metalness: 0.05,
      transmission: 0.1,
      thickness: 1.0,
      envMapIntensity: 0.8,
    });
    const geo = new SphereGeometry(1, 32, 32);
    const mesh = new InstancedMesh(geo, mat, countPerColor + 1);
    mesh.castShadow = false;
    scene.add(mesh);
    return mesh;
  });

  // Physics
  const physics = new PhysicsWorld(cfg);
  const dummy  = new Object3D();

  // Mouse interaction
  const raycaster = new Raycaster();
  const mouse     = new Vector2(9999, 9999);
  const floor     = new Plane(new Vector3(0, 0, 1), 0);
  const mousePos  = new Vector3();

  function onMouseMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(floor, mousePos);
    physics.target.copy(mousePos);
  }

  function onTouchMove(e) {
    if (!e.touches.length) return;
    const touch = e.touches[0];
    const rect  = renderer.domElement.getBoundingClientRect();
    mouse.x = ((touch.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((touch.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(floor, mousePos);
    physics.target.copy(mousePos);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // Resize
  function resize() {
    const w = container.offsetWidth, h = container.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);
  resize();

  // Animation
  const clock = new Clock();
  let rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    physics.update(dt);

    // Sync physics positions to instanced meshes
    for (let i = 0; i < cfg.count; i++) {
      const colorIdx = i % palette.length;
      const meshIdx  = Math.floor(i / palette.length);
      const base = 3 * i;
      dummy.position.set(physics.pos[base], physics.pos[base + 1], physics.pos[base + 2]);
      dummy.scale.setScalar(physics.sizes[i]);
      dummy.updateMatrix();
      meshes[colorIdx].setMatrixAt(meshIdx, dummy.matrix);
    }
    meshes.forEach(m => { m.instanceMatrix.needsUpdate = true; });

    renderer.render(scene, camera);
  }
  animate();

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('resize', resize);
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}
