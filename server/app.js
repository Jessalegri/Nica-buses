// Configuracion inicial = express 
const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
const PORT = 3001;

// Establecemos la conexión con la base de datos SQLite3
const db = new sqlite3.Database('./nicabus.sql.db', (err) => {
    if (err) {
        // Si hay un error durante la conexión, se muestra
        console.error('Error conectando a la base de datos: ', err);
        return;
    }
    console.log('Conexión establecida con la base de datos.');
});

// archivos estaticos desde carpeta 'public'
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('¡Bienvenido a NicaBus!');
});


app.listen(PORT, () => {
    console.log(`El servidor está corriendo en http://localhost:${PORT}`);
});


