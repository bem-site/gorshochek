var fs = require('fs'),
    mockFs = require('mock-fs'),
    Config = require('../../../lib/config'),
    SaveModelFile = require('../../../lib/tasks/save-model-file');

describe('SaveModelFile', function () {
    before(function () {
        var configFile = fs.readFileSync('./test/stub/.builder/make.js', { encoding: 'utf-8' }),
            modelFile = fs.readFileSync('./test/stub/model/model.json', { encoding: 'utf-8' });
        mockFs({
            '.builder': {
                'make.js': configFile
            },
            model: {
                'model.json': modelFile
            },
            cache: {},
            data: {}
        });
    });

    after(function () {
        mockFs.restore();
    });

    describe('instance methods', function () {
        var task;

        before(function () {
            task = new SaveModelFile(new Config(), {});
        });

        it('run', function (done) {
            task.run().then(function () {
                fs.existsSync('./cache/model.json').should.equal(true);
                done();
            });
        });
    });
});
