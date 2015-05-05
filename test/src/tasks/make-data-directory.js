var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Config = require('../../../src/config'),
    MakeDataDirectory = require('../../../src/tasks/make-data-directory');

describe('MakeDataDirectory', function () {
    before(function () {
        process.chdir(path.resolve(__dirname, '../../stub'));
    });

    describe('instance methods', function () {
        var task,
            config;

        before(function () {
            config = new Config();
            task = new MakeDataDirectory(config, {});
        });

        it('run', function (done) {
            task.run().then(function () {
                fs.existsSync('./data').should.equal(true);
                done();
            });
        });
    });

    after(function () {
        fsExtra.removeSync('./data');
        process.chdir(path.resolve(__dirname, '../../../'));
    });
});
