var fs = require('fs'),
    mockFs = require('mock-fs'),
    should = require('should'),
    Config = require('../../lib/config');

describe('Config', function () {
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

    describe('constructor', function () {
        it('should throw error in case of missing configuration file', function () {
            (function () { return new Config('../');})
                .should.throw('Configuration file ./.builder/make.js not found or invalid.')
        });

        it ('success', function () {
            var config = new Config();
            config.languages.should.be.instanceOf(Array);
            config.loggerSettings.should.be.instanceOf(Object);
            config.modelFilePath.should.be.instanceOf(String);
            config.destinationDirPath.should.be.instanceOf(String);
            config.tasks.should.be.instanceOf(Array);
        });
    });

    describe('setters', function () {
        var config;

        before(function () {
            config = new Config();
        });

        describe('_setLanguages', function () {
            it('should set with given value', function () {
                var r = config._setLanguages({ languages: ['en', 'ru'] });
                r.should.be.instanceOf(Config);
                config.getLanguages().should.be.instanceOf(Array).and.have.length(2);
                should.deepEqual(config.getLanguages(), ['en', 'ru']);
            });

            it('should set with default value', function () {
                var r = config._setLanguages({});
                r.should.be.instanceOf(Config);
                config.getLanguages().should.be.instanceOf(Array).and.have.length(1);
                should.deepEqual(config.getLanguages(), ['en']);
            });
        });

        describe('_setLoggerSettings', function () {
            it('should set with given value', function () {
                var r = config._setLoggerSettings({ logger: { level: 'info' } });
                r.should.be.instanceOf(Config);
                config.getLoggerSettings().should.be.instanceOf(Object);
                should.deepEqual(config.getLoggerSettings(), { level: 'info' });
            });

            it('should set with default value', function () {
                var r = config._setLoggerSettings({});
                r.should.be.instanceOf(Config);
                config.getLoggerSettings().should.be.instanceOf(Object);
                should.deepEqual(config.getLoggerSettings(), { level: 'debug' });
            });
        });

        describe('_setModelFilePath', function () {
            it('should set with given value', function () {
                var r = config._setModelFilePath({ modelFilePath: './model/model1.json' });
                r.should.be.instanceOf(Config);
                config.getModelFilePath().should.be.instanceOf(String);
                config.getModelFilePath().should.equal('./model/model1.json');
            });

            it('should set with default value', function () {
                var r = config._setModelFilePath({});
                r.should.be.instanceOf(Config);
                config.getModelFilePath().should.be.instanceOf(String);
                config.getModelFilePath().should.equal('./model/model.json');
            });
        });

        describe('_setDestinationDirPath', function () {
            it('should set with given value', function () {
                var r = config._setDestinationDirPath({ destDir: './data1' });
                r.should.be.instanceOf(Config);
                config.getDestinationDirPath().should.be.instanceOf(String);
                config.getDestinationDirPath().should.equal('./data1');
            });

            it('should set with default value', function () {
                var r = config._setDestinationDirPath({});
                r.should.be.instanceOf(Config);
                config.getDestinationDirPath().should.be.instanceOf(String);
                config.getDestinationDirPath().should.equal('./data');
            });
        });

        describe('_setTasks', function () {
            it('should set with given value', function () {
                var r = config._setTasks({ tasks: [{}, {}] });
                r.should.be.instanceOf(Config);
                config.getTasks().should.be.instanceOf(Array).and.have.length(2);
                should.deepEqual(config.getTasks(), [{}, {}]);
            });

            it('should set with default value', function () {
                var r = config._setTasks({});
                r.should.be.instanceOf(Config);
                config.getTasks().should.be.instanceOf(Array).and.have.length(0);
                should.deepEqual(config.getTasks(), []);
            });
        });
    });

    describe('getters', function () {
        var config;

        before(function () {
            config = new Config();
        });

        it('should return languages', function () {
            config.getLanguages().should.be.instanceOf(Array);
            config.getLanguages().should.have.length(2);
        });

        it('should return logger settings', function () {
            config.getLoggerSettings().should.be.instanceOf(Object);
            config.getLoggerSettings().should.have.property('level');
            config.getLoggerSettings().level.should.equal('debug');
        });

        it('should return model file path', function () {
            config.getModelFilePath().should.be.instanceOf(String);
            config.getModelFilePath().should.equal('./model/model.json');
        });

        it('should return destination folder path', function () {
            config.getDestinationDirPath().should.be.instanceOf(String);
            config.getDestinationDirPath().should.equal('./data');
        });

        it('should return task objects', function () {
            config.getTasks().should.be.instanceOf(Array);
            config.getTasks().should.have.length(13);
        });
    });
});
