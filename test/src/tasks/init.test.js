var fs = require('fs'),
    fsExtra = require('fs-extra'),
    Model = require('../../../lib/model/model'),
    Config = require('../../../lib/config'),
    Init = require('../../../lib/tasks/init');

function copyModelFile() {
    fsExtra.copySync('./test/stub/model/model.json', './model/model.json');
}

describe('Init', function() {
    var task;

    beforeEach(function() {
        fsExtra.ensureDirSync('./model');
    });

    afterEach(function() {
        fsExtra.removeSync('./model');
    });

    it('should return valid task name', function() {
        Init.getName().should.equal('init');
    });

    describe('run', function() {
        it('should create cache folder if it does not exists yet', function() {
            copyModelFile();

            task = new Init(new Config(), {});
            return task.run(new Model()).then(function() {
                fs.existsSync('./.builder/cache').should.equal(true);
            });
        });

        it ('should create data folder if it does not exists yet', function() {
            copyModelFile();

            task = new Init(new Config(), {});
            return task.run(new Model()).then(function() {
                fs.existsSync('./data').should.equal(true);
            });
        });

        it('should return rejected promise if model.json file was not found', function() {
            task = new Init(new Config(), {});
            return task.run(new Model()).catch(function(error) {
                error.message.should.startWith('Can\'t read or parse model file');
            });
        });
    });
});

