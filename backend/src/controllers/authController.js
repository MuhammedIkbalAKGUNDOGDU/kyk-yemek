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

// Token doğrulama yardımcı fonksiyonu
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// GET ME - Aktif kullanıcı bilgisi
exports.getMe = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
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

// UPDATE PROFILE - Profil güncelle (e-posta hariç)
exports.updateProfile = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Doğrulama hatası', 
        details: errors.array() 
      });
    }

    const { fullName, nickname, cityId, avatarId } = req.body;
    const userId = decoded.userId;

    // Eğer nickname değişiyorsa, başka kullanıcıda var mı kontrol et
    if (nickname) {
      const nicknameCheck = await db.query(
        'SELECT id FROM users WHERE nickname = $1 AND id != $2',
        [nickname, userId]
      );
      if (nicknameCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor' });
      }
    }

    // Kullanıcıyı güncelle (e-posta hariç)
    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           nickname = COALESCE($2, nickname),
           city_id = COALESCE($3, city_id),
           avatar_id = COALESCE($4, avatar_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND is_active = true
       RETURNING id, full_name, nickname, email, city_id, avatar_id, role, is_verified, created_at`,
      [fullName, nickname, cityId, avatarId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const user = result.rows[0];

    res.json({
      message: 'Profil güncellendi',
      user: {
        id: user.id,
        fullName: user.full_name,
        nickname: user.nickname,
        email: user.email,
        cityId: user.city_id,
        avatarId: user.avatar_id,
        role: user.role,
        isVerified: user.is_verified,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ error: 'Profil güncellenirken bir hata oluştu' });
  }
};

// CHANGE PASSWORD - Şifre değiştir
exports.changePassword = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Doğrulama hatası', 
        details: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = decoded.userId;

    // Mevcut şifreyi kontrol et
    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mevcut şifre hatalı' });
    }

    // Yeni şifreyi hashle ve güncelle
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Şifre başarıyla güncellendi' });

  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ error: 'Şifre değiştirilirken bir hata oluştu' });
  }
};

// GET MY COMMENTS - Kullanıcının yorumlarını getir
exports.getMyComments = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const userId = decoded.userId;

    const result = await db.query(
      `SELECT c.id, c.text, c.created_at, 
              m.id as menu_id, m.city_id, m.date, m.meal_type
       FROM comments c
       JOIN menus m ON c.menu_id = m.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      comments: result.rows.map(c => {
        // Tarihi düzgün formatla
        let dateStr;
        if (c.date instanceof Date) {
          const year = c.date.getFullYear();
          const month = String(c.date.getMonth() + 1).padStart(2, '0');
          const day = String(c.date.getDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
        } else {
          dateStr = String(c.date).split('T')[0];
        }
        
        return {
          id: c.id,
          text: c.text,
          createdAt: c.created_at,
          menuId: c.menu_id,
          cityId: c.city_id,
          menuDate: dateStr,
          mealType: c.meal_type
        };
      })
    });

  } catch (error) {
    console.error('GetMyComments error:', error);
    res.status(500).json({ error: 'Yorumlar alınamadı' });
  }
};

// GET MY VOTES - Kullanıcının beğenilerini getir
exports.getMyVotes = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const userId = decoded.userId;

    const result = await db.query(
      `SELECT v.vote_type, v.created_at, f.id as food_id, f.name as food_name, f.likes, f.dislikes
       FROM user_food_votes v
       JOIN foods f ON v.food_id = f.id
       WHERE v.user_id = $1
       ORDER BY v.created_at DESC`,
      [userId]
    );

    const likes = result.rows.filter(v => v.vote_type === 'like').map(v => ({
      foodId: v.food_id,
      foodName: v.food_name,
      totalLikes: v.likes,
      totalDislikes: v.dislikes,
      votedAt: v.created_at
    }));

    const dislikes = result.rows.filter(v => v.vote_type === 'dislike').map(v => ({
      foodId: v.food_id,
      foodName: v.food_name,
      totalLikes: v.likes,
      totalDislikes: v.dislikes,
      votedAt: v.created_at
    }));

    res.json({
      likes,
      dislikes,
      totalLikes: likes.length,
      totalDislikes: dislikes.length
    });

  } catch (error) {
    console.error('GetMyVotes error:', error);
    res.status(500).json({ error: 'Beğeniler alınamadı' });
  }
};

// GET MY STATS - Kullanıcı istatistikleri
exports.getMyStats = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const userId = decoded.userId;

    // Yorum sayısı
    const commentCount = await db.query(
      'SELECT COUNT(*) FROM comments WHERE user_id = $1',
      [userId]
    );

    // Beğeni sayıları
    const voteCount = await db.query(
      `SELECT vote_type, COUNT(*) 
       FROM user_food_votes 
       WHERE user_id = $1 
       GROUP BY vote_type`,
      [userId]
    );

    let likes = 0;
    let dislikes = 0;
    voteCount.rows.forEach(v => {
      if (v.vote_type === 'like') likes = parseInt(v.count);
      if (v.vote_type === 'dislike') dislikes = parseInt(v.count);
    });

    res.json({
      commentCount: parseInt(commentCount.rows[0].count),
      likeCount: likes,
      dislikeCount: dislikes
    });

  } catch (error) {
    console.error('GetMyStats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
};

