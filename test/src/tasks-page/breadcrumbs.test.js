var Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    PageBreadcrumbs = require('../../../lib/tasks-page/breadcrumbs');

describe('PageBreadcrumbs', function() {
    var config = new Config('debug'),
        model = new Model(),
        task,
        pages = [
            {url: '/', en: {title: 'index title'}},
            {url: '/url1', en: {title: 'url1 title'}},
            {url: '/url1/url2', en: {title: 'url2 title'}}
        ];

    config.setLanguages(['en']);

    beforeEach(function() {
        task = new PageBreadcrumbs(config, {});
        model.setPages(pages);
    });

    it('should return valid task name', function() {
        PageBreadcrumbs.getName().should.equal('create page breadcrumbs');
    });

    it('should create valid breadcrumbs model for index page', function() {
        task.run(model).then(function(result) {
            result.getPages()[0].en.breadcrumbs.should.eql([{url: '/', title: 'index title'}]);
        });
    });

    it('should create valid breadcrumbs model for first-level pages', function() {
        task.run(model).then(function(result) {
            result.getPages()[1].en.breadcrumbs.should.eql([
                {url: '/', title: 'index title'},
                {url: '/url1', title: 'url1 title'}
            ]);
        });
    });

    it('should create valid breadcrumbs model for second-level pages', function() {
        task.run(model).then(function(result) {
            result.getPages()[2].en.breadcrumbs.should.eql([
                {url: '/', title: 'index title'},
                {url: '/url1', title: 'url1 title'},
                {url: '/url1/url2', title: 'url2 title'}
            ]);
        });
    });
});

