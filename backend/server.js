const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // izinkan frontend mengakses API

// Sesuaikan dengan konfigurasi MySQL Workbench kamu
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // username MySQL kamu
  password: ':4GuNg210105',        // password MySQL kamu
  database: 'iot_db'
});

db.connect((err) => {
  if (err) {
    console.error('Gagal konek ke database:', err);
    return;
  }
  console.log('Terhubung ke MySQL!');
});

// Endpoint pengganti select.php
app.get('/api/select', (req, res) => {
  const sql = 'SELECT id_sensor, Temperature, Humidity FROM iot';
  db.query(sql, (err, results) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    if (results.length > 0) {
      res.json({ success: true, data: results });
    } else {
      res.json({ success: false, message: 'No data found' });
    }
  });
});

app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});