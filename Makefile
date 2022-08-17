install:
	npm ci

start:
	npx webpack serve

test:
	npm test -- --watch

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

.PHONY: test