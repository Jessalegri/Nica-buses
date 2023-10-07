// Configuracion inicial = express 
const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
const PORT = 3001;

// Establecemos la conexión con la base de datos SQLite3
const db = new sqlite3.Database('../dataBase.db', (err) => { // Ajusta la ruta
    if (err) {
        // Si hay un error durante la conexión, se muestra
        console.error('Error conectando a la base de datos: ', err);
        return;
    }
    console.log('Conexión establecida con la base de datos.');
});

// archivos estaticos desde carpeta 'public'    / conexion frontend * backend
app.use(express.static('../public'));

// configutacion de las rutas para 'query' consultas de la base de datos
app.get('/buscar', (req, res) => {
    const origen = req.query.origen;
    const destino = req.query.destino;

    const sql = `
    SELECT 
        origen_terminal.terminal AS terminal_origen,
        destino_terminal.terminal AS terminal_destino,
        horario.hora_salida,
        horario.duracion_de_viaje,
        COALESCE(calif.calificacion, 'No calificado') AS calificacion
    FROM 
        HorarioDeBuses AS horario
    JOIN 
        Terminales AS origen_terminal ON horario.terminal_origen_id = origen_terminal.id
    JOIN 
        Terminales AS destino_terminal ON horario.terminal_destino_id = destino_terminal.id
    JOIN 
        Ciudades AS origen_ciudad ON origen_terminal.ciudad_id = origen_ciudad.id
    JOIN 
        Ciudades AS destino_ciudad ON destino_terminal.ciudad_id = destino_ciudad.id
    LEFT JOIN 
        Calificaciones AS calif ON horario.id = calif.horario_id
    WHERE 
        origen_ciudad.nombre = ? AND destino_ciudad.nombre = ?`;

    db.all(sql, [origen, destino], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`El servidor está corriendo en http://localhost:${PORT}`);
});

