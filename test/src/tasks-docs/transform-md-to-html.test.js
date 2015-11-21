var Q = require('q'),
    bemMdRenderer = require('bem-md-renderer'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    DocsTransformMdHtml = require('../../../lib/tasks-docs/transform-md-to-html');

describe('DocsTransformMdHtml', function() {
    var sandbox = sinon.sandbox.create(),
        config = new Config('debug'),
        task = new DocsTransformMdHtml(config, {}),
        model;

    beforeEach(function() {
        model = new Model();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid task name', function() {
        DocsTransformMdHtml.getName().should.equal('docs transform markdown to html');
    });

    describe('getCriteria', function() {
        it('should return false on missed language version of page', function() {
            var page = {url: '/url1'};
            task.getCriteria(page, 'en').should.equal(false);
        });

        it('should return false on missed contentFile field for lang version of page', function() {
            var page = {url: '/url1', en: {}};
            task.getCriteria(page, 'en').should.equal(false);
        });

        it('should return false if contentFile value does not match regular expression', function() {
            var page = {url: '/url1', en: {contentFile: '/foo/bar.json'}};
            task.getCriteria(page, 'en').should.equal(false);
        });

        it('should return true if contentFile value matches regular expression', function() {
            var page = {url: '/url1', en: {contentFile: '/foo/bar.md'}};
            task.getCriteria(page, 'en').should.equal(true);
        });
    });

    describe('transform', function() {
        var page = {url: '/url1'},
            language = 'en';

        it('should call render method of bem-md-renderer tool', function() {
            var spy = sandbox.spy(bemMdRenderer, 'render');
            return task.transform(page, language, '# Hello World').then(function() {
                spy.should.be.calledOnce;
                spy.should.be.calledWith('# Hello World');
            });
        });

        it('should return transformed source in html format', function() {
            return task.transform(page, language, '# Hello World').should.eventually.be
                .equal('<h1 id="hello-world"><a href="#hello-world" class="anchor"></a>Hello World</h1>\n');
        });

        it('should return rejected promise with error in case of invalid source file', function() {
            sandbox.stub(bemMdRenderer, 'render').yields(new Error('error'));
            return task.transform(page, language, '# Hello World').should.be.rejectedWith('error');
        });
    });
});
