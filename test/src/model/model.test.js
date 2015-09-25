var should = require('should'),
    Changes = require('../../../lib/model/changes'),
    Model = require('../../../lib/model/model');

describe('Model', function () {
    it('initialization', function () {
        var model = new Model();
        model.getPages().should.be.instanceOf(Array).and.have.length(0);
        model.getChanges().should.be.instanceOf(Changes);
    });

    describe('instance methods', function () {
        var model,
            testObj = { foo: 'bar' };

        beforeEach(function () {
            model = new Model();
        });

        it('it should have getter of new model', function () {
            model._newModel = testObj;
            should.deepEqual(model.getNewModel(), testObj);
        });

        it('it should have setter of new model', function () {
            model.setNewModel(testObj);
            should.deepEqual(model.getNewModel(), testObj);
        });

        it('should have getter of old model', function () {
            model._oldModel = testObj;
            should.deepEqual(model.getOldModel(), testObj);
        });

        it('should have setter of old model', function () {
            model.setOldModel(testObj);
            should.deepEqual(model.getOldModel(), testObj);
        });

        it('getChanges should return instance of Changes class', function () {
            model.getChanges().should.be.instanceOf(Changes);
        });

        it ('getPages should return empty array of pages', function () {
            model.getPages().should.be.instanceOf(Array).and.have.length(0);
        });

        it ('setPages should set pages model', function () {
            model.setPages([1, 2]).should.be.instanceOf(Model);
            model.getPages().should.be.instanceOf(Array).and.have.length(2);
        });

        describe('merge', function () {
            beforeEach(function () {
                var oldModel = [
                        { url: '/url1', a: 'a1', b: 1, c: { c1: 'c11', c2: 'c21' } },
                        { url: '/url2', a: 'a2', b: 2, c: { c1: 'c12', c2: 'c22' } },
                        { url: '/url3', a: 'a3', b: 3, c: { c1: 'c13', c2: 'c23' } },
                        { url: '/url4', a: 'a4', b: 4, c: { c1: 'c14', c2: 'c24' } },
                        { url: '/url5', a: 'a5', b: 5, c: { c1: 'c15', c2: 'c25' } }
                    ],
                    newModel = [
                        { url: '/url1', a: 'a1', b: 1, c: { c1: 'c11', c2: 'c21' } },
                        { url: '/url4', a: 'b4', b: 4, c: { c1: 'c14', c2: 'd24' } },
                        { url: '/url5', a: 'b5', b: 5, c: { c1: 'c15', c2: 'd25' } },
                        { url: '/url6', a: 'a6', b: 6, c: { c1: 'c16', c2: 'c26' } },
                        { url: '/url7', a: 'a7', b: 7, c: { c1: 'c17', c2: 'c27' } }
                    ];
                model.setOldModel(oldModel);
                model.setNewModel(newModel);
            });

            it('should have valid number of pages after merge', function () {
                model.merge();
                model.getPages().should.be.instanceOf(Array).and.have.length(5);
            });

            it ('should have valid added changes after merge', function () {
                model.merge();
                should.deepEqual(model.getChanges().pages.added, [
                    { type: 'page', url: '/url6' },
                    { type: 'page', url: '/url7' }
                ]);
            });

            it ('should have valid modified changes after merge', function () {
                model.merge();
                should.deepEqual(model.getChanges().pages.modified, [
                    { type: 'page', url: '/url4' },
                    { type: 'page', url: '/url5' }
                ]);
            });

            it ('should have valid removed changes after merge', function () {
                model.merge();
                should.deepEqual(model.getChanges().pages.removed, [
                    { type: 'page', url: '/url2' },
                    { type: 'page', url: '/url3' }
                ]);
            });
        });

        describe('normalize', function () {
            var languages = ['en', 'ru'];

            describe('oldUrls', function () {
                it('should set given oldUrls', function () {
                    var page = {
                        url: '/url1',
                        oldUrls: ['/url11', '/url22'],
                        en: {},
                        ru: {}
                    };
                    model.setPages([page]);
                    model.normalize(languages);

                    should.deepEqual(model.getPages()[0].oldUrls, page.oldUrls);
                });

                it('should set default oldUrls as empty array', function () {
                    var page = {
                        url: '/url1',
                        en: {},
                        ru: {}
                    };
                    model.setPages([page]);
                    model.normalize(languages);

                    should.deepEqual(model.getPages()[0].oldUrls, []);
                });
            });

            describe('view', function () {
                it('should set given view', function () {
                    var page = {
                        url: '/url1',
                        oldUrls: ['/url11', '/url22'],
                        view: 'index',
                        en: {},
                        ru: {}
                    };
                    model.setPages([page]);
                    model.normalize(languages);

                    model.getPages()[0].view.should.equal(page.view);
                });

                it('should set default view as "post"', function () {
                    var page = {
                        url: '/url1',
                        oldUrls: ['/url11', '/url22'],
                        en: {},
                        ru: {}
                    };
                    model.setPages([page]);
                    model.normalize(languages);

                    model.getPages()[0].view.should.equal('post');
                });
            });

            describe('published', function () {
                it('should set given and default values of published field', function () {
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

                    model.setPages([page]);
                    model.normalize(languages);

                    model.getPages()[0].en.published.should.equal(false);
                    model.getPages()[0].ru.published.should.equal(true);
                });
            });

            describe('missed title', function () {
                it('should set published false when title as missed', function () {
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

                    model.setPages([page]);
                    model.normalize(languages);

                    model.getPages()[0].en.published.should.equal(false);
                    model.getPages()[0].ru.published.should.equal(true);
                });
            });
        });

        /*
        describe('getPagesByCriteria', function () {
            it('should return valid set of filtered pages', function () {
                var pages = [
                        { url: '/url1' },
                        { url: '/url2', en: {} },
                        {
                            url: '/url3',
                            ru: {
                                sourceUrl: 'https://github.com/bem/bem-method/' +
                                'tree/bem-info-data/method/index/index.en.md'
                            },
                            en: { sourceUrl: '/foo/bar' }
                        },
                        {
                            url: '/url4',
                            en: {
                                sourceUrl: 'https://github.com/bem/bem-method/' +
                                'tree/bem-info-data/method/index/index.en.md'
                            },
                            ru: {}
                        }
                    ],
                    result = task.getPagesByCriteria(pages, ['en', 'ru']);

                result.should.be.instanceOf(Array).and.have.length(2);
                should.deepEqual(result, [pages[2], pages[3]]);
            });
        });
        */
    });
});
