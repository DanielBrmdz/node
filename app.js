// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const PORT = 3000;
//const SECRET_KEY = 'tu_clave_secreta_muy_segura';
const SECRET_KEY = 'contrasenia_muy_muy_segura';
const path = require('path');



app.use(cors());
app.use(cors({
    origin: '*', // En producción, especifica el origen exacto
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const users = [
    { username: 'admin', password: 'admin*' },
    { username: 'user', password: 'user*' }
];



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'despliegue.html'));
});

const getClientIP = (req) => {    
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {        
        return forwardedFor.split(',')[0];
    }    
    return req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.connection.socket.remoteAddress;
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});


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

app.use(verifyToken);

app.get('/protected', (req, res) => {

    const clientIP = getClientIP(req);        
    const token = req.headers['authorization'];
    const decoded = jwt.decode(token);
        
    const expirationTime = new Date(decoded.exp * 1000);
    const formattedExpTime = expirationTime.toLocaleString();

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
                    <p><span class="label">IP del cliente:</span> ${clientIP}</p>
                    <p><span class="label">Token expira:</span> ${formattedExpTime}
                </div>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});