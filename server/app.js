// app.js = nucleo del servidor (servidor backend), donde le dices al servidor que hacer cuando recibe peticiones
// node.js = entorno de ejecucion de JS que ejecuta codigo JS fuera del navegador (Google) en el lado del servidor
// express = marco de trabajo (framework) facilita la creacion de app web.

// Configuracion inicial = express 
const express = require('express');                 // importando Express
const app = express();                              // inicializacion de app web

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`El servidor está corriendo en http://localhost:${PORT}`);
}); // Inicia el servidor en el puerto 3000.

