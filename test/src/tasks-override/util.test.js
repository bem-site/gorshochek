var Url = require('url'),
    util = require('../../../lib/tasks-override/util');

describe('tasks-override/util', function() {
    describe('isAbsoluteHttpUrl', function() {
        it('should return true for absolute http url: "http://some-website.com"', function() {
            util.isAbsoluteHttpUrl(Url.parse('http://some-website.com')).should.equal(true);
        });

        it('should return true for absolute https url: "https://some-website.com"', function() {
            util.isAbsoluteHttpUrl(Url.parse('https://some-website.com')).should.equal(true);
        });

        it('should return false for non-http(s) absolute url: "git://some-website.com"', function() {
            util.isAbsoluteHttpUrl(Url.parse('git://some-website.com')).should.equal(false);
        });

        it('should return false for relative url', function() {
            util.isAbsoluteHttpUrl(Url.parse('../some-website.com')).should.equal(false);
        });
    });

    describe('hasUnsupportedProtocol', function() {
        it('should return true for absolute non-http(s) url "git://some-website.com"', function() {
            util.hasUnsupportedProtocol(Url.parse('git://some-website.com')).should.equal(true);
        });

        it('should return false for absolute http(s) url "http://some-website.com"', function() {
            util.hasUnsupportedProtocol(Url.parse('http://some-website.com')).should.equal(false);
        });

        it('should return false for relative url', function() {
            util.hasUnsupportedProtocol(Url.parse('../some-website.com')).should.equal(false);
        });
    });

    describe('isAnchor', function() {
        it('should return false for non-anchor absolute url', function() {
            util.isAnchor(Url.parse('http://some-website.com#some-anchor')).should.equal(false);
        });

        it('should return false for non-anchor relative url', function() {
            util.isAnchor(Url.parse('../some-website.com#some-anchor')).should.equal(false);
        });

        it('should return true for anchor url', function() {
            util.isAnchor(Url.parse('#some-anchor')).should.equal(true);
        });
    });

    describe('isGithubUrl', function() {
        it('should return true for github url', function() {
            util.isGithubUrl(Url.parse('https://github.com/some-org/some-user')).should.equal(true);
        });

        it('should return false for non-github url', function() {
            util.isGithubUrl(Url.parse('https://some-website.com/some-org/some-user')).should.equal(false);
        });
    });

    describe('isNativeWebsiteUrl', function() {
        it('should return true if url is native website url', function() {
            util.isNativeWebsiteUrl(Url.parse('/url1'), ['/url1']).should.equal(true);
        });

        it('should return true if url (with trailing slash) is native website url', function() {
            util.isNativeWebsiteUrl(Url.parse('/url1/'), ['/url1']).should.equal(true);
        });

        it('should return false if url is non-native website url', function() {
            util.isNativeWebsiteUrl(Url.parse('http://some-website.com'), ['/url1']).should.equal(false);
        });
    });

    describe('findReplacement', function() {
        var pages = [
                {url: '/url1', sourceUrl: '/sourceUrl1', published: true},
                {url: '/url2', sourceUrl: '/sourceUrl2/README.md', published: true}
            ],
            sourceUrlMap,
            existedUrls;

        beforeEach(function() {
            sourceUrlMap = util.createSourceUrlsMap(pages);
            existedUrls = util.createArrayOfModelPageUrls(pages);
        });

        it('should find replacement from sourceUrlMap', function() {
            util.findReplacement(['/sourceUrl1'], sourceUrlMap, existedUrls).should.equal('/url1');
        });

        it('should find replacement from sourceUrlMap by alter key', function() {
            util.findReplacement(['/sourceUrl2'], sourceUrlMap, existedUrls).should.equal('/url2');
        });

        it('should find replacement from model page urls array', function() {
            util.findReplacement(['/url1'], sourceUrlMap, existedUrls).should.equal('/url1');
        });

        it('should return null if replacement was not found', function() {
            var result = util.findReplacement(['/non-existed'], sourceUrlMap, existedUrls);
            (result == null).should.equal(true);
        });
    });

    describe('createArrayOfModelPageUrls', function() {
        it('should create array of model pages urls', function() {
            var pages = [
                {url: '/url1'},
                {url: '/url2'}
            ];
            util.createArrayOfModelPageUrls(pages).should.eql(['/url1', '/url2']);
        });
    });

    describe('createSourceUrlsMap', function() {
        it('should create map with sourceUrls as keys and urls as values', function() {
            var pages = [
                {url: '/url1', sourceUrl: '/sourceUrl1', published: true},
                {url: '/url2', sourceUrl: '/sourceUrl2', published: true}
            ];
            var sourceUrlMap = util.createSourceUrlsMap(pages);
            sourceUrlMap.get('/sourceUrl1').should.equal('/url1');
            sourceUrlMap.get('/sourceUrl2').should.equal('/url2');
        });

        it('should skip pages without "sourceUrl" fields', function() {
            var pages = [
                {url: '/url1', sourceUrl: '/sourceUrl1', published: true},
                {url: '/url2', published: true}
            ];
            var sourceUrlMap = util.createSourceUrlsMap(pages);
            sourceUrlMap.size.should.equal(1);
        });

        it('should skip unpublished pages', function() {
            var pages = [
                {url: '/url1', sourceUrl: '/sourceUrl1', published: true},
                {url: '/url2', sourceUrl: '/sourceUrl1', published: false}
            ];
            var sourceUrlMap = util.createSourceUrlsMap(pages);
            sourceUrlMap.has('/sourceUrl1').should.equal(true);
            sourceUrlMap.has('/sourceUrl2').should.equal(false);
        });
    });
});
