const express = require('express');
const app = express();
const port = 3000;

// Función para obtener la IP local
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
            }
        }
    }
    return results;
}

// Middleware para registrar todas las solicitudes
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const localIPs = getLocalIP();
    
    // Obtener IP del cliente
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress;
    
    // Limpiar la IP del cliente (remover IPv6 ::ffff: prefix si existe)
    const cleanClientIP = clientIP.replace(/^::ffff:/, '');
    
    console.log('\n=== Nueva Solicitud ===');
    console.log(`Timestamp: [${timestamp}]`);
    console.log('IP Local del Servidor:', localIPs);
    console.log(`IP del Cliente: ${cleanClientIP}`);
    console.log(`Método: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('=====================\n');

    next();
});

// Ruta principal
app.get('/', (req, res) => {
    const localIPs = getLocalIP();
    res.send(`
        <h1>¡Bienvenido a mi aplicación!</h1>
        <p>IP(s) Local(es) del Servidor: ${localIPs.join(', ')}</p>
        <p>IP del Cliente: ${req.ip}</p>
    `);
});

// Ruta de API
app.get('/api/datos', (req, res) => {
    const localIPs = getLocalIP();
    res.json({
        mensaje: 'Estos son algunos datos de ejemplo',
        ipLocal: localIPs,
        ipCliente: req.ip,
        timestamp: new Date().toISOString()
    });
});

// Iniciar el servidor
app.listen(port, () => {
    const localIPs = getLocalIP();
    console.log(`Servidor corriendo en:`);
    localIPs.forEach(ip => {
        console.log(`http://${ip}:${port}`);
    });
    console.log(`http://localhost:${port}`);
});