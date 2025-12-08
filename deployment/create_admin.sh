#!/bin/bash

# KYK Yemek - Admin Oluşturma Script'i
# Backend başladıktan sonra otomatik olarak admin kullanıcısı oluşturur

set -e

ADMIN_EMAIL="${ADMIN_EMAIL:-muhammik1234@gmail.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-yemekkykadmin123}"
ADMIN_NAME="${ADMIN_NAME:-Admin}"
BACKEND_URL="${BACKEND_URL:-http://localhost:5001}"

echo "👤 Admin kullanıcısı oluşturuluyor..."

# Backend'in hazır olmasını bekle
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f -s "${BACKEND_URL}/api/health" > /dev/null 2>&1; then
        echo "✅ Backend hazır!"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -lt $max_attempts ]; then
        sleep 2
    fi
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Backend hazır değil. Admin oluşturulamadı."
    exit 1
fi

# Admin oluşturma API çağrısı
response=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/admin/setup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${ADMIN_PASSWORD}\",
    \"name\": \"${ADMIN_NAME}\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 201 ]; then
    echo "✅ Admin kullanıcısı başarıyla oluşturuldu!"
    echo "   Email: ${ADMIN_EMAIL}"
    echo "   Şifre: ${ADMIN_PASSWORD}"
elif [ "$http_code" -eq 400 ]; then
    echo "ℹ️  Admin zaten mevcut (bu normaldir)"
else
    echo "⚠️  Admin oluşturulurken hata oluştu (HTTP: $http_code)"
    echo "   Response: $body"
fi

