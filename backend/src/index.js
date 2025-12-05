const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS - TÜM originlere izin ver (development için)
app.use(cors());

// Diğer Middleware
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası' });
});

// Server'ı başlat
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`);
  
  // Database bağlantısını test et
  try {
    await db.query('SELECT NOW()');
    console.log('✅ PostgreSQL bağlantısı başarılı');
  } catch (err) {
    console.error('❌ PostgreSQL bağlantı hatası:', err.message);
  }
});

// Process'in kapanmaması için
process.on('SIGTERM', () => {
  console.log('SIGTERM sinyali alındı, server kapatılıyor...');
  server.close(() => {
    console.log('Server kapatıldı');
    process.exit(0);
  });
});

