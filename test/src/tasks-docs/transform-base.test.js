var Q = require('q'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    DocsTransformBase = require('../../../lib/tasks-docs/transform-base');

describe('DocsTransformBase', function() {
    var sandbox = sinon.sandbox.create(),
        task = new DocsTransformBase(new Config('debug'), {}),
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
            var page = {url: '/url1', contentFile: '/foo/bar.file'};
            task.transform(page, 'Hello World').should.eventually.be.equal('Hello World');
        });
    });

    describe('processPage', function() {
        var page;

        beforeEach(function() {
            task.readFileFromCache.returns(Q('Hello World'));
            task.writeFileToCache.returns(Q());
            task.getCriteria.returns(true);
            page = {url: '/url1', contentFile: '/foo/bar.file'};
        });

        it('should return fulfilled promise with page value', function() {
            task.processPage(model, page).should.be.eventually.eql(page);
        });

        it('should read source file from cache by valid path', function() {
            return task.processPage(model, page).then(function() {
                task.readFileFromCache.should.be.calledOnce;
                task.readFileFromCache.should.be.calledWithMatch('foo/bar.file');
            });
        });

        it('should call transform for source file with valid argument', function() {
            sandbox.stub(task, 'transform').returns(Q());
            return task.processPage(model, page).then(function() {
                task.transform.should.be.calledOnce;
                task.transform.should.be.calledWith(page, 'Hello World');
            });
        });

        it('should write source file to cache by valid path', function() {
            return task.processPage(model, page).then(function() {
                task.writeFileToCache.should.be.calledOnce;
                task.writeFileToCache.should.be.calledWithMatch('foo/index.html');
            });
        });

        it('should call read -> transform -> write methods in valid order', function() {
            sandbox.stub(task, 'transform').returns(Q('Hello World'));
            return task.processPage(model, page).then(function() {
                task.transform.should.be.calledAfter(task.readFileFromCache);
                task.writeFileToCache.should.be.calledAfter(task.transform);
            });
        });

        it('should update "contentFile" property of page model', function() {
            return task.processPage(model, page).then(function(page) {
                page.en.contentFile.should.equal('/foo/index.html');
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
