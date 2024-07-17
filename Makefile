check: 
	docker compose config
up: check
	docker compose up -d
down:
	docker compose down
ps:
	docker compose ps -a
run:
	docker compose stop remix-ls
	docker compose run --rm -v ./source:/app -p 3000:3000 remix-ls bash
	docker compose start remix-ls