// Main loop and debug hooks
(function main() {
  let last = performance.now();
  const dbg = { speed: 1, auto: false, autoT: 0 };
  window.__dbg = {
    get G() { return G; }, Scenes, dbg,
    go(name, arg) { Scenes.go(window.__scenes[name](arg)); },
  };
  function frame(now) {
    let dt = Math.min(0.05, (now - last) / 1000) * dbg.speed;
    last = now;
    if (dbg.auto && Scenes.cur && Scenes.cur.bot && Scenes.state === 'run') {
      Input.down.up = Input.down.down = Input.down.left = Input.down.right = false;
      Scenes.cur.bot();
      Input.down.a = false;
    } else if (dbg.auto) {
      dbg.autoT += dt;
      if (dbg.autoT > 0.12) {
        dbg.autoT = 0;
        const ks = ['a', 'a', 'a', 'left', 'right', 'up', 'down'];
        const k = ks[Math.floor(Math.random() * ks.length)];
        Input.pressed[k] = true;
        Input.down.a = Math.random() < 0.5;
        Input.down.up = Math.random() < 0.5; Input.down.left = Math.random() < 0.3; Input.down.right = Math.random() < 0.3;
      }
    }
    const steps = dbg.speed > 1 ? Math.ceil(dbg.speed) : 1;
    for (let i = 0; i < steps; i++) Scenes.update(dt / steps);
    Scenes.draw();
    if (Scenes.cur && Scenes.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + Scenes.fade + ')'; ctx.fillRect(0, 0, W, H); }
    Input.pressed = {};
    requestAnimationFrame(frame);
  }
  Scenes.go(TitleScene());
  requestAnimationFrame(frame);
})();
