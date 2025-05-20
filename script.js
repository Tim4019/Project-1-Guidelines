document.addEventListener("DOMContentLoaded", () => {
    const startScreen = document.getElementById("startScreen");
    const startBtn = document.getElementById("startBtn");
    const gameArea = document.getElementById("characterScreen");
  
    let player;
    let score = 0;
    let scoreBoard;
    let isGameRunning = false;
    let keys = {};
  
    function createPlayer() {
      player = document.createElement("div");
      player.id = "player";
      player.src = ""
      gameArea.appendChild(player);
    }
  
    function createScoreBoard() {
      scoreBoard = document.createElement("div");
      scoreBoard.id = "scoreBoard";
      scoreBoard.innerHTML = `Score: <span id="score">0</span>`;
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
  
      setTimeout(spawnEnemy, 1000);
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
      alert("Game Over! Your score: " + score);
      window.location.reload(); 
    }
  
    startBtn.addEventListener("click", startGame);
    document.addEventListener("keydown", (e) => {
      keys[e.key] = true;
      if (e.key === " ") shoot();
    });
    document.addEventListener("keyup", (e) => {
      keys[e.key] = false;
    });
  });
  