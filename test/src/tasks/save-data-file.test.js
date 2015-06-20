var fs = require('fs'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    SaveDataFile = require('../../../lib/tasks/save-data-file');

describe('SaveDataFile', function () {
    beforeEach(function () {
        fsExtra.ensureDirSync('./data');
    });

    afterEach(function () {
        fsExtra.deleteSync('./data');
    });

    it('should return valid task name', function () {
        SaveDataFile.getName().should.equal('save data file');
    });

    describe('instance methods', function () {
        var config,
            model,
            task;

        before(function () {
            config = new Config('debug');
            task = new SaveDataFile(config, {});
            model = new Model();

            model.setPages([
                {
                    url: '/url1',
                    en: {}
                }
            ]);
        });

        describe('run', function () {
            it('should successfully being saved to data.json file', function (done) {
                task.run(model).then(function () {
                    fs.existsSync('./data/data.json').should.equal(true);
                    done();
                });
            });

            it('should fail if data folder does not exists', function (done) {
                fs.rmdirSync('./data');
                task.run(model).catch(function (error) {
                    error.code.should.equal('ENOENT');
                    done();
                });
            });
        });
    });
});

