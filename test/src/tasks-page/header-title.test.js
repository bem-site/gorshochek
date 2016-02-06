var Model = require('../../../lib/model'),
    createHeaderTitle = require('../../../index').tasks.page.createHeaderTitle;

describe('tasks-page/header-title', function() {
    var pages = [
            {url: '/', title: 'index title'},
            {url: '/url1/', title: 'url1 title'},
            {url: '/url1/url2/', title: 'url2 title'}
        ],
        model = new Model();

    beforeEach(function() {
        model.setPages(pages);
    });

    it('should return function as result', function() {
        createHeaderTitle(model).should.be.instanceOf(Function);
    });

    it('should set valid header title value for index page', function() {
        return createHeaderTitle(model)().then(function(result) {
            result.getPages()[0].header.title.should.equal('index title');
        });
    });

    it('should set valid header title value for first-level pages', function() {
        return createHeaderTitle(model)().then(function(result) {
            result.getPages()[1].header.title.should.equal('url1 title / index title');
        });
    });

    it('should set valid header title value for second-level pages', function() {
        return createHeaderTitle(model)().then(function(result) {
            result.getPages()[2].header.title.should.equal('url2 title / url1 title / index title');
        });
    });

    it('should use custom delimiter received from options', function() {
        return createHeaderTitle(model, {delimiter: '||'})().then(function(result) {
            result.getPages()[1].header.title.should.equal('url1 title||index title');
        });
    });
});
