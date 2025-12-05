const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');

// Token oluştur
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// REGISTER - Yeni kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    // Validation hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Doğrulama hatası', 
        details: errors.array() 
      });
    }

    const { fullName, nickname, email, password, cityId } = req.body;

    // E-posta kontrolü
    const emailCheck = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Kullanıcı adı kontrolü
    const nicknameCheck = await db.query(
      'SELECT id FROM users WHERE nickname = $1',
      [nickname]
    );
    if (nicknameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Kullanıcıyı kaydet
    const result = await db.query(
      `INSERT INTO users (full_name, nickname, email, password_hash, city_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, nickname, email, city_id, avatar_id, role, created_at`,
      [fullName, nickname, email, passwordHash, cityId]
    );

    const user = result.rows[0];

    // Token oluştur
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Kayıt başarılı',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        nickname: user.nickname,
        email: user.email,
        cityId: user.city_id,
        avatarId: user.avatar_id,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu' });
  }
};

// LOGIN - Giriş yap
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Doğrulama hatası', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Kullanıcıyı bul
    const result = await db.query(
      `SELECT id, full_name, nickname, email, password_hash, city_id, avatar_id, role, is_active
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    const user = result.rows[0];

    // Hesap aktif mi kontrol et
    if (!user.is_active) {
      return res.status(403).json({ error: 'Hesabınız askıya alınmış' });
    }

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    // Son giriş tarihini güncelle
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Token oluştur
    const token = generateToken(user.id);

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        nickname: user.nickname,
        email: user.email,
        cityId: user.city_id,
        avatarId: user.avatar_id,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
  }
};

// LOGOUT - Çıkış yap
exports.logout = async (req, res) => {
  // Client tarafında token silinecek
  res.json({ message: 'Çıkış başarılı' });
};

// GET ME - Aktif kullanıcı bilgisi
exports.getMe = async (req, res) => {
  try {
    // Token'dan user ID al
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
    }

    // Kullanıcıyı getir
    const result = await db.query(
      `SELECT id, full_name, nickname, email, city_id, avatar_id, role, is_verified, created_at, last_login
       FROM users WHERE id = $1 AND is_active = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        nickname: user.nickname,
        email: user.email,
        cityId: user.city_id,
        avatarId: user.avatar_id,
        role: user.role,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Kullanıcı bilgisi alınamadı' });
  }
};

