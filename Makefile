#
# Run all tests
#
test:
	./node_modules/vows/bin/vows test/*.js
.PHONY: test install