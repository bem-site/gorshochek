var Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    PageBreadcrumbs = require('../../../lib/tasks-page/breadcrumbs');

describe('PageBreadcrumbs', function() {
    var model = new Model(),
        pages = [
            {url: '/', title: 'index title'},
            {url: '/url1', title: 'url1 title'},
            {url: '/url1/url2', title: 'url2 title'}
        ],
        task;

    beforeEach(function() {
        task = new PageBreadcrumbs(new Config('debug'), {});
        model.setPages(pages);
    });

    it('should return valid task name', function() {
        PageBreadcrumbs.getName().should.equal('create page breadcrumbs');
    });

    it('should create valid breadcrumbs model for index page', function() {
        task.run(model).then(function(result) {
            result.getPages()[0].breadcrumbs.should.eql([{url: '/', title: 'index title'}]);
        });
    });

    it('should create valid breadcrumbs model for first-level pages', function() {
        task.run(model).then(function(result) {
            result.getPages()[1].breadcrumbs.should.eql([
                {url: '/', title: 'index title'},
                {url: '/url1', title: 'url1 title'}
            ]);
        });
    });

    it('should create valid breadcrumbs model for second-level pages', function() {
        task.run(model).then(function(result) {
            result.getPages()[2].breadcrumbs.should.eql([
                {url: '/', title: 'index title'},
                {url: '/url1', title: 'url1 title'},
                {url: '/url1/url2', title: 'url2 title'}
            ]);
        });
    });
});

