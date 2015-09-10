var should = require('should'),
    Config = require('../../lib/config'),
    Builder = require('../../lib/index'),
    Init = require('../../lib/tasks/init');

describe('Builder', function () {
    it('constructor', function () {
        var builder = new Builder('debug');
        builder.getConfig().should.be.ok;
        builder.logger.should.be.ok;
        builder.getTasks().should.be.instanceOf(Array).and.have.length(0);
    });

    it('static constructor', function () {
        var builder = Builder.init('debug');
        builder.getConfig().should.be.ok;
        builder.logger.should.be.ok;
        builder.getTasks().should.be.instanceOf(Array).and.have.length(0);
    });

    describe('private methods', function () {
        var builder;

        beforeEach(function () {
            builder = new Builder('debug');
        });

        it('_onSuccess', function () {
            var result = {};
            should.deepEqual(builder._onSuccess(result), result);
        });

        it('_onError', function () {
            var error = new Error('error');
            (function () { return builder._onError(error); }).should.throw('error');
        });
    });

    describe('public methods', function () {
        var builder;

        beforeEach(function () {
            builder = new Builder('debug');
        });

        it('getConfig', function () {
            builder.getConfig().should.be.ok;
            builder.getConfig().should.be.instanceOf(Config);
        });

        it('getTasks', function () {
            builder.getTasks().should.be.instanceOf(Array);
            builder.getTasks().should.have.length(0);
        });

        describe('setLanguages', function () {
            it('should return builder', function () {
                builder.setLanguages(['en', 'ru']).should.be.instanceOf(Builder);
            });

            it('should override languages configuration', function () {
                builder.setLanguages(['en', 'ru']);
                should.deepEqual(builder.getConfig().getLanguages(), ['en', 'ru']);
            });
        });

        describe('setCacheFolder', function () {
            it('should return builder', function () {
                builder.setCacheFolder('./cache').should.be.instanceOf(Builder);
            });

            it('should override cache folder', function () {
                builder.setCacheFolder('./foo');
                builder.getConfig().getCacheFolder().should.equal('./foo');
            });
        });

        describe('setDataFolder', function () {
            it('should return builder', function () {
                builder.setDataFolder('./foo').should.be.instanceOf(Builder);
            });

            it('should override data folder', function () {
                builder.setDataFolder('./foo');
                builder.getConfig().getDataFolder().should.equal('./foo');
            });
        });

        describe('setModelFilePath', function () {
            it('should return builder', function () {
                builder.setModelFilePath('./foo/bar.json').should.be.instanceOf(Builder);
            });

            it('should override model file path', function () {
                builder.setModelFilePath('./foo/bar.json');
                builder.getConfig().getModelFilePath().should.equal('./foo/bar.json');
            });
        });

        describe('addTask', function () {
            it('should return builder', function () {
                builder.addTask(Init, { path: './path1' }).should.be.instanceOf(Builder);
            });

            it('should add task to the execution queue', function () {
                builder.addTask(Init, { path: './path1' });
                builder.getTasks().should.be.instanceOf(Array).and.have.length(1);
            });
        });
    });

    it('run', function (done) {
        var builder = new Builder('debug');
        builder.run().then(function () {
            // TODO implement more precise test
            done();
        });
    });
});
