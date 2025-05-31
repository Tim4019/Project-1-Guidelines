// Wait for the HTML content to fully load before running the game logic
document.addEventListener("DOMContentLoaded", () => {
  //----- DOM Elements -----
  const startScreen = document.getElementById("startScreen");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const gameArea = document.getElementById("characterScreen");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScoreEl = document.getElementById("finalScore");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const muteBtn = document.getElementById("muteBtn");

  //----- Game State Variables -----
  let player, scoreBoard;
  let level = 1;
  let score = 0;
  let lives = 3;
  let keys = {};             // Tracks keys being pressed
  let canShoot = true;       // Controls shooting rate
  let isGameRunning = false; // Game running flag
  let isMuted = false;       // Sound mute toggle

  //----- Audio Setup -----
  const bgMusic = new Audio("./sounds/bgMusic.mp3");
  const gunShot = new Audio("./sounds/gunShot.mp3");
  const explosion = new Audio("./sounds/explosion.mp3");
  const heartBeat = new Audio("./sounds/heartBeat.mp3");
  const failBuzzer = new Audio("./sounds/failBuzzer.mp3");

  // Set looping and volume for audio
  bgMusic.loop = true;
  bgMusic.volume = 0.1;
  gunShot.volume = 0.1;
  explosion.volume = 0.1;
  heartBeat.volume = 0.1;
  failBuzzer.volume = 0.1;

  // Function to play a sound if not muted
  const play = (sound) => {
    if (!isMuted) {
      sound.currentTime = 0;
      sound.play();
    }
  };

  //----- Mute Button Toggle -----
  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    [bgMusic, gunShot, explosion, heartBeat, failBuzzer].forEach(
      (sfx) => (sfx.muted = isMuted)
    );
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
  });

  //----- Player & UI Creation -----
  function createPlayer() {
    player = document.createElement("div");
    player.id = "player";
    player.style.position = "absolute";
    player.style.left = `${gameArea.clientWidth - 40 / 2}px`;
    player.style.top = `${gameArea.clientHeight - 80}px`;
    gameArea.appendChild(player);
  }

  function createScoreBoard() {
    scoreBoard = document.createElement("div");
    scoreBoard.id = "scoreBoard";
    scoreBoard.innerHTML = `
      Kills: <span id="score">0</span> |
      Level: <span id="lvl">1</span> |
      Lives: <span id="lives">❤❤❤</span>
    `;
    gameArea.appendChild(scoreBoard);
  }

  // Update score and level display
  function updateScore() {
    document.getElementById("score").innerText = score;
    if (score > 0 && score % 10 === 0) level++; // Increase level every 10 kills
    document.getElementById("lvl").innerText = level;
  }

  // Update lives display
  function updateLives() {
    document.getElementById("lives").innerText = "❤".repeat(lives);
  }

  //----- Enemy Spawning & Movement -----
  function spawnEnemy() {
    if (!isGameRunning) return;

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.style.left = `${Math.floor(Math.random() * 1180)}px`; // Random x position
    enemy.style.top = "0px";
    gameArea.appendChild(enemy);

    const speed = 3 + level; // Increase speed with level
    let angle = 0; // For sine-wave movement

    const enemyInterval = setInterval(() => {
      if (!isGameRunning) {
        enemy.remove();
        clearInterval(enemyInterval);
        return;
      }

      const y = parseInt(enemy.style.top);
      const x = parseInt(enemy.style.left);

      // Movement patterns based on level(zig zag and homing every time you get to the next wave)
      if (level === 2) {
        angle += 0.1;
        enemy.style.left = `${x + Math.sin(angle) * 5}px`; // Sine-wave movement
      } else if (level === 3) {
        const dx = player.offsetLeft - x;
        enemy.style.left = `${x + Math.sign(dx) * 2}px`; // Homing movement
      } else if (level >= 4) {
        angle += 0.2;
        enemy.style.left = `${x + Math.sin(angle) * 6}px`;
      }

      enemy.style.top = `${y + speed}px`; // Fall speed

      // Remove enemy if off-screen
      if (y > gameArea.clientHeight) {
        enemy.remove();
        clearInterval(enemyInterval);
      }

      // Collision with player
      if (player && isColliding(player, enemy)) {
        lives--;
        if (lives < 3) play(heartBeat);
        updateLives();
        enemy.remove();
        clearInterval(enemyInterval);
        if (lives <= 0) endGame();
      }
    }, 50);

    // Recursive call to keep spawning enemies with delay
    setTimeout(spawnEnemy, Math.max(1000 - level * 100, 0));
  }

  //----- Shooting Logic -----
  function shoot() {
    if (!canShoot || !isGameRunning) return;
    canShoot = false;
    setTimeout(() => (canShoot = true), 300); // Shooting cooldown

    play(gunShot);

    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = `${player.offsetLeft + 27}px`; // Bullet position centered
    bullet.style.top = `${player.offsetTop}px`;
    gameArea.appendChild(bullet);

    const interval = setInterval(() => {
      bullet.style.top = `${bullet.offsetTop - 10}px`; // Move bullet up

      // Remove bullet if it goes off screen
      if (bullet.offsetTop < 0) {
        bullet.remove();
        clearInterval(interval);
        return;
      }

      // Check collision with enemies
      document.querySelectorAll(".enemy").forEach((enemy) => {
        if (isColliding(bullet, enemy)) {
          play(explosion);
          bullet.remove();
          enemy.remove();
          clearInterval(interval);
          score++;
          updateScore();
        }
      });
    }, 30);
  }

  //----- Collision Detection -----
  const isColliding = (a, b) => {
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();
    return !(
      r1.top > r2.bottom ||
      r1.bottom < r2.top ||
      r1.right < r2.left ||
      r1.left > r2.right
    );
  };

  //----- Player Movement -----
  function gameLoop() {
    if (!isGameRunning) return;

    const speed = 2;

    if (keys["ArrowLeft"] && player.offsetLeft > 0) {
      player.style.left = `${player.offsetLeft - speed}px`;
    }

    if (
      keys["ArrowRight"] &&
      player.offsetLeft < gameArea.clientWidth - player.offsetWidth
    ) {
      player.style.left = `${player.offsetLeft + speed}px`;
    }

    if (keys["ArrowUp"] && player.offsetTop > 0) {
      player.style.top = `${player.offsetTop - speed}px`;
    }

    if (
      keys["ArrowDown"] &&
      player.offsetTop < gameArea.clientHeight - player.offsetHeight
    ) {
      player.style.top = `${player.offsetTop + speed}px`;
    }

    requestAnimationFrame(gameLoop); // Call every frame
  }

  //----- Background Scrolling -----
  let roadOffset = 0;

  function scrollRoad() {
    if (!isGameRunning) return;

    roadOffset += 20;
    gameArea.style.backgroundPositionY = `${roadOffset}px`;
    requestAnimationFrame(scrollRoad);
  }

  //----- Game Start / End Logic -----
  function startGame() {
    isGameRunning = true;
    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";
    level = 1;
    score = 0;
    lives = 3;
    keys = {};
    gameArea.innerHTML = "";
    createPlayer();
    createScoreBoard();
    updateScore();
    updateLives();
    spawnEnemy();
    requestAnimationFrame(gameLoop);
    scrollRoad();
    play(bgMusic);
    roadOffset = 0;
    gameArea.style.backgroundPositionY = `0px`;
  }

  function endGame() {
    isGameRunning = false;
    play(failBuzzer);
    bgMusic.pause();
    document.querySelectorAll(".enemy, .bullet").forEach((el) => el.remove());
    finalScoreEl.textContent = `You scored ${score} kills`;
    gameOverScreen.style.display = "flex";
  }

  //----- Button Events -----
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", () => {
    restartBtn.style.display = "none";
    startGame();
  });
  playAgainBtn.addEventListener("click", startGame);

  //----- Key Controls -----
  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " ") shoot(); // Spacebar to shoot
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });
});
