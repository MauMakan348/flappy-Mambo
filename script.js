const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");

canvas.width = 400;
canvas.height = 600;

// Bird
let birdImg = new Image();
birdImg.src = "Matikanetannhauser_Chibi1-2.webp";

//Background
let bgImg = new Image();
bgImg.src = "bgflappy.jpg";

// Ground image
let groundImg = new Image();
groundImg.src = "tanah.png";

// SFX jump
let jumpSfx = new Audio("mambou.mp3");
let jumpSound = new Audio("mambou.mp3");
jumpSound.volume = 0.1; // 30% volume
let hitSfx = new Audio("mambod.mp3");
let scoreSfx = new Audio("mamboketawa.mp3");

let bgPattern;
bgImg.onload = function () {
  bgPattern = ctx.createPattern(bgImg, "repeat");
};

let topPipeImg = new Image();
topPipeImg.src = "toppipe.png";

let bottomPipeImg = new Image();
bottomPipeImg.src = "bottompipe.png";

let bird = {
  x: 50,
  y: 150,
  w: 60,
  h: 80,
  gravity: 0.6, // lebih ringan biar jatuhnya smooth
  lift: -9, // lompat lebih pendek
  velocity: 0,
};

// Ground
let groundHeight = 80;

// Pipes
let pipes = [];
let frame = 0;
let score = 0;

// Game state
let gameState = "start"; // "start", "play", "over"

// Controls
document.addEventListener("keydown", (e) => {
  if (gameState === "play") {
    bird.velocity = bird.lift;
  }

  // Tekan spasi di menu start / game over untuk mulai lagi
  if (e.code === "Space" && (gameState === "start" || gameState === "over")) {
    resetGame();
    gameState = "play";
    startBtn.style.display = "none";
  }
});

// Start button
startBtn.addEventListener("click", () => {
  resetGame();
  gameState = "play";
  startBtn.style.display = "none";
});

// Reset function
function resetGame() {
  bird.y = 150;
  bird.velocity = 0;
  pipes = [];
  frame = 0;
  score = 0;
}

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background repeat tile (kalau sudah siap)
  if (bgPattern) {
    ctx.fillStyle = bgPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (gameState === "start") {
    // Judul game
    ctx.fillStyle = "#9A3F3F";
    ctx.font = "bold 40px Roboto Black";
    ctx.textAlign = "center";
    ctx.fillText("FLAPPY MAMBO", canvas.width / 2, canvas.height / 3);

    // Burung preview
    ctx.drawImage(
      birdImg,
      canvas.width / 2 - bird.w / 2,
      canvas.height / 2 - bird.h,
      bird.w,
      bird.h
    );

    // Teks instruksi berkedip
    ctx.font = "20px Arial";
    ctx.fillStyle = "blue";
    if (Math.floor(frame / 30) % 2 === 0) {
      // bikin kedip tiap setengah detik
      ctx.fillText(
        "Tekan Spasi atau Klik Start",
        canvas.width / 2,
        canvas.height / 1.5
      );
    }
  }

  if (gameState === "play") {
    // Bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // === Batasi burung biar nggak jatuh lewat tanah ===
    if (bird.y + bird.h > canvas.height - groundHeight) {
      gameOver();
    }

    // Draw bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.w, bird.h);

    // Pipes
    if (frame % 90 === 0) {
      let pipeHeight = Math.floor(Math.random() * 200) + 100;
      pipes.push({
        x: canvas.width,
        y: pipeHeight,
        w: 50,
        gap: 220,
      });
    }

    // pipe image
    let topPipeImg = new Image();
    topPipeImg.src = "toppipe.png";

    let bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.png";

    pipes.forEach((pipe) => {
      pipe.x -= 2.5;

      // Draw top pipe pakai gambar
      ctx.drawImage(topPipeImg, pipe.x, 0, pipe.w, pipe.y);

      // Draw bottom pipe pakai gambar
      ctx.drawImage(
        bottomPipeImg,
        pipe.x,
        pipe.y + pipe.gap,
        pipe.w,
        canvas.height - groundHeight - (pipe.y + pipe.gap)
      );

      // Collision detection
      if (
        bird.x < pipe.x + pipe.w &&
        bird.x + bird.w > pipe.x &&
        (bird.y < pipe.y || bird.y + bird.h > pipe.y + pipe.gap)
      ) {
        gameOver();
      }

      if (!pipe.passed && pipe.x + pipe.w < bird.x) {
        score++;
        pipe.passed = true; // supaya tidak dihitung lagi

        if (score % 10 === 0) {
          scoreSfx.currentTime = 0;
          scoreSfx.play();
        }
      }

      document.addEventListener("keydown", (e) => {
        if (gameState === "play") {
          bird.velocity = bird.lift;
          jumpSfx.currentTime = 0; // reset biar bisa diputar cepat berulang
          jumpSfx.play();
        }

        if (
          e.code === "Space" &&
          (gameState === "start" || gameState === "over")
        ) {
          resetGame();
          gameState = "play";
          startBtn.style.display = "none";
        }
      });

      // Collision detection tetap sama
      if (
        bird.x < pipe.x + pipe.w &&
        bird.x + bird.w > pipe.x &&
        (bird.y < pipe.y || bird.y + bird.h > pipe.y + pipe.gap)
      ) {
        gameOver();
      }

      // Score update
      if (pipe.x + pipe.w === bird.x) {
        score++;
        if (score % 10 === 0) {
          scoreSfx.currentTime = 0;
          scoreSfx.play();
        }
      }
    });

    // Remove offscreen pipes
    pipes = pipes.filter((pipe) => pipe.x + pipe.w > 0);

    // Draw ground pakai gambar
    ctx.drawImage(
      groundImg,
      0,
      canvas.height - groundHeight,
      canvas.width,
      groundHeight
    );

    // Draw score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.textAlign = "right"; // rata kanan
    ctx.fillText("Score: " + score, canvas.width - 10, 30);

    frame++;
  }

  // ✅ Tambahkan Game Over di luar blok "play"
  if (gameState === "over") {
    ctx.fillStyle = "#9A3F3F";
    ctx.font = "Bold 40px Roboto";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Tekan Spasi", canvas.width / 2, canvas.height / 2 + 50);
  }

  requestAnimationFrame(gameLoop);
}

function gameOver() {
  gameState = "over";
  startBtn.style.display = "block";
  startBtn.textContent = "Main Lagi";

  hitSfx.currentTime = 0;
  hitSfx.play();
}

gameLoop();
