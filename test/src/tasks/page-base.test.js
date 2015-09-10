var should = require('should'),
    Config = require('../../../lib/config'),
    PageBase = require('../../../lib/tasks/page-base');

describe('PageBase', function () {
    it('should return valid task name', function () {
        PageBase.getName().should.equal('page base operations');
    });

    describe('instance methods', function () {
        var config,
            task;

        before(function () {
            config = new Config('debug');
            config.setLanguages(['en', 'ru']);
            task = new PageBase(config, {});
        });

        describe('getPagesMap', function () {
            it ('should build valid pages map', function () {
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
                            url: '/url2',
                            en: { title: 'url2 en title' },
                            ru: { title: 'url2 ru title' }
                        }
                    ],
                    languages = ['en', 'ru'],
                    pagesMap = task.getPagesMap(pages, languages);

                pagesMap.get('/').get('en').should.equal('index en title');
                pagesMap.get('/').get('ru').should.equal('index ru title');

                pagesMap.get('/url1').get('ru').should.equal('url1 ru title');

                pagesMap.get('/url2').get('en').should.equal('url2 en title');
                pagesMap.get('/url2').get('ru').should.equal('url2 ru title');
            });
        });

        describe('getParentUrls', function () {
            it('should get parent urls for index page', function () {
                should.deepEqual(task.getParentUrls({ url: '/' }), ['/']);
            });

            it('should get parent urls for first level', function () {
                should.deepEqual(task.getParentUrls({ url: '/url1' }), ['/', '/url1']);
            });

            it('should get parent urls for second level', function () {
                should.deepEqual(task.getParentUrls({ url: '/url1/url2' }), ['/', '/url1', '/url1/url2']);
            });

            it('should get parent urls for third level', function () {
                should.deepEqual(task.getParentUrls({ url: '/url1/url2/url3' }),
                    ['/', '/url1', '/url1/url2', '/url1/url2/url3']);
            });
        });
    });
});

