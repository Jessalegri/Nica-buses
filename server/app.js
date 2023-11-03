const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path'); 

const app = express();
const PORT = 3001;

// Configura EJS como motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
 
// Middleware para manejar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Establecemos la conexión con la base de datos SQLite3
const db = new sqlite3.Database('../dataBase.db', (err) => {
    if (err) {
        console.error('Error conectando a la base de datos: ', err);
        return;
    }
    console.log('Conexión establecida con la base de datos.');
});

// Archivos estáticos desde carpeta 'public'
app.use(express.static('../public'));

// Aquí agregamos la función
function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Configuración de las rutas para 'query' consultas de la base de datos
app.get('/buscar', (req, res) => {
    const origen = normalizeString(req.query.origen || "");
    const destino = normalizeString(req.query.destino || "");


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
        LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(origen_ciudad.nombre, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u')) = ? 
    AND 
        LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(destino_ciudad.nombre, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u')) = ?`;


    db.all(sql, [origen, destino], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Renderizar la vista 'resultados.ejs' y enviarla al cliente
        res.render('resultados', {
            origen: req.query.origen,
            destino: req.query.destino,
            resultados: rows
        });
    });
});

// Ruta de "agregar-horario" con el servidor.
app.get('/horarios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/horario.html'));
});

// Ruta para servir el archivo de estilos
app.get('/horario.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/css/horario.css'));
});

app.listen(PORT, () => {
    console.log(`El servidor está corriendo en http://localhost:${PORT}`);
});




