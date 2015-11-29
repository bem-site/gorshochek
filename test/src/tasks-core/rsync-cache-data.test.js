var fs = require('fs'),
    path = require('path'),
    Rsync = require('rsync'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    RsyncCacheData = require('../../../lib/tasks-core/rsync-cache-data');

describe('RsyncCacheData', function() {
    var sandbox = sinon.sandbox.create(),
        config = new Config('debug'),
        task,
        model;

    beforeEach(function() {
        sandbox.stub(fs, 'writeFile');
        sandbox.stub(fs, 'readdirSync');
        model = new Model();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid task name', function() {
        RsyncCacheData.getName().should.equal('rsync-cache-data');
    });

    it('should call valid rsync command for default task params', function() {
        var rsyncBuildSpy = sandbox.spy(Rsync, 'build');
        var rsyncSetSpy = sandbox.spy(Rsync.prototype, 'set');
        sandbox.stub(Rsync.prototype, 'execute').yields(null, 0);
        fs.readdirSync.returns([]);
        fs.writeFile.yields(null);
        task = new RsyncCacheData(config);

        return task.run(model).then(function() {
            rsyncBuildSpy.should.be.calledWith({
                destination: './data',
                flags: 'rd',
                source: []
            });
            rsyncSetSpy.getCall(0).should.be.calledWith('r');
            rsyncSetSpy.getCall(1).should.be.calledWith('d');
            rsyncSetSpy.getCall(2).should.be.calledWith('delete');
            rsyncSetSpy.getCall(3).should.be.calledWith('delete-excluded');
            rsyncSetSpy.getCall(4).should.be.calledWith('force');
        });
    });

    it('should also exclude some patterns for rsync if exclude task options were set', function() {
        var rsyncBuildSpy = sandbox.spy(Rsync, 'build');
        sandbox.stub(Rsync.prototype, 'execute').yields(null, 0);
        fs.readdirSync.returns([]);
        fs.writeFile.yields(null);
        task = new RsyncCacheData(config, {exclude: '*.meta.json'});

        return task.run(model).then(function() {
            rsyncBuildSpy.should.be.calledWith({
                destination: './data',
                flags: 'rd',
                source: [],
                exclude: ['*.meta.json']
            });
        });
    });

    it('should return rejected promise if rsync command fail with error', function() {
        sandbox.stub(Rsync.prototype, 'execute').yields(new Error('rsync error'));
        fs.readdirSync.returns([]);
        fs.writeFile.yields(null);
        task = new RsyncCacheData(config, {});

        return task.run(model).should.be.rejectedWith('rsync error');
    });

    it('should return rejected promise if rsync command exit code does not equal to 0', function() {
        sandbox.stub(Rsync.prototype, 'execute').yields(null, 128);
        fs.readdirSync.returns([]);
        fs.writeFile.yields(null);
        task = new RsyncCacheData(config, {});

        return task.run(model).should.be.rejectedWith('rsync error with code 128');
    });

    it('should save common data.json file to valid file path', function() {
        sandbox.stub(Rsync.prototype, 'execute').yields(null, 0);
        fs.readdirSync.returns([]);
        fs.writeFile.yields(null);
        task = new RsyncCacheData(config, {});

        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/data.json');
        });
    });

    it('should return rejected promise if error occur while saving data.json.file', function() {
        sandbox.stub(Rsync.prototype, 'execute').yields(null, 0);
        fs.readdirSync.returns([]);
        fs.writeFile.yields(new Error('write file error'));
        task = new RsyncCacheData(config, {});

        return task.run(model).should.be.rejectedWith('write file error');
    });

    it('should return fulfilled promise with model if all operations have been finished successfully', function() {
        sandbox.stub(Rsync.prototype, 'execute').yields(null, 0);
        fs.readdirSync.returns([]);
        fs.writeFile.yields(null);
        task = new RsyncCacheData(config, {});

        return task.run(model).should.eventually.eql(model);
    });
});
