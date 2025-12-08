const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Admin token doğrulama
exports.authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Admin yetkisi gerekli' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Admin token mu kontrol et
      if (!decoded.isAdmin) {
        return res.status(401).json({ error: 'Admin yetkisi gerekli' });
      }
      
      // Admin aktif mi kontrol et
      const result = await db.query(
        'SELECT id FROM admins WHERE id = $1 AND is_active = true',
        [decoded.adminId]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Admin bulunamadı veya devre dışı' });
      }
      
      req.adminId = decoded.adminId;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ error: 'Kimlik doğrulama hatası' });
  }
};


