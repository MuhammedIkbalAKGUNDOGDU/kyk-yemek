const { validationResult } = require('express-validator');
const db = require('../config/database');

// Yemek isimlerini foods tablosuna ekle (yoksa)
async function ensureFoodsExist(items) {
  for (const itemName of items) {
    const trimmedName = itemName.trim();
    if (!trimmedName) continue;
    
    // Upsert: varsa pas geç, yoksa ekle
    await db.query(
      `INSERT INTO foods (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
      [trimmedName]
    );
  }
}

// TÜM MENÜLER (admin için, filtrelenebilir)
exports.getAllMenus = async (req, res) => {
  try {
    const { city, month, year, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // WHERE koşullarını oluştur
    let whereClause = ' WHERE 1=1';
    const filterParams = [];
    let paramCount = 0;

    if (city) {
      paramCount++;
      whereClause += ` AND m.city_id = $${paramCount}`;
      filterParams.push(city);
    }

    if (year && month) {
      paramCount++;
      whereClause += ` AND EXTRACT(YEAR FROM m.date) = $${paramCount}`;
      filterParams.push(parseInt(year));
      paramCount++;
      whereClause += ` AND EXTRACT(MONTH FROM m.date) = $${paramCount}`;
      filterParams.push(parseInt(month));
    }

    if (status) {
      paramCount++;
      whereClause += ` AND m.status = $${paramCount}`;
      filterParams.push(status);
    }

    // Count query
    const countQuery = `SELECT COUNT(*) FROM menus m ${whereClause}`;
    const countResult = await db.query(countQuery, filterParams);
    const total = parseInt(countResult.rows[0].count);

    // Main query
    let query = `
      SELECT m.*, a.name as admin_name
      FROM menus m
      LEFT JOIN admins a ON m.created_by = a.id
      ${whereClause}
      ORDER BY m.date DESC, m.meal_type ASC
    `;

    // Pagination
    const params = [...filterParams];
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);

    res.json({
      menus: result.rows.map(m => ({
        id: m.id,
        cityId: m.city_id,
        date: m.date,
        mealType: m.meal_type,
        items: m.items,
        totalCalories: m.total_calories,
        status: m.status,
        createdBy: m.admin_name,
        createdAt: m.created_at,
        publishedAt: m.published_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all menus error:', error);
    res.status(500).json({ error: 'Menüler alınamadı' });
  }
};

// TEK MENÜ DETAY
exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT m.*, a.name as admin_name
       FROM menus m
       LEFT JOIN admins a ON m.created_by = a.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menü bulunamadı' });
    }

    const m = result.rows[0];

    res.json({
      menu: {
        id: m.id,
        cityId: m.city_id,
        date: m.date,
        mealType: m.meal_type,
        items: m.items,
        totalCalories: m.total_calories,
        status: m.status,
        createdBy: m.admin_name,
        createdAt: m.created_at,
        publishedAt: m.published_at
      }
    });

  } catch (error) {
    console.error('Get menu by id error:', error);
    res.status(500).json({ error: 'Menü alınamadı' });
  }
};

// YENİ MENÜ OLUŞTUR (tek)
exports.createMenu = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Doğrulama hatası', details: errors.array() });
    }

    const { cityId, date, mealType, items, totalCalories } = req.body;
    const adminId = req.adminId;

    // Aynı menü var mı kontrol et
    const existing = await db.query(
      'SELECT id FROM menus WHERE city_id = $1 AND date = $2 AND meal_type = $3',
      [cityId, date, mealType]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Bu tarih ve öğün için menü zaten mevcut',
        existingId: existing.rows[0].id
      });
    }

    // Yemek isimlerini kaydet
    await ensureFoodsExist(items);

    // Menü oluştur (taslak olarak)
    const result = await db.query(
      `INSERT INTO menus (city_id, date, meal_type, items, total_calories, status, created_by)
       VALUES ($1, $2, $3, $4, $5, 'draft', $6)
       RETURNING *`,
      [cityId, date, mealType, items, totalCalories, adminId]
    );

    res.status(201).json({
      message: 'Menü taslak olarak oluşturuldu',
      menu: result.rows[0]
    });

  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ error: 'Menü oluşturulamadı' });
  }
};

// TOPLU MENÜ YÜKLEME (JSON)
exports.bulkUpload = async (req, res) => {
  try {
    const { city, year, month, menus } = req.body;
    const adminId = req.adminId;

    if (!city || !year || !month || !menus || !Array.isArray(menus)) {
      return res.status(400).json({ error: 'Geçersiz veri formatı' });
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [],
      newFoods: []
    };

    // Tüm yemek isimlerini topla
    const allFoods = new Set();
    menus.forEach(dayMenu => {
      if (dayMenu.breakfast?.items) {
        dayMenu.breakfast.items.forEach(item => allFoods.add(item.trim()));
      }
      if (dayMenu.dinner?.items) {
        dayMenu.dinner.items.forEach(item => allFoods.add(item.trim()));
      }
    });

    // Mevcut yemekleri kontrol et
    const existingFoods = await db.query('SELECT name FROM foods');
    const existingFoodNames = new Set(existingFoods.rows.map(f => f.name));
    
    allFoods.forEach(food => {
      if (!existingFoodNames.has(food)) {
        results.newFoods.push(food);
      }
    });

    // Yeni yemekleri ekle
    await ensureFoodsExist([...allFoods]);

    // Her gün için menüleri oluştur
    for (const dayMenu of menus) {
      const day = dayMenu.day;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Kahvaltı
      if (dayMenu.breakfast?.items?.length > 0) {
        try {
          const existing = await db.query(
            'SELECT id FROM menus WHERE city_id = $1 AND date = $2 AND meal_type = $3',
            [city, dateStr, 'breakfast']
          );

          if (existing.rows.length > 0) {
            results.skipped++;
          } else {
            await db.query(
              `INSERT INTO menus (city_id, date, meal_type, items, total_calories, status, created_by)
               VALUES ($1, $2, 'breakfast', $3, $4, 'draft', $5)`,
              [city, dateStr, dayMenu.breakfast.items, dayMenu.breakfast.calories || 0, adminId]
            );
            results.created++;
          }
        } catch (err) {
          results.errors.push(`${dateStr} kahvaltı: ${err.message}`);
        }
      }

      // Akşam yemeği
      if (dayMenu.dinner?.items?.length > 0) {
        try {
          const existing = await db.query(
            'SELECT id FROM menus WHERE city_id = $1 AND date = $2 AND meal_type = $3',
            [city, dateStr, 'dinner']
          );

          if (existing.rows.length > 0) {
            results.skipped++;
          } else {
            await db.query(
              `INSERT INTO menus (city_id, date, meal_type, items, total_calories, status, created_by)
               VALUES ($1, $2, 'dinner', $3, $4, 'draft', $5)`,
              [city, dateStr, dayMenu.dinner.items, dayMenu.dinner.calories || 0, adminId]
            );
            results.created++;
          }
        } catch (err) {
          results.errors.push(`${dateStr} akşam: ${err.message}`);
        }
      }
    }

    res.json({
      message: 'Toplu yükleme tamamlandı',
      results
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Toplu yükleme başarısız' });
  }
};

// MENÜ GÜNCELLE (sadece taslak)
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, totalCalories } = req.body;

    // Menü var mı ve taslak mı kontrol et
    const existing = await db.query(
      'SELECT id, status, date FROM menus WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Menü bulunamadı' });
    }

    if (existing.rows[0].status === 'published') {
      return res.status(400).json({ error: 'Yayınlanmış menü düzenlenemez' });
    }

    // Yemek isimlerini kaydet
    if (items) {
      await ensureFoodsExist(items);
    }

    // Güncelle
    const result = await db.query(
      `UPDATE menus 
       SET items = COALESCE($1, items),
           total_calories = COALESCE($2, total_calories)
       WHERE id = $3
       RETURNING *`,
      [items, totalCalories, id]
    );

    res.json({
      message: 'Menü güncellendi',
      menu: result.rows[0]
    });

  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: 'Menü güncellenemedi' });
  }
};

// MENÜ YAYINLA
exports.publishMenu = async (req, res) => {
  try {
    const { id } = req.params;

    // Menü var mı kontrol et
    const existing = await db.query(
      'SELECT id, status FROM menus WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Menü bulunamadı' });
    }

    if (existing.rows[0].status === 'published') {
      return res.status(400).json({ error: 'Menü zaten yayında' });
    }

    // Yayınla
    const result = await db.query(
      `UPDATE menus 
       SET status = 'published', published_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message: 'Menü yayınlandı',
      menu: result.rows[0]
    });

  } catch (error) {
    console.error('Publish menu error:', error);
    res.status(500).json({ error: 'Menü yayınlanamadı' });
  }
};

