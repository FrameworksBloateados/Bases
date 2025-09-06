up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose down
	sleep 2
	docker compose up -d

clean:
	docker compose down -v --remove-orphans
