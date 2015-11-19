var Config = require('../../../lib/config'),
    PageBase = require('../../../lib/tasks-page/base');

describe('PageBase', function() {
    var config,
        task;

    beforeEach(function() {
        config = new Config('debug');
        config.setLanguages(['en']);
        task = new PageBase(config, {});
    });

    it('should return valid task name', function() {
        PageBase.getName().should.equal('page base operations');
    });

    describe('getParentUrls', function() {
        it('should get parent urls for index page', function() {
            task.getParentUrls({url: '/'}).should.eql(['/']);
        });

        it('should get parent urls for first level pages', function() {
            task.getParentUrls({url: '/url1'}).should.eql(['/', '/url1']);
        });

        it('should get parent urls for second level', function() {
            task.getParentUrls({url: '/url1/url2'}).should.eql(['/', '/url1', '/url1/url2']);
        });

        it('should get parent urls for third level', function() {
            task.getParentUrls({url: '/url1/url2/url3'}).should.eql(['/', '/url1', '/url1/url2', '/url1/url2/url3']);
        });
    });

    describe('getPagesMap', function() {
        var pages = [
                {url: '/', en: {title: '/ en'}, ru: {title: '/ ru'}},
                {url: '/url1', ru: {title: 'url1 ru'}}
        ];
        it ('should build valid complex map of titles by urls and languages', function() {
            var pagesMap = task.createPageTitlesMap(pages, ['en', 'ru']);
            pagesMap.get('/').get('en').should.equal('/ en');
            pagesMap.get('/').get('ru').should.equal('/ ru');
            pagesMap.get('/url1').get('ru').should.equal('url1 ru');
        });
    });
});

