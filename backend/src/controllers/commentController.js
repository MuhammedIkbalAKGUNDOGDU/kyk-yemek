const db = require('../config/database');

// Menüye ait yorumları getir (public)
exports.getMenuComments = async (req, res) => {
  try {
    const { menuId } = req.params;

    const result = await db.query(
      `SELECT c.id, c.text, c.created_at, u.nickname, u.avatar_id
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.menu_id = $1
       ORDER BY c.created_at DESC
       LIMIT 100`,
      [menuId]
    );

    res.json({
      comments: result.rows.map(c => ({
        id: c.id,
        text: c.text,
        author: c.nickname,
        avatarId: c.avatar_id,
        createdAt: c.created_at
      }))
    });

  } catch (error) {
    console.error('Get menu comments error:', error);
    res.status(500).json({ error: 'Yorumlar alınamadı' });
  }
};

// Şehir + tarih + öğün için yorumları getir (public)
exports.getCommentsByCityDateMeal = async (req, res) => {
  try {
    const { city, date, mealType } = req.query;

    if (!city || !date || !mealType) {
      return res.status(400).json({ error: 'Şehir, tarih ve öğün tipi gerekli' });
    }

    // Önce menüyü bul
    const menuResult = await db.query(
      `SELECT id FROM menus 
       WHERE city_id = $1 AND date = $2 AND meal_type = $3 AND status = 'published'`,
      [city, date, mealType]
    );

    if (menuResult.rows.length === 0) {
      return res.json({ comments: [], menuId: null });
    }

    const menuId = menuResult.rows[0].id;

    // Yorumları getir
    const result = await db.query(
      `SELECT c.id, c.text, c.created_at, u.nickname, u.avatar_id
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.menu_id = $1
       ORDER BY c.created_at DESC
       LIMIT 100`,
      [menuId]
    );

    res.json({
      menuId,
      comments: result.rows.map(c => ({
        id: c.id,
        text: c.text,
        author: c.nickname,
        avatarId: c.avatar_id,
        createdAt: c.created_at
      }))
    });

  } catch (error) {
    console.error('Get comments by city/date/meal error:', error);
    res.status(500).json({ error: 'Yorumlar alınamadı' });
  }
};

// Yorum ekle (auth gerekli)
exports.addComment = async (req, res) => {
  try {
    const { menuId, text } = req.body;
    const userId = req.userId;

    if (!menuId) {
      return res.status(400).json({ error: 'Menü ID gerekli' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Yorum metni gerekli' });
    }

    if (text.length > 200) {
      return res.status(400).json({ error: 'Yorum en fazla 200 karakter olabilir' });
    }

    // Sadece harf, sayı, boşluk ve bazı noktalama işaretleri
    const cleanText = text.trim();
    if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s.,!?()-]+$/.test(cleanText)) {
      return res.status(400).json({ error: 'Yorum sadece harf, sayı ve temel noktalama işaretleri içerebilir' });
    }

    // Menü var mı kontrol et
    const menuCheck = await db.query(
      'SELECT id FROM menus WHERE id = $1 AND status = $2',
      [menuId, 'published']
    );

    if (menuCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Menü bulunamadı veya yayında değil' });
    }

    // Yorum ekle
    const result = await db.query(
      `INSERT INTO comments (user_id, menu_id, text)
       VALUES ($1, $2, $3)
       RETURNING id, text, created_at`,
      [userId, menuId, cleanText]
    );

    // Kullanıcı bilgisini al
    const userResult = await db.query(
      'SELECT nickname, avatar_id FROM users WHERE id = $1',
      [userId]
    );

    const comment = result.rows[0];
    const user = userResult.rows[0];

    res.status(201).json({
      message: 'Yorum eklendi',
      comment: {
        id: comment.id,
        text: comment.text,
        author: user.nickname,
        avatarId: user.avatar_id,
        createdAt: comment.created_at
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Yorum eklenemedi' });
  }
};

// Yorum sil (sadece kendi yorumunu)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Yorumun sahibi mi kontrol et
    const commentCheck = await db.query(
      'SELECT user_id FROM comments WHERE id = $1',
      [id]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Yorum bulunamadı' });
    }

    if (commentCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Bu yorumu silme yetkiniz yok' });
    }

    await db.query('DELETE FROM comments WHERE id = $1', [id]);

    res.json({ message: 'Yorum silindi' });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Yorum silinemedi' });
  }
};

// Menü yorum sayısını getir
exports.getCommentCount = async (req, res) => {
  try {
    const { menuId } = req.params;

    const result = await db.query(
      'SELECT COUNT(*) FROM comments WHERE menu_id = $1',
      [menuId]
    );

    res.json({ count: parseInt(result.rows[0].count) });

  } catch (error) {
    console.error('Get comment count error:', error);
    res.status(500).json({ error: 'Yorum sayısı alınamadı' });
  }
};

