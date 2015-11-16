var Config = require('../../lib/config');

describe('Config', function() {
    var config;

    beforeEach(function() {
        config = new Config('debug');
    });

    it('should have default languages set', function() {
        config.getLanguages().should.be.eql(['en']);
    });

    it('should have default logger settings', function() {
        config.getLoggerSettings().should.be.eql({level: 'debug'});
    });

    it('should have default path to model file', function() {
        config.getModelFilePath().should.be.equal('./model/model.json');
    });

    it('should have default path to destination data folder', function() {
        config.getDataFolder().should.be.equal('./data');
    });

    it('should have default path to cache folder', function() {
        config.getCacheFolder().should.be.equal('./.builder/cache');
    });

    it('should return valid default settings', function() {
        Config.defaults.should.be.eql({
            languages: ['en'],
            modelFilePath: './model/model.json',
            dataFolder: './data',
            cacheFolder: './.builder/cache'
        });
    });

    describe('method setLanguages', function() {
        it('should can be used in chain', function() {
            config.setLanguages().should.be.instanceof(Config);
        });

        it('should set with given value', function() {
            config.setLanguages(['en', 'ru']);
            config.getLanguages().should.be.eql(['en', 'ru']);
        });

        it('should set with default value', function() {
            config.setLanguages();
            config.getLanguages().should.be.eql(['en']);
        });
    });

    describe('method setLoggerSettings', function() {
        it('should can be used in chain', function() {
            config.setLogLevel().should.be.instanceof(Config);
        });

        it('should set with given value', function() {
            config.setLogLevel('info');
            config.getLoggerSettings().should.be.eql({level: 'info'});
        });

        it('should set with default value', function() {
            config.setLogLevel();
            config.getLoggerSettings().should.be.eql({level: 'debug'});
        });
    });

    describe('method setModelFilePath', function() {
        it('should can be used in chain', function() {
            config.setModelFilePath().should.be.instanceof(Config);
        });

        it('should set with given value', function() {
            config.setModelFilePath('./foo/bar.json');
            config.getModelFilePath().should.be.equal('./foo/bar.json');
        });

        it('should set with default value', function() {
            config.setModelFilePath();
            config.getModelFilePath().should.be.equal('./model/model.json');
        });
    });

    describe('setDataFolder', function() {
        it('should can be used in chain', function() {
            config.setDataFolder().should.be.instanceOf(Config);
        });

        it('should set with given value', function() {
            config.setDataFolder('./data1');
            config.getDataFolder().should.be.equal('./data1');
        });

        it('should set with default value', function() {
            config.setDataFolder();
            config.getDataFolder().should.be.equal('./data');
        });
    });

    describe('setCacheFolder', function() {
        it('should can be used in chain', function() {
            config.setCacheFolder().should.be.instanceOf(Config);
        })

        it('should set with given value', function() {
            config.setCacheFolder('./cache1');
            config.getCacheFolder().should.equal('./cache1');
        });

        it('should set with default value', function() {
            config.setCacheFolder();
            config.getCacheFolder().should.equal('./.builder/cache');
        });
    });
});
