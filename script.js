document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("startScreen");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const gameArea = document.getElementById("characterScreen");

  let player;
  let score = 0;
  let scoreBoard;
  let isGameRunning = false;
  let keys = {};

  function createPlayer() {
    player = document.createElement("div");
    player.id = "player";
    gameArea.appendChild(player);
  }

  function createScoreBoard() {
    scoreBoard = document.createElement("div");
    scoreBoard.id = "scoreBoard";
    scoreBoard.innerHTML = `Kills: <span id="score">0</span>`;
    gameArea.appendChild(scoreBoard);
  }

  function updateScore() {
    document.getElementById("score").innerText = score;
  }

  function spawnEnemy() {
    if (!isGameRunning) return;

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.style.left = `${Math.floor(Math.random() * 560)}px`;
    gameArea.appendChild(enemy);

    let enemyInterval = setInterval(() => {
      const currentTop = parseInt(enemy.style.top || "0");
      if (currentTop > 400) {
        enemy.remove();
        clearInterval(enemyInterval);
      } else {
        enemy.style.top = `${currentTop + 5}px`;
      }

      if (player && isColliding(player, enemy)) {
        endGame();
      }
    }, 50);

    setTimeout(spawnEnemy, Math.max(800 - score * 5, 300)); // speed up spawn rate
  }

  function shoot() {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = `${player.offsetLeft + 17}px`;
    bullet.style.top = `${player.offsetTop}px`;
    gameArea.appendChild(bullet);

    const interval = setInterval(() => {
      bullet.style.top = `${bullet.offsetTop - 10}px`;

      if (bullet.offsetTop < 0) {
        bullet.remove();
        clearInterval(interval);
      }

      const enemies = document.querySelectorAll(".enemy");
      enemies.forEach((enemy) => {
        if (isColliding(bullet, enemy)) {
          bullet.remove();
          enemy.remove();
          score += 1;
          updateScore();
        }
      });
    }, 30);
  }

  function isColliding(a, b) {
    const rect1 = a.getBoundingClientRect();
    const rect2 = b.getBoundingClientRect();

    return !(
      rect1.top > rect2.bottom ||
      rect1.bottom < rect2.top ||
      rect1.right < rect2.left ||
      rect1.left > rect2.right
    );
  }

  function gameLoop() {
    if (!isGameRunning) return;

    if (keys["ArrowLeft"] && player.offsetLeft > 0) {
      player.style.left = `${player.offsetLeft - 5}px`;
    }
    if (keys["ArrowRight"] && player.offsetLeft < gameArea.clientWidth - 40) {
      player.style.left = `${player.offsetLeft + 5}px`;
    }

    requestAnimationFrame(gameLoop);
  }

  function startGame() {
    isGameRunning = true;
    startScreen.style.display = "none";
    createPlayer();
    createScoreBoard();
    spawnEnemy();
    requestAnimationFrame(gameLoop);
  }

  function endGame() {
    isGameRunning = false;
    document.querySelectorAll(".enemy, .bullet").forEach(el => el.remove());
    alert("You were eaten! Final kill count: " + score);
    restartBtn.style.display = "inline-block";
  }

  function restartGame() {
    gameArea.innerHTML = "";
    score = 0;
    keys = {};
    isGameRunning = true;
    createPlayer();
    createScoreBoard();
    updateScore();
    restartBtn.style.display = "none";
    spawnEnemy();
    requestAnimationFrame(gameLoop);
  }

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", restartGame);
  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " ") shoot();
  });
  document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });
});
