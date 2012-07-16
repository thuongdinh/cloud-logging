#
# Run all tests
#
test:
	./node_modules/vows/bin/vows test/*.js --spec

run:
	node app.js

.PHONY: all test clean