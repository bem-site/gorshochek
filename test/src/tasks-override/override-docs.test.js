var Url = require('url'),
    Q = require('q'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    OverrideDocs = require('../../../lib/tasks-override/override-docs');

describe('OverrideDocs', function() {
    var sandbox = sinon.sandbox.create(),
        overrideDocs;

    beforeEach(function() {
        overrideDocs = new OverrideDocs(new Config('debug'), {})
    });

    it('should have valid task name', function() {
        OverrideDocs.getName().should.equal('override link in docs');
    });

    describe('getCriteria', function() {
        it('should return false for page without "contentFile" field', function() {
            overrideDocs.getCriteria({url: '/url1'}).should.equal(false);
        });

        it('should return false for non-html "contentFile"', function() {
            overrideDocs.getCriteria({url: '/url1', contentFile: '/file.json'}).should.equal(false);
        });

        it('should return true for html "contentFile"', function() {
            overrideDocs.getCriteria({url: '/url1', contentFile: '/file.html'}).should.equal(true);
        });
    });

    describe('override', function() {
        describe('image', function() {
            it('should not rewrite image without src attribute', function() {
                overrideDocs.override(null, null, [], '<img>').should.equal('<img>');
            });

            it('should not rewrite image with absolute http(s) url', function() {
                var html = '<img src="http://some-image-url">';
                overrideDocs.override(null, null, [], html).should.equal(html);
            });

            it('should rewrite relative links to images', function() {
                var html = '<img src="./relative-image-url">';
                overrideDocs.override({sourceUrl: 'http://page/source/url'}, null, [], html)
                    .should.equal('<img src="http://page/source/relative-image-url?raw=true">');
            });
        });

        describe('link', function() {
            var sourceUrlMap, existedUrls;

            beforeEach(function() {
                sourceUrlMap = overrideDocs.createSourceUrlsMap([
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
                ]),
                existedUrls = ['/url1', '/url2'];
            })

            it('should not rewrite anchor links', function() {
                var html = '<a href="#some-anchor"></a>';
                overrideDocs.override(null, null, [], html).should.equal(html);
            });

            it('should not rewrite links with unsupported protocols', function() {
                var html = '<a href="mail://mail.to.some"></a>';
                overrideDocs.override(null, null, [], html).should.equal(html);
            });

            it('should not rewrite native website links', function() {
                var html = '<a href="/url1"></a>';
                overrideDocs.override(null, null, ['/url1'], html).should.equal(html);
            });

            it('should not rewrite absolute http(s) non-github links', function() {
                var html = '<a href="http://some-absolute-url"></a>';
                overrideDocs.override(null, null, [], html).should.equal(html);
            });

            it('should replace absolute link to gh source (if it also persisted in model)', function() {
                var page = {url: '/url1'},
                    html = '<a href="https://github.com/org/user/blob/ref/some-path2"></a>';
                overrideDocs.override(page, sourceUrlMap, existedUrls, html)
                    .should.equal('<a href="/url2"></a>');
            });

            it('should replace relative link to gh source (if it also persisted in model)', function() {
                var page = {url: '/url1', sourceUrl: 'https://github.com/org/user/blob/ref/some-path1'},
                    html = '<a href="./some-path2"></a>';
                overrideDocs.override(page, sourceUrlMap, existedUrls, html)
                    .should.equal('<a href="/url2"></a>');
            });

            it('should replace relative link (with anchor) to gh source', function() {
                var page = {url: '/url1', sourceUrl: 'https://github.com/org/user/blob/ref/some-path1'},
                    html = '<a href="./some-path2#anchor"></a>';
                overrideDocs.override(page, sourceUrlMap, existedUrls, html)
                    .should.equal('<a href="/url2#anchor"></a>');
            });

            it('should left original link if replacement was not found', function() {
                var page = {url: '/url1', sourceUrl: 'https://github.com/org/user/blob/ref/some-path1'},
                    html = '<a href="./some-path3"></a>';
                overrideDocs.override(page, sourceUrlMap, existedUrls, html).should.equal(html);
            });
        });
    });

    describe('createProcessPageFunc', function() {
        var model = new Model();

        it('should return function', function() {
            overrideDocs.createProcessPageFunc(model).should.be.instanceof(Function);
        });

        describe('page process function', function() {
            beforeEach(function() {
                sandbox.stub(overrideDocs, 'readFileFromCache').returns(Q());
                sandbox.stub(overrideDocs, 'override').returns(Q());
                sandbox.stub(overrideDocs, 'writeFileToCache').returns(Q());
            });

            it('should read page content file from cache with valid path', function() {
                var page = {url: '/url1', contentFile: '/path-to-content-file'},
                    processFunction = overrideDocs.createProcessPageFunc(model);
                return processFunction(model, page).then(function() {
                    overrideDocs.readFileFromCache.should.be.calledOnce;
                    overrideDocs.readFileFromCache.should.be.calledWith('/path-to-content-file');
                });
            });

            it('should call override function', function() {
                var page = {url: '/url1'},
                    processFunction = overrideDocs.createProcessPageFunc(model);
                return processFunction(model, page).then(function() {
                    overrideDocs.override.should.be.calledOnce;
                });
            });

            it('should write page content to file in cache with valid path', function() {
                var page = {url: '/url1', contentFile: '/path-to-content-file'},
                    processFunction = overrideDocs.createProcessPageFunc(model);
                return processFunction(model, page).then(function() {
                    overrideDocs.writeFileToCache.should.be.calledOnce;
                    overrideDocs.writeFileToCache.should.be.calledWithMatch('/path-to-content-file');
                });
            });

            it('should return promise with model instance', function() {
                var page = {url: '/url1'},
                    processFunction = overrideDocs.createProcessPageFunc(model);
                return processFunction(model, page).should.eventually.eql(page);
            });
        });
    });
});
