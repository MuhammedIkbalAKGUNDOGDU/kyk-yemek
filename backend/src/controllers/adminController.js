const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');

// Admin token oluştur
const generateAdminToken = (adminId) => {
  return jwt.sign(
    { adminId, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Token doğrulama
const verifyAdminToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return null;
    return decoded;
  } catch (err) {
    return null;
  }
};

// ADMIN LOGIN
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Doğrulama hatası', details: errors.array() });
    }

    const { email, password } = req.body;

    // Admin'i bul
    const result = await db.query(
      'SELECT id, email, password_hash, name, is_active FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({ error: 'Hesap devre dışı' });
    }

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    // Son giriş güncelle
    await db.query(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [admin.id]
    );

    // Token oluştur
    const token = generateAdminToken(admin.id);

    res.json({
      message: 'Giriş başarılı',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
  }
};

// GET ADMIN INFO
exports.getMe = async (req, res) => {
  try {
    const decoded = verifyAdminToken(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const result = await db.query(
      'SELECT id, email, name, created_at, last_login FROM admins WHERE id = $1 AND is_active = true',
      [decoded.adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin bulunamadı' });
    }

    const admin = result.rows[0];

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        createdAt: admin.created_at,
        lastLogin: admin.last_login
      }
    });

  } catch (error) {
    console.error('Admin getMe error:', error);
    res.status(500).json({ error: 'Bilgi alınamadı' });
  }
};

// ADMIN LOGOUT
exports.logout = (req, res) => {
  res.json({ message: 'Çıkış başarılı' });
};

// Middleware: Admin yetki kontrolü
exports.requireAdmin = async (req, res, next) => {
  const decoded = verifyAdminToken(req);
  if (!decoded) {
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
};

// İlk admin oluşturma (bir kez çalıştırılacak)
exports.createFirstAdmin = async (req, res) => {
  try {
    // Zaten admin var mı kontrol et
    const existingAdmin = await db.query('SELECT id FROM admins LIMIT 1');
    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ error: 'Admin zaten mevcut' });
    }

    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, şifre ve isim gerekli' });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Admin oluştur
    const result = await db.query(
      'INSERT INTO admins (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, passwordHash, name]
    );

    res.status(201).json({
      message: 'Admin oluşturuldu',
      admin: result.rows[0]
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Admin oluşturulamadı' });
  }
};

