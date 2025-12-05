const db = require('../config/database');

// TÜM YEMEKLERİ GETİR (admin için)
exports.getAllFoods = async (req, res) => {
  try {
    const { search, sort = 'name', order = 'asc', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM foods WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    // Count (ORDER BY olmadan)
    let countQuery = 'SELECT COUNT(*) FROM foods WHERE 1=1';
    if (search) countQuery += ` AND name ILIKE $1`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Sorting
    const validSorts = ['name', 'likes', 'dislikes', 'created_at'];
    const sortField = validSorts.includes(sort) ? sort : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);

    res.json({
      foods: result.rows.map(f => ({
        id: f.id,
        name: f.name,
        likes: f.likes,
        dislikes: f.dislikes,
        createdAt: f.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all foods error:', error);
    res.status(500).json({ error: 'Yemekler alınamadı' });
  }
};

// YEMEK BEĞENİ BİLGİSİ (public - isimle)
exports.getFoodStats = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Yemek ismi gerekli' });
    }

    const result = await db.query(
      'SELECT id, name, likes, dislikes FROM foods WHERE name = $1',
      [name]
    );

    if (result.rows.length === 0) {
      // Yemek yoksa 0 döndür
      return res.json({
        name,
        likes: 0,
        dislikes: 0
      });
    }

    const food = result.rows[0];

    res.json({
      id: food.id,
      name: food.name,
      likes: food.likes,
      dislikes: food.dislikes
    });

  } catch (error) {
    console.error('Get food stats error:', error);
    res.status(500).json({ error: 'Yemek bilgisi alınamadı' });
  }
};

// YEMEK BEĞEN (kullanıcı girişli)
exports.likeFood = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId; // Auth middleware'den

    if (!name) {
      return res.status(400).json({ error: 'Yemek ismi gerekli' });
    }

    // Yemeği bul veya oluştur
    let foodResult = await db.query(
      'SELECT id FROM foods WHERE name = $1',
      [name]
    );

    let foodId;
    if (foodResult.rows.length === 0) {
      // Yemek yoksa oluştur
      const newFood = await db.query(
        'INSERT INTO foods (name) VALUES ($1) RETURNING id',
        [name]
      );
      foodId = newFood.rows[0].id;
    } else {
      foodId = foodResult.rows[0].id;
    }

    // Kullanıcının önceki oyu var mı?
    const existingVote = await db.query(
      'SELECT id, vote_type FROM user_food_votes WHERE user_id = $1 AND food_id = $2',
      [userId, foodId]
    );

    if (existingVote.rows.length > 0) {
      const oldVoteType = existingVote.rows[0].vote_type;

      if (oldVoteType === 'like') {
        // Zaten beğenmiş, beğeniyi geri al
        await db.query('DELETE FROM user_food_votes WHERE id = $1', [existingVote.rows[0].id]);
        await db.query('UPDATE foods SET likes = likes - 1 WHERE id = $1', [foodId]);
        
        const updated = await db.query('SELECT likes, dislikes FROM foods WHERE id = $1', [foodId]);
        return res.json({
          message: 'Beğeni geri alındı',
          likes: updated.rows[0].likes,
          dislikes: updated.rows[0].dislikes,
          userVote: null
        });
      } else {
        // Dislike'tan like'a geç
        await db.query(
          'UPDATE user_food_votes SET vote_type = $1 WHERE id = $2',
          ['like', existingVote.rows[0].id]
        );
        await db.query(
          'UPDATE foods SET likes = likes + 1, dislikes = dislikes - 1 WHERE id = $1',
          [foodId]
        );
        
        const updated = await db.query('SELECT likes, dislikes FROM foods WHERE id = $1', [foodId]);
        return res.json({
          message: 'Beğeni güncellendi',
          likes: updated.rows[0].likes,
          dislikes: updated.rows[0].dislikes,
          userVote: 'like'
        });
      }
    }

    // Yeni beğeni
    await db.query(
      'INSERT INTO user_food_votes (user_id, food_id, vote_type) VALUES ($1, $2, $3)',
      [userId, foodId, 'like']
    );
    await db.query('UPDATE foods SET likes = likes + 1 WHERE id = $1', [foodId]);

    const updated = await db.query('SELECT likes, dislikes FROM foods WHERE id = $1', [foodId]);
    res.json({
      message: 'Beğenildi',
      likes: updated.rows[0].likes,
      dislikes: updated.rows[0].dislikes,
      userVote: 'like'
    });

  } catch (error) {
    console.error('Like food error:', error);
    res.status(500).json({ error: 'Beğeni işlemi başarısız' });
  }
};

