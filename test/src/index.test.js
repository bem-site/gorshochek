var Config = require('../../lib/config'),
    Builder = require('../../lib/index'),
    Init = require('../../lib/tasks-core/init');

describe('Builder', function() {
    var sandbox = sinon.sandbox.create(),
        builder;

    beforeEach(function() {
        builder = new Builder('debug');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should has config instance available by getConfig() method', function() {
        builder.getConfig().should.be.instanceOf(Config);
    });

    it('should has empty array of tasks after initialization', function() {
        builder.getTasks().should.be.instanceOf(Array).and.be.empty;
    });

    describe('setLanguages', function() {
        it('should return instance of Builder class', function() {
            builder.setLanguages(['en', 'ru']).should.be.instanceof(Builder);
        });

        it('should override default languages configuration', function() {
            builder.setLanguages(['en', 'ru']);
            builder.getConfig().getLanguages().should.eql(['en', 'ru']);
        });
    });

    describe('setCacheFolder', function() {
        it('should return instance of Builder class', function() {
            builder.setCacheFolder('./cache').should.be.instanceof(Builder);
        });

        it('should override default path to cache folder', function() {
            builder.setCacheFolder('./foo');
            builder.getConfig().getCacheFolder().should.be.equal('./foo');
        });
    });

    describe('setDataFolder', function() {
        it('should return instance of Builder class', function() {
            builder.setDataFolder('./foo').should.be.instanceof(Builder);
        });

        it('should override default path to data folder', function() {
            builder.setDataFolder('./foo');
            builder.getConfig().getDataFolder().should.equal('./foo');
        });
    });

    describe('setModelFilePath', function() {
        it('should return instance of Builder class', function() {
            builder.setModelFilePath('./foo/bar.json').should.be.instanceof(Builder);
        });

        it('should override default model file path', function() {
            builder.setModelFilePath('./foo/bar.json');
            builder.getConfig().getModelFilePath().should.equal('./foo/bar.json');
        });
    });

    describe('addTask', function() {
        it('should return instance of Builder class', function() {
            builder.addTask(Init, {path: './path1'}).should.be.instanceof(Builder);
        });

        it('should add task to the execution queue', function() {
            builder.addTask(Init, {path: './path1'});
            builder.getTasks().should.be.instanceof(Array).and.have.length(1);
        });
    });
});
