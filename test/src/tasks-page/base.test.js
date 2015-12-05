var Config = require('../../../lib/config'),
    PageBase = require('../../../lib/tasks-page/base');

describe('PageBase', function() {
    var task;

    beforeEach(function() {
        task = new PageBase(new Config('debug'), {});
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
                {url: '/', title: '/title'},
                {url: '/url1', title: '/url1 title'}
        ];
        it ('should build valid complex map of titles by urls and languages', function() {
            var pagesMap = task.createPageTitlesMap(pages);
            pagesMap.get('/').should.equal('/title');
            pagesMap.get('/url1').should.equal('/url1 title');
        });
    });
});

