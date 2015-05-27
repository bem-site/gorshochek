var fs = require('fs'),
    mockFs = require('mock-fs'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    MakePagesCache = require('../../../lib/tasks/make-pages-cache');

describe('MakePagesCache', function () {
    beforeEach(function () {
        mockFs({
            cache: {}
        });
    });

    afterEach(function () {
        mockFs.restore();
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

        describe('run', function () {
            it('should successfully create cache sub-folders', function (done) {
                task.run(model)
                    .then(function () {
                        fs.existsSync('./cache/foo1/bar1').should.equal(true);
                        fs.existsSync('./cache/foo2/bar2').should.equal(true);
                        done();
                    });

            });

            //it('should fail if data folder does not exists', function (done) {
            //    fs.rmdirSync('./data');
            //    task.run(model).catch(function (error) {
            //        error.code.should.equal('ENOENT');
            //        done();
            //    });
            //});
        });
    });
});
