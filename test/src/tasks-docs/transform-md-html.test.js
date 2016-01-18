var Q = require('q'),
    mdToHtml = require('bem-md-renderer'),
    Model = require('../../../lib/model'),
    baseUtil = require('../../../lib/util'),
    transformMdToHtml = require('../../../index').tasks.docs.transformMdToHtml;

describe('tasks-docs/transform-md-html', function() {
    var sandbox = sinon.sandbox.create(),
        model = new Model();

    beforeEach(function() {
        sandbox.stub(console, 'error');
        sandbox.stub(baseUtil, 'readFileFromCache').returns(Q(''));
        sandbox.stub(baseUtil, 'writeFileToCache').returns(Q());
        sandbox.stub(mdToHtml, 'render').yields(null, '');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return function as result', function() {
        transformMdToHtml(model).should.be.instanceOf(Function);
    });

    it('should not transform pages without "contentFile" fields', function() {
        model.setPages([{url: '/url1'}]);
        return transformMdToHtml(model)().then(function() {
            mdToHtml.render.should.not.be.called;
        });
    });

    it('should not transform pages with not-markdown content files', function() {
        model.setPages([{url: '/url1', contentFile: '/not-md.file'}]);
        return transformMdToHtml(model)().then(function() {
            mdToHtml.render.should.not.be.called;
        });
    });

    it('should read source file from cache by valid path', function() {
        model.setPages([{url: '/url1', contentFile: '/some-content.md'}]);
        return transformMdToHtml(model)().then(function() {
            baseUtil.readFileFromCache.should.be.calledOnce;
            baseUtil.readFileFromCache.should.be.calledWithMatch('/some-content.md');
        });
    });

    it('should write source file to cache by valid path', function() {
        model.setPages([{url: '/url1', contentFile: '/foo/some-content.md'}]);
        return transformMdToHtml(model)().then(function() {
            baseUtil.writeFileToCache.should.be.calledOnce;
            baseUtil.writeFileToCache.should.be.calledWithMatch('foo/index.html');
        });
    });

    it('should update "contentFile" property of page model', function() {
        model.setPages([{url: '/url1', contentFile: '/foo/some-content.md'}]);
        return transformMdToHtml(model)().then(function() {
            model.getPages()[0].contentFile.should.equal('/foo/index.html');
        });
    });

    describe('transform errors', function() {
        beforeEach(function() {
            mdToHtml.render.yields(new Error('some-error'));
            model.setPages([{url: '/url1', contentFile: '/foo/some-content.md'}]);
        });

        it('should print log error message if md -> html transformation failed for source', function() {
            return transformMdToHtml(model)().then(function() {
                console.error.should.be.calledTwice;
                console.error.firstCall.should.be
                    .calledWithExactly('Error occur while transform md -> html for page: /url1');
            });
        });

        it('should not save html content file', function() {
            return transformMdToHtml(model)().then(function() {
                baseUtil.writeFileToCache.should.not.be.called;
            });
        });

        it('should not update contentFile field', function() {
            return transformMdToHtml(model)().then(function() {
                model.getPages()[0].contentFile.should.equal('/foo/some-content.md');
            });
        });
    });

    it('should return promise with model instance', function() {
        return transformMdToHtml(model)().should.eventually.be.instanceOf(Model);
    });
});
