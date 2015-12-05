var Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    PageHeaderTitle = require('../../../lib/tasks-page/header-title');

describe('PageHeaderTitle', function() {
    var config = new Config('debug'),
        task = new PageHeaderTitle(config, {}),
        pages = [
            {url: '/', title: 'index title'},
            {url: '/url1', title: 'url1 title'},
            {url: '/url1/url2', title: 'url2 title'}
        ],
        model = new Model();

    beforeEach(function() {
        model.setPages(pages);
    });

    it('should return valid task name', function() {
        PageHeaderTitle.getName().should.equal('create page titles');
    });

    it('should set valid header title value for index page', function() {
        return task.run(model).then(function(result) {
            result.getPages()[0].header.title.should.equal('index title');
        });
    });

    it('should set valid header title value for first-level pages', function() {
        return task.run(model).then(function(result) {
            result.getPages()[1].header.title.should.equal('url1 title/index title');
        });
    });

    it('should set valid header title value for second-level pages', function() {
        return task.run(model).then(function(result) {
            result.getPages()[2].header.title.should.equal('url2 title/url1 title/index title');
        });
    });
});
