// Juego estilo "Chrome Dino" con temática Tortugas Ninja
// Implementación completa: canvas, jugador, obstáculos, salto, puntaje y reinicio.

window.addEventListener('load', () => {
    const canvas = document.getElementById('juegoCanvas');
    const ctx = canvas.getContext('2d');

    // Configuración
    const CANVAS_W = canvas.width;
    const CANVAS_H = canvas.height;
    const GROUND_Y = CANVAS_H - 40; // línea del suelo

    // Tortugas disponibles
    const turtles = {
        leonardo: { name: 'Leonardo', bandana: '#1e90ff', weapon: 'Katanas' },
        raphael: { name: 'Raphael', bandana: '#ff0000', weapon: 'Sais' },
        donatello: { name: 'Donatello', bandana: '#9370db', weapon: 'Bo' },
        michelangelo: { name: 'Michelangelo', bandana: '#ff7300', weapon: 'Nunchakus' }
    };

    // Jugador (Tortuga)
    const player = {
        x: 60,
        y: GROUND_Y - 50,
        width: 48,
        height: 50,
        vy: 0,
        gravity: 0.0018, // px per ms^2
        jumpForce: -0.6, // px per ms
        isOnGround: true,
        color: '#2ecc71', // verde tortuga
        bandana: '#ff7300', // color de la banda (default Michelangelo)
        selectedTurtle: 'michelangelo'
    };

    // Obstáculos
    const obstacles = [];
    let spawnTimer = 0;
    let spawnInterval = 1400; // ms

    // Velocidad del juego
    let speed = 0.35; // px per ms
    let speedIncreaseTimer = 0;

    // Estado
    let lastTime = 0;
    let running = true;
    let score = 0;
    let showMenu = true; // mostrar menú de selección al inicio
    
    // Cooldowns en segundos para cada tortuga
    const abilityMaxCooldowns = {
        leonardo: 5,    // corta obstáculos
        raphael: 6,     // rompe obstáculos pesados
        donatello: 4,   // desintegra obstáculos tecnológicos
        michelangelo: 3 // salto especial mejorado
    };

    // Estado actual de cooldowns
    const abilityCooldowns = {
        leonardo: 0,
        raphael: 0,
        donatello: 0,
        michelangelo: 0
    };

    // Variable global para personaje seleccionado (accesible desde index.html)
    window.selectedCharacter = null;
    // Controla si el bucle ya fue arrancado
    let loopStarted = false;

    // Controles / Habilidades por tortuga
    // Esta versión de `jump()` dispara la habilidad primaria según la tortuga seleccionada:
    // - leonardo: corta un obstáculo cercano al frente
    // - raphael: rompe (destruye) el obstáculo más cercano
    // - donatello: desintegra (limpia) todos los obstáculos
    // - michelangelo: salta (comportamiento original)
    // Salto normal
    function jump() {
        if (showMenu) return; // no saltar si está en el menú

        // Si el juego terminó, reiniciar con espacio/tap
        if (!running) {
            resetGame();
            return;
        }

        // Salto básico
        if (player.isOnGround && running) {
            player.vy = player.jumpForce;
            player.isOnGround = false;
        }
    }

    // Habilidades especiales
    function useAbility() {
        if (showMenu || !running) return;

        const turtle = player.selectedTurtle;
        
        if (abilityCooldowns[turtle] > 0) {
            console.log("⏳ Esperando cooldown de " + turtle);
            return;
        }

        console.log("🔥 Habilidad activada: " + turtle);

        switch (turtle) {
            case 'leonardo':
                slashAttack();
                break;
            case 'raphael':
                smashAttack();
                break;
            case 'donatello':
                techDisintegrate();
                break;
            case 'michelangelo':
                megaJump();
                break;
        }

        // Activar cooldown
        abilityCooldowns[turtle] = abilityMaxCooldowns[turtle];
    }

    // Leonardo: corte en corto rango
    function slashAttack() {
        console.log("✂️ Leonardo corta obstáculos");
        if (obstacles.length > 0) {
            // Elimina el primer obstáculo al frente
            obstacles.shift();
            score += 5;
        }
    }

    // Raphael: rompe objetos pesados
    function smashAttack() {
        console.log("💥 Raphael destruye todo!");
        if (obstacles.length > 0) {
            // Elimina todos los obstáculos
            obstacles.length = 0;
            score += 10;
        }
    }

    // Donatello: desintegra tecnología
    function techDisintegrate() {
        console.log("⚡ Donatello desintegra!");
        if (obstacles.length > 0) {
            // Elimina el primer obstáculo
            obstacles.shift();
            score += 8;
        }
    }

    // Mikey: salto mejorado
    function megaJump() {
        console.log("🍕 Mikey MEGA jump!");
        if (player.isOnGround) {
            player.vy = player.jumpForce * 1.8; // salto 80% más alto
            player.isOnGround = false;
        }
    }

    // --- Helper: habilidades simples y seguras ---


    function selectTurtle(turtleName) {
        if (showMenu && turtles[turtleName]) {
            player.selectedTurtle = turtleName;
            player.bandana = turtles[turtleName].bandana;
            showMenu = false;
            running = true;
            lastTime = performance.now();
            // Oculta la pantalla de autenticación y muestra la pantalla del juego
            if (document.getElementById('authScreen')) document.getElementById('authScreen').classList.remove('active');
            if (document.getElementById('gameScreen')) document.getElementById('gameScreen').classList.add('active');
            // Si el loop aún no ha empezado, iniciarlo
            if (!loopStarted) { loopStarted = true; requestAnimationFrame(loop); }
        }
    }

    // =========================================================
    // Este código inicializa el juego desde index.html
    // Se recomienda llamar: window.initGame(characterID)
    // =========================================================
    window.initGame = function(characterID) {
        console.log('Juego iniciado con characterID:', characterID);
        // Guardar selección global
        window.selectedCharacter = characterID;

        // Mapear id numérico a nombre de tortuga o aceptar string
        if (typeof characterID === 'number') {
            const map = {1: 'leonardo', 2: 'raphael', 3: 'donatello', 4: 'michelangelo'};
            const chosen = map[characterID];
            if (chosen && turtles[chosen]) {
                player.selectedTurtle = chosen;
                player.bandana = turtles[chosen].bandana;
            }
        } else if (typeof characterID === 'string' && turtles[characterID]) {
            player.selectedTurtle = characterID;
            player.bandana = turtles[characterID].bandana;
        }

        // Oculta la pantalla de autenticación y muestra la pantalla del juego
        if (document.getElementById('authScreen')) document.getElementById('authScreen').classList.remove('active');
        if (document.getElementById('gameScreen')) document.getElementById('gameScreen').classList.add('active');

        // Limpiar canvas (usa las referencias ya creadas en este archivo)
        try {
            ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        } catch (e) {
            console.warn('No se pudo limpiar el canvas al iniciar el juego:', e);
        }

        // Reiniciar/ajustar estado del juego (usar variables existentes)
        score = 0;
        running = true;
        showMenu = false;
        player.y = GROUND_Y - player.height;
        player.vy = 0;
        player.isOnGround = true;
    // Reiniciar cooldowns
    for (const k in abilityCooldowns) abilityCooldowns[k] = 0;
        lastTime = performance.now();

        // Arrancar el loop central si aún no ha arrancado (usa loop existente)
        if (!loopStarted) {
            loopStarted = true;
            requestAnimationFrame(loop);
        }
    };

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump(); // Salto normal
        }
        if (e.code === 'KeyX') {
            e.preventDefault();
            useAbility(); // Habilidad especial
        }
        // Selección con teclas numéricas en el menú
        if (showMenu) {
            if (e.code === 'Digit1') selectTurtle('leonardo');
            if (e.code === 'Digit2') selectTurtle('raphael');
            if (e.code === 'Digit3') selectTurtle('donatello');
            if (e.code === 'Digit4') selectTurtle('michelangelo');
        }
    });

    // Soporte táctil / click
    canvas.addEventListener('mousedown', (e) => {
        if (showMenu) {
            handleMenuClick(e);
        } else {
            jump();
        }
    });
    canvas.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        if (showMenu) {
            handleMenuClick(e.touches[0]);
        } else {
            jump();
        }
    }, {passive: false});

    // Manejar clicks en el menú
    function handleMenuClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Detectar click en las cajas de tortugas (2x2 grid)
        const boxW = 160, boxH = 120;
        const startX = (CANVAS_W - boxW * 2 - 40) / 2;
        const startY = 120;
        const gap = 20;
        
        const turtleKeys = Object.keys(turtles);
        for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = startX + col * (boxW + gap);
            const by = startY + row * (boxH + gap);
            
            if (x >= bx && x <= bx + boxW && y >= by && y <= by + boxH) {
                selectTurtle(turtleKeys[i]);
                break;
            }
        }
    }

    // Spawnear obstáculos
    function spawnObstacle() {
        const h = 30 + Math.random() * 40; // altura variable
        const w = 20 + Math.random() * 30;
        obstacles.push({
            x: CANVAS_W + 20,
            y: GROUND_Y - h,
            width: w,
            height: h,
            color: '#8e44ad' // color enemigo
        });
    }

    // Reiniciar juego
    function resetGame() {
        obstacles.length = 0;
        spawnTimer = 0;
        spawnInterval = 1400;
        speed = 0.35;
        score = 0;
        running = true;
        showMenu = true; // volver al menú
        // Reiniciar cooldowns al volver al menú
        for (const k in abilityCooldowns) abilityCooldowns[k] = 0;
        // Mostrar la pantalla de autenticación y ocultar la pantalla del juego
        if (document.getElementById('gameScreen')) document.getElementById('gameScreen').classList.remove('active');
        if (document.getElementById('authScreen')) document.getElementById('authScreen').classList.add('active');
        player.y = GROUND_Y - player.height;
        player.vy = 0;
        player.isOnGround = true;
        lastTime = performance.now();
    }

    // Colisiones AABB
    function collides(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    // Dibujar tortuga (simple estilizado)
    function drawPlayer(ctx) {
        // cuerpo
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // caparazón - círculo central
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.ellipse(player.x + player.width/2, player.y + player.height/2, player.width*0.6, player.height*0.45, 0, 0, Math.PI*2);
        ctx.fill();

        // banda ninja
        ctx.fillStyle = player.bandana;
        ctx.fillRect(player.x + 6, player.y + 10, player.width - 12, 8);
    }

    function drawObstacle(ctx, obs) {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // ojos (para darle personalidad)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obs.x + obs.width*0.15, obs.y + obs.height*0.2, obs.width*0.18, obs.height*0.18);
        ctx.fillRect(obs.x + obs.width*0.6, obs.y + obs.height*0.2, obs.width*0.18, obs.height*0.18);
        ctx.fillStyle = '#000';
        ctx.fillRect(obs.x + obs.width*0.18, obs.y + obs.height*0.25, 2, 2);
        ctx.fillRect(obs.x + obs.width*0.63, obs.y + obs.height*0.25, 2, 2);
    }

    function drawGround(ctx) {
        ctx.fillStyle = '#444';
        ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
    }

    function drawScore(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Puntuación: ' + Math.floor(score), 12, 28);
        
        // Mostrar tortuga seleccionada
        ctx.font = '16px Arial';
        ctx.fillText(turtles[player.selectedTurtle].name, 12, 52);
        
        // Dibujar barra de cooldown de habilidad (si aplica)
        const sel = player.selectedTurtle;
        const maxCd = abilityMaxCooldowns[sel] || 0;
        const curCd = abilityCooldowns[sel] || 0;
        if (maxCd > 0) {
            const barX = 12;
            const barY = 60;
            const barW = 120;
            const barH = 8;
            // fondo
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            // porción restante (invertido: cuando curCd=0, bar llena)
            const pct = Math.max(0, 1 - curCd / maxCd);
            ctx.fillStyle = pct >= 1 ? '#2ecc71' : '#f1c40f';
            ctx.fillRect(barX, barY, barW * pct, barH);
            // borde
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);
            // texto de cooldown en ms (si en cooldown)
            if (curCd > 0) {
                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.fillText(Math.ceil(curCd) + ' ms', barX + barW + 8, barY + barH);
            } else {
                ctx.fillStyle = '#aaa';
                ctx.font = '12px Arial';
                ctx.fillText('Habilidad lista', barX + barW + 8, barY + barH);
            }
        }
    }

    function drawGameOver(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#fff';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡Game Over!', CANVAS_W/2, CANVAS_H/2 - 30);
        ctx.font = '24px Arial';
        ctx.fillText('Puntuación: ' + Math.floor(score), CANVAS_W/2, CANVAS_H/2 + 10);
        ctx.font = '18px Arial';
        ctx.fillText('Presiona Espacio o toca para volver al menú', CANVAS_W/2, CANVAS_H/2 + 45);
    }

    function drawMenu(ctx) {
        // Fondo
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        
        // Título
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Selecciona tu Tortuga Ninja', CANVAS_W/2, 60);
        
        // Grid 2x2 de tortugas
        const boxW = 160, boxH = 120;
        const startX = (CANVAS_W - boxW * 2 - 40) / 2;
        const startY = 120;
        const gap = 20;
        
        const turtleKeys = Object.keys(turtles);
        turtleKeys.forEach((key, i) => {
            const turtle = turtles[key];
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = startX + col * (boxW + gap);
            const y = startY + row * (boxH + gap);
            
            // Caja
            ctx.fillStyle = '#333';
            ctx.fillRect(x, y, boxW, boxH);
            ctx.strokeStyle = turtle.bandana;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, boxW, boxH);
            
            // Mini tortuga
            const turtleW = 40, turtleH = 40;
            const tx = x + (boxW - turtleW) / 2;
            const ty = y + 15;
            
            // cuerpo
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(tx, ty, turtleW, turtleH);
            
            // caparazón
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.ellipse(tx + turtleW/2, ty + turtleH/2, turtleW*0.6, turtleH*0.45, 0, 0, Math.PI*2);
            ctx.fill();
            
            // banda
            ctx.fillStyle = turtle.bandana;
            ctx.fillRect(tx + 5, ty + 8, turtleW - 10, 6);
            
            // Nombre
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(turtle.name, x + boxW/2, ty + turtleH + 25);
            
            // Arma
            ctx.font = '12px Arial';
            ctx.fillStyle = '#aaa';
            ctx.fillText(turtle.weapon, x + boxW/2, ty + turtleH + 42);
            
            // Número
            ctx.fillStyle = turtle.bandana;
            ctx.font = 'bold 14px Arial';
            ctx.fillText((i + 1).toString(), x + 10, y + 20);
        });
        
        // Instrucciones
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Haz clic en una tortuga o presiona 1-4', CANVAS_W/2, CANVAS_H - 40);
    }

    // Bucle principal
    function loop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const dt = timestamp - lastTime; // ms
        lastTime = timestamp;

        // Limpiar
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // Si estamos en el menú, solo dibujarlo
        if (showMenu) {
            drawMenu(ctx);
            requestAnimationFrame(loop);
            return;
        }

        if (running) {
            // Actualizar jugador (física simple)
            player.vy += player.gravity * dt;
            player.y += player.vy * dt;
            if (player.y + player.height >= GROUND_Y) {
                player.y = GROUND_Y - player.height;
                player.vy = 0;
                player.isOnGround = true;
            }

            // Actualizar cooldowns de habilidades
            for (const k in abilityCooldowns) {
                if (abilityCooldowns[k] > 0) {
                    abilityCooldowns[k] -= dt;
                    if (abilityCooldowns[k] < 0) abilityCooldowns[k] = 0;
                }
            }

            // Spawning
            spawnTimer += dt;
            if (spawnTimer >= spawnInterval) {
                spawnTimer = 0;
                spawnInterval = 900 + Math.random() * 1200; // un poco variable
                spawnObstacle();
            }

            // Actualizar obstáculos
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.x -= speed * dt;
                if (obs.x + obs.width < -50) obstacles.splice(i, 1);
                // Colisión
                if (collides(player, obs)) {
                    running = false;
                }
            }

            // Actualizar cooldowns de habilidades (dt está en ms, convertir a segundos)
            for (const turtle in abilityCooldowns) {
                if (abilityCooldowns[turtle] > 0) {
                    abilityCooldowns[turtle] -= dt / 1000;
                    if (abilityCooldowns[turtle] < 0) {
                        abilityCooldowns[turtle] = 0;
                    }
                }
            }

            // Aumentar velocidad lentamente
            speedIncreaseTimer += dt;
            if (speedIncreaseTimer > 5000) { // cada 5s
                speed += 0.03;
                speedIncreaseTimer = 0;
            }

            // Puntuación aumenta con el tiempo
            score += dt * 0.02;
        }

        // Dibujar
        // fondo
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        drawGround(ctx);
        drawPlayer(ctx);
        obstacles.forEach(o => drawObstacle(ctx, o));
        drawScore(ctx);

        if (!running) drawGameOver(ctx);

        requestAnimationFrame(loop);
    }

    // El bucle se inicia desde `selectTurtle()` o `window.initGame()`
});