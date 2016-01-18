var _ = require('lodash'),
    Model = require('../../../lib/model'),
    baseUtil = require('../../../lib/util'),
    rsync = require('../../../index').tasks.core.rsync;

describe('tasks-core/rsync', function() {
    var sandbox = sinon.sandbox.create(),
        rsyncStub,
        model = new Model(),
        baseParams = {
            src: './.builder/cache/',
            dest: './data',
            options: '-rd --delete --delete-excluded --force',
            sync: false
        };

    beforeEach(function() {
        sandbox.stub(console, 'error');
        rsyncStub = sandbox.stub(baseUtil, 'rsync').yields(null);
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return function as result', function() {
        rsync(model).should.be.instanceOf(Function);
    });

    it('should return promise with model instance', function() {
        return rsync(model)().should.eventually.be.instanceOf(Model);
    });

    it('should rejected with error if error occur while synchronization', function() {
        rsyncStub.yields(new Error('some-error'));
        return rsync(model)().should.rejectedWith('some-error');
    });

    it('should rsync with default parameters', function() {
        return rsync(model)().then(function() {
            rsyncStub.should.be.calledWithMatch(baseParams);
        });
    });

    it('should rsync from custom source path', function() {
        return rsync(model, {src: './some-source'})().then(function() {
            rsyncStub.should.be.calledWithMatch(_.extend({}, baseParams, {src: './some-source'}));
        });
    });

    it('should rsync to custom destination path', function() {
        return rsync(model, {dest: './some-destination'})().then(function() {
            rsyncStub.should.be.calledWithMatch(_.extend({}, baseParams, {dest: './some-destination'}));
        });
    });

    it('should use custom given rsync raw options', function() {
        return rsync(model, {options: '-rtvhcz'})().then(function() {
            rsyncStub.should.be.calledWithMatch(_.extend({}, baseParams, {options: '-rtvhcz'}));
        });
    });

    it('should be able to set given excluded patterns', function() {
        return rsync(model, {options: '-rd', exclude: ['*.js', '*.css']})().then(function() {
            rsyncStub.should.be
                .calledWithMatch(_.extend({}, baseParams, {options: '-rd --exclude \'*.js\' --exclude \'*.css\''}));
        });
    });
});
