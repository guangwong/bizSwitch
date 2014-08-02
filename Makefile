.PHONY: test

test:
	make test-base test-self test-cluster
test-base:
	mocha test/base/*.test.js
test-self:
	mocha test/self.mode/*.test.js
test-cluster:
	mocha test/cluster.mode/*.test.js
