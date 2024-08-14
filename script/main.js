document.addEventListener('DOMContentLoaded', () => {
    const interfaz = document.querySelector('.Interfaz');
    const gameArea = document.getElementById('gameArea');
    const sujeto = document.getElementById('sujeto');

    interfaz.style.display = 'block';
    gameArea.style.display = 'none';

    document.addEventListener('keydown', () => {
        interfaz.style.display = 'none';
        gameArea.style.display = 'block';
        startGame(); 
    }, { once: true }); 

    function startGame() {
        console.log('Juego iniciado!');
        let movX = sujeto.offsetLeft;
    	let movY = sujeto.offsetTop;
    	let keysPressed = {};
    	let enemies = []; 
    	let bullets = []; 
    	let gameOver = false;
    	let cont = 0; 
    	let enemyTimer;

        enemyTimer = setInterval(createEnemy, 2000); 

        function updateMovement() {
            if (keysPressed['w']) movY -= 5;
            if (keysPressed['s']) movY += 5;
            if (keysPressed['a']) movX -= 5;
            if (keysPressed['d']) movX += 5;

            if (movX < 0) movX = 0;
            if (movY < 0) movY = 0;
            if (movX > gameArea.offsetWidth - sujeto.offsetWidth) movX = gameArea.offsetWidth - sujeto.offsetWidth;
            if (movY > gameArea.offsetHeight - sujeto.offsetHeight) movY = gameArea.offsetHeight - sujeto.offsetHeight;

            sujeto.style.top = movY + "px";
            sujeto.style.left = movX + "px";
        }

        function gameLoop() {
            if (!gameOver) {
                updateMovement();
                updateEnemies();
                updateBullets();
                requestAnimationFrame(gameLoop);
            }
        }
        gameLoop();

        document.addEventListener('keydown', function(event) {
            keysPressed[event.key] = true;
            if (event.key === 'x') {
                shootBullet();
            }
        });

        document.addEventListener('keyup', function(event) {
            delete keysPressed[event.key];
        });

        function shootBullet() {
            let bullet = document.createElement('div');
            bullet.className = 'bullet';
            bullet.style.left = (sujeto.offsetLeft + sujeto.offsetWidth / 2 - 1.5) + 'px'; 
            bullet.style.top = (sujeto.offsetTop - 10) + 'px';
            gameArea.appendChild(bullet);
            bullets.push(bullet);

            function moveBullet() {
                let bulletTop = bullet.offsetTop;
                if (bulletTop < 0) {
                    bullet.remove();
                    bullets = bullets.filter(b => b !== bullet); 
                    return;
                }
                bullet.style.top = bulletTop - 35 + 'px'; 
                requestAnimationFrame(moveBullet);
            }
            moveBullet();
        }

        function createEnemy() {
            let randomX = Math.floor(Math.random() * (gameArea.offsetWidth - 50)); 
            const enemy = document.createElement('div');
            enemy.className = 'enemy';
            enemy.style.left = `${randomX}px`;
            enemy.style.top = `0px`;
            gameArea.appendChild(enemy);
            enemies.push(enemy);
        }

        function updateEnemies() {
            enemies.forEach(enemy => {
                let top = parseInt(enemy.style.top, 10);
                top += 2; // Ajusta la velocidad de movimiento vertical del enemigo
                if (top > gameArea.offsetHeight) {
                    enemy.remove();
                    enemies = enemies.filter(e => e !== enemy);
                } else {
                    enemy.style.top = `${top}px`;
                }
                checkCollisionWithPlayer(enemy);
            });
        }

        function updateBullets() {
            bullets.forEach(bullet => {
                let bulletTop = bullet.offsetTop;
                if (bulletTop < 0) {
                    bullet.remove();
                    bullets = bullets.filter(b => b !== bullet);
                } else {
                    bullet.style.top = bulletTop - 35 + 'px'; 
                    checkCollisionWithEnemy(bullet);
                }
            });
        }

        let points = 0;

        function checkCollisionWithEnemy(bullet) {
            enemies.forEach(enemy => {
                let eRect = enemy.getBoundingClientRect();
                let bRect = bullet.getBoundingClientRect();
                
                if (eRect.left < bRect.right &&
                    eRect.right > bRect.left &&
                    eRect.top < bRect.bottom &&
                    eRect.bottom > bRect.top) {
                    
                    enemy.remove();
                    bullets = bullets.filter(b => b !== bullet); 
                    enemies = enemies.filter(e => e !== enemy); 
                    bullet.remove();
                    points += 100;
                    document.getElementById("points").innerHTML = "Puntos: " + points;
                    escribir();
                }
            });
        }

        function checkCollisionWithPlayer(enemy) {
            let eRect = enemy.getBoundingClientRect();
            let pRect = sujeto.getBoundingClientRect();
            
            if (eRect.left < pRect.right &&
                eRect.right > pRect.left &&
                eRect.top < pRect.bottom &&
                eRect.bottom > pRect.top) {
                endGame();
            }
        }

        function escribir() {
            cont++;
            document.getElementById("cont").innerHTML = "Número de muertes: " + cont;
        }

        function endGame() {
            gameOver = true;
            clearInterval(enemyTimer);
            alert('Game Over! Reloading the page...');
            window.location.reload();
        }
    }
});
