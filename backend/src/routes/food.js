const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const adminController = require('../controllers/adminController');
const jwt = require('jsonwebtoken');

// User auth middleware (opsiyonel - giriş yapmış kullanıcılar için)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.userId) {
        req.userId = decoded.userId;
      }
    } catch (err) {
      // Token geçersiz, pas geç
    }
  }
  next();
};

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
router.get('/stats', foodController.getFoodStats);
router.post('/bulk-stats', foodController.getBulkFoodStats);

// =============================================
// AUTH REQUIRED ROUTES (Kullanıcı girişi gerekli)
// =============================================
router.post('/like', requireAuth, foodController.likeFood);
router.post('/dislike', requireAuth, foodController.dislikeFood);
router.get('/user-vote', requireAuth, foodController.getUserVote);

// =============================================
// ADMIN ROUTES
// =============================================
router.get('/', adminController.requireAdmin, foodController.getAllFoods);

module.exports = router;

