const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Token doğrulama - zorunlu auth
exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Kullanıcı aktif mi kontrol et
      const result = await db.query(
        'SELECT id FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Kullanıcı bulunamadı veya pasif' });
      }
      
      req.userId = decoded.userId;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Kimlik doğrulama hatası' });
  }
};

// Token doğrulama - opsiyonel auth (giriş yapmış olabilir, olmayabilir)
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Token yok, devam et
      req.userId = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Kullanıcı aktif mi kontrol et
      const result = await db.query(
        'SELECT id FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );
      
      if (result.rows.length > 0) {
        req.userId = decoded.userId;
      } else {
        req.userId = null;
      }
    } catch {
      req.userId = null;
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.userId = null;
    next();
  }
};


