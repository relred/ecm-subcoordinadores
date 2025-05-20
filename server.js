const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MariaDB
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'ecm'
});

db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar a MariaDB:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado a MariaDB');
});

// Crear tabla si no existe
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS coordinadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    celular VARCHAR(255),
    correo VARCHAR(255),
    estado VARCHAR(255),
    municipio VARCHAR(255),
    promotores VARCHAR(255),
    promovidos VARCHAR(255)
  )
`;

db.query(createTableQuery, err => {
  if (err) {
    console.error('❌ Error al crear tabla:', err.message);
  } else {
    console.log('✅ Tabla coordinadores lista');
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Ruta para guardar datos del formulario
app.post('/api/guardar', (req, res) => {
  const { nombre, celular, correo, estado, municipio, promotores, promovidos } = req.body;

  if (!nombre || !celular || !correo || !estado || !municipio || !promotores || !promovidos) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const insertQuery = `
    INSERT INTO coordinadores (nombre, celular, correo, estado, municipio, promotores, promovidos)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [nombre, celular, correo, estado, municipio, promotores, promovidos], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar:', err.message);
      return res.status(500).json({ error: 'Error al guardar datos' });
    }

    console.log(`✅ Coordinador registrado con ID ${result.insertId}`);
    res.json({ success: true, id: result.insertId });
  });
});

// Ruta para obtener todos los registros
app.get('/api/coordinadores', (req, res) => {
  db.query("SELECT * FROM coordinadores", (err, results) => {
    if (err) {
      console.error('❌ Error al leer la base:', err.message);
      return res.status(500).json({ error: 'Error al leer datos' });
    }

    res.json(results);
  });
});

app.get('/panel/ver', (req, res) => {
  res.sendFile(path.join(__dirname, 'ver.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