// TOPLU YAYINLA (ID listesiyle)
exports.bulkPublish = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Menü ID listesi gerekli' });
    }

    const result = await db.query(
      `UPDATE menus 
       SET status = 'published', published_at = CURRENT_TIMESTAMP
       WHERE id = ANY($1) AND status = 'draft'
       RETURNING id`,
      [ids]
    );

    res.json({
      message: `${result.rows.length} menü yayınlandı`,
      publishedIds: result.rows.map(r => r.id)
    });

  } catch (error) {
    console.error('Bulk publish error:', error);
    res.status(500).json({ error: 'Toplu yayınlama başarısız' });
  }
};

// AYLIK TOPLU YAYINLA (şehir + yıl + ay)
exports.publishMonth = async (req, res) => {
  try {
    const { city, year, month } = req.body;

    if (!city || !year || !month) {
      return res.status(400).json({ error: 'Şehir, yıl ve ay gerekli' });
    }

    // Önce kaç taslak var kontrol et
    const draftCount = await db.query(
      `SELECT COUNT(*) FROM menus 
       WHERE city_id = $1 
         AND EXTRACT(YEAR FROM date) = $2 
         AND EXTRACT(MONTH FROM date) = $3
         AND status = 'draft'`,
      [city, parseInt(year), parseInt(month)]
    );

    const totalDrafts = parseInt(draftCount.rows[0].count);

    if (totalDrafts === 0) {
      return res.status(400).json({ error: 'Bu ay için yayınlanacak taslak menü yok' });
    }

    // Tüm taslakları yayınla
    const result = await db.query(
      `UPDATE menus 
       SET status = 'published', published_at = CURRENT_TIMESTAMP
       WHERE city_id = $1 
         AND EXTRACT(YEAR FROM date) = $2 
         AND EXTRACT(MONTH FROM date) = $3
         AND status = 'draft'
       RETURNING id`,
      [city, parseInt(year), parseInt(month)]
    );

    res.json({
      message: `${result.rows.length} menü yayınlandı`,
      publishedCount: result.rows.length,
      city,
      year: parseInt(year),
      month: parseInt(month)
    });

  } catch (error) {
    console.error('Publish month error:', error);
    res.status(500).json({ error: 'Aylık yayınlama başarısız' });
  }
};

