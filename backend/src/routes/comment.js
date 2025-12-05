const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const jwt = require('jsonwebtoken');

// User auth middleware (zorunlu)
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Giriş yapmalısınız' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
};

// =============================================
// PUBLIC ROUTES
// =============================================

// Şehir + tarih + öğün için yorumları getir
router.get('/by-menu', commentController.getCommentsByCityDateMeal);

// Menü ID'ye göre yorumları getir
router.get('/menu/:menuId', commentController.getMenuComments);

// Menü yorum sayısı
router.get('/menu/:menuId/count', commentController.getCommentCount);

// =============================================
// AUTH REQUIRED ROUTES
// =============================================

// Yorum ekle
router.post('/', requireAuth, commentController.addComment);

// Yorum sil
router.delete('/:id', requireAuth, commentController.deleteComment);

module.exports = router;

