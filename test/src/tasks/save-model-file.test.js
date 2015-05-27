var fs = require('fs'),
    mockFs = require('mock-fs'),
    Config = require('../../../lib/config'),
    SaveModelFile = require('../../../lib/tasks/save-model-file');

describe('SaveModelFile', function () {
    before(function () {
        var modelFile = fs.readFileSync('./test/stub/model/model.json', { encoding: 'utf-8' });
        mockFs({
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
        var config = new Config('debug'),
            task;

        before(function () {
            config.setCacheFolder('./cache');
            task = new SaveModelFile(config, {});
        });

        it('run', function (done) {
            task.run().then(function () {
                fs.existsSync('./cache/model.json').should.equal(true);
                done();
            });
        });
    });
});
