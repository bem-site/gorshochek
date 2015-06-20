var fs = require('fs'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    MakePagesCache = require('../../../lib/tasks/make-pages-cache');

describe('MakePagesCache', function () {
    beforeEach(function () {
        fsExtra.ensureDirSync('./cache');
    });

    afterEach(function () {
        fsExtra.deleteSync('./cache');
    });

    it('should return valid task name', function () {
        MakePagesCache.getName().should.equal('make pages cache folders');
    });

    describe('instance methods', function () {
        var config,
            model,
            task;

        before(function () {
            config = new Config('debug'),
                task = new MakePagesCache(config, {}),
                model = new Model();

            config.setCacheFolder('./cache');
            model.setPages([
                {
                    url: '/foo1/bar1',
                    en: {}
                },
                {
                    url: '/foo2/bar2',
                    en: {}
                }
            ]);
        });

        describe('_makeFolder', function () {
            it('should successfully create cache folder for page', function (done) {
                task._makeFolder({ url: '/foo' }).then(function () {
                    fs.existsSync('./cache/foo').should.equal(true);
                    done();
                });
            });

            it('should reject on empty page.url', function (done) {
                task._makeFolder({}).catch(function (error) {
                    error.message.should.equal('Arguments to path.join must be strings');
                    fs.existsSync('./cache/foo').should.equal(false);
                    done();
                });
            });
        });

        describe('run', function () {
            it('should successfully create cache sub-folders', function (done) {
                task.run(model)
                    .then(function () {
                        fs.existsSync('./cache/foo1/bar1').should.equal(true);
                        fs.existsSync('./cache/foo2/bar2').should.equal(true);
                        done();
                    });
            });
        });
    });
});
