var fs = require('fs'),
    mockFs = require('mock-fs'),
    should = require('should'),
    Config = require('../../../lib/config'),
    MakeCacheDirectory = require('../../../lib/tasks/make-cache-directory');

describe('MakeCacheDirectory', function () {
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
        var task;

        before(function () {
            task = new MakeCacheDirectory(new Config(), {});
        });

        it('run', function (done) {
            task.run().then(function () {
                var exists = fs.existsSync('./cache')
                exists.should.equal(true);
                done();
            });
        });
    });
});
