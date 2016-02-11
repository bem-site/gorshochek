var path = require('path'),
    _ = require('lodash'),
    Q = require('q'),
    Model = require('../../../src/model'),
    baseUtil = require('../../../src/util'),
    loadSourceFromLocal = require('../../../index').tasks.docs.loadSourceFromLocal;

describe('tasks-docs/load-from-file', () => {
    var sandbox = sinon.sandbox.create(),
        defaultPage = {url: '/url', sourceUrl: '../foo.file'},
        model;

    beforeEach(() => {
        sandbox.stub(console, 'error');
        sandbox.stub(baseUtil, 'readFile').returns(Q('hello-world'));
        sandbox.stub(baseUtil, 'readFileFromCache').returns(Q('hello-world'));
        sandbox.stub(baseUtil, 'writeFileToCache').returns(Q()),
        model = new Model();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return function as result', () => {
        loadSourceFromLocal(model).should.be.instanceOf(Function);
    });

    it('should not process pages without "sourceUrl" property', () => {
        model.setPages([{url: '/url1/'}]);
        return loadSourceFromLocal(model)().then(() => {
            baseUtil.readFileFromCache.should.not.be.called;
        });
    });

    it('should not process page if "sourceUrl" value does not match local file regular expression', () => {
        model.setPages([{url: '/url1/', sourceUrl: 'http://github.com/foo/bar'}]);
        return loadSourceFromLocal(model)().then(() => {
            baseUtil.readFileFromCache.should.not.be.called;
        });
    });

    describe('sourceUrl matches local file path criteria', () => {
        it('should match on file path like a "/foo/bar.file"', () => {
            model.setPages([{url: '/url', sourceUrl: '/foo/bar.md'}]);
            return loadSourceFromLocal(model)().then(() => {
                baseUtil.readFileFromCache.should.be.calledOnce;
            });
        });

        it('should match on file path like a "./foo/bar.md"', () => {
            model.setPages([{url: '/url', sourceUrl: './foo/bar.md'}]);
            return loadSourceFromLocal(model)().then(() => {
                baseUtil.readFileFromCache.should.be.calledOnce;
            });
        });

        it('should match on file path like a "../foo/bar.md"', () => {
            model.setPages([{url: '/url', sourceUrl: '../foo/bar.md'}]);
            return loadSourceFromLocal(model)().then(() => {
                baseUtil.readFileFromCache.should.be.calledOnce;
            });
        });

        it('should match on file path like a "../../foo/bar.md"', () => {
            model.setPages([{url: '/url', sourceUrl: '../../foo/bar.md'}]);
            return loadSourceFromLocal(model)().then(() => {
                baseUtil.readFileFromCache.should.be.calledOnce;
            });
        });
    });

    it('should try to read file from cache by valid file path', () => {
        model.setPages([_.extend({}, defaultPage)]);

        return loadSourceFromLocal(model)().then(() => {
            baseUtil.readFileFromCache.should.be
                .calledWithMatch(path.join('/url', 'index.file'));
        });
    });

    it('should read file from local filesystem by valid path', () => {
        model.setPages([_.extend({}, defaultPage)]);

        return loadSourceFromLocal(model)().then(() => {
            baseUtil.readFile.should.be.calledWithMatch('foo.file');
        });
    });

    it('should reject operation in case of missed local file', () => {
        model.setPages([_.extend({}, defaultPage)]);
        baseUtil.readFile.returns(Q.reject('Error'));

        return loadSourceFromLocal(model)().then(() => {
            baseUtil.writeFileToCache.should.not.be.called;
            should.not.exist(model.getPages()[0].contentFile);
        });
    });

    it('should process file as new if it was not file in cache', () => {
        model.setPages([_.extend({}, defaultPage)]);
        baseUtil.readFileFromCache.returns(Q.reject('Error'));

        return loadSourceFromLocal(model)().then(() => {
            model.getChanges().added.should.have.length(1);
        });
    });

    it('should process file as modified if it is not same as in cache', () => {
        model.setPages([_.extend({}, defaultPage)]);
        baseUtil.readFileFromCache.returns(Q('Hello World old'));

        return loadSourceFromLocal(model)().then(() => {
            model.getChanges().modified.should.have.length(1);
        });
    });

    it('should not to do anything if file was not changed', () => {
        model.setPages([_.extend({}, defaultPage)]);
        return loadSourceFromLocal(model)().then(() => {
            var changes = model.getChanges();
            changes.added.should.be.empty;
            changes.modified.should.be.empty;
        });
    });

    it('should set valid value of "contentFile" field', () => {
        model.setPages([_.extend({}, defaultPage)]);
        return loadSourceFromLocal(model)().then(() => {
            model.getPages()[0].contentFile.should.equal('/url/index.file');
        });
    });

    it('should be resolved with model instance', () => {
        loadSourceFromLocal(model)().should.eventually.be.instanceOf(Model);
    });
});
