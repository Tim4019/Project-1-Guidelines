document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("startScreen");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const gameArea = document.getElementById("characterScreen");

  let player;
  let level = 1;
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
    scoreBoard.innerHTML = `Kills: <span id="score">0</span> | Level: <span id="lvl">1</span>`;
    gameArea.appendChild(scoreBoard);
  }

  function updateScore() {
    document.getElementById("score").innerText = score;
  
    if (score > 0 && score % 10 === 0) {
      level += 1;
      console.log("Level up! Level:", level);
    }
  
    document.getElementById("lvl").innerText = level;
  }  

  function spawnEnemy() {
    if (!isGameRunning) return;
  
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.style.left = `${Math.floor(Math.random() * 560)}px`;
    enemy.style.top = "0px";
    gameArea.appendChild(enemy);
  
    console.log(`Enemy spawned at level ${level}`);
  
    const speed = 3 + level; // speed increases each level
    let angle = 0;
  
    let enemyInterval = setInterval(() => {
      if (!isGameRunning) {
        enemy.remove();
        clearInterval(enemyInterval);
        return;
      }
  
      let currentTop = parseInt(enemy.style.top);
      let currentLeft = parseInt(enemy.style.left);
  
      // Level-specific behavior:
      if (level === 2) {
        // Zigzag
        angle += 0.1;
        enemy.style.left = `${currentLeft + Math.sin(angle) * 5}px`;
      } else if (level === 3) {
        // Homing
        if (player) {
          const dx = player.offsetLeft - currentLeft;
          enemy.style.left = `${currentLeft + Math.sign(dx) * 2}px`;
        }
      } else if (level >= 4) {
        // Zigzag + speed boost
        angle += 0.2;
        enemy.style.left = `${currentLeft + Math.sin(angle) * 6}px`;
      }
  
      // Always move downward
      enemy.style.top = `${currentTop + speed}px`;
  
      // Off-screen or collision
      if (currentTop > 400) {
        enemy.remove();
        clearInterval(enemyInterval);
      }
  
      if (player && isColliding(player, enemy)) {
        endGame();
      }
    }, 50);
  
    // Spawn next enemy after delay
    setTimeout(spawnEnemy, Math.max(1000 - level * 100, 300));
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
        return;
      }
    
      const enemies = document.querySelectorAll(".enemy");
      enemies.forEach((enemy) => {
        if (isColliding(bullet, enemy)) {
          console.log("Collision detected!"); // ADD THIS
          bullet.remove();
          enemy.remove();
          score += 1;
          console.log("Score is now:", score); // ADD THIS
          updateScore();
          clearInterval(interval);
        }
      });
    }, 30);       
  }

  function isColliding(a, b) {
    const rect1 = a.getBoundingClientRect();
    const rect2 = b.getBoundingClientRect();
    console.log("Checking collision:", rect1, rect2); // ADD THIS
  
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
