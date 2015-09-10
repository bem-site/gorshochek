var should = require('should'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    PageBreadcrumbs = require('../../../lib/tasks/page-breadcrumbs');

describe('PageBreadcrumbs', function () {
    it('should return valid task name', function () {
        PageBreadcrumbs.getName().should.equal('create page breadcrumbs');
    });

    describe('instance methods', function () {
        var config,
            task;

        before(function () {
            config = new Config('debug');
            config.setLanguages(['en', 'ru']);
            task = new PageBreadcrumbs(config, {});
        });

        describe('run', function () {
            it('should add breadcrumbs to pages', function (done) {
                var pages = [
                        {
                            url: '/',
                            en: { title: 'index en title' },
                            ru: { title: 'index ru title' }
                        },
                        {
                            url: '/url1',
                            ru: { title: 'url1 ru title' }
                        },
                        {
                            url: '/url1/url2',
                            ru: { title: 'url2 ru title' }
                        }
                    ],
                    model = new Model();
                model.setPages(pages);
                task.run(model).then(function (m) {
                    should.deepEqual(m.getPages()[0]['en'].breadcrumbs, [
                        { url: '/', title: 'index en title' }
                    ]);
                    should.deepEqual(m.getPages()[0]['ru'].breadcrumbs, [
                        { url: '/', title: 'index ru title' }
                    ]);
                    should.deepEqual(m.getPages()[1]['ru'].breadcrumbs, [
                        { url: '/', title: 'index ru title' },
                        { url: '/url1', title: 'url1 ru title' }
                    ]);
                    should.deepEqual(m.getPages()[2]['ru'].breadcrumbs, [
                        { url: '/', title: 'index ru title' },
                        { url: '/url1', title: 'url1 ru title' },
                        { url: '/url1/url2', title: 'url2 ru title' }
                    ]);
                    done();
                });
            });
        });
    });
});

