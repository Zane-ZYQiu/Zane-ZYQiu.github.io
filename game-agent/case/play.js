// Playable web rebuild of the case study's city builder (Kenney Starter Kit City Builder assets, CC0).
// Two rule sets: "before" mirrors the original game's builder.gd; "after" follows the task requirements.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const root = document.getElementById('play');

const BASE = new URL('./', import.meta.url).href;
const STRUCTURES = [
  ['road-straight', '直路', 25], ['road-straight-lightposts', '路灯直路', 25], ['road-corner', '弯道', 25],
  ['road-split', '丁字路口', 25], ['road-intersection', '十字路口', 25], ['pavement', '人行道', 10],
  ['pavement-fountain', '喷泉', 10], ['building-small-a', '小楼 A', 50], ['building-small-b', '小楼 B', 60],
  ['building-small-c', '小楼 C', 70], ['building-small-d', '小楼 D', 70], ['building-garage', '车库', 70],
  ['grass', '草地', 10], ['grass-trees', '树林', 25], ['grass-trees-tall', '高树林', 25]
].map(([file, name, price]) => ({ file, name, price }));
// Godot GridMap orthogonal indices for rotations about Y.
const ORIENT_TO_ANGLE = { 0: 0, 16: Math.PI / 2, 10: Math.PI, 22: -Math.PI / 2 };
const ORIENT_CYCLE = [0, 16, 10, 22];
const START_CASH = 10000;
const HISTORY_LIMIT = 64;

