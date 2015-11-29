var Q = require('q'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    DocsTransformBase = require('../../../lib/tasks-docs/transform-base');

describe('DocsTransformBase', function() {
    var sandbox = sinon.sandbox.create(),
        config = new Config('debug'),
        task = new DocsTransformBase(config, {}),
        model;

    beforeEach(function() {
        sandbox.stub(task, 'readFileFromCache');
        sandbox.stub(task, 'writeFileToCache');
        sandbox.stub(task, 'getCriteria');
        model = new Model();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid task name', function() {
        DocsTransformBase.getName().should.equal('doc transform base');
    });

    describe('transform', function() {
        it('should return fulfilled promise with given source', function() {
            var page = {url: '/url1', en: {contentFile: '/foo/bar.file'}};
            task.transform(page, 'en', 'Hello World').should.eventually.be.equal('Hello World');
        });
    });

    describe('processPage', function() {
        var languages = ['en'];
        var page;

        beforeEach(function() {
            task.readFileFromCache.returns(Q('Hello World'));
            task.writeFileToCache.returns(Q());
            task.getCriteria.returns(true);
            page = {url: '/url1', en: {contentFile: '/foo/bar.file'}};
        });

        it('should return fulfilled promise with page value', function() {
            task.processPage(model, page, languages).should.be.eventually.eql(page);
        });

        it('should skip page lang versions without attached source file paths', function() {
            task.getCriteria.returns(false);
            var transformSpy = sandbox.spy(task.transform);
            return task.processPage(model, {url: '/url1', en: {}}, languages).then(function() {
                task.readFileFromCache.should.not.be.called;
                transformSpy.should.not.be.called;
                task.writeFileToCache.should.not.be.called;
            });
        });

        it('should read source file from cache by valid path', function() {
            return task.processPage(model, page, languages).then(function() {
                task.readFileFromCache.should.be.calledOnce;
                task.readFileFromCache.should.be.calledWithMatch('foo/bar.file');
            });
        });

        it('should call transform for source file with valid argument', function() {
            sandbox.stub(task, 'transform').returns(Q());
            return task.processPage(model, page, languages).then(function() {
                task.transform.should.be.calledOnce;
                task.transform.should.be.calledWith(page, 'en', 'Hello World');
            });
        });

        it('should write source file to cache by valid path', function() {
            return task.processPage(model, page, languages).then(function() {
                task.writeFileToCache.should.be.calledOnce;
                task.writeFileToCache.should.be.calledWithMatch('foo/en.html');
            });
        });

        it('should call read -> transform -> write methods in valid order', function() {
            sandbox.stub(task, 'transform').returns(Q('Hello World'));
            return task.processPage(model, page, languages).then(function() {
                task.transform.should.be.calledAfter(task.readFileFromCache);
                task.writeFileToCache.should.be.calledAfter(task.transform);
            });
        });

        it('should update "contentFile" property of page model', function() {
            return task.processPage(model, page, languages).then(function(page) {
                page.en.contentFile.should.equal('/foo/en.html');
            });
        });
    });

    describe('run', function() {
        it('should return fulfilled promise with model instance', function() {
            sandbox.stub(task, 'processPagesAsync').returns(Q());
            task.run(model).should.eventually.be.eql(model);
        });
    });
});
