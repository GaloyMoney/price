clean-deps:
	docker compose down

start-deps:
	docker compose up -d
	direnv reload

reset-deps: clean-deps start-deps

realtime-start-server:
	. ./.envrc && yarn tsnd --respawn --files -r tsconfig-paths/register -r src/services/tracing.ts \
		src/servers/realtime/run-monitoring.ts | yarn pino-pretty -c -l

realtime-start: start-deps realtime-start-server

realtime-watch-compile:
	yarn workspace realtime watch-compile

realtime-check-code:
	yarn workspace realtime tsc-check
	yarn workspace realtime eslint-check
	yarn workspace realtime build

realtime-unit-in-ci:
	yarn workspace realtime ci:test:unit

history-start-server:
	. ./.envrc && yarn tsnd --respawn --files -r tsconfig-paths/register -r src/services/tracing.ts \
		src/servers/history/run.ts | yarn pino-pretty -c -l

history-start: start-deps history-start-server

history-watch-compile:
	yarn workspace history watch-compile

history-check-code:
	yarn workspace history tsc-check
	yarn workspace history eslint-check
	yarn workspace history build

history-unit-in-ci:
	yarn workspace history ci:test:unit
