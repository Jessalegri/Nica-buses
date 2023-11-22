const express = require('express');
const mysql = require('mysql'); 
const path = require('path'); 

const app = express();
const PORT = 3001;

// Configura EJS como motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
 
// Middleware para manejar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Establecemos la conexión con la base de datos MySQL
const db = mysql.createConnection({
    host: '127.0.0.1', // Cambia esto por la dirección de tu servidor MySQL si es diferente
    user: 'root',
    password: 'caramelo2410',
    database: 'buses_horarios'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos: ', err);
        return;
    }
    console.log('Conexión establecida con la base de datos MySQL.');
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


    db.query(sql, [origen, destino], (err, rows) => {
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

// Ruta POST para agregar nuevos horarios
app.post('/agregar-horario', (req, res) => {
    // Extraer los datos enviados desde el formulario
    const { ciudad_origen, ciudad_destino, terminal_origen, terminal_destino, hora_salida, duracion_viaje } = req.body;

    // Función para obtener el ID de un terminal basado en el nombre del terminal y la ciudad
    function obtenerTerminalId(nombreTerminal, nombreCiudad) {
        return new Promise((resolve, reject) => {
            // Consulta SQL para encontrar el ID del terminal
            const sql = `SELECT t.id FROM Terminales t JOIN Ciudades c ON t.ciudad_id = c.id WHERE t.nombre = ? AND c.nombre = ?`;
            db.query(sql, [nombreTerminal, nombreCiudad], (err, rows) => {
                if (err) {
                    reject(err);
                } else if (rows.length > 0) {
                    resolve(rows[0].id);
                } else {
                    reject(new Error("No se encontró el terminal o la ciudad"));
                }
            });
        });
    }

    // Usar Promise.all para obtener los IDs de los terminales de origen y destino
    Promise.all([
        obtenerTerminalId(terminal_origen, ciudad_origen),
        obtenerTerminalId(terminal_destino, ciudad_destino)
    ])
    .then(ids => {
        // Desestructurar los IDs obtenidos
        const [terminalOrigenId, terminalDestinoId] = ids;

        // Consulta SQL para insertar el nuevo horario en la base de datos
        const sqlInsert = `INSERT INTO HorarioDeBuses (terminal_origen_id, terminal_destino_id, hora_salida, duracion_de_viaje) VALUES (?, ?, ?, ?)`;
        db.query(sqlInsert, [terminalOrigenId, terminalDestinoId, hora_salida, duracion_viaje], (err, result) => {
            if (err) {
                console.error('Error al insertar en la base de datos: ', err);
                res.status(500).send('Error al agregar el horario');
                return;
            }
            // Enviar respuesta de éxito al cliente
            res.send('Horario agregado con éxito');
        });
    })
    .catch(err => {
        // Manejar errores, por ejemplo, si no se encuentran los IDs de los terminales
        console.error('Error al obtener los IDs de los terminales: ', err);
        res.status(500).send('Error al procesar la solicitud');
    });
});


    // Codigo de inicio de servidor.
app.listen(PORT, () => {
    console.log(`El servidor está corriendo en http://localhost:${PORT}`);
});
