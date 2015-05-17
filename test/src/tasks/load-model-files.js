var fs = require('fs'),
    mockFs = require('mock-fs'),
    Config = require('../../../lib/config'),
    LoadModelFiles = require('../../../lib/tasks/load-model-files');

describe('LoadModelFiles', function () {
    before(function () {
        var configFile = fs.readFileSync('./test/stub/.builder/make.js', { encoding: 'utf-8' }),
            modelFile = fs.readFileSync('./test/stub/model/model.json', { encoding: 'utf-8' });
        mockFs({
            '.builder': {
                'make.js': configFile
            },
            model: {
                '_model.json': modelFile
            },
            cache: {},
            data: {}
        });
    });

    after(function () {
        mockFs.restore();
    });

    describe('model file does not exist', function () {
        var task;

        before(function () {
            task = new LoadModelFiles(new Config(), {});
        });

        it('run', function (done) {
            task.run().catch(function (error) {
                error.message.indexOf('Can\'t read or parse model file').should.above(-1);
                done();
            });
        });
    });
});
