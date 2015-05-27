var should = require('should'),
    Changes = require('../../../lib/model/changes'),
    Model = require('../../../lib/model/model');

describe('Model', function () {
    it('initialization', function () {
        var model = new Model();
        model._pages.should.be.instanceOf(Array).and.have.length(0);
        model._changes.should.be.instanceOf(Changes);
    });

    describe('instance methods', function () {
        var model,
            testObj = { foo: 'bar' };

        before(function () {
            model = new Model();
        });

        it('get new model', function () {
            model._newModel = testObj;
            should.deepEqual(model.getNewModel(), testObj);
        });

        it('set new model', function () {
            model.setNewModel(testObj);
            should.deepEqual(model.getNewModel(), testObj);
        });

        it('get old model', function () {
            model._oldModel = testObj;
            should.deepEqual(model.getOldModel(), testObj);
        });

        it('set old model', function () {
            model.setOldModel(testObj);
            should.deepEqual(model.getOldModel(), testObj);
        });

        it('getChanges', function () {
            model.getChanges().should.be.instanceOf(Changes);
        });

        it ('getPages', function () {
            model.getPages().should.be.instanceOf(Array).and.have.length(0);
        });

        it ('setPages', function () {
            model.setPages([1, 2]).should.be.instanceOf(Model);
            model.getPages().should.be.instanceOf(Array).and.have.length(2);
        });
    });
});
