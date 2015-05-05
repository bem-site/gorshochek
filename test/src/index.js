var path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Logger = require('bem-site-logger'),
    Config = require('../../lib/config'),
    Builder = require('../../lib/index');

describe('builder', function () {
    before(function () {
        process.chdir(path.resolve(__dirname, '../stub'));
        fsExtra.removeSync('./cache');
        fsExtra.removeSync('./data');
    });

    it('init', function () {
        var builder = new Builder();
        builder.init();

        builder._config.should.be.instanceOf(Config);
        builder._logger.should.be.instanceOf(Logger);
    });

    it('_onSuccess', function () {
        var result = {},
            builder = new Builder();
        builder.init();
        should.deepEqual(builder._onSuccess(result), result);
    });

    it('_onError', function () {
        var error = new Error('error'),
            builder = new Builder();
        builder.init();
        (function () { return builder._onError(error); }).should.throw('error');
    });

    it('run', function (done) {
        var builder = new Builder();
        builder.init();
        builder.run().then(function () {
            // TODO implement more precise test
            done();
        });
    });

    after(function () {
        fsExtra.removeSync('./cache');
        fsExtra.removeSync('./data');
        process.chdir(path.resolve(__dirname, '../../'));
    });
});
