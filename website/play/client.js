(() => {
  const canvas = document.getElementById('realm');
  const ctx = canvas?.getContext('2d');
  const status = document.getElementById('play-status');
  if (!canvas || !ctx) return;

  const world = { x: 0, y: 0, width: 2200, height: 1500 };
  const player = { x: 1100, y: 750, speed: 3.1, direction: 0 };
  const keys = new Set();
  let last = 0;
  let running = true;
  const obstacles = [
    { x: 780, y: 560, w: 130, h: 95 }, { x: 1320, y: 590, w: 170, h: 100 },
    { x: 930, y: 930, w: 100, h: 150 }, { x: 1470, y: 850, w: 120, h: 170 },
    { x: 560, y: 810, w: 95, h: 140 }, { x: 1130, y: 380, w: 180, h: 80 }
  ];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function blocked(x, y) {
    return obstacles.some(o => x > o.x - 18 && x < o.x + o.w + 18 && y > o.y - 18 && y < o.y + o.h + 18);
  }
  function drawTree(x, y, size) {
    ctx.fillStyle = '#171d18'; ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#343a2b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, size - 5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#24271e'; ctx.beginPath(); ctx.moveTo(x, y - size * 1.4); ctx.lineTo(x - size, y + size * .5); ctx.lineTo(x + size, y + size * .5); ctx.closePath(); ctx.fill();
  }
  function render(t) {
    const dt = Math.min((t - last) || 16, 32) / 16; last = t;
    let dx = 0, dy = 0;
    if (keys.has('ArrowLeft') || keys.has('a')) dx--;
    if (keys.has('ArrowRight') || keys.has('d')) dx++;
    if (keys.has('ArrowUp') || keys.has('w')) dy--;
    if (keys.has('ArrowDown') || keys.has('s')) dy++;
    if (dx || dy) {
      const length = Math.hypot(dx, dy) || 1; dx = dx / length * player.speed * dt; dy = dy / length * player.speed * dt;
      if (!blocked(player.x + dx, player.y)) player.x += dx;
      if (!blocked(player.x, player.y + dy)) player.y += dy;
      player.x = Math.max(40, Math.min(world.width - 40, player.x));
      player.y = Math.max(40, Math.min(world.height - 40, player.y));
      player.direction = Math.atan2(dy, dx);
    }
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const camX = Math.max(0, Math.min(world.width - w, player.x - w / 2));
    const camY = Math.max(0, Math.min(world.height - h, player.y - h / 2));
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#151b17'; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(-camX, -camY);
    // Stone paths and mossy ground
    ctx.fillStyle = '#282b24'; ctx.beginPath(); ctx.moveTo(0, 690); ctx.lineTo(650, 640); ctx.lineTo(1030, 730); ctx.lineTo(1450, 680); ctx.lineTo(2200, 740); ctx.lineTo(2200, 900); ctx.lineTo(1400, 840); ctx.lineTo(900, 890); ctx.lineTo(400, 820); ctx.lineTo(0, 850); ctx.fill();
    ctx.strokeStyle = '#3c4033'; ctx.lineWidth = 2;
    for (let x = 0; x < world.width; x += 80) for (let y = 0; y < world.height; y += 80) {
      ctx.globalAlpha = .15; ctx.strokeRect(x + ((y / 80) % 2) * 20, y, 40, 34);
    }
    ctx.globalAlpha = 1;
    // Ancient ruins
    obstacles.forEach((o, i) => {
      ctx.fillStyle = '#10110f'; ctx.fillRect(o.x + 7, o.y + 9, o.w, o.h);
      ctx.fillStyle = '#4b4337'; ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#88765b'; ctx.lineWidth = 3; ctx.strokeRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
      ctx.strokeStyle = '#272a24'; ctx.lineWidth = 2;
      for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(o.x + 6, o.y + k * o.h / 4); ctx.lineTo(o.x + o.w - 6, o.y + k * o.h / 4); ctx.stroke(); }
      if (i % 2 === 0) { ctx.fillStyle = '#a7352d'; ctx.globalAlpha = .45; ctx.fillRect(o.x + o.w / 2 - 2, o.y + 8, 4, o.h - 16); ctx.globalAlpha = 1; }
    });
    for (let i = 0; i < 48; i++) {
      const x = (i * 173 + 61) % world.width, y = (i * 239 + 43) % world.height;
      if (Math.hypot(x - player.x, y - player.y) > 90 && !obstacles.some(o => x > o.x - 30 && x < o.x + o.w + 30 && y > o.y - 30 && y < o.y + o.h + 30)) drawTree(x, y, 15 + (i % 3) * 5);
    }
    // Player shadow, cloak and facing marker
    ctx.fillStyle = '#0009'; ctx.beginPath(); ctx.ellipse(player.x, player.y + 10, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a7352d'; ctx.beginPath(); ctx.moveTo(player.x, player.y - 17); ctx.lineTo(player.x - 13, player.y + 10); ctx.lineTo(player.x + 13, player.y + 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d8c4a1'; ctx.beginPath(); ctx.arc(player.x, player.y - 8, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e3c38b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(player.x + Math.cos(player.direction) * 24, player.y + Math.sin(player.direction) * 24); ctx.stroke();
    ctx.restore();
    const coords = document.getElementById('coords');
    if (coords) coords.textContent = Math.round(player.x) + ' / ' + Math.round(player.y);
    if (running) requestAnimationFrame(render);
  }
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(key)) e.preventDefault();
    keys.add(key);
  });
  window.addEventListener('keyup', e => keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
  window.addEventListener('blur', () => keys.clear());
  document.querySelectorAll('[data-move]').forEach(button => {
    const key = button.dataset.move;
    const down = e => { e.preventDefault(); keys.add(key); };
    const up = e => { e.preventDefault(); keys.delete(key); };
    button.addEventListener('pointerdown', down);
    ['pointerup','pointercancel','pointerleave'].forEach(name => button.addEventListener(name, up));
  });
  const reset = document.getElementById('reset');
  reset?.addEventListener('click', () => { player.x = 1100; player.y = 750; keys.clear(); });
  resize();
  if (status) status.textContent = 'Offline prototyp beží — pohyb je lokálny, bez účtu a bez serverového pripojenia.';
  requestAnimationFrame(render);
})();