ifeq ($(OS),Windows_NT)
    RENAME = ren
else
    RENAME = mv
endif

.PHONY: all patch

all:
	$(RENAME) tsconfig-loader.json tsconfig.json
	npm run compilation
	$(RENAME) tsconfig.json tsconfig-loader.json
	$(RENAME) tsconfig-scripts.json tsconfig.json
	npm run compilation
	$(RENAME) tsconfig.json tsconfig-scripts.json
	npm start

patch:
	@npm run patch