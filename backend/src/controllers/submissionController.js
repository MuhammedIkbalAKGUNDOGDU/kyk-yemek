const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// İzin verilen dosya tipleri
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Dosya yükleme (public - herkes gönderebilir)
exports.submitMenu = async (req, res) => {
  try {
    const { cityId, year, month, note, submitterName, submitterEmail } = req.body;
    const file = req.file;

    // Validasyonlar
    if (!file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    if (!cityId || !year || !month) {
      // Yüklenen dosyayı sil
      if (file.path) fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Şehir, yıl ve ay gerekli' });
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      if (file.path) fs.unlinkSync(file.path);
      return res.status(400).json({ 
        error: 'Geçersiz dosya tipi. Sadece JPEG, PNG, WebP ve PDF kabul edilir.' 
      });
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      if (file.path) fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Dosya boyutu 10MB\'dan büyük olamaz' });
    }

    // Kullanıcı ID (giriş yapmışsa)
    const userId = req.userId || null;

    // Veritabanına kaydet
    const result = await db.query(
      `INSERT INTO menu_submissions 
       (user_id, submitter_name, submitter_email, city_id, year, month, file_path, file_name, file_type, file_size, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, created_at`,
      [
        userId,
        submitterName || null,
        submitterEmail || null,
        cityId,
        parseInt(year),
        parseInt(month),
        file.path,
        file.originalname,
        file.mimetype,
        file.size,
        note || null
      ]
    );

    res.status(201).json({
      message: 'Menü başarıyla gönderildi. İncelendikten sonra yayınlanacaktır.',
      submission: {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Submit menu error:', error);
    // Hata durumunda dosyayı sil
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({ error: 'Menü gönderilemedi' });
  }
};

// Tüm gönderileri getir (admin)
exports.getAllSubmissions = async (req, res) => {
  try {
    const { status, city, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = ' WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND ms.status = $${paramCount}`;
      params.push(status);
    }

    if (city) {
      paramCount++;
      whereClause += ` AND ms.city_id = $${paramCount}`;
      params.push(city);
    }

    // Count query
    const countResult = await db.query(
      `SELECT COUNT(*) FROM menu_submissions ms ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Main query
    const queryParams = [...params];
    paramCount++;
    queryParams.push(parseInt(limit));
    paramCount++;
    queryParams.push(offset);

    const result = await db.query(
      `SELECT ms.*, u.nickname as user_nickname, a.name as reviewer_name
       FROM menu_submissions ms
       LEFT JOIN users u ON ms.user_id = u.id
       LEFT JOIN admins a ON ms.reviewed_by = a.id
       ${whereClause}
       ORDER BY ms.created_at DESC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      queryParams
    );

    res.json({
      submissions: result.rows.map(s => ({
        id: s.id,
        userId: s.user_id,
        userNickname: s.user_nickname,
        submitterName: s.submitter_name,
        submitterEmail: s.submitter_email,
        cityId: s.city_id,
        year: s.year,
        month: s.month,
        fileName: s.file_name,
        fileType: s.file_type,
        fileSize: s.file_size,
        note: s.note,
        status: s.status,
        adminNote: s.admin_note,
        reviewerName: s.reviewer_name,
        reviewedAt: s.reviewed_at,
        createdAt: s.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ error: 'Gönderiler alınamadı' });
  }
};

// Tek gönderi detayı (admin)
exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT ms.*, u.nickname as user_nickname, a.name as reviewer_name
       FROM menu_submissions ms
       LEFT JOIN users u ON ms.user_id = u.id
       LEFT JOIN admins a ON ms.reviewed_by = a.id
       WHERE ms.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gönderi bulunamadı' });
    }

    const s = result.rows[0];

    res.json({
      submission: {
        id: s.id,
        userId: s.user_id,
        userNickname: s.user_nickname,
        submitterName: s.submitter_name,
        submitterEmail: s.submitter_email,
        cityId: s.city_id,
        year: s.year,
        month: s.month,
        filePath: s.file_path,
        fileName: s.file_name,
        fileType: s.file_type,
        fileSize: s.file_size,
        note: s.note,
        status: s.status,
        adminNote: s.admin_note,
        reviewerName: s.reviewer_name,
        reviewedAt: s.reviewed_at,
        createdAt: s.created_at
      }
    });

  } catch (error) {
    console.error('Get submission by id error:', error);
    res.status(500).json({ error: 'Gönderi alınamadı' });
  }
};

// Dosyayı getir (admin)
exports.getSubmissionFile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT file_path, file_name, file_type FROM menu_submissions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gönderi bulunamadı' });
    }

    const { file_path, file_name, file_type } = result.rows[0];

    // Dosya var mı kontrol et
    if (!fs.existsSync(file_path)) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }

    res.setHeader('Content-Type', file_type);
    res.setHeader('Content-Disposition', `inline; filename="${file_name}"`);
    res.sendFile(path.resolve(file_path));

  } catch (error) {
    console.error('Get submission file error:', error);
    res.status(500).json({ error: 'Dosya alınamadı' });
  }
};

// Gönderi durumunu güncelle (admin)
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const adminId = req.adminId;

    if (!['pending', 'reviewed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }

    const result = await db.query(
      `UPDATE menu_submissions 
       SET status = $1, admin_note = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, adminNote || null, adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gönderi bulunamadı' });
    }

    res.json({
      message: 'Gönderi durumu güncellendi',
      submission: result.rows[0]
    });

  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({ error: 'Durum güncellenemedi' });
  }
};

// Gönderiyi sil (admin)
exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    // Önce dosya yolunu al
    const result = await db.query(
      'SELECT file_path FROM menu_submissions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gönderi bulunamadı' });
    }

    const filePath = result.rows[0].file_path;

    // Veritabanından sil
    await db.query('DELETE FROM menu_submissions WHERE id = $1', [id]);

    // Dosyayı sil
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Gönderi silindi' });

  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: 'Gönderi silinemedi' });
  }
};

// İstatistikler (admin dashboard için)
exports.getSubmissionStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) as total
      FROM menu_submissions
    `);

    res.json({
      stats: {
        pending: parseInt(result.rows[0].pending),
        reviewed: parseInt(result.rows[0].reviewed),
        rejected: parseInt(result.rows[0].rejected),
        total: parseInt(result.rows[0].total)
      }
    });

  } catch (error) {
    console.error('Get submission stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
};


