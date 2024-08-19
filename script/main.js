document.addEventListener('DOMContentLoaded', () => {
    const interfaz = document.querySelector('.Interfaz');
    const gameArea = document.getElementById('gameArea');
    const sujeto = document.getElementById('sujeto');
    const pauseOverlay = document.getElementById('pauseOverlay'); // Interfaz de pausa

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
        let gamePaused = false; // Estado de pausa
        let enemyTimer;
        let points = 0;
	let cont = 0;
        let canShoot = true;
        let shootInterval = 200;
        let canShootBurst = true;
        let burstCooldown = 1000; // Cooldown de 1 segundo para la ráfaga

        function startEnemyGeneration() {
            enemyTimer = setInterval(createEnemy, 2000); // Genera enemigos cada 2 segundos
        }

        function stopEnemyGeneration() {
            clearInterval(enemyTimer);
        }

        startEnemyGeneration();

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
            if (!gameOver && !gamePaused) { // Verifica si el juego no está en pausa
                updateMovement();
                updateEnemies();
                updateBullets();
            }
            requestAnimationFrame(gameLoop); // Sigue ejecutando el loop, pero no actualiza si está en pausa
        }
        gameLoop();

        document.addEventListener('keydown', function(event) {
            keysPressed[event.key] = true;
            if (event.key === 'x' && canShoot) {
                shootBullet();
                canShoot = false;
                setTimeout(() => {
                    canShoot = true;
                }, shootInterval);
            }
            if (event.key === 'z' && canShootBurst) {
                shootBurst();
                canShootBurst = false;
                setTimeout(() => {
                    canShootBurst = true;
                }, burstCooldown);
            }
            if (event.key === 'Escape') {
                gamePaused = !gamePaused;
                if (gamePaused) {
                    stopEnemyGeneration(); 
                    pauseOverlay.style.display = 'block'; 
                    console.log("Juego en pausa");
                } else {
                    startEnemyGeneration(); 
                    pauseOverlay.style.display = 'none'; 
                    console.log("Juego reanudado");
                }
            }
        });

        document.addEventListener('keyup', function(event) {
            delete keysPressed[event.key];
        });

        function shootBurst() {
            let burstCount = 5; 
            let burstInterval = 100; 

            for (let i = 0; i < burstCount; i++) {
                setTimeout(shootBullet, i * burstInterval);
            }
        }

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
    
    let margin = 9;
    let adjustedERect = {
        left: eRect.left + margin,
        right: eRect.right - margin,
        top: eRect.top + margin,
        bottom: eRect.bottom - margin
    };
    let adjustedPRect = {
        left: pRect.left + margin,
        right: pRect.right - margin,
        top: pRect.top + margin,
        bottom: pRect.bottom - margin
    };

    if (adjustedERect.left < adjustedPRect.right &&
        adjustedERect.right > adjustedPRect.left &&
        adjustedERect.top < adjustedPRect.bottom &&
        adjustedERect.bottom > adjustedPRect.top) {
        endGame();
    }
}


        function escribir() {
            cont++;
            document.getElementById("cont").innerHTML = "Número de muertes: " + cont;
        }

        function endGame() {
            gameOver = true;
            stopEnemyGeneration(); 
            alert('Game Over! Reloading the page...');
            window.location.reload();
        }
    }
});
