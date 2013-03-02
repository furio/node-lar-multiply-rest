TESTDIR = test
MOCHAEXEC = ./node_modules/.bin/mocha

test: test-all

test-all:
	@$(MOCHAEXEC) $(TESTDIR)/matrixGenerator.test.js \
					$(TESTDIR)/primeUtils.test.js \
					$(TESTDIR)/csrStuff.test.js \
					$(TESTDIR)/SpMSpM-Multiply.test.js

test-matrixgen:
	@$(MOCHAEXEC) $(TESTDIR)/matrixGenerator.test.js

test-primeutils:
	@$(MOCHAEXEC) $(TESTDIR)/primeUtils.test.js

test-csrmatrix:
	@$(MOCHAEXEC) $(TESTDIR)/csrStuff.test.js

test-webclmultiply:
	@$(MOCHAEXEC) $(TESTDIR)/SpMSpM-Multiply.test.js

.PHONY: test
