#
# Run all tests
#
test:
	./node_modules/vows/bin/vows specs/*.js --spec
run:
	node app.js
.PHONY: run install