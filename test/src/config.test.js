var should = require('should'),
    Config = require('../../lib/config');

describe('Config', function () {
    describe('constructor', function () {
        var config;

        it ('success', function () {
            config = new Config('debug');
        });

        describe('default settings after initialization', function () {
            beforeEach(function () {
                config = new Config('debug');
            });

            it('should have default languages set', function () {
                should.deepEqual(config._languages, ['en']);
            });

            it('should have default logger settings', function () {
                should.deepEqual(config._loggerSettings, { level: 'debug' });
            });

            it('should have default path to model file', function () {
                config._modelFilePath.should.equal('./model/model.json');
            });

            it('should have default path to destination data folder', function () {
                config._dataFolder.should.equal('./data');
            });

            it('should have default path to cache folder', function () {
                config._cacheFolder.should.equal('./.builder/cache');
            });
        });
    });

    it('should return valid default settings', function () {
        should.deepEqual(Config.defaults, {
            languages: ['en'],
            modelFilePath: './model/model.json',
            dataFolder: './data',
            cacheFolder: './.builder/cache'
        });
    });

    describe('setters', function () {
        var config;

        beforeEach(function () {
            config = new Config('debug');
        });

        describe('setLanguages', function () {
            it('should set with given value', function () {
                config.setLanguages(['en', 'ru']).should.be.instanceOf(Config);
                config.getLanguages().should.be.instanceOf(Array).and.have.length(2);
                should.deepEqual(config.getLanguages(), ['en', 'ru']);
            });

            it('should set with default value', function () {
                config.setLanguages().should.be.instanceOf(Config);
                config.getLanguages().should.be.instanceOf(Array).and.have.length(1);
                should.deepEqual(config.getLanguages(), ['en']);
            });
        });

        describe('setLoggerSettings', function () {
            it('should set with given value', function () {
                config.setLogLevel('info').should.be.instanceOf(Config);
                config.getLoggerSettings().should.be.instanceOf(Object);
                should.deepEqual(config.getLoggerSettings(), { level: 'info' });
            });

            it('should set with default value', function () {
                config.setLogLevel().should.be.instanceOf(Config);
                config.getLoggerSettings().should.be.instanceOf(Object);
                should.deepEqual(config.getLoggerSettings(), { level: 'debug' });
            });
        });

        describe('setModelFilePath', function () {
            it('should set with given value', function () {
                config.setModelFilePath('./foo/bar.json').should.be.instanceOf(Config);
                config.getModelFilePath().should.be.instanceOf(String);
                config.getModelFilePath().should.equal('./foo/bar.json');
            });

            it('should set with default value', function () {
                config.setModelFilePath().should.be.instanceOf(Config);
                config.getModelFilePath().should.be.instanceOf(String);
                config.getModelFilePath().should.equal('./model/model.json');
            });
        });

        describe('setDataFolder', function () {
            it('should set with given value', function () {
                config.setDataFolder('./data1').should.be.instanceOf(Config);
                config.getDataFolder().should.be.instanceOf(String);
                config.getDataFolder().should.equal('./data1');
            });

            it('should set with default value', function () {
                config.setDataFolder().should.be.instanceOf(Config);
                config.getDataFolder().should.be.instanceOf(String);
                config.getDataFolder().should.equal('./data');
            });
        });

        describe('setCacheFolder', function () {
            it('should set with given value', function () {
                config.setCacheFolder('./cache1').should.be.instanceOf(Config);
                config.getCacheFolder().should.be.instanceOf(String);
                config.getCacheFolder().should.equal('./cache1');
            });

            it('should set with default value', function () {
                config.setCacheFolder().should.be.instanceOf(Config);
                config.getCacheFolder().should.be.instanceOf(String);
                config.getCacheFolder().should.equal('./.builder/cache');
            });
        });
    });

    describe('getters', function () {
        var config;

        beforeEach(function () {
            config = new Config('debug');
        });

        it('should return languages', function () {
            config.getLanguages().should.be.instanceOf(Array);
            config.getLanguages().should.have.length(1);
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

        it('should return destination data folder path', function () {
            config.getDataFolder().should.be.instanceOf(String);
            config.getDataFolder().should.equal('./data');
        });

        it('should return cache folder path', function () {
            config.getCacheFolder().should.be.instanceOf(String);
            config.getCacheFolder().should.equal('./.builder/cache');
        });
    });
});
