document.addEventListener("DOMContentLoaded", () => {
  const startScreen   = document.getElementById("startScreen");
  const startBtn      = document.getElementById("startBtn");
  const restartBtn    = document.getElementById("restartBtn");
  const gameArea      = document.getElementById("characterScreen");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScoreEl   = document.getElementById("finalScore");
  const playAgainBtn   = document.getElementById("playAgainBtn");
  const muteBtn        = document.getElementById("muteBtn");

  let player, scoreBoard;
  let level  = 1;
  let score  = 0;
  let lives  = 3;
  let keys   = {};
  let canShoot = true;
  let isGameRunning = false;
  let isMuted = false;

  //---------- AUDIO ----------//
  const bgMusic    = new Audio("./sounds/bgMusic.mp3");
  const gunShot = new Audio("sounds/gunShot.mp3");
  const explosion  = new Audio("./sounds/explosion.mp3");
  const heartBeat  = new Audio("./sounds/heartBeat.mp3");
  const failBuzzer = new Audio("./sounds/failBuzzer.mp3");
  const gunShot    = new Audio("../sounds/gunShot.mp3");
  const explosion  = new Audio("sounds./explosion.mp3");
  const heartBeat  = new Audio("sounds./heartBeat.mp3");
  const failBuzzer = new Audio("sounds./failBuzzer.mp3");

  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  const play = sound => {
    if (!isMuted) {
      sound.currentTime = 0;
      sound.play();
    }
  };

  //---------- MUTE TOGGLE ---------//
  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    [bgMusic, gunShot, explosion, heartBeat, failBuzzer].forEach(sfx => sfx.muted = isMuted);
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
  });

  //--------- CREATE ELEMENTS ---------//
  function createPlayer() {
    player = document.createElement("div");
    player.id = "player";
    player.style.left   = `${(gameArea.clientWidth - 40) / 2}px`;
    player.style.bottom = "20px";
    gameArea.appendChild(player);
  }

  function createScoreBoard() {
    scoreBoard = document.createElement("div");
    scoreBoard.id = "scoreBoard";
    scoreBoard.innerHTML = `
      Kills: <span id="score">0</span> |
      Level: <span id="lvl">1</span> |
      Lives: <span id="lives">❤️❤️❤️</span>
    `;
    gameArea.appendChild(scoreBoard);
  }

  function updateScore() {
    document.getElementById("score").innerText = score;
    if (score > 0 && score % 10 === 0) level++;
    document.getElementById("lvl").innerText = level;
  }

  function updateLives() {
    document.getElementById("lives").innerText = "❤️".repeat(lives);
  }

  //--------- ENEMIES ---------//
  function spawnEnemy() {
    if (!isGameRunning) return;

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.style.left = `${Math.floor(Math.random() * 560)}px`;
    enemy.style.top  = "0px";
    gameArea.appendChild(enemy);

    const speed = 3 + level;
    let angle = 0;

    const enemyInterval = setInterval(() => {
      if (!isGameRunning) {
        enemy.remove(); clearInterval(enemyInterval); return;
      }

      const y = parseInt(enemy.style.top);
      const x = parseInt(enemy.style.left);

        // movement pattern by level (when enemies aim you); 
      if (level === 2) { 
        angle += 0.1; enemy.style.left = `${x + Math.sin(angle) * 5}px`; // This makes the enemy move in a zigzag pattern as it falls down.
      } else if (level === 3) { 
        const dx = player.offsetLeft - x; enemy.style.left = `${x + Math.sign(dx) * 2}px`; 
      } else if (level >= 4)  { 
        angle += 0.2; enemy.style.left = `${x + Math.sin(angle) * 6}px`; 
      }

      enemy.style.top = `${y + speed}px`;
       
      // off-screen
      if (y > gameArea.clientHeight) {
        enemy.remove(); clearInterval(enemyInterval); // means if the enemy has moved below the visible game area, to stop movement.
      }

      // collision with player
      if (player && isColliding(player, enemy)) {
        lives--;
        if (lives < 3) play(heartBeat);
        updateLives();
        enemy.remove(); clearInterval(enemyInterval);
        if (lives <= 0) endGame();
      }
    }, 50);

    setTimeout(spawnEnemy, Math.max(1000 - level * 100, 300));
  }

  //--------- SHOOT ----------//
  function shoot() {
    if (!canShoot || !isGameRunning) return;
    canShoot = false; setTimeout(() => (canShoot = true), 300);

    play(gunShot);

    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = `${player.offsetLeft + 17}px`;
    bullet.style.top  = `${player.offsetTop}px`;
    gameArea.appendChild(bullet);

    const interval = setInterval(() => {
      bullet.style.top = `${bullet.offsetTop - 10}px`;
      if (bullet.offsetTop < 0) {
        bullet.remove(); clearInterval(interval); return;
      }

      document.querySelectorAll(".enemy").forEach(enemy => {
        if (isColliding(bullet, enemy)) {
          play(explosion);
          bullet.remove(); enemy.remove(); clearInterval(interval);
          score++; updateScore();
        }
      });
    }, 30);
  }

  //--------- UTIL ----------//
  const isColliding = (a, b) => {
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();
    return !(r1.top > r2.bottom || r1.bottom < r2.top ||
             r1.right < r2.left || r1.left > r2.right);
  };

  function gameLoop() {
    if (!isGameRunning) return;
    if (keys["ArrowLeft"]  && player.offsetLeft > 0) player.style.left = `${player.offsetLeft - 5}px`;
    if (keys["ArrowRight"] && player.offsetLeft < gameArea.clientWidth - 40) player.style.left = `${player.offsetLeft + 5}px`;
    requestAnimationFrame(gameLoop);
  }

   //------- FLOW ----//
    function startGame() {
    isGameRunning = true;
    startScreen.style.display = "none";
    gameOverScreen.style.display = "none"; // hide overlay if it was open
    level = 1; score = 0; lives = 3; keys = {};
    gameArea.innerHTML = "";
    createPlayer(); createScoreBoard();
    updateScore(); updateLives();
    spawnEnemy(); requestAnimationFrame(gameLoop);
    play(bgMusic);
  }

  function endGame() {
    isGameRunning = false;
    play(failBuzzer);
    bgMusic.pause();
    document.querySelectorAll(".enemy, .bullet").forEach(el => el.remove());
    finalScoreEl.textContent = `You scored ${score} kills`;
    gameOverScreen.style.display = "flex";
  }

  //--------- CONTROLS ----------//
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", () => {
    restartBtn.style.display = "none";
    startGame();
  });

  playAgainBtn.addEventListener("click", startGame); // from overlay

      // clear entities
  document.addEventListener("keydown", e => {
    keys[e.key] = true;
    if (e.key === " ") shoot();
  });

      // show overlay
  document.addEventListener("keyup", e => {
    keys[e.key] = false;
  });
});
