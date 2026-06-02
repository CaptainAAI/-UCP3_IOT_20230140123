const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ':4GuNg210105',
  database: 'iot_db',
});

db.connect((err) => {
  if (err) {
    console.error('Gagal konek ke database:', err);
    return;
  }
  console.log('Terhubung ke MySQL!');
});

function normalizePayload(body) {
  return {
    sensor_id: body.sensor_id,
    timestamp: body.timestamp,
    temperature: body.temperature,
    humidity: body.humidity,
    pressure: body.pressure,
    latitude: body.latitude ?? body.location?.latitude,
    longitude: body.longitude ?? body.location?.longitude,
    status: body.status,
  };
}

app.get('/api/sensor-data', (req, res) => {
  const sql = `
    SELECT
      sensor_id,
      timestamp,
      temperature,
      humidity,
      pressure,
      latitude,
      longitude,
      status
    FROM sensor_data
    ORDER BY timestamp ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    return res.json({ success: true, data: results });
  });
});

app.get('/api/select', (req, res) => {
  const sql = `
    SELECT
      sensor_id,
      timestamp,
      temperature,
      humidity,
      pressure,
      latitude,
      longitude,
      status
    FROM sensor_data
    ORDER BY timestamp ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    return res.json({ success: true, data: results });
  });
});

app.post('/api/sensor-data', (req, res) => {
  const payload = normalizePayload(req.body || {});

  const sql = `
    INSERT INTO sensor_data
      (sensor_id, timestamp, temperature, humidity, pressure, latitude, longitude, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    payload.sensor_id,
    payload.timestamp,
    payload.temperature,
    payload.humidity,
    payload.pressure,
    payload.latitude,
    payload.longitude,
    payload.status,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Data sensor berhasil disimpan',
      insertedId: result.insertId,
      data: payload,
    });
  });
});

app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});