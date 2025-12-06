.PHONY: help build up down logs restart clean

help: ## Bu yardım mesajını gösterir
	@echo "KYK Yemek - Docker Deployment Komutları"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Container'ları build et
	docker-compose build

up: ## Container'ları başlat
	docker-compose up -d

down: ## Container'ları durdur
	docker-compose down

logs: ## Tüm logları göster
	docker-compose logs -f

logs-backend: ## Backend loglarını göster
	docker-compose logs -f backend

logs-frontend: ## Frontend loglarını göster
	docker-compose logs -f frontend

logs-postgres: ## PostgreSQL loglarını göster
	docker-compose logs -f postgres

logs-nginx: ## Nginx loglarını göster
	docker-compose logs -f nginx

restart: ## Container'ları yeniden başlat
	docker-compose restart

restart-backend: ## Backend'i yeniden başlat
	docker-compose restart backend

restart-frontend: ## Frontend'i yeniden başlat
	docker-compose restart frontend

clean: ## Container'ları ve volume'ları temizle (DİKKAT: Veri kaybı!)
	docker-compose down -v

ps: ## Container durumlarını göster
	docker-compose ps

shell-backend: ## Backend container'ına gir
	docker-compose exec backend sh

shell-frontend: ## Frontend container'ına gir
	docker-compose exec frontend sh

shell-postgres: ## PostgreSQL'e bağlan
	docker-compose exec postgres psql -U postgres -d kyk_yemek

backup-db: ## Veritabanını yedekle
	docker-compose exec postgres pg_dump -U postgres kyk_yemek > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Yedek oluşturuldu: backup_$(shell date +%Y%m%d_%H%M%S).sql"

restore-db: ## Veritabanını geri yükle (kullanım: make restore-db FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Dosya belirtilmedi. Kullanım: make restore-db FILE=backup.sql"; \
		exit 1; \
	fi
	docker-compose exec -T postgres psql -U postgres -d kyk_yemek < $(FILE)
	@echo "✅ Veritabanı geri yüklendi: $(FILE)"

start: ## Otomatik başlatma script'ini çalıştır
	./start.sh

stop: ## Container'ları durdur
	./stop.sh