// YEMEK BEĞENİ KALDIRMA (kullanıcı girişli)
exports.dislikeFood = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({ error: 'Yemek ismi gerekli' });
    }

    // Yemeği bul veya oluştur
    let foodResult = await db.query(
      'SELECT id FROM foods WHERE name = $1',
      [name]
    );

    let foodId;
    if (foodResult.rows.length === 0) {
      const newFood = await db.query(
        'INSERT INTO foods (name) VALUES ($1) RETURNING id',
        [name]
      );
      foodId = newFood.rows[0].id;
    } else {
      foodId = foodResult.rows[0].id;
    }

    // Kullanıcının önceki oyu var mı?
    const existingVote = await db.query(
      'SELECT id, vote_type FROM user_food_votes WHERE user_id = $1 AND food_id = $2',
      [userId, foodId]
    );

    if (existingVote.rows.length > 0) {
      const oldVoteType = existingVote.rows[0].vote_type;

      if (oldVoteType === 'dislike') {
        // Zaten dislike, geri al
        await db.query('DELETE FROM user_food_votes WHERE id = $1', [existingVote.rows[0].id]);
        await db.query('UPDATE foods SET dislikes = dislikes - 1 WHERE id = $1', [foodId]);
        
        const updated = await db.query('SELECT likes, dislikes FROM foods WHERE id = $1', [foodId]);
        return res.json({
          message: 'Beğenmeme geri alındı',
          likes: updated.rows[0].likes,
          dislikes: updated.rows[0].dislikes,
          userVote: null
        });
      } else {
        // Like'tan dislike'a geç
        await db.query(
          'UPDATE user_food_votes SET vote_type = $1 WHERE id = $2',
          ['dislike', existingVote.rows[0].id]
        );
        await db.query(
          'UPDATE foods SET likes = likes - 1, dislikes = dislikes + 1 WHERE id = $1',
          [foodId]
        );
        
        const updated = await db.query('SELECT likes, dislikes FROM foods WHERE id = $1', [foodId]);
        return res.json({
          message: 'Beğenmeme güncellendi',
          likes: updated.rows[0].likes,
          dislikes: updated.rows[0].dislikes,
          userVote: 'dislike'
        });
      }
    }

    // Yeni dislike
    await db.query(
      'INSERT INTO user_food_votes (user_id, food_id, vote_type) VALUES ($1, $2, $3)',
      [userId, foodId, 'dislike']
    );
    await db.query('UPDATE foods SET dislikes = dislikes + 1 WHERE id = $1', [foodId]);

    const updated = await db.query('SELECT likes, dislikes FROM foods WHERE id = $1', [foodId]);
    res.json({
      message: 'Beğenilmedi',
      likes: updated.rows[0].likes,
      dislikes: updated.rows[0].dislikes,
      userVote: 'dislike'
    });

  } catch (error) {
    console.error('Dislike food error:', error);
    res.status(500).json({ error: 'Beğenmeme işlemi başarısız' });
  }
};

// KULLANICININ BİR YEMEĞİ BEĞENİP BEĞENMEDİĞİ
exports.getUserVote = async (req, res) => {
  try {
    const { name } = req.query;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({ error: 'Yemek ismi gerekli' });
    }

    const foodResult = await db.query(
      'SELECT id FROM foods WHERE name = $1',
      [name]
    );

    if (foodResult.rows.length === 0) {
      return res.json({ userVote: null });
    }

    const voteResult = await db.query(
      'SELECT vote_type FROM user_food_votes WHERE user_id = $1 AND food_id = $2',
      [userId, foodResult.rows[0].id]
    );

    res.json({
      userVote: voteResult.rows.length > 0 ? voteResult.rows[0].vote_type : null
    });

  } catch (error) {
    console.error('Get user vote error:', error);
    res.status(500).json({ error: 'Oy bilgisi alınamadı' });
  }
};

// TOPLU BEĞENİ BİLGİSİ (birden fazla yemek için)
exports.getBulkFoodStats = async (req, res) => {
  try {
    const { names } = req.body;

    if (!names || !Array.isArray(names)) {
      return res.status(400).json({ error: 'Yemek isimleri listesi gerekli' });
    }

    const result = await db.query(
      'SELECT name, likes, dislikes FROM foods WHERE name = ANY($1)',
      [names]
    );

    // Tüm istenen yemekleri döndür, olmayanlar için 0
    const statsMap = {};
    result.rows.forEach(f => {
      statsMap[f.name] = { likes: f.likes, dislikes: f.dislikes };
    });

    const stats = names.map(name => ({
      name,
      likes: statsMap[name]?.likes || 0,
      dislikes: statsMap[name]?.dislikes || 0
    }));

    res.json({ stats });

  } catch (error) {
    console.error('Get bulk food stats error:', error);
    res.status(500).json({ error: 'Toplu yemek bilgisi alınamadı' });
  }
};

