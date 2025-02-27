window.addEventListener('load', function () { 
    const canvas = document.getElementById('canvas1'); 
    const ctx = canvas.getContext('2d'); 
    canvas.width = 800; 
    canvas.height = 720; 
    let enemies = []; 
    let score = 0; 
    let gameOver = false; 
    let gameStarted = false; 
    let quizTime = true;
    let answerRed = false;
    let answerBlue = false;
    let answerPurple = false;
    let answer = 2;

    // Start screen elements
    const startScreen = document.createElement('div');
    startScreen.style.position = 'absolute';
    startScreen.style.top = '50%';
    startScreen.style.left = '50%';
    startScreen.style.transform = 'translate(-50%, -50%)';
    startScreen.style.textAlign = 'center';
    startScreen.style.fontSize = '30px';
    startScreen.style.fontFamily = 'Helvetica, sans-serif';
    startScreen.style.color = 'white';
    startScreen.innerHTML = `
        <h3>Shadow's Aventure à travers la Suisse</h3>
        <h4>  Utilisez les touches fléchées pour vous déplacer.</h4>
        <h4> Tous les ennemis ont une aura invisible autour d'eux </h4>
        <h4>qui mettra fin à votre partie!! </h4>
        <h4>Vous ne pouvez appuyer que sur 1 touche à la fois.</h4>
        <p>Appuyez sur 'Entrée' pour démarrer</p>
    `;
    document.body.appendChild(startScreen);

    // Handle keypress for game start
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !gameStarted) {
            gameStarted = true;
            document.body.removeChild(startScreen); // Remove the start screen
            animate(0); // Start the game animation
        }
    });

    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight') 
                    && this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', e => {
                if (this.keys.includes(e.key)) {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.maxFrame = 8;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime, enemies) {
            // Collision detection with enemies
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width / 2) - (this.x + this.width / 2);
                const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < enemy.width / 2 + this.width / 2) {
                    // Specific collision checks
                    if (enemy instanceof Enemy) {
                        if (!quizTime) {
                            // Game Over if a normal enemy hits the player and it's not quiz time
                            gameOver = true;
                        }
                    } else if ((enemy instanceof EnemyRed && !answerRed) || 
                               (enemy instanceof EnemyBlue && !answerBlue) || 
                               (enemy instanceof EnemyPurple && !answerPurple)) {
                        // Game Over only if player answers wrong
                        gameOver = true;
                    }
                }
            });

            // Sprite animation
            if (this.frameTimer > this.frameInterval) {
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // Controls
            this.speed = 0;
            if (input.keys.includes('ArrowRight')) this.speed = 5;
            if (input.keys.includes('ArrowLeft')) this.speed = -5;
            if (input.keys.includes('ArrowUp') && this.onGround()) this.vy -= 32;

            // Horizontal movement
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;

            // Vertical movement
            this.y += this.vy;
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else {
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }
        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }
  




   


    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 7;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    }

    // Enemy Red, Blue, and Purple classes (same as previous, no changes needed)
    class EnemyRed {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImageRed');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 8;
            this.markedforDeletion = false;
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedforDeletion = true;
                score++;
            }
        }
    }

    class EnemyBlue {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImageBlue');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 8;
            this.markedforDeletion = false;
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedforDeletion = true;
                score++;
            }
        }
    }

    class EnemyPurple {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImagePurple');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 8;
            this.markedforDeletion = false;
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedforDeletion = true;
                score++;
            }
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 8;
            this.markedforDeletion = false;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime){
            if (this.frameTimer > this.frameInterval){
                if(this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedforDeletion = true;
                score++;
            } 
        
        }
    }
    let enemyTimer = 0;
    let currentEnemyIndex = 0;
    const enemiesToSpawn = [EnemyRed, EnemyPurple, EnemyBlue];

    function handleEnemies(deltaTime) {
        // Update the enemy spawn timer
        enemyTimer += deltaTime;
    
        if (enemyTimer > 5000) {
            if (quizTime) { 
                // Spawn red, blue, or purple enemies during quizTime
                const EnemyClass = enemiesToSpawn[currentEnemyIndex];
                enemies.push(new EnemyClass(canvas.width, canvas.height));
                currentEnemyIndex = (currentEnemyIndex + 1) % enemiesToSpawn.length;
            } else {
                // Spawn normal enemies when quizTime is false
                enemies.push(new Enemy(canvas.width, canvas.height));
            }
            enemyTimer = 0; // Reset the timer
        }
    
        // Update and draw enemies
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
    
        // Remove enemies marked for deletion
        enemies = enemies.filter(enemy => !enemy.markedforDeletion);
    }

    function displayStatusText1(context) {

            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('Bonjour, sautez par-dessus les ennemis pour gagner des points. Lorsque une question est affichée, les ennemis changeront de couleur en fonction des options proposées. Vous devrez traverser lennemi de la couleur correspondant à la bonne réponse pour continuer', canvas.width / 2, 200);
            context.fillStyle = 'white';
            context.fillText('Bonjour, sautez par-dessus les ennemis pour gagner des points. Lorsque une question est affichée, les ennemis changeront de couleur en fonction des options proposées. Vous devrez traverser lennemi de la couleur correspondant à la bonne réponse pour continuer', canvas.width / 2 + 2, 202);
    }

    function displayStatusText(context) {
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 20, 50);
        context.fillStyle = 'white';
        context.fillText('Score: ' + score, 22, 52);
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('Fin de Jeu, Ctrl + r pour réessayer! ', canvas.width / 2, 200);
            context.fillStyle = 'white';
            context.fillText('Fin de Jeu, Ctrl + r pour réessayer! ', canvas.width / 2 + 2, 202);
        }
    }


    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemies(deltaTime);
        displayStatusText(ctx);
        displayStatusText1(ctx);
        if (!gameOver) requestAnimationFrame(animate);
    }
});
