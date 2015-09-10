var should = require('should'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    PageSearchMeta = require('../../../lib/tasks/page-search-meta');

describe('PageSearchMeta', function () {
    it('should return valid task name', function () {
        PageSearchMeta.getName().should.equal('create page search meta-information');
    });

    describe('instance methods', function () {
        var config,
            task;

        before(function () {
            config = new Config('debug');
            config.setLanguages(['en', 'ru']);
            task = new PageSearchMeta(config, {});
        });

        describe('run', function () {
            it('should add page search meta information to pages', function (done) {
                var pages = [
                        {
                            url: '/',
                            en: { title: 'index en title' },
                            ru: { title: 'index ru title', tags: ['tag1', 'tag2'] }
                        }
                    ],
                    model = new Model();
                model.setPages(pages);
                task.run(model).then(function (m) {
                    should.deepEqual(m.getPages()[0]['en'].meta, {
                        breadcrumbs: [
                            { url: '/', title: 'index en title' }
                        ],
                        fields: {
                            type: 'doc',
                            keywords: []
                        }
                    });
                    should.deepEqual(m.getPages()[0]['ru'].meta, {
                        breadcrumbs: [
                            { url: '/', title: 'index ru title' }
                        ],
                        fields: {
                            type: 'doc',
                            keywords: ['tag1', 'tag2']
                        }
                    });
                    done();
                });
            });
        });
    });
});
