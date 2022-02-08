BIN_DIR=node_modules/.bin

clean-deps:
	docker compose down

reset-realtime-deps: clean-deps start-realtime-deps
reset-history-deps: clean-deps start-history-deps

start-realtime-deps:
	docker compose up realtime-deps -d
	direnv reload

start-history-deps:
	docker compose up history-deps -d
	direnv reload

start: start-realtime-deps start-realtime

start-realtime:
	. ./.envrc && yarn tsnd --respawn --files -r tsconfig-paths/register -r src/services/tracing.ts \
		src/servers/realtime/run-monitoring.ts | yarn pino-pretty -c -l

start-history:
	. ./.envrc && yarn tsnd --respawn --files -r tsconfig-paths/register -r src/services/tracing.ts \
		src/servers/history/run.ts | yarn pino-pretty -c -l

check-code:
	yarn tsc-check
	yarn eslint-check
	yarn build

watch-compile:
	$(BIN_DIR)/tsc --watch  --noEmit --skipLibCheck

unit-in-ci:
	LOGLEVEL=warn $(BIN_DIR)/jest --config ./test/jest-unit.config.js --ci --bail
