# KYK Yemek - Docker Deployment

Bu klasör, KYK Yemek uygulamasını Docker container'ları ile çalıştırmak için gerekli dosyaları içerir.

## 🏗️ Mimari

- **PostgreSQL**: Veritabanı
- **Backend**: Node.js/Express API (Port 5001)
- **Frontend**: Next.js (Port 3000)
- **Nginx**: Reverse Proxy ve Load Balancer (Port 80/443)

## 📋 Gereksinimler

- Docker (v20.10+)
- Docker Compose (v2.0+)

## 🚀 Hızlı Başlangıç

### 1. Environment Dosyası Oluştur

```bash
cd deployment
cp env.example .env
```

`.env` dosyasını düzenleyip gerekli değerleri ayarlayın:
- `POSTGRES_PASSWORD`: Güvenli bir şifre
- `JWT_SECRET`: Güçlü bir JWT secret key
- `NEXT_PUBLIC_API_URL`: Production API URL'i

### 2. Container'ları Başlat

**Otomatik başlatma (önerilen):**
```bash
./start.sh
```

**Manuel başlatma:**
```bash
docker-compose up -d
```

### 3. Veritabanı Kontrolü

```bash
# PostgreSQL loglarını kontrol et
docker-compose logs postgres

# Veritabanına bağlan
docker-compose exec postgres psql -U postgres -d kyk_yemek
```

### 4. Admin Kullanıcısı Oluştur

```bash
# Admin oluşturma script'ini çalıştır
docker-compose exec postgres psql -U postgres -d kyk_yemek -f /docker-entrypoint-initdb.d/create_admin.sql

# Veya API üzerinden
curl -X POST http://localhost/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin"
  }'
```

## 📝 Komutlar

### Makefile ile (Önerilen)

```bash
make help          # Tüm komutları listele
make build         # Container'ları build et
make up            # Container'ları başlat
make down          # Container'ları durdur
make logs          # Tüm logları göster
make logs-backend  # Backend logları
make logs-frontend # Frontend logları
make restart       # Tüm container'ları yeniden başlat
make backup-db     # Veritabanını yedekle
make restore-db FILE=backup.sql  # Veritabanını geri yükle
make shell-backend # Backend container'ına gir
make shell-postgres # PostgreSQL'e bağlan
```

### Docker Compose ile

```bash
# Container'ları başlat
docker-compose up -d

# Container'ları durdur
docker-compose down

# Logları görüntüle
docker-compose logs -f

# Container'ları yeniden build et
docker-compose build --no-cache
docker-compose up -d

# Veritabanı yedekleme
docker-compose exec postgres pg_dump -U postgres kyk_yemek > backup.sql

# Veritabanı geri yükleme
docker-compose exec -T postgres psql -U postgres kyk_yemek < backup.sql
```

### Script'ler ile

```bash
# Otomatik başlatma
./start.sh

# Durdurma
./stop.sh
```

## 🔧 Yapılandırma

### Port Değiştirme

`.env` dosyasında portları değiştirebilirsiniz:
```env
FRONTEND_PORT=3000
BACKEND_PORT=5001
NGINX_HTTP_PORT=80
POSTGRES_PORT=5432
```

### Nginx Yapılandırması

`nginx.conf` dosyasını düzenleyerek reverse proxy ayarlarını değiştirebilirsiniz.

### SSL/HTTPS

Production için SSL sertifikası eklemek için:

1. Sertifikaları `nginx/ssl/` klasörüne koyun
2. `nginx.conf` dosyasını güncelleyin (HTTPS server block ekleyin)
3. `docker-compose.yml`'de volume mapping ekleyin

## 📊 Health Checks

- **Backend**: `http://localhost/api/health`
- **Frontend**: `http://localhost/`
- **Nginx**: `http://localhost/health`

## 🗄️ Veri Kalıcılığı

- **PostgreSQL**: `postgres_data` volume'unda saklanır
- **Uploads**: `backend/uploads/` klasöründe saklanır

## 🐛 Sorun Giderme

### Container'lar başlamıyor
```bash
# Logları kontrol et
docker-compose logs

# Container durumunu kontrol et
docker-compose ps
```

### Veritabanı bağlantı hatası
```bash
# PostgreSQL'in hazır olmasını bekle
docker-compose logs postgres

# Health check'i kontrol et
docker-compose exec postgres pg_isready -U postgres
```

### Port çakışması
`.env` dosyasında portları değiştirin veya çakışan servisleri durdurun.

### Upload klasörü izinleri
```bash
# Upload klasörü izinlerini düzelt
chmod -R 755 ../backend/uploads
```

## 🚢 Production Deployment

1. `.env` dosyasını production değerleriyle güncelleyin
2. `JWT_SECRET` ve `POSTGRES_PASSWORD` için güçlü değerler kullanın
3. SSL sertifikalarını ekleyin
4. Domain'i yapılandırın
5. Firewall kurallarını ayarlayın
6. Monitoring ve logging ekleyin

## 📦 Volume Yönetimi

### Volume'ları Listele
```bash
docker volume ls
```

### Volume'u Sil (DİKKAT: Veri kaybına neden olur)
```bash
docker-compose down -v
```

## 🔐 Güvenlik

- Production'da mutlaka güçlü şifreler kullanın
- JWT_SECRET'ı güvenli tutun
- Database şifresini düzenli olarak değiştirin
- SSL/HTTPS kullanın
- Firewall kurallarını yapılandırın

## 📞 Destek

Sorun yaşarsanız:
- Logları kontrol edin: `docker-compose logs`
- Container durumunu kontrol edin: `docker-compose ps`
- Health check'leri test edin

