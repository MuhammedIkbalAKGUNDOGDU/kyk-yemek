const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const submissionController = require('../controllers/submissionController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, '../../uploads/submissions');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `menu-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Geçersiz dosya tipi. Sadece JPEG, PNG, WebP ve PDF kabul edilir.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Hata yakalayıcı middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Dosya boyutu 10MB\'dan büyük olamaz' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// ========================
// PUBLIC ROUTES
// ========================

// Menü gönder (herkes - opsiyonel auth)
router.post('/', optionalAuth, upload.single('file'), handleUploadError, submissionController.submitMenu);

// ========================
// ADMIN ROUTES
// ========================

// Tüm gönderileri getir
router.get('/admin/all', authenticateAdmin, submissionController.getAllSubmissions);

// İstatistikler
router.get('/admin/stats', authenticateAdmin, submissionController.getSubmissionStats);

// Tek gönderi detayı
router.get('/admin/:id', authenticateAdmin, submissionController.getSubmissionById);

// Gönderi dosyasını getir
router.get('/admin/:id/file', authenticateAdmin, submissionController.getSubmissionFile);

// Gönderi durumunu güncelle
router.put('/admin/:id/status', authenticateAdmin, submissionController.updateSubmissionStatus);

// Gönderiyi sil
router.delete('/admin/:id', authenticateAdmin, submissionController.deleteSubmission);

module.exports = router;

