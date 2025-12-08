#!/bin/bash

# KYK Yemek - Docker Deployment Start Script

set -e

echo "🚀 KYK Yemek Deployment Başlatılıyor..."

# .env dosyası kontrolü
if [ ! -f .env ]; then
    echo "⚠️  .env dosyası bulunamadı!"
    echo "📝 env.example dosyasından .env oluşturuluyor..."
    cp env.example .env
    echo "✅ .env dosyası oluşturuldu. Lütfen gerekli değerleri düzenleyin!"
    echo "   Özellikle şunları değiştirin:"
    echo "   - POSTGRES_PASSWORD"
    echo "   - JWT_SECRET"
    echo "   - NEXT_PUBLIC_API_URL (production için)"
    exit 1
fi

# Docker kontrolü
if ! command -v docker &> /dev/null; then
    echo "❌ Docker bulunamadı. Lütfen Docker'ı yükleyin."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose bulunamadı. Lütfen Docker Compose'u yükleyin."
    exit 1
fi

# Container'ları build et
echo "🔨 Container'lar build ediliyor..."
docker compose build

# Container'ları başlat
echo "▶️  Container'lar başlatılıyor..."
docker compose up -d

# PostgreSQL'in hazır olmasını bekle
echo "⏳ PostgreSQL'in hazır olması bekleniyor..."
sleep 5

# Health check
echo "🏥 Health check yapılıyor..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL hazır!"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Deneme $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ PostgreSQL başlatılamadı!"
    docker compose logs postgres
    exit 1
fi

# Backend health check
echo "⏳ Backend'in hazır olması bekleniyor..."
sleep 5

max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
        echo "✅ Backend hazır!"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Deneme $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "⚠️  Backend henüz hazır değil. Logları kontrol edin: docker compose logs backend"
fi

echo ""
echo "✅ Deployment tamamlandı!"
echo ""
echo "📊 Servisler:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5001/api"
echo "   - Nginx: http://localhost:80"
echo ""
echo "📝 Logları görüntülemek için:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Durdurmak için:"
echo "   docker compose down"

