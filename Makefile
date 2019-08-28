TESTS = $(shell ls -S `find test -type f -name "*.test.js" -print`)
REGISTRY = http://r.cnpmjs.org
REPORTER = spec
TIMEOUT = 3000
MOCHA_OPTS =

install:
	@npm install \
		--registry=$(REGISTRY)

jshint: install
	@./node_modules/.bin/jshint .

test: install
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--bail \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--require should \
		$(MOCHA_OPTS) \
		$(TESTS)

test-all all: install jshint test cov

clean:
	@rm -rf node_modules
	@rm -rf coverage

.PHONY: test test-all test-cov cov all clean