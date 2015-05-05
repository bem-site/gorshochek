var path = require('path'),
    should = require('should'),
    Changes = require('../../../lib/model/changes'),
    Model = require('../../../lib/model/model');

describe('Model', function () {
    it('initialization', function () {
        var model = new Model();
        model._commonPages.should.be.instanceOf(Array).and.have.length(0);
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

        it ('getCommonPages', function () {
            model.getCommonPages().should.be.instanceOf(Array).and.have.length(0);
        });

        it ('setCommonPages', function () {
            model.setCommonPages([1, 2]).should.be.instanceOf(Model);
            model.getCommonPages().should.be.instanceOf(Array).and.have.length(2);
        });
    });
});
