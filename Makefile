#
# Run all tests
#
test:
	./node_modules/vows/bin/vows test/*.js --spec
.PHONY: test install