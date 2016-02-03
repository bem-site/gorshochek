var path = require('path'),
    _ = require('lodash'),
    Q = require('q'),
    Model = require('../../../lib/model'),
    baseUtil = require('../../../lib/util'),
    loadSourceFromLocal = require('../../../index').tasks.docs.loadSourceFromLocal;

describe('tasks-docs/load-from-file', function() {
    var sandbox = sinon.sandbox.create(),
        defaultPage = {url: '/url', sourceUrl: '../foo.file'},
        model;

    beforeEach(function() {
        sandbox.stub(console, 'error');
        sandbox.stub(baseUtil, 'readFile').returns(Q('hello-world'));
        sandbox.stub(baseUtil, 'readFileFromCache').returns(Q('hello-world'));
        sandbox.stub(baseUtil, 'writeFileToCache').returns(Q()),
        model = new Model();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return function as result', function() {
        loadSourceFromLocal(model).should.be.instanceOf(Function);
    });

    it('should not process pages without "sourceUrl" property', function() {
        model.setPages([{url: '/url1'}]);
        return loadSourceFromLocal(model)().then(function() {
            baseUtil.readFileFromCache.should.not.be.called;
        });
    });

    it('should not process page if "sourceUrl" value does not match local file regular expression', function() {
        model.setPages([{url: '/url1', sourceUrl: 'http://github.com/foo/bar'}]);
        return loadSourceFromLocal(model)().then(function() {
            baseUtil.readFileFromCache.should.not.be.called;
        });
    });

    describe('sourceUrl matches local file path criteria', function() {
        it('should match on file path like a "/foo/bar.file"', function() {
            model.setPages([{url: '/url', sourceUrl: '/foo/bar.md'}]);
            return loadSourceFromLocal(model)().then(function() {
                baseUtil.readFileFromCache.should.be.calledOnce;
            });
        });

        it('should match on file path like a "./foo/bar.md"', function() {
            model.setPages([{url: '/url', sourceUrl: './foo/bar.md'}]);
            return loadSourceFromLocal(model)().then(function() {
                baseUtil.readFileFromCache.should.be.calledOnce;
            });
        });

        it('should match on file path like a "../foo/bar.md"', function() {
            model.setPages([{url: '/url', sourceUrl: '../foo/bar.md'}]);
            return loadSourceFromLocal(model)().then(function() {
                baseUtil.readFileFromCache.should.be.calledOnce;
            });
        });

        it('should match on file path like a "../../foo/bar.md"', function() {
            model.setPages([{url: '/url', sourceUrl: '../../foo/bar.md'}]);
            return loadSourceFromLocal(model)().then(function() {
                baseUtil.readFileFromCache.should.be.calledOnce;
            });
        });
    });

    it('should try to read file from cache by valid file path', function() {
        model.setPages([_.extend({}, defaultPage)]);

        return loadSourceFromLocal(model)().then(function() {
            baseUtil.readFileFromCache.should.be
                .calledWithMatch(path.join('/url', 'index.file'));
        });
    });

    it('should read file from local filesystem by valid path', function() {
        model.setPages([_.extend({}, defaultPage)]);

        return loadSourceFromLocal(model)().then(function() {
            baseUtil.readFile.should.be.calledWithMatch('foo.file');
        });
    });

    it('should reject operation in case of missed local file', function() {
        model.setPages([_.extend({}, defaultPage)]);
        baseUtil.readFile.returns(Q.reject('Error'));

        return loadSourceFromLocal(model)().then(function() {
            baseUtil.writeFileToCache.should.not.be.called;
            should.not.exist(model.getPages()[0].contentFile);
        });
    });

    it('should process file as new if it was not file in cache', function() {
        model.setPages([_.extend({}, defaultPage)]);
        baseUtil.readFileFromCache.returns(Q.reject('Error'));

        return loadSourceFromLocal(model)().then(function() {
            model.getChanges().added.should.have.length(1);
        });
    });

    it('should process file as modified if it is not same as in cache', function() {
        model.setPages([_.extend({}, defaultPage)]);
        baseUtil.readFileFromCache.returns(Q('Hello World old'));

        return loadSourceFromLocal(model)().then(function() {
            model.getChanges().modified.should.have.length(1);
        });
    });

    it('should not to do anything if file was not changed', function() {
        model.setPages([_.extend({}, defaultPage)]);
        return loadSourceFromLocal(model)().then(function() {
            var changes = model.getChanges();
            changes.added.should.be.empty;
            changes.modified.should.be.empty;
        });
    });

    it('should set valid value of "contentFile" field', function() {
        model.setPages([_.extend({}, defaultPage)]);
        return loadSourceFromLocal(model)().then(function() {
            model.getPages()[0].contentFile.should.equal('/url/index.file');
        });
    });

    it('should be resolved with model instance', function() {
        loadSourceFromLocal(model)().should.eventually.be.instanceOf(Model);
    });
});
