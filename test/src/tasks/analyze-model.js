var fs = require('fs'),
    mockFs = require('mock-fs'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    AnalyzeModel = require('../../../lib/tasks/analyze-model');

describe('AnalyzeModel', function () {
    var languages, config, task;

    before(function () {
        var configFile = fs.readFileSync('./test/stub/.builder/make.js', { encoding: 'utf-8' }),
            modelFile = fs.readFileSync('./test/stub/model/model.json', { encoding: 'utf-8' });
        mockFs({
            '.builder': {
                'make.js': configFile
            },
            model: {
              'model.json': modelFile
            },
            cache: {},
            data: {}
        });

        languages = ['en', 'ru'];
        config = new Config();
        task = new AnalyzeModel(config, {});
    });

    after(function () {
        mockFs.restore();
    });

    describe('_analyzePage', function () {
        describe('oldUrls', function () {
            it('given', function () {
                var page = {
                    url: '/url1',
                    oldUrls: ['/url11', '/url22'],
                    en: {},
                    ru: {}
                };
                should.deepEqual(task._analyzePage(page, languages).oldUrls, page.oldUrls);
            });

            it('default', function () {
                var page = {
                    url: '/url1',
                    en: {},
                    ru: {}
                };
                should.deepEqual(task._analyzePage(page, languages).oldUrls, []);
            });
        });

        describe('view', function () {
            it('given', function () {
                var page = {
                    url: '/url1',
                    oldUrls: ['/url11', '/url22'],
                    view: 'index',
                    en: {},
                    ru: {}
                };
                should.deepEqual(task._analyzePage(page, languages).view, page.view);
            });

            it('default', function () {
                var page = {
                    url: '/url1',
                    oldUrls: ['/url11', '/url22'],
                    en: {},
                    ru: {}
                };
                task._analyzePage(page, languages).view.should.equal('post');
            });
        });

        describe('published', function () {
            it('given and default', function () {
                var page = {
                    url: '/url1',
                    oldUrls: ['/url11', '/url22'],
                    view: 'index',
                    en: {},
                    ru: {
                        published: true,
                        title: 'Hello World'
                    }
                };

                task._analyzePage(page, languages).en.published.should.equal(false);
                task._analyzePage(page, languages).ru.published.should.equal(true);
            });
        });

        describe('missed title', function () {
            it('should hide post if it has not title', function () {
                var page = {
                    url: '/url1',
                    oldUrls: ['/url11', '/url22'],
                    view: 'index',
                    en: {
                        published: true
                    },
                    ru: {
                        published: true,
                        title: 'Hello World'
                    }
                };
                task._analyzePage(page, languages).en.published.should.equal(false);
                task._analyzePage(page, languages).ru.published.should.equal(true);
            });
        });

        describe('authors', function () {
            it('given and default', function () {
                var page = {
                    url: '/url1',
                    oldUrls: ['/url11', '/url22'],
                    view: 'index',
                    en: {
                        authors: ['author-id1', 'author-id2', 'author-id3']
                    },
                    ru: {}
                };

                should.deepEqual(task._analyzePage(page, languages).en.authors, page.en.authors);
                should.deepEqual(task._analyzePage(page, languages).ru.authors, []);
            });
        });

        describe('translators', function () {
            it('given and default', function () {
                var page = {
                    url: '/url1',
                    oldUrls: ['/url11', '/url22'],
                    view: 'index',
                    en: {
                        translators: ['translator-id1', 'translator-id2', 'translator-id3']
                    },
                    ru: {}
                };

                should.deepEqual(task._analyzePage(page, languages).en.translators, page.en.translators);
                should.deepEqual(task._analyzePage(page, languages).ru.translators, []);
            });
        });

        describe('tags', function () {
            it('given and default', function () {
                var page = {
                    url: '/url1',
                    oldUrls: ['/url11', '/url22'],
                    view: 'index',
                    en: {
                        tags: ['tag1', 'tag2', 'tag3']
                    },
                    ru: {}
                };

                should.deepEqual(task._analyzePage(page, languages).en.tags, page.en.tags);
                should.deepEqual(task._analyzePage(page, languages).ru.tags, []);
            });
        });
    });

    it('run', function (done) {
        var model = new Model();
        model.setPages(fsExtra.readJSONSync('./model/model.json'));
        task.run(model).then(function () {
            done();
        });
    });
});
