BIN_DIR=node_modules/.bin

check-code:
	yarn tsc-check
	yarn eslint-check
	yarn build

watch-compile:
	$(BIN_DIR)/tsc --watch  --noEmit --skipLibCheck

unit-in-ci:
	LOGLEVEL=warn $(BIN_DIR)/jest --config ./test/jest-unit.config.js --ci --bail
