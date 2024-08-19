document.addEventListener('DOMContentLoaded', () => {
    const interfaz = document.querySelector('.Interfaz');
    const gameArea = document.getElementById('gameArea');
    const sujeto = document.getElementById('sujeto');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const instructionsOverlay = document.getElementById('instructionsOverlay'); 
    const showInstructionsBtn = document.getElementById('showInstructions'); 
    const closeInstructionsBtn = document.getElementById('closeInstructions'); 

    interfaz.style.display = 'block';
    gameArea.style.display = 'none';

    document.addEventListener('keydown', () => {
        interfaz.style.display = 'none';
        gameArea.style.display = 'block';
        startGame(); 
    }, { once: true }); 

    showInstructionsBtn.addEventListener('click', () => {
        instructionsOverlay.style.display = 'block';
    });

    closeInstructionsBtn.addEventListener('click', () => {
        instructionsOverlay.style.display = 'none';
    });
    function startGame() {
        console.log('Juego iniciado!');
        let movX = sujeto.offsetLeft;
        let movY = sujeto.offsetTop;
        let keysPressed = {};
        let enemies = [];
        let bullets = [];
        let gameOver = false;
        let gamePaused = false; 
        let enemyTimer;
        let points = 0;
	let cont = 0;
        let canShoot = true;
        let shootInterval = 200;
        let canShootBurst = true;
        let burstCooldown = 3000; 
	let vidas= 100;
        function startEnemyGeneration() {
            enemyTimer = setInterval(createEnemy, 2000); 
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
            if (!gameOver && !gamePaused) { 
                updateMovement();
                updateEnemies();
                updateBullets();
            }
            requestAnimationFrame(gameLoop); 
        }
        gameLoop();

        document.addEventListener('keydown', function(event) {
            keysPressed[event.key] = true;
            if (event.key === 'j' && canShoot) {
                shootBullet();
                canShoot = false;
                setTimeout(() => {
                    canShoot = true;
                }, shootInterval);
            }
            if (event.key === 'k' && canShootBurst) {
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
            let burstCount = 6; 
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
                bullet.style.top = bulletTop - 40 + 'px'; 
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
    enemy.health = 2;

    if (Math.random() < 0.3) { // 30% de probabilidad
        enemy.classList.add('shootingEnemy');
        startShooting(enemy); // Hacer que este enemigo comience a disparar
    }

    gameArea.appendChild(enemy);
    enemies.push(enemy);
}
function startShooting(enemy) {
    let shootingInterval = setInterval(() => {
        if (!document.body.contains(enemy)) { 
            clearInterval(shootingInterval);
            return;
        }
        shootEnemyBullet(enemy);
    }, 1500); // Dispara cada 1.5 segundos
}

function shootEnemyBullet(enemy) {
    let bullet = document.createElement('div');
    bullet.className = 'enemyBullet';
    bullet.style.left = (enemy.offsetLeft + enemy.offsetWidth / 2 - 2.5) + 'px'; 
    bullet.style.top = (enemy.offsetTop + enemy.offsetHeight) + 'px'; 
    gameArea.appendChild(bullet);

    function moveBullet() {
        let bulletTop = bullet.offsetTop;
        if (bulletTop > gameArea.offsetHeight) {
            bullet.remove();
            return;
        }
        bullet.style.top = bulletTop + 5 + 'px'; // Velocidad de la bala
        requestAnimationFrame(moveBullet);
    }
    moveBullet();
}


        function updateEnemies() {
            enemies.forEach(enemy => {
                let top = parseInt(enemy.style.top, 10);
                top += 2; 
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

    document.querySelectorAll('.enemyBullet').forEach(bullet => {
        let bulletTop = bullet.offsetTop;
        if (bulletTop > gameArea.offsetHeight) {
            bullet.remove();
        } else {
            bullet.style.top = bulletTop + 5 + 'px'; // Velocidad de la bala enemiga
            checkCollisionWithPlayerBullet(bullet);
        }
    });
}

function checkCollisionWithPlayerBullet(bullet) {
    let bRect = bullet.getBoundingClientRect();
    let pRect = sujeto.getBoundingClientRect();
    
    if (bRect.left < pRect.right &&
        bRect.right > pRect.left &&
        bRect.top < pRect.bottom &&
        bRect.bottom > pRect.top) {

        vidas -= 5;
        document.getElementById("lives").innerHTML = "Vida: " + vidas + "%";

        bullet.remove();

        if (vidas <= 0) {
            endGame();
        }
    }
}


        function checkCollisionWithEnemy(bullet) {
            enemies.forEach(enemy => {
                let eRect = enemy.getBoundingClientRect();
                let bRect = bullet.getBoundingClientRect();
                
                if (eRect.left < bRect.right &&
                    eRect.right > bRect.left &&
                    eRect.top < bRect.bottom &&
                    eRect.bottom > bRect.top) {
                    
		    enemy.health--;
		    if(enemy.health<=0){
			enemy.remove();                        
			enemies = enemies.filter(e => e !== enemy); 
			points += 100;
                	document.getElementById("points").innerHTML = "Puntos: " + points;
			escribir();
		    }
                    bullet.remove();
		    bullets = bullets.filter(b => b !== bullet); 
                    
                    
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
			vidas-=10;
        		document.getElementById("lives").innerHTML = "Vida: " + vidas +"%";
			enemy.remove();
			enemies = enemies.filter(e => e!== enemy)
			if(vidas<=0){
       				endGame();
			}
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
