// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const PORT = 3000;
const SECRET_KEY = 'tu_clave_secreta_muy_segura';


app.use(cors());
app.use(cors({
    origin: '*', // En producción, especifica el origen exacto
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Array de usuarios (en un caso real esto estaría en una base de datos)
const users = [
    { username: 'admin', password: '12345' },
    { username: 'user', password: 'password' }
];

// Ruta de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verificar si el usuario existe
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '5h' });
    res.json({ token });
});

// Middleware de verificación de token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send(`
           <!DOCTYPE html>
            <html>
            <head>
                <title>Token Inválido</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f8d7da;
                    }
                    .error-container {
                        text-align: center;
                        padding: 2rem;
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #dc3545;
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>⚠️ Token Inválido</h1>
                    <p>El token proporcionado no es válido o ha expirado</p>
                </div>
            </body>
            </html>
        `);
    }

    try {
        // Eliminar "Bearer " si está presente
        const cleanToken = token.replace('Bearer ', '');
        const decoded = jwt.verify(cleanToken, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send(`
           <!DOCTYPE html>
            <html>
            <head>
                <title>Token Inválido</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f8d7da;
                    }
                    .error-container {
                        text-align: center;
                        padding: 2rem;
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #dc3545;
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>⚠️ Token Inválido</h1>
                    <p>El token proporcionado no es válido o ha expirado</p>
                </div>
            </body>
            </html>
        `);
    }
};

// Aplicar middleware de verificación a todas las rutas siguientes
app.use(verifyToken);

// Ruta protegida
app.get('/protected', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Acceso Completo</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #00b09b, #96c93d);
                }
                .success-container {
                    background: white;
                    padding: 2rem 3rem;
                    border-radius: 15px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 500px;
                }
                h1 {
                    color: #2c3e50;
                    margin-bottom: 1rem;
                }
                .checkmark {
                    font-size: 4rem;
                    color: #00b09b;
                    margin-bottom: 1rem;
                }
                .message {
                    color: #666;
                    line-height: 1.6;
                }
                .user-info {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            <div class="success-container">
                <div class="checkmark">✓</div>
                <h1>¡Tienes Acceso Completo!</h1>
                <p class="message">Has sido autenticado correctamente y tienes acceso a todos los recursos protegidos.</p>
                <div class="user-info">
                    <p>Usuario: ${req.user.username}</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});