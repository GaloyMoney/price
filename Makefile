BIN_DIR=node_modules/.bin

clean-deps:
	docker compose down

reset-deps: clean-deps start-deps

start-deps:
	docker compose up integration-deps -d
	direnv reload

start: start-deps start-realtime

start-realtime:
	. ./.envrc && yarn tsnd --respawn --files -r tsconfig-paths/register -r src/services/tracing.ts \
		src/servers/realtime/run-monitoring.ts | yarn pino-pretty -c -l

check-code:
	yarn tsc-check
	yarn eslint-check
	yarn build

watch-compile:
	$(BIN_DIR)/tsc --watch  --noEmit --skipLibCheck

unit-in-ci:
	LOGLEVEL=warn $(BIN_DIR)/jest --config ./test/jest-unit.config.js --ci --bail
