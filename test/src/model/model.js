var Changes = require('../../../lib/model/changes'),
    Model = require('../../../lib/model/model');

describe('Model', function () {
    it('initialization', function () {
        var model = new Model();
        model._pages.should.be.instanceOf(Array).and.have.length(0);
        model._changes.should.be.instanceOf(Changes);
    });

    describe('instance methods', function () {
        var model;

        before(function () {
            model = new Model();
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