async function init() {
  const $ = s => root.querySelector(s);
  const stage = $('.play-stage'), canvas = $('canvas');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- renderer / scene ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b3b9cc');
  scene.fog = new THREE.Fog('#b3b9cc', 38, 70);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(17, 19, 17);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8890a8, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-8, 16, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 50 });
  sun.shadow.bias = -0.0006;
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.18 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const grid = new THREE.GridHelper(40, 40, 0x9aa1b8, 0xa6acc2);
  grid.position.set(0.5, 0.002, 0.5); grid.material.transparent = true; grid.material.opacity = 0.55; scene.add(grid);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(1, 0, 1);
  controls.enableDamping = true;
  controls.minDistance = 6; controls.maxDistance = 48;
  controls.maxPolarAngle = Math.PI * 0.42; controls.minPolarAngle = Math.PI * 0.12;
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  controls.update();

  // ---------- models ----------
  const loader = new GLTFLoader();
  const models = await Promise.all(STRUCTURES.map(s => loader.loadAsync(BASE + 'models/' + s.file + '.glb').then(g => {
    g.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g.scene;
  })));
  const sample = await fetch(BASE + 'sample-map.json').then(r => r.json());

  // ---------- palette with rendered thumbnails ----------
  const palette = $('.palette');
  const thumbR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  thumbR.setSize(88, 88); thumbR.outputColorSpace = THREE.SRGBColorSpace;
  const tScene = new THREE.Scene(); tScene.add(new THREE.HemisphereLight(0xffffff, 0x8890a8, 2));
  const tSun = new THREE.DirectionalLight(0xffffff, 2); tSun.position.set(-3, 6, 4); tScene.add(tSun);
  const tCam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); tCam.position.set(2.2, 2.3, 2.2); tCam.lookAt(0, 0.25, 0);
  STRUCTURES.forEach((s, i) => {
    const m = models[i].clone(); tScene.add(m); thumbR.render(tScene, tCam); tScene.remove(m);
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pal'; b.dataset.i = i;
    b.innerHTML = '<img alt="" src="' + thumbR.domElement.toDataURL() + '"><span>' + s.name + '</span><small>$' + s.price + '</small>';
    b.addEventListener('click', () => select(i));
    palette.appendChild(b);
  });
  thumbR.dispose();

  // ---------- city state ----------
  const city = new THREE.Group(); scene.add(city);
  const objs = new Map();               // "x,z" -> Object3D
  const state = { mode: 'after', cells: new Map(), cash: START_CASH, undo: [], redo: [], item: 0, orient: 0, demolish: false, busy: false };
  const key = (x, z) => x + ',' + z;

  function setCell(x, z, cell) {
    const k = key(x, z);
    if (objs.has(k)) { city.remove(objs.get(k)); objs.delete(k); }
    if (cell) {
      state.cells.set(k, cell);
      const o = models[cell.item].clone();
      o.position.set(x, 0, z); o.rotation.y = ORIENT_TO_ANGLE[cell.orient] || 0;
      city.add(o); objs.set(k, o);
    } else state.cells.delete(k);
  }
  function loadCity(cells, cash) {
    [...state.cells.keys()].forEach(k => { const [x, z] = k.split(',').map(Number); setCell(x, z, null); });
    cells.forEach(([x, z, item, orient]) => setCell(x, z, { item, orient }));
    state.cash = cash; state.undo = []; state.redo = [];
  }

  // ---------- rules ----------
  const fmt = n => (n < 0 ? '-$' : '$') + Math.abs(n);
  function edit(x, z, next, cost) {
    const k = key(x, z), prev = state.cells.get(k) || null;
    const entry = { x, z, prev, next, cashBefore: state.cash, cashAfter: state.cash - cost };
    setCell(x, z, next); state.cash = entry.cashAfter;
    state.undo.push(entry); if (state.undo.length > HISTORY_LIMIT) state.undo.shift();
    state.redo = [];
  }
  function build(x, z) {
    const s = STRUCTURES[state.item], cur = state.cells.get(key(x, z));
    const next = { item: state.item, orient: state.orient };
    if (state.mode === 'before') {
      // builder.gd: always overwrite; charge full price unless the same structure was already there; no refund, no cash check.
      setCell(x, z, next);
      if (!cur || cur.item !== state.item) { state.cash -= s.price; return say((cur ? '替换成 ' : '建了 ') + s.name + '，扣 $' + s.price + (cur ? '（旧建筑一分钱没退）' : '') + (state.cash < 0 ? '，余额变成负数了' : ''), state.cash < 0 ? 'bad' : ''); }
      return say(cur.orient === state.orient ? '一模一样，什么都没变' : '转了个方向，不花钱');
    }
    if (cur && cur.item === state.item && cur.orient === state.orient) return say('一模一样，什么都没变（不进历史）');
    const refund = cur && cur.item !== state.item ? Math.floor(STRUCTURES[cur.item].price / 2) : 0;
    const cost = cur && cur.item === state.item ? 0 : s.price - refund;
    if (state.cash - cost < 0) return say('Error: 钱不够（这一步要 $' + cost + '，只剩 ' + fmt(state.cash) + '），什么都没变', 'bad');
    edit(x, z, next, cost);
    if (!cur) say('建了 ' + s.name + '，扣 $' + s.price);
    else if (cost === 0) say('转了个方向，不花钱');
    else say('替换成 ' + s.name + '：退回旧建筑 $' + refund + '，再扣 $' + s.price);
  }
  function demolish(x, z) {
    const cur = state.cells.get(key(x, z));
    if (!cur) return say('这里是空地，什么都没变');
    const name = STRUCTURES[cur.item].name;
    if (state.mode === 'before') { setCell(x, z, null); return say('拆掉了 ' + name + '，但没退钱', 'bad'); }
    const refund = Math.floor(STRUCTURES[cur.item].price / 2);
    edit(x, z, null, -refund);
    say('拆掉了 ' + name + '，退回 $' + refund);
  }
  function undo() {
    if (state.mode === 'before') return say('按了没反应：原游戏的撤销按钮没接任何逻辑', 'bad');
    const e = state.undo.pop(); if (!e) return say('没有可以撤销的操作');
    setCell(e.x, e.z, e.prev); state.cash = e.cashBefore; state.redo.push(e); say('已撤销：楼和钱都回到上一步');
  }
  function redo() {
    if (state.mode === 'before') return say('按了没反应：原游戏的重做按钮没接任何逻辑', 'bad');
    const e = state.redo.pop(); if (!e) return say('没有可以重做的操作');
    setCell(e.x, e.z, e.next); state.cash = e.cashAfter; state.undo.push(e); say('已重做');
  }

  // ---------- UI ----------
  const cashEl = $('.cash b'), statusEl = $('.status'), undoBtn = $('[data-act=undo]'), redoBtn = $('[data-act=redo]');
  const modeBtns = [...root.querySelectorAll('[data-mode]')], demoBtn = $('[data-act=demolish]');
  function say(text, tone) { statusEl.textContent = text; statusEl.className = 'status' + (tone ? ' ' + tone : ''); refresh(); }
  function refresh() {
    cashEl.textContent = fmt(state.cash);
    cashEl.parentElement.classList.toggle('neg', state.cash < 0);
    const live = state.mode === 'after';
    undoBtn.disabled = state.busy || (live && !state.undo.length);
    redoBtn.disabled = state.busy || (live && !state.redo.length);
    palette.querySelectorAll('.pal').forEach(b => b.classList.toggle('on', +b.dataset.i === state.item && !state.demolish));
    demoBtn.classList.toggle('on', state.demolish);
    modeBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === state.mode ? 'true' : 'false'));
    root.classList.toggle('is-before', state.mode === 'before');
    updateGhost();
  }
  function select(i) { state.item = i; state.demolish = false; refresh(); }
  function rotate() { state.orient = ORIENT_CYCLE[(ORIENT_CYCLE.indexOf(state.orient) + 1) % 4]; refresh(); }

  undoBtn.addEventListener('click', () => !state.busy && undo());
  redoBtn.addEventListener('click', () => !state.busy && redo());
  $('[data-act=rotate]').addEventListener('click', rotate);
  demoBtn.addEventListener('click', () => { state.demolish = !state.demolish; refresh(); });
  $('[data-act=sample]').addEventListener('click', () => { if (state.busy) return; loadCity(sample.cells, sample.cash); frame(1, 1, 22); say('载入了示例城市'); });
  $('[data-act=clear]').addEventListener('click', () => { if (state.busy) return; loadCity([], START_CASH); frame(0, 0, 16); say('清空了，预算回到 $10000'); });
  modeBtns.forEach(b => b.addEventListener('click', () => {
    if (state.busy || state.mode === b.dataset.mode) return;
    state.mode = b.dataset.mode; state.undo = []; state.redo = [];
    say(state.mode === 'before' ? '切到改造前：用的是原游戏的规则，试试替换、拆除、撤销' : '切到改造后：用的是需求里的规则');
  }));
  addEventListener('keydown', e => {
    if (!isVisible() || state.busy || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === 'r') rotate();
    else if (k === 'q') select((state.item + STRUCTURES.length - 1) % STRUCTURES.length);
    else if (k === 'e') select((state.item + 1) % STRUCTURES.length);
    else if ((e.metaKey || e.ctrlKey) && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  });

  // ---------- picking ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  const selector = new THREE.Group(); scene.add(selector);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.56, 0.66, 4, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }));
  ring.rotation.set(-Math.PI / 2, 0, Math.PI / 4); ring.position.y = 0.02; selector.add(ring);
  let ghost = null, ghostKey = '', hover = null;
  function updateGhost() {
    const want = state.demolish ? 'x' : state.item + ':' + state.orient;
    if (want !== ghostKey) {
      if (ghost) selector.remove(ghost);
      ghost = null; ghostKey = want;
      if (!state.demolish) {
        ghost = models[state.item].clone(true);
        ghost.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.55; o.castShadow = false; } });
        ghost.position.y = 0.25; ghost.rotation.y = ORIENT_TO_ANGLE[state.orient]; selector.add(ghost);
      }
    }
    ring.material.color.set(state.demolish ? 0xff6b8e : 0xffffff);
  }
  function cellAt(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    return { x: Math.round(hit.x), z: Math.round(hit.z) };
  }
  canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { hover = cellAt(e); selector.visible = !!hover && !state.busy; } });
  canvas.addEventListener('pointerleave', () => { selector.visible = false; });
  let down = null;
  canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now(), b: e.button }; });
  canvas.addEventListener('pointerup', e => {
    if (!down || state.busy) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), quick = performance.now() - down.t < 450;
    const b = down.b; down = null;
    if (moved > 6 || !quick) return;
    if (b === 2) return rotate();
    if (b !== 0) return;
    const c = cellAt(e); if (!c) return;
    hover = c; selector.visible = e.pointerType === 'mouse';
    state.demolish ? demolish(c.x, c.z) : build(c.x, c.z);
    bump(c);
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // ---------- camera framing & effects ----------
  const camGoal = { t: null };
  function frame(x, z, dist) {
    const dir = camera.position.clone().sub(controls.target).normalize();
    camGoal.t = { target: new THREE.Vector3(x, 0, z), pos: new THREE.Vector3(x, 0, z).add(dir.multiplyScalar(dist)) };
  }
  const pops = [];
  function bump(c) { const o = objs.get(key(c.x, c.z)); if (o && !reduce) pops.push({ o, t: 0 }); }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage); resize();
  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);
  const isVisible = () => visible;

  let last = performance.now();
  renderer.setAnimationLoop(now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible) return;
    if (camGoal.t) {
      const k = reduce ? 1 : 1 - Math.pow(0.01, dt);
      controls.target.lerp(camGoal.t.target, k); camera.position.lerp(camGoal.t.pos, k);
      if (camera.position.distanceTo(camGoal.t.pos) < 0.05) camGoal.t = null;
    }
    if (hover) selector.position.lerp(new THREE.Vector3(hover.x, 0, hover.z), reduce ? 1 : Math.min(1, dt * 30));
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i]; p.t += dt * 4; const s = 1 + 0.18 * Math.sin(Math.min(p.t, 1) * Math.PI);
      p.o.scale.setScalar(s); if (p.t >= 1) { p.o.scale.setScalar(1); pops.splice(i, 1); }
    }
    controls.update();
    renderer.render(scene, camera);
  });

  // ---------- agent replay: the same 7 steps the real test performs ----------
  const logEl = $('.log tbody'), verdictEl = $('.log-verdict'), runBtn = $('[data-act=run]'), tag = $('.step-tag');
  const STEPS = [
    { text: '在空地上铺一段直路', run: () => { select(0); state.orient = 0; build(0, 0); }, want: [9975, 0, 0] },
    { text: '换成路灯直路', run: () => { select(1); build(0, 0); }, want: [9962, 1, 0] },
    { text: '点撤销', run: () => undo(), want: [9975, 0, 0] },
    { text: '点重做', run: () => redo(), want: [9962, 1, 0] },
    { text: '再点一次重做（已经没有可重做的了）', run: () => redo(), want: [9962, 1, 0] },
    { text: '点撤销', run: () => undo(), want: [9975, 0, 0] },
    { text: '选回直路，转 90° 再放（只转方向，不该花钱）', run: () => { select(0); state.orient = 0; rotate(); build(0, 0); }, want: [9975, 0, 16] }
  ];
  const desc = c => c ? STRUCTURES[c.item].name + (c.orient ? '（转过）' : '') : '空地';
  const wait = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 150) : ms));
  async function runAgent() {
    if (state.busy) return;
    state.busy = true; runBtn.disabled = true; refresh();
    if (innerWidth <= 980) stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    logEl.innerHTML = ''; verdictEl.className = 'log-verdict'; verdictEl.textContent = 'Agent 正在游戏里操作…';
    loadCity([], START_CASH); frame(0, 0, 11); hover = { x: 0, z: 0 }; selector.visible = true;
    say('测试从一块空地、$10000 开始');
    await wait(900);
    let bad = 0;
    for (let i = 0; i < STEPS.length; i++) {
      const st = STEPS[i];
      tag.hidden = false; tag.textContent = '第 ' + (i + 1) + ' 步：' + st.text;
      await wait(700);
      st.run(); bump({ x: 0, z: 0 });
      const cell = state.cells.get(key(0, 0));
      const [wc, wi, wo] = st.want, ok = state.cash === wc && cell && cell.item === wi && cell.orient === wo;
      if (!ok) bad++;
      const tr = document.createElement('tr'); tr.className = ok ? 'ok' : 'bad';
      tr.innerHTML = '<td>' + (i + 1) + '</td><td>' + st.text + '</td><td>' + fmt(wc) + '<small>' + desc({ item: wi, orient: wo }) + '</small></td><td>' + fmt(state.cash) + '<small>' + desc(cell) + '</small></td><td>' + (ok ? '✓' : '✗') + '</td>';
      logEl.appendChild(tr);
      await wait(1100);
    }
    tag.hidden = true;
    verdictEl.className = 'log-verdict ' + (bad ? 'bad' : 'ok');
    verdictEl.textContent = bad
      ? '发现 ' + bad + ' 处不对：替换时没退钱，撤销 / 重做不工作。Agent 要做的，就是把这些 bug 找出来并修好。'
      : '7 步全部正确：钱、建筑、撤销 / 重做都对得上。';
    state.busy = false; runBtn.disabled = false; refresh();
  }
  runBtn.addEventListener('click', runAgent);

  // ---------- start ----------
  loadCity(sample.cells, sample.cash);
  root.classList.add('ready');
  $('.play-loading').hidden = true;
  say('点格子盖楼，拖动画面换角度。也可以点「让 Agent 测一遍」。');
}

if (root) init().catch(err => {
  console.error(err);
  root.querySelector('.play-loading').textContent = '3D 场景没能加载，请刷新重试。';
});
