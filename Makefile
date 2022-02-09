realtime-watch-compile:
	yarn workspace realtime watch-compile

realtime-check-code:
	yarn workspace realtime tsc-check
	yarn workspace realtime eslint-check
	yarn workspace realtime build

realtime-unit-in-ci:
	yarn workspace realtime ci:test:unit
