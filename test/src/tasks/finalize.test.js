var fs = require('fs'),
    path = require('path'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    Finalize = require('../../../lib/tasks/finalize');

describe('Finalize', function () {
    beforeEach(function () {
        fsExtra.ensureDirSync('./.builder/cache/url1');
        fsExtra.ensureDirSync('./data');

        fs.writeFileSync('./.builder/cache/url1/en.md', 'en md');
        fs.writeFileSync('./.builder/cache/url1/en.meta.json', 'en meta json');
        fs.writeFileSync('./.builder/cache/url1/en.html', 'en html');
    });

    afterEach(function () {
        fsExtra.removeSync('./.builder');
        fsExtra.removeSync('./data');
    });

    it('should return valid task name', function () {
        Finalize.getName().should.equal('finalize');
    });

    describe('instance methods', function () {
        var config,
            model,
            task;

        beforeEach(function () {
            config = new Config('debug');
            task = new Finalize(config, {});
            model = new Model();
            model.setPages([
                {
                    url: '/url1',
                    en: {}
                }
            ]);
        });

        describe('sync cache and data folders', function () {
            it('should create folder in target path', function () {
                return task.run(model).then(function () {
                    fs.existsSync(path.resolve('./data/url1')).should.equal(true);
                });
            });

            it('should create files in target path', function () {
                return task.run(model).then(function () {
                    fs.existsSync(path.resolve('./data/url1/en.md')).should.equal(true);
                    fs.existsSync(path.resolve('./data/url1/en.meta.json')).should.equal(true);
                    fs.existsSync(path.resolve('./data/url1/en.html')).should.equal(true);
                });
            });

            it('should create valid files in target path', function () {
                return task.run(model).then(function () {
                    fs.readFileSync(path.resolve('./data/url1/en.md'), 'utf-8').should.equal('en md');
                    fs.readFileSync(path.resolve('./data/url1/en.meta.json'), 'utf-8').should.equal('en meta json');
                    fs.readFileSync(path.resolve('./data/url1/en.html'), 'utf-8').should.equal('en html');
                });
            });
        });

        describe('task parameters', function () {
            it('should accept and use exclude parameters', function () {
                task = new Finalize(config, { exclude: ['*.md'] });
                return task.run(model).then(function () {
                    fs.existsSync(path.resolve('./data/url1/en.md')).should.equal(false);
                    fs.existsSync(path.resolve('./data/url1/en.meta.json')).should.equal(true);
                    fs.existsSync(path.resolve('./data/url1/en.html')).should.equal(true);
                });
            });
        });

        it('should successfully being saved to data.json file', function () {
            return task.run(model).then(function () {
                fs.existsSync('./data/data.json').should.equal(true);
            });
        });
    });
});
