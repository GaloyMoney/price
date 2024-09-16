clean-deps:
	docker compose down

start-deps:
	direnv reload
	docker compose up -d

reset-deps: clean-deps start-deps

realtime-start-server:
	. ./.envrc && cd realtime && yarn tsnd --respawn --files -r tsconfig-paths/register -r src/services/tracing.ts \
		src/servers/realtime/run-monitoring.ts | yarn pino-pretty -c -l

realtime-start: start-deps realtime-start-server

realtime-watch-compile:
	yarn realtime watch-compile

realtime-check-code:
	yarn realtime tsc-check
	yarn realtime eslint-check
	yarn realtime build

realtime-unit-in-ci:
	yarn realtime ci:test:unit

history-start-server:
	. ./.envrc && cd history && yarn tsnd --respawn --files -r tsconfig-paths/register -r src/services/tracing.ts \
		src/servers/history/run.ts | yarn pino-pretty -c -l

history-start: start-deps history-start-server

history-watch-compile:
	yarn history watch-compile

history-check-code:
	yarn history tsc-check
	yarn history eslint-check
	yarn history build

history-unit-in-ci:
	yarn history ci:test:unit
