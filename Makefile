clean-deps:
	docker compose down

start-deps:
	docker compose up -d
	direnv reload

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
