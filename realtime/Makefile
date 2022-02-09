clean-deps:
	docker compose down

start-deps:
	docker compose up realtime-deps -d
	direnv reload

reset-deps: clean-deps start-deps

start-server:
	. ./.envrc && yarn tsnd --respawn --files -r tsconfig-paths/register -r src/services/tracing.ts \
		src/servers/realtime/run-monitoring.ts | yarn pino-pretty -c -l

start: start-deps start-server

check-code:
	yarn tsc-check
	yarn eslint-check
	yarn build

watch-compile:
	yarn tsc --watch  --noEmit --skipLibCheck

unit-in-ci:
	LOGLEVEL=warn yarn jest --config ./test/jest-unit.config.js --ci --bail
