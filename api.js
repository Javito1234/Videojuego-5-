// API para comunicación con el backend PHP

const API = {
    // Función auxiliar para hacer peticiones
    async request(url, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            return await response.json();
        } catch (error) {
            console.error('Error en la petición:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    },
    
    // Verificar sesión actual
    async checkSession() {
        return await this.request('check_session.php');
    },
    
    // Iniciar sesión
    async login(username, password) {
        return await this.request('login.php', 'POST', { username, password });
    },
    
    // Registrar usuario
    async register(username, email, password, tortuga) {
        return await this.request('register.php', 'POST', { username, email, password, tortuga });
    },
    
    // Cerrar sesión
    async logout() {
        return await this.request('logout.php', 'POST');
    },
    
    // Guardar puntuación
    async saveScore(puntuacion, tortuga) {
        return await this.request('save_score.php', 'POST', { puntuacion, tortuga });
    },
    
    // Obtener leaderboard
    async getLeaderboard() {
        return await this.request('leaderboard.php');
    },
    
    // Actualizar tortuga favorita
    async updateTurtle(tortuga) {
        return await this.request('update_turtle.php', 'POST', { tortuga });
    }
};

// Variables globales de sesión
let currentUser = null;

// Funciones de UI para autenticación
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    clearErrors();
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    clearErrors();
}

function clearErrors() {
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('registerError').classList.remove('show');
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// Función de login
async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showError('loginError', 'Por favor completa todos los campos');
        return;
    }
    
    const result = await API.login(username, password);
    
    if (result.success) {
        currentUser = result.user;
        showGameScreen();
    } else {
        showError('loginError', result.error || 'Error al iniciar sesión');
    }
}

// Función de registro
async function register() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const tortuga = document.querySelector('input[name="regTurtle"]:checked').value;
    
    if (!username || !email || !password) {
        showError('registerError', 'Por favor completa todos los campos');
        return;
    }
    
    const result = await API.register(username, email, password, tortuga);
    
    if (result.success) {
        currentUser = result.user;
        showGameScreen();
    } else {
        if (result.errors) {
            showError('registerError', result.errors.join('<br>'));
        } else {
            showError('registerError', result.error || 'Error al registrar usuario');
        }
    }
}

// Función de logout
async function logout() {
    await API.logout();
    currentUser = null;
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('authScreen').style.display = 'block';
    showLogin();
    
    // Limpiar formularios
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('regUsername').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
}

// Mostrar pantalla del juego
function showGameScreen() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    // Actualizar información del usuario
    const turtleNames = {
        leonardo: 'Leonardo',
        raphael: 'Raphael',
        donatello: 'Donatello',
        michelangelo: 'Michelangelo'
    };
    
    document.getElementById('userDisplay').textContent = 
        `👤 ${currentUser.username} | 🐢 ${turtleNames[currentUser.tortuga_favorita]}`;
    
    // Iniciar el juego con la tortuga favorita
    if (window.initGame) {
        window.initGame(currentUser.tortuga_favorita);
    }
}

// Mostrar leaderboard
async function showLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    modal.classList.add('show');
    
    const result = await API.getLeaderboard();
    
    if (result.success) {
        displayLeaderboard(result.leaderboard, result.user_ranking);
    } else {
        document.getElementById('leaderboardContent').innerHTML = 
            '<p style="color: #ff6b6b;">Error al cargar el ranking</p>';
    }
}

// Cerrar leaderboard
function closeLeaderboard() {
    document.getElementById('leaderboardModal').classList.remove('show');
}

// Mostrar datos del leaderboard
function displayLeaderboard(leaderboard, userRanking) {
    const turtleNames = {
        leonardo: 'Leonardo',
        raphael: 'Raphael',
        donatello: 'Donatello',
        michelangelo: 'Michelangelo'
    };
    
    // Mostrar ranking del usuario
    let userRankingHTML = '';
    if (userRanking) {
        userRankingHTML = `
            <div class="user-ranking">
                <h3>Tu Ranking</h3>
                <p><strong>Posición:</strong> #${userRanking.ranking}</p>
                <p><strong>Mejor Puntuación:</strong> ${userRanking.mejor_puntuacion}</p>
                <p><strong>Total de Partidas:</strong> ${userRanking.total_partidas}</p>
            </div>
        `;
    }
    document.getElementById('userRanking').innerHTML = userRankingHTML;
    
    // Mostrar tabla de líderes
    let leaderboardHTML = '<div class="leaderboard-table">';
    
    if (leaderboard.length === 0) {
        leaderboardHTML += '<p style="color: #fff; text-align: center;">No hay puntuaciones aún</p>';
    } else {
        leaderboard.forEach((entry, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
            
            leaderboardHTML += `
                <div class="leaderboard-row ${isTop3 ? 'top-3' : ''}">
                    <div class="rank ${rankClass}">#${rank}</div>
                    <div class="player-info">
                        <div class="player-name">${entry.username}</div>
                        <div class="player-turtle">🐢 ${turtleNames[entry.tortuga_favorita]}</div>
                    </div>
                    <div class="score">${entry.mejor_puntuacion}</div>
                </div>
            `;
        });
    }
    
    leaderboardHTML += '</div>';
    document.getElementById('leaderboardContent').innerHTML = leaderboardHTML;
}

// Verificar sesión al cargar la página
window.addEventListener('load', async () => {
    const result = await API.checkSession();
    
    if (result.success && result.logged_in) {
        currentUser = result.user;
        showGameScreen();
    } else {
        document.getElementById('authScreen').style.display = 'block';
        showLogin();
    }
});

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('leaderboardModal');
    if (event.target === modal) {
        closeLeaderboard();
    }
};