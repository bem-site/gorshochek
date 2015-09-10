var should = require('should'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    PageHeaderMeta = require('../../../lib/tasks/page-header-meta');

describe('PageHeaderMeta', function () {
    it('should return valid task name', function () {
        PageHeaderMeta.getName().should.equal('create page header meta-information');
    });

    describe('instance methods', function () {
        var config,
            task;

        before(function () {
            config = new Config('debug');
            config.setLanguages(['en', 'ru']);
            task = new PageHeaderMeta(config, {});
        });

        describe('_addMetaToPage', function () {
            it('should skip if language version of page does not exists', function () {
                var page = { url: '/url1' };
                task._addMetaToPage(page, 'en');
                should(page.header).equal(undefined);
            });

            it('should add header meta-information', function () {
                var page = {
                    url: '/url1',
                    en: {
                        title: 'page title'
                    }
                };
                task._addMetaToPage(page, 'en');

                should.deepEqual(page['en'].header.meta, {
                    ogUrl: '/url1',
                    ogType: 'article',
                    description: 'page title',
                    ogDescription: 'page title',
                    keywords: '',
                    ogKeywords: ''
                });
            });

            it('should add header meta-information (with tags)', function () {
                var page = {
                    url: '/url1',
                    en: {
                        title: 'page title',
                        tags: ['tag1', 'tag2']
                    }
                };
                task._addMetaToPage(page, 'en');

                should.deepEqual(page['en'].header.meta, {
                    ogUrl: '/url1',
                    ogType: 'article',
                    description: 'page title',
                    ogDescription: 'page title',
                    keywords: 'tag1, tag2',
                    ogKeywords: 'tag1, tag2'
                });
            });
        });

        describe('run', function () {
           it('should add header.meta to pages', function (done) {
               var pages = [
                       {
                           url: '/',
                           en: { title: 'index en title', tags: ['index1', 'index2'] },
                           ru: { title: 'index ru title' }
                       },
                       {
                           url: '/url1',
                           ru: { title: 'url1 ru title' }
                       }
                   ],
                   model = new Model();
               model.setPages(pages);

               task.run(model).then(function (m) {
                   should.deepEqual(m.getPages()[0]['en'].header.meta, {
                       ogUrl: '/',
                       ogType: 'article',
                       description: 'index en title',
                       ogDescription: 'index en title',
                       keywords: 'index1, index2',
                       ogKeywords: 'index1, index2'
                   });

                   should.deepEqual(m.getPages()[0]['ru'].header.meta, {
                       ogUrl: '/',
                       ogType: 'article',
                       description: 'index ru title',
                       ogDescription: 'index ru title',
                       keywords: '',
                       ogKeywords: ''
                   });

                   should.deepEqual(m.getPages()[1]['ru'].header.meta, {
                       ogUrl: '/url1',
                       ogType: 'article',
                       description: 'url1 ru title',
                       ogDescription: 'url1 ru title',
                       keywords: '',
                       ogKeywords: ''
                   });
                  done();
               });
           });
        });
    });
});
