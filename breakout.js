(() => {
  window.createBreakoutGame = function createBreakoutGame(root) {
    const canvas = root.querySelector("#breakout-canvas");
    const ctx = canvas?.getContext("2d");
    const scoreEl = root.querySelector("#breakout-score");
    const levelEl = root.querySelector("#breakout-level");
    const livesEl = root.querySelector("#breakout-lives");
    const message = root.querySelector("#breakout-message");
    const messageTitle = root.querySelector("#breakout-message-title");
    const messageText = root.querySelector("#breakout-message-text");
    const startBtn = root.querySelector("#breakout-start");
    const pauseBtn = root.querySelector("#breakout-pause");
    const resetBtn = root.querySelector("#breakout-reset");
    if (!canvas || !ctx || !message || !startBtn) return { destroy() {} };

    const W = 900, H = 540;
    const COLORS = ["#b7ff4a", "#76e6bb", "#66cfff", "#b1a0ff", "#ff91c8"];
    let raf = 0, lastTime = 0, destroyed = false;
    let state = "ready"; // ready, playing, paused, serve, between, gameover
    let score = 0, level = 1, lives = 3, bricks = [];
    const paddle = { x: W / 2, y: H - 38, w: 150, h: 14, speed: 680 };
    const ball = { x: W / 2, y: H - 58, r: 9, vx: 0, vy: 0, stuck: true };
    const keys = new Set();

    function updateHud() {
      if (scoreEl) scoreEl.textContent = String(score);
      if (levelEl) levelEl.textContent = String(level);
      if (livesEl) livesEl.textContent = String(lives);
    }

    function showMessage(title, text, buttonLabel) {
      messageTitle.textContent = title;
      messageText.textContent = text;
      startBtn.textContent = buttonLabel;
      message.hidden = false;
    }

    function hideMessage() {
      message.hidden = true;
    }

    function resetBall() {
      ball.stuck = true;
      ball.x = paddle.x;
      ball.y = paddle.y - ball.r - 4;
      ball.vx = 0;
      ball.vy = 0;
    }

    function buildLevel() {
      bricks = [];
      const columns = 12;
      const rows = Math.min(9, 3 + Math.floor((level - 1) / 2));
      const gap = 8, left = 38, top = 72, brickH = 22;
      const brickW = (W - left * 2 - gap * (columns - 1)) / columns;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          // Układ zmienia się z poziomu na poziom, ale każda plansza pozostaje grywalna.
          const pattern = (row * 7 + col * 3 + level) % 17;
          if (pattern === 0 && row > 0 && level % 3 !== 0) continue;
          const maxHp = Math.min(4, 1 + Math.floor((level - 1) / 5));
          const hp = Math.min(maxHp, 1 + ((row + col + level) % maxHp === 0 ? 1 : 0) +
            (level > 8 && (row + col) % 7 === 0 ? 1 : 0));
          bricks.push({
            x: left + col * (brickW + gap),
            y: top + row * (brickH + gap),
            w: brickW, h: brickH, hp: Math.min(maxHp, hp), maxHp,
            color: COLORS[(row + level + Math.floor(col / 3)) % COLORS.length],
            alive: true
          });
        }
      }
    }

    function resetGame() {
      score = 0; level = 1; lives = 3;
      paddle.x = W / 2;
      buildLevel();
      resetBall();
      state = "ready";
      pauseBtn.textContent = "PAUZA";
      updateHud();
      showMessage("BLOCK BREAKER", "Zbij wszystkie bloki. Kolejne stage są generowane bez końca, a trudność rośnie.", "GRAJ");
      draw();
    }

    function launchBall() {
      const speed = Math.min(430, 280 + level * 4);
      ball.stuck = false;
      ball.vx = (Math.random() * 2 - 1) * speed * 0.52;
      if (Math.abs(ball.vx) < 75) ball.vx = ball.vx < 0 ? -75 : 75;
      ball.vy = -Math.sqrt(Math.max(1, speed * speed - ball.vx * ball.vx));
      state = "playing";
      hideMessage();
      lastTime = 0;
    }

    function nextServe() {
      resetBall();
      state = "serve";
      showMessage("ŻYCIE STRACONE", "Ustaw platformę palcem albo strzałkami i graj dalej.", "KONTYNUUJ");
    }

    function advanceLevel() {
      level++;
      score += 100 + level * 10;
      paddle.x = W / 2;
      buildLevel();
      resetBall();
      updateHud();
      state = "between";
      showMessage("STAGE " + level, "Nowy układ bloków. Kulka przyspiesza, a bloki są twardsze.", "NASTĘPNY STAGE");
    }

    function gameOver() {
      state = "gameover";
      resetBall();
      showMessage("KONIEC GRY", "Wynik: " + score + " • dotarłeś do stage " + level + ".", "ZAGRAJ PONOWNIE");
    }

    function hitBrick(brick, oldX, oldY) {
      brick.hp--;
      score += 10;
      if (brick.hp <= 0) {
        brick.alive = false;
        score += 10;
      }
      if (oldX + ball.r <= brick.x || oldX - ball.r >= brick.x + brick.w) {
        ball.vx *= -1;
      } else if (oldY + ball.r <= brick.y || oldY - ball.r >= brick.y + brick.h) {
        ball.vy *= -1;
      } else {
        ball.vy *= -1;
      }
      updateHud();
    }

    function update(dt) {
      if (state !== "playing") {
        if (ball.stuck) {
          ball.x = paddle.x;
          ball.y = paddle.y - ball.r - 4;
        }
        return;
      }

      if (keys.has("ArrowLeft") || keys.has("KeyA")) paddle.x -= paddle.speed * dt;
      if (keys.has("ArrowRight") || keys.has("KeyD")) paddle.x += paddle.speed * dt;
      paddle.x = Math.max(paddle.w / 2 + 8, Math.min(W - paddle.w / 2 - 8, paddle.x));

      const oldX = ball.x, oldY = ball.y;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
      if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }

      // Kolizja z platformą — kąt odbicia zależy od miejsca trafienia.
      if (ball.vy > 0 &&
          ball.y + ball.r >= paddle.y &&
          ball.y - ball.r <= paddle.y + paddle.h &&
          ball.x >= paddle.x - paddle.w / 2 &&
          ball.x <= paddle.x + paddle.w / 2) {
        const offset = (ball.x - paddle.x) / (paddle.w / 2);
        const speed = Math.min(520, Math.max(280, Math.hypot(ball.vx, ball.vy) + 5));
        const angle = offset * 1.05;
        ball.vx = Math.sin(angle) * speed;
        ball.vy = -Math.cos(angle) * speed;
        ball.y = paddle.y - ball.r - 1;
      }

      for (const brick of bricks) {
        if (!brick.alive) continue;
        const nearX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.w));
        const nearY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.h));
        const dx = ball.x - nearX, dy = ball.y - nearY;
        if (dx * dx + dy * dy <= ball.r * ball.r) {
          hitBrick(brick, oldX, oldY);
          break;
        }
      }

      if (bricks.every(brick => !brick.alive)) {
        advanceLevel();
        return;
      }

      if (ball.y - ball.r > H) {
        lives--;
        updateHud();
        if (lives <= 0) gameOver();
        else nextServe();
      }
    }

    function roundedRect(x, y, w, h, radius) {
      const r = Math.min(radius, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#07100d");
      bg.addColorStop(1, "#080a16");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(183,255,74,.055)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      for (const brick of bricks) {
        if (!brick.alive) continue;
        ctx.save();
        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 8;
        const grad = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.h);
        grad.addColorStop(0, brick.color);
        grad.addColorStop(1, brick.hp > 1 ? "#273f4b" : "#17231d");
        ctx.fillStyle = grad;
        roundedRect(brick.x, brick.y, brick.w, brick.h, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = brick.color;
        ctx.globalAlpha = .5;
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (brick.hp > 1) {
          ctx.fillStyle = "#f3f7fa";
          ctx.font = "700 11px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(brick.hp), brick.x + brick.w / 2, brick.y + brick.h / 2);
        }
        ctx.restore();
      }

      const px = paddle.x - paddle.w / 2;
      const pgrad = ctx.createLinearGradient(px, paddle.y, px + paddle.w, paddle.y);
      pgrad.addColorStop(0, "#65d5ff");
      pgrad.addColorStop(.5, "#b7ff4a");
      pgrad.addColorStop(1, "#b1a0ff");
      ctx.save();
      ctx.shadowColor = "#b7ff4a";
      ctx.shadowBlur = 20;
      ctx.fillStyle = pgrad;
      roundedRect(px, paddle.y, paddle.w, paddle.h, 7);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "#f7fff0";
      ctx.shadowBlur = 22;
      const ballGrad = ctx.createRadialGradient(ball.x - 3, ball.y - 4, 1, ball.x, ball.y, ball.r);
      ballGrad.addColorStop(0, "#ffffff");
      ballGrad.addColorStop(.45, "#d8ff99");
      ballGrad.addColorStop(1, "#70e1ff");
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function frame(timestamp) {
      if (destroyed) return;
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min(.032, (timestamp - lastTime) / 1000);
      lastTime = timestamp;
      update(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }

    function positionPaddle(event) {
      if (root.hidden) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      paddle.x = Math.max(paddle.w / 2 + 8,
        Math.min(W - paddle.w / 2 - 8, (event.clientX - rect.left) * W / rect.width));
      if (ball.stuck) {
        ball.x = paddle.x;
        ball.y = paddle.y - ball.r - 4;
      }
    }

    function onKeyDown(event) {
      if (root.hidden || !root.isConnected) return;
      if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
      if (event.code === "ArrowLeft" || event.code === "ArrowRight" || event.code === "KeyA" || event.code === "KeyD") keys.add(event.code);
      if (event.code === "Space") togglePause();
      if (event.code === "Enter" && ["ready", "serve", "between"].includes(state)) startOrContinue();
    }

    function onKeyUp(event) { keys.delete(event.code); }

    function startOrContinue() {
      if (state === "gameover") {
        resetGame();
        launchBall();
      } else if (["ready", "serve", "between"].includes(state)) {
        launchBall();
      } else if (state === "paused") {
        state = "playing";
        hideMessage();
        pauseBtn.textContent = "PAUZA";
      }
    }

    function togglePause() {
      if (state === "playing") {
        state = "paused";
        showMessage("PAUZA", "Gra jest wstrzymana.", "WZNÓW");
        pauseBtn.textContent = "WZNÓW";
      } else if (state === "paused") {
        state = "playing";
        hideMessage();
        pauseBtn.textContent = "PAUZA";
        lastTime = 0;
      }
    }

    function onStartClick() { startOrContinue(); }
    function onPauseClick() { togglePause(); }
    function onResetClick() { resetGame(); }

    canvas.addEventListener("pointerdown", positionPaddle);
    canvas.addEventListener("pointermove", positionPaddle);
    canvas.addEventListener("touchmove", event => event.preventDefault(), { passive: false });
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    startBtn.addEventListener("click", onStartClick);
    pauseBtn.addEventListener("click", onPauseClick);
    resetBtn.addEventListener("click", onResetClick);

    resetGame();
    raf = requestAnimationFrame(frame);

    return {
      destroy() {
        destroyed = true;
        if (raf) cancelAnimationFrame(raf);
        canvas.removeEventListener("pointerdown", positionPaddle);
        canvas.removeEventListener("pointermove", positionPaddle);
        window.removeEventListener("keydown", onKeyDown, true);
        window.removeEventListener("keyup", onKeyUp, true);
        startBtn.removeEventListener("click", onStartClick);
        pauseBtn.removeEventListener("click", onPauseClick);
        resetBtn.removeEventListener("click", onResetClick);
      }
    };
  };
})();