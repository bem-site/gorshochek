var fs = require('fs'),
    mockFs = require('mock-fs'),
    Config = require('../../../lib/config'),
    MakeDataDirectory = require('../../../lib/tasks/make-data-directory');

describe('MakeDataDirectory', function () {
    before(function () {
        var configFile = fs.readFileSync('./test/stub/.builder/make.js', { encoding: 'utf-8' });
        mockFs({
            '.builder': {
                'make.js': configFile
            }
        });
    });

    after(function () {
        mockFs.restore();
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
});
