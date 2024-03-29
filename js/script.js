let canvas = document.getElementById("gameCanvas");
let scoreBoard = document.getElementById("score");
let currentScore = document.getElementById("currentScore");
let highScoreContainer = document.getElementById("highScore");
let startGame = document.getElementById("startGame");
let playPauseIt = document.getElementById("playPauseIt");
let gameStartBtn = document.getElementById("gameStartBtn");
let gameOver = document.getElementById("gameOver");
let gameOverReason = document.getElementById("gameOverReason");
let retryGame = document.getElementById("retryGame");
let controls = document.querySelector(".controls");
let leftControlBtn = document.getElementById("leftBtn");
let rightControlBtn = document.getElementById("rightBtn");
let upControlBtn = document.getElementById("upBtn");
let downControlBtn = document.getElementById("downBtn");
const canvasBgColor = "black";
const foodColor = "tomato";
const foodBorderColor = "white";
const snakeColor = "black";
const snakeBorderColor = "lightgray";
const gameSpeed = 300;
let snakeSize;
let timeoutHandle;
let gameStarted = false;
setHWofCanvas();
if (window.innerWidth >= 768) {
    snakeSize = 50;
} else {
    snakeSize = 20;
}
let snake = [
    { x: 100, y: 100 },
    { x: 100 - snakeSize, y: 100 },
    { x: 100 - snakeSize * 2, y: 100 },
    { x: 100 - snakeSize * 3, y: 100 }
];
let score = 0;
let changingDirection = false;
let foodX;
let foodY;
let dX = snakeSize;
let dY = 0;
let ctx = canvas.getContext("2d");
let timeoutNow;
let gamePaused = false;
let highScore;
const highScoreStorage = localStorage.getItem("highScore");
window.addEventListener("resize", setHWofCanvas);
gameStartBtn.addEventListener("click", startGameNow);
retryGame.addEventListener("click", replayGame);
window.addEventListener("keydown", changeDirection);
window.addEventListener("keydown", pressedEnter);
window.addEventListener("keydown", playPauseGame);
leftControlBtn.addEventListener("click", controlPressed);
leftControlBtn.addEventListener("touchstart", controlPressed);
rightControlBtn.addEventListener("click", controlPressed);
rightControlBtn.addEventListener("click", controlPressed);
downControlBtn.addEventListener("touchstart", controlPressed);
downControlBtn.addEventListener("click", controlPressed);
upControlBtn.addEventListener("touchstart", controlPressed);
upControlBtn.addEventListener("click", controlPressed);
clearCanvas();
createFood();
highScoreAvailable();
isGameCompleted();
function setHWofCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
function highScoreAvailable() {
    if (highScoreStorage !== null) {
        console.log("onload storage");
        highScoreContainer.innerHTML = highScoreStorage;
        highScoreContainer.parentElement.classList.remove("hide");
    }
}
function replayGame() {
    snake = [];
    snake.push(
        { x: 100, y: 100 },
        { x: 100 - snakeSize, y: 100 },
        { x: 100 - snakeSize * 2, y: 100 },
        { x: 100 - snakeSize * 3, y: 100 }
    );
    dX = snakeSize;
    dY = 0;
    gameOver.classList.remove("show");
    createFood();
    startGameNow();
}
function playPauseGame(e) {
    const keyCode = e.keyCode;
    const PkeyCode = 80;
    const isPKeyPressed = keyCode === PkeyCode;
    if (isPKeyPressed && gameStarted) {
        if (!gamePaused) {
            clearedTimeout();
            playPauseIt.classList.add("show");
            gamePaused = true;
        } else {
            startGameNow();
            playPauseIt.classList.remove("show");
            gamePaused = false;
        }
    }
}
function pressedEnter(e) {
    const enterkeyCode = 13;
    const keyCode = e.keyCode;
    const enterPressed = keyCode === enterkeyCode;
    if (!gameStarted && enterPressed) {
        startGameNow();
    }
}
function startGameNow() {
    gameStarted = true;
    if (window.innerWidth <= 768) {
        if (gameStarted) controls.classList.remove("hide");
    }
    score = 0;
    scoreBoard.innerHTML = score;
    const isShowing = startGame.classList.contains("show");
    if (isShowing) {
        startGame.classList.remove("show");
    }
    scoreBoard.classList.add("show");
    main();
}
function main() {
    const didHitWall = hitWall();
    const didHitItself = hitItself();
    if (didHitWall || didHitItself) {
        if (didHitItself) {
            gameOverReason.innerHTML = "You Bit Yourself!"
        }
        if (didHitWall) {
            gameOverReason.innerHTML = "You Hit Wall!"
        }
        currentScore.innerHTML = scoreBoard.textContent;
        scoreBoard.classList.remove("show");
        gameOver.classList.add("show");
        if (highScoreStorage == null && score > 0) {
            console.log("initial storage");
            localStorage.setItem("highScore", score);
            highScoreContainer.innerHTML = localStorage.getItem("highScore");
            highScoreContainer.parentElement.classList.remove("hide");
        }
        if (highScoreStorage !== null && score > highScoreStorage) {
            console.log("update storage");
            localStorage.setItem("highScore", score);
            highScoreContainer.innerHTML = localStorage.getItem("highScore");
        }
        return;
    }
    if (isGameCompleted()) {
        return;
    }
    timeoutNow = setTimeout(function () {
        changingDirection = false;
        clearCanvas();
        drawFood();
        advanceSnake();
        drawSnake();
        main();
    }, gameSpeed)
}
function clearedTimeout() {
    if (timeoutHandle) console.log("cleared"); clearTimeout(timeoutNow);
    timeoutHandle = null;
}
function isGameCompleted() {
    const totalPixels = canvas.width * canvas.height;
    const maxLengthOfSnake = totalPixels / (snakeSize * snakeSize);
    if (snake.length > maxLengthOfSnake - 1) {
        clearedTimeout();
        timeoutHandle = null;
        gameOver.querySelector("h2").innerHTML = "Congratulations"
        currentScore.innerHTML = score;
        gameOverReason.innerHTML = "Your snake ate all food :)";
        gameOver.classList.add("show");
        return true;
    }
    return false;
}
function clearCanvas() {
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function generateNumber(min, max) {
    return Math.round((Math.random() * (max - min) + min) / snakeSize) * snakeSize;
}

function createFood() {
    foodX = generateNumber(0, canvas.width - snakeSize);
    foodY = generateNumber(0, canvas.height - snakeSize);
    snake.forEach(function (part) {
        if (part.x == foodX && part.y == foodY) {
            createFood();
        }
    });
}
function drawFood() {
    ctx.fillStyle = foodColor;
    ctx.strokeStyle = foodBorderColor;
    ctx.fillRect(foodX, foodY, snakeSize, snakeSize);
    ctx.strokeRect(foodX, foodY, snakeSize, snakeSize);
}
function drawSnakePart(part) {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorderColor;
    ctx.fillRect(part.x, part.y, snakeSize, snakeSize);
    ctx.strokeRect(part.x, part.y, snakeSize, snakeSize);
}
function drawSnake() {
    snake.forEach(drawSnakePart);
}
function advanceSnake() {
    let head = { x: snake[0].x + dX, y: snake[0].y + dY };
    snake.unshift(head);
    if (snake[0].x == foodX && snake[0].y == foodY) {
        score += 10;
        scoreBoard.innerHTML = score;
        createFood();
    } else {
        snake.pop();
    }
}
function hitItself() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
            return true;
        }
    }
}
function hitWall() {
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > canvas.width - snakeSize;
    const hitUpWall = snake[0].y < 0;
    const hitDownWall = snake[0].y > canvas.height - snakeSize;
    return hitDownWall || hitLeftWall || hitRightWall || hitUpWall;
}
function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;
    const keyCode = event.keyCode;

    const keyLeft = 37;
    const keyDown = 40;
    const keyRight = 39;
    const keyUp = 38;

    const goingLeft = dX === -snakeSize;
    const goingRight = dX === snakeSize;
    const goingUp = dY === -snakeSize;
    const goingDown = dY === snakeSize;

    if (keyCode == keyLeft && !goingRight) {
        dX = -snakeSize;
        dY = 0;
    }

    if (keyCode == keyRight && !goingLeft) {
        dX = snakeSize;
        dY = 0;
    }

    if (keyCode == keyDown && !goingUp) {
        dX = 0;
        dY = snakeSize;
    }

    if (keyCode == keyUp && !goingDown) {
        dX = 0;
        dY = -snakeSize;
    }
}
function controlPressed(e) {
    const btnsId = e.target.id;
    const goingLeft = dX === -snakeSize;
    const goingRight = dX === snakeSize;
    const goingUp = dY === -snakeSize;
    const goingDown = dY === snakeSize;
    if (btnsId == "downBtn" && !goingUp) {
        dX = 0;
        dY = snakeSize;
    }
    if (btnsId == "upBtn" && !goingDown) {
        dX = 0;
        dY = -snakeSize;
    }
    if (btnsId == "leftBtn" && !goingRight) {
        dX = -snakeSize;
        dY = 0;
    }
    if (btnsId == "rightBtn" && !goingLeft) {
        dX = snakeSize;
        dY = 0;
    }
}