var Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    PageHeaderMeta = require('../../../lib/tasks-page/header-meta');

describe('PageHeaderMeta', function() {
    var task,
        pages = [
            {url: '/', title: '/ title', tags: ['index1', 'index2']},
            {url: '/url1', title: '/url1 title'}
        ],
        model = new Model();

    function getMetaFieldValue(result, field, pageIndex) {
        pageIndex = pageIndex || 0;
        return result.getPages()[pageIndex].header.meta[field];
    }

    beforeEach(function() {
        task = new PageHeaderMeta(new Config('debug'), {});
        model.setPages(pages);
    });

    it('should return valid task name', function() {
        PageHeaderMeta.getName().should.equal('create page header meta-information');
    });

    it('should set value for "ogUrl" meta field', function() {
        return task.run(model).then(function(result) {
            getMetaFieldValue(result, 'ogUrl').should.be.equal('/');
        });
    });

    it('should set value for "ogType" meta field', function() {
        return task.run(model).then(function(result) {
            getMetaFieldValue(result, 'ogType').should.be.equal('article');
        });
    });

    it('should set value for "description" meta field', function() {
        return task.run(model).then(function(result) {
            getMetaFieldValue(result, 'description').should.be.equal('/ title');
        });
    });

    it('should set value for "ogDescription" meta field', function() {
        return task.run(model).then(function(result) {
            getMetaFieldValue(result, 'ogDescription').should.be.equal('/ title');
        });
    });

    it('should set valid value for "keywords" meta field for tagged page', function() {
        return task.run(model).then(function(result) {
            getMetaFieldValue(result, 'keywords').should.be.equal('index1, index2');
        });
    });

    it('should set valid value for "ogKeywords" meta field for tagged page', function() {
        return task.run(model).then(function(result) {
            getMetaFieldValue(result, 'ogKeywords').should.be.equal('index1, index2');
        });
    });

    it('should set empty value for "keywords" meta field for non-tagged page', function() {
        return task.run(model).then(function(result) {
            getMetaFieldValue(result, 'keywords', 1).should.be.equal('');
        });
    });

    it('should set empty value for "ogKeywords" meta field for non-tagged page', function() {
        return task.run(model).then(function(result) {
            getMetaFieldValue(result, 'ogKeywords', 1).should.be.equal('');
        });
    });
});
