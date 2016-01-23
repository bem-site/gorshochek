var Q = require('q'),
    _ = require('lodash'),
    Model = require('../../../lib/model'),
    baseUtil = require('../../../lib/util'),
    util = require('../../../lib/tasks/override/util'),
    overrideDocs = require('../../../lib/tasks/override/override-docs');

describe('tasks-override/override-docs', function() {
    var sandbox = sinon.sandbox.create(),
        model;

    beforeEach(function() {
        model = new Model();

        sandbox.stub(baseUtil, 'readFileFromCache');
        sandbox.stub(baseUtil, 'writeFileToCache').returns(Q());
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return function as result', function() {
        overrideDocs(model).should.be.instanceOf(Function);
    });

    it('should not process pages without "contentFile" field', function() {
        model.setPages([{url: '/url1'}]);
        return overrideDocs(model)().then(function() {
            baseUtil.readFileFromCache.should.not.be.called;
        });
    });

    it('should not process pages with non-html "contentFile" field', function() {
        model.setPages([{url: '/url1', contentFile: '/url1/index.json'}]);
        return overrideDocs(model)().then(function() {
            baseUtil.readFileFromCache.should.not.be.called;
        });
    });

    describe('override image sources', function() {
        beforeEach(function() {
            model.setPages([{url: '/url1', contentFile: '/url1/index.html'}]);
        });

        it('should not process image tags without src attributes', function() {
            baseUtil.readFileFromCache.returns(Q('<img>'));

            return overrideDocs(model)().then(function() {
                baseUtil.writeFileToCache.should.be.calledWith('/url1/index.html', '<img>');
            });
        });

        it('should not rewrite image with absolute http(s) url', function() {
            var html = '<img src="http://some-image-url">';
            baseUtil.readFileFromCache.returns(Q(html));

            return overrideDocs(model)().then(function() {
                baseUtil.writeFileToCache.should.be.calledWith('/url1/index.html', html);
            });
        });

        it('should rewrite relative links to images', function() {
            var html = '<img src="./relative-image-url">';
            model.getPages()[0].sourceUrl = 'http://page/source/url';
            baseUtil.readFileFromCache.returns(Q(html));

            return overrideDocs(model)().then(function() {
                baseUtil.writeFileToCache.should.be
                    .calledWith('/url1/index.html', '<img src="http://page/source/relative-image-url?raw=true">');
            });
        });
    });

    describe('override link href attributes', function() {
        function shouldRewriteFromTo(from, to) {
            baseUtil.readFileFromCache.returns(Q(from));

            return overrideDocs(model)().then(function() {
                baseUtil.writeFileToCache.should.be.calledWith('/url1/index.html', to);
            });
        }

        beforeEach(function() {
            var sourceUrlsMap = util.createSourceUrlsMap([
                {
                    url: '/url1',
                    sourceUrl: 'https://github.com/org/user/blob/ref/some-path1',
                    published: true
                },
                {
                    url: '/url2',
                    sourceUrl: 'https://github.com/org/user/blob/ref/some-path2',
                    published: true
                }
            ]);
            sandbox.stub(util, 'createSourceUrlsMap').returns(sourceUrlsMap);
            sandbox.stub(util, 'createArrayOfModelPageUrls').returns(['/url1', '/url2']);

            model.setPages([{
                url: '/url1',
                sourceUrl: 'https://github.com/org/user/blob/ref/some-path1',
                contentFile: '/url1/index.html'
            }]);
        });

        it('should not rewrite anchor links', function() {
            var html = '<a href="#some-anchor"></a>';
            return shouldRewriteFromTo(html, html);
        });

        it('should not rewrite links with unsupported protocols', function() {
            var html = '<a href="mail://mail.to.some"></a>';
            return shouldRewriteFromTo(html, html);
        });

        it('should not rewrite native website links', function() {
            var html = '<a href="/url1"></a>';
            return shouldRewriteFromTo(html, html);
        });

        it('should not rewrite absolute http(s) non-github links', function() {
            var html = '<a href="http://some-absolute-url"></a>';
            return shouldRewriteFromTo(html, html);
        });

        it('should replace absolute link to gh source (if it also persisted in model)', function() {
            return shouldRewriteFromTo(
                '<a href="https://github.com/org/user/blob/ref/some-path2"></a>', '<a href="/url2"></a>');
        });

        it('should replace relative link to gh source (if it also persisted in model)', function() {
            return shouldRewriteFromTo('<a href="./some-path2"></a>', '<a href="/url2"></a>');
        });

        it('should replace relative link (with anchor) to gh source', function() {
            return shouldRewriteFromTo('<a href="./some-path2#anchor"></a>', '<a href="/url2#anchor"></a>');
        });

        it('should left original link if replacement was not found', function() {
            var html = '<a href="./some-path3"></a>';
            return shouldRewriteFromTo(html, html);
        });
    });
});
