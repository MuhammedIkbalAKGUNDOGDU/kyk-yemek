-- =============================================
-- İLK ADMİN OLUŞTURMA
-- =============================================
-- Bu SQL'i PostgreSQL query tool'dan çalıştırın
-- Şifreyi değiştirmek isterseniz aşağıdaki hash'i güncelleyin

-- Şifre: admin123
-- bcrypt hash: $2a$10$rQnM1qxlPqYl.0HqK8aZxOQG5TzVhBvXz5vXmGtqJjWz8Kxl5XjHi

INSERT INTO admins (email, password_hash, name)
VALUES (
    'admin@yemekkyk.com',
    '$2a$10$rQnM1qxlPqYl.0HqK8aZxOQG5TzVhBvXz5vXmGtqJjWz8Kxl5XjHi',
    'Admin'
)
ON CONFLICT (email) DO NOTHING;

-- Oluşturulan admin'i kontrol et
SELECT id, email, name, created_at FROM admins;

-- =============================================
-- FARKLI ŞİFRE KULLANMAK İSTERSENİZ:
-- =============================================
-- Node.js ile hash oluşturun:
--
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('yeni_sifre', 10);
-- console.log(hash);
--
-- Çıkan hash'i yukarıdaki password_hash değerine yazın
-- =============================================