// MENÜ SİL (sadece taslak)
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    // Menü var mı ve taslak mı kontrol et
    const existing = await db.query(
      'SELECT id, status FROM menus WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Menü bulunamadı' });
    }

    if (existing.rows[0].status === 'published') {
      return res.status(400).json({ error: 'Yayınlanmış menü silinemez' });
    }

    await db.query('DELETE FROM menus WHERE id = $1', [id]);

    res.json({ message: 'Menü silindi' });

  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ error: 'Menü silinemedi' });
  }
};

// KULLANICILARA AÇIK: Yayınlanmış menüleri getir
exports.getPublicMenus = async (req, res) => {
  try {
    const { city, date } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'Şehir parametresi gerekli' });
    }

    let query = `
      SELECT id, city_id, date, meal_type, items, total_calories
      FROM menus
      WHERE city_id = $1 AND status = 'published'
    `;
    const params = [city];

    if (date) {
      query += ` AND date = $2`;
      params.push(date);
    } else {
      // Varsayılan: bugün ve sonrası
      query += ` AND date >= CURRENT_DATE`;
    }

    query += ` ORDER BY date ASC, meal_type ASC`;

    const result = await db.query(query, params);

    res.json({
      menus: result.rows.map(m => {
        // Tarihi düzgün formatta döndür (YYYY-MM-DD) - timezone sorunlarını önle
        let dateStr;
        if (m.date instanceof Date) {
          const year = m.date.getFullYear();
          const month = String(m.date.getMonth() + 1).padStart(2, '0');
          const day = String(m.date.getDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
        } else {
          dateStr = String(m.date).split('T')[0];
        }
        return {
          id: m.id,
          cityId: m.city_id,
          date: dateStr,
          mealType: m.meal_type,
          items: m.items,
          totalCalories: m.total_calories
        };
      })
    });

  } catch (error) {
    console.error('Get public menus error:', error);
    res.status(500).json({ error: 'Menüler alınamadı' });
  }
};

// Aylık menü (public)
exports.getMonthlyMenu = async (req, res) => {
  try {
    const { city, year, month } = req.query;

    if (!city || !year || !month) {
      return res.status(400).json({ error: 'Şehir, yıl ve ay parametreleri gerekli' });
    }

    const result = await db.query(
      `SELECT id, city_id, date, meal_type, items, total_calories
       FROM menus
       WHERE city_id = $1 
         AND EXTRACT(YEAR FROM date) = $2 
         AND EXTRACT(MONTH FROM date) = $3
         AND status = 'published'
       ORDER BY date ASC, meal_type ASC`,
      [city, parseInt(year), parseInt(month)]
    );

    // Günlere göre grupla (ID'ler dahil)
    const menusByDay = {};
    
    result.rows.forEach(m => {
      // PostgreSQL DATE tipini doğru parse et
      // Timezone sorunlarını önlemek için yerel tarih kullan
      let dateStr;
      if (m.date instanceof Date) {
        // Date objesinden yerel tarih al
        const year = m.date.getFullYear();
        const month = String(m.date.getMonth() + 1).padStart(2, '0');
        const day = String(m.date.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      } else {
        // Zaten string ise direkt kullan
        dateStr = String(m.date).split('T')[0];
      }
      
      const dayNum = parseInt(dateStr.split('-')[2], 10);
      
      if (!menusByDay[dayNum]) {
        menusByDay[dayNum] = { 
          date: dateStr,
          breakfast: null, 
          dinner: null,
          breakfastId: null,
          dinnerId: null
        };
      }
      if (m.meal_type === 'breakfast') {
        menusByDay[dayNum].breakfast = { items: m.items, calories: m.total_calories };
        menusByDay[dayNum].breakfastId = m.id;
      } else {
        menusByDay[dayNum].dinner = { items: m.items, calories: m.total_calories };
        menusByDay[dayNum].dinnerId = m.id;
      }
    });

    res.json({
      city,
      year: parseInt(year),
      month: parseInt(month),
      menus: Object.values(menusByDay)
    });

  } catch (error) {
    console.error('Get monthly menu error:', error);
    res.status(500).json({ error: 'Aylık menü alınamadı' });
  }
};

