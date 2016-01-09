var Url = require('url'),
    overrideUtils = require('../../../lib/tasks-override/utils');

describe('overrideUtils', function() {
    describe('isAbsoluteHttpUrl', function() {
        it('should return true for absolute http url: "http://some-website.com"', function() {
            overrideUtils.isAbsoluteHttpUrl(Url.parse('http://some-website.com')).should.equal(true);
        });

        it('should return true for absolute https url: "https://some-website.com"', function() {
            overrideUtils.isAbsoluteHttpUrl(Url.parse('https://some-website.com')).should.equal(true);
        });

        it('should return false for non-http(s) absolute url: "git://some-website.com"', function() {
            overrideUtils.isAbsoluteHttpUrl(Url.parse('git://some-website.com')).should.equal(false);
        });

        it('should return false for relative url', function() {
            overrideUtils.isAbsoluteHttpUrl(Url.parse('../some-website.com')).should.equal(false);
        });
    });

    describe('hasUnsupportedProtocol', function() {
        it('should return true for absolute non-http(s) url "git://some-website.com"', function() {
            overrideUtils.hasUnsupportedProtocol(Url.parse('git://some-website.com')).should.equal(true);
        });

        it('should return false for absolute http(s) url "http://some-website.com"', function() {
            overrideUtils.hasUnsupportedProtocol(Url.parse('http://some-website.com')).should.equal(false);
        });

        it('should return false for relative url', function() {
            overrideUtils.hasUnsupportedProtocol(Url.parse('../some-website.com')).should.equal(false);
        });
    });

    describe('isAnchor', function() {
        it('should return false for non-anchor absolute url', function() {
            overrideUtils.isAnchor(Url.parse('http://some-website.com#some-anchor')).should.equal(false);
        });

        it('should return false for non-anchor relative url', function() {
            overrideUtils.isAnchor(Url.parse('../some-website.com#some-anchor')).should.equal(false);
        });

        it('should return true for anchor url', function() {
            overrideUtils.isAnchor(Url.parse('#some-anchor')).should.equal(true);
        });
    });

    describe('isGithubUrl', function() {
        it('should return true for github url', function() {
            overrideUtils.isGithubUrl(Url.parse('https://github.com/some-org/some-user')).should.equal(true);
        });

        it('should return false for non-github url', function() {
            overrideUtils.isGithubUrl(Url.parse('https://some-website.com/some-org/some-user')).should.equal(false);
        });
    });

    describe('isNativeWebsiteUrl', function() {
        it('should return true if url is native website url', function() {
            overrideUtils.isNativeWebsiteUrl(Url.parse('/url1'), ['/url1']).should.equal(true);
        });

        it('should return true if url (with trailing slash) is native website url', function() {
            overrideUtils.isNativeWebsiteUrl(Url.parse('/url1/'), ['/url1']).should.equal(true);
        });

        it('should return false if url is non-native website url', function() {
            overrideUtils.isNativeWebsiteUrl(Url.parse('http://some-website.com'), ['/url1']).should.equal(false);
        });
    });
});
