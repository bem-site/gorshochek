var _ = require('lodash'),
    should = require('should'),
    Changes = require('../../../lib/model/changes'),
    Model = require('../../../lib/model/model');

describe('Model', function() {
    var model;

    beforeEach(function() {
        model = new Model();
    });

    it('should have empty array of pages after initialization', function() {
        model.getPages().should.be.instanceOf(Array).and.have.length(0);
    });

    it('should have model of changes', function() {
        model.getChanges().should.be.instanceOf(Changes);
    });

    describe('newModel property', function() {
        it('should have getter', function() {
            model.getNewModel.should.be.instanceOf(Function);
        });

        it('should have setter', function() {
            model.setNewModel.should.be.instanceOf(Function);
        });

        it('should can set and get newModel', function() {
            should(model.getNewModel()).not.be.ok;
            model.setNewModel({foo: 'bar'});
            model.getNewModel().should.be.eql({foo: 'bar'});
        });
    });

    describe('oldModel property', function() {
        it('should have getter', function() {
            model.getOldModel.should.be.instanceOf(Function);
        });

        it('should have setter', function() {
            model.setOldModel.should.be.instanceOf(Function);
        });

        it('should can set and get oldModel', function() {
            should(model.getOldModel()).not.be.ok;
            model.setOldModel({foo: 'bar'});
            model.getOldModel().should.be.eql({foo: 'bar'});
        });
    });

    describe('pages property', function() {
        it('should have getter', function() {
            model.getPages.should.be.instanceOf(Function);
        });

        it('should have setter', function() {
            model.setPages.should.be.instanceOf(Function);
        });

        it('should can set and get pages', function() {
            model.getPages().should.have.length(0);
            model.setPages([{url: '/url1'}]);
            model.getPages().should.be.eql([{url: '/url1'}]);
        });
    });

    describe('merge models', function() {
        describe('merge empty models', function() {
            beforeEach(function() {
                model.setOldModel([]);
                model.setNewModel([]);
                model.merge();
            });

            it('should not find any changes for empty models', function() {
                model.getChanges().pages.added.should.be.empty;
                model.getChanges().pages.modified.should.be.empty;
                model.getChanges().pages.removed.should.be.empty;
            });

            it('should have empty result model', function() {
                model.getPages().should.be.empty;
            });
        });

        describe('merge newModel with empty oldModel', function() {
            beforeEach(function() {
                model.setOldModel([]);
                model.setNewModel([{url: '/url1'}]);
            });

            it('should have valid result model', function() {
                model.merge();
                model.getPages().should.be.eql([{url: '/url1'}])
            });

            it('should have valid added changes model', function() {
                model.merge();
                model.getChanges().pages.added.should.eql([{type: 'page', url: '/url1'}])
            });

            it('should have empty modified changes model', function() {
                model.merge();
                model.getChanges().pages.modified.should.be.empty;
            });

            it('should have empty removed changes model', function() {
                model.merge();
                model.getChanges().pages.removed.should.be.empty;
            });
        });

        describe('merge no-empty models', function() {
            beforeEach(function() {
                var oldModel = [
                        {url: '/url1', a: 'a1', b: 1, c: {c1: 'c11', c2: 'c21'}},
                        {url: '/url2', a: 'a2', b: 2, c: {c1: 'c12', c2: 'c22'}},
                        {url: '/url3', a: 'a3', b: 3, c: {c1: 'c13', c2: 'c23'}}
                    ],
                    newModel = [
                        {url: '/url1', a: 'a1', b: 1, c: {c1: 'c11', c2: 'c21'}},
                        {url: '/url3', a: 'b3', b: 3, c: {c1: 'c13', c2: 'd23'}},
                        {url: '/url4', a: 'b4', b: 4, c: {c1: 'c14', c2: 'd24'}}
                    ];
                model.setOldModel(oldModel);
                model.setNewModel(newModel);
            });

            it('should have valid number of pages after merge', function() {
                model.merge();
                model.getPages().should.be.instanceOf(Array).and.have.length(3);
            });

            it ('should have valid added changes after merge', function() {
                model.merge();
                model.getChanges().pages.added.should.eql([{type: 'page', url: '/url4'}]);
            });

            it ('should have valid modified changes after merge', function() {
                model.merge();
                model.getChanges().pages.modified.should.eql([{type: 'page', url: '/url3'}]);
            });

            it ('should have valid removed changes after merge', function() {
                model.merge();
                model.getChanges().pages.removed.should.eql([{type: 'page', url: '/url2'}]);
            });
        });
    });

    describe('normalize', function() {
        var languages = ['en', 'ru'],
            commonPageProperties = {url: '/url1', en: {}, ru: {}};

        function prepareModelPages(pageProperty) {
            model.setPages([_.merge(pageProperty, commonPageProperties)]);
        }

        it('should set given "oldUrls" property value as is if it was set', function() {
            prepareModelPages({oldUrls: ['/url11', '/url22']});
            model.normalize(languages);
            model.getPages().shift().oldUrls.should.eql(['/url11', '/url22']);
        });

        it('should set default "oldUrls" property value as empty array', function() {
            prepareModelPages({});
            model.normalize(languages);
            model.getPages().shift().oldUrls.should.eql([]);
        });

        it('should set given "view" property value as is if it was given', function() {
            prepareModelPages({view: 'index'});
            model.normalize(languages);
            model.getPages().shift().view.should.equal('index');
        });

        it('should set default "view" property value as "post"', function() {
            prepareModelPages({});
            model.normalize(languages);
            model.getPages().shift().view.should.equal('post');
        });

        it('should set given "published" property value as is', function() {
            prepareModelPages({ru: {published: true, title: 'Hello World'}});
            model.normalize(languages);
            model.getPages().shift().ru.published.should.equal(true);
        });

        it('should set default "published" property value as false', function() {
            prepareModelPages({});
            model.normalize(languages);
            model.getPages().shift().ru.published.should.equal(false);
        });

        it('should set "published" false when title as missed', function() {
            prepareModelPages({en: {published: true}});
            model.normalize(languages);
            model.getPages().shift().en.published.should.equal(false);
        });
    });
});
