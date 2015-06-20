var fs = require('fs'),
    path = require('path'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    RsyncPages = require('../../../lib/tasks/rsync-pages');

describe('RsyncPages', function () {
    beforeEach(function () {
        fsExtra.ensureDirSync('./.builder/cache/url1');
        fsExtra.ensureDirSync('./data');

        fs.writeFileSync('./.builder/cache/url1/en.md', 'en md');
        fs.writeFileSync('./.builder/cache/url1/en.meta.json', 'en meta json');
        fs.writeFileSync('./.builder/cache/url1/en.html', 'en html');
    });

    afterEach(function () {
        fsExtra.deleteSync('./.builder');
        fsExtra.deleteSync('./data');
    });

    it('should return valid task name', function () {
        RsyncPages.getName().should.equal('synchronize pages with data folder');
    });

    describe('instance methods', function () {
        var config,
            model,
            task;

        beforeEach(function () {
            config = new Config('debug');
            task = new RsyncPages(config, {});
            model = new Model();
        });

        describe('sync cache and data folders', function () {
            it('should create folder in target path', function (done) {
                task.run(model).then(function () {
                    fs.existsSync(path.resolve('./data/url1')).should.equal(true);
                    done();
                });
            });

            it('should create files in target path', function (done) {
                task.run(model).then(function () {
                    fs.existsSync(path.resolve('./data/url1/en.md')).should.equal(true);
                    fs.existsSync(path.resolve('./data/url1/en.meta.json')).should.equal(true);
                    fs.existsSync(path.resolve('./data/url1/en.html')).should.equal(true);
                    done();
                });
            });

            it('should create valid files in target path', function (done) {
                task.run(model).then(function () {
                    fs.readFileSync(path.resolve('./data/url1/en.md'), 'utf-8').should.equal('en md');
                    fs.readFileSync(path.resolve('./data/url1/en.meta.json'), 'utf-8').should.equal('en meta json');
                    fs.readFileSync(path.resolve('./data/url1/en.html'), 'utf-8').should.equal('en html');
                    done();
                });
            });
        });

        describe('task parameters', function () {
            it('should accept and use exclude parameters', function (done) {
                task = new RsyncPages(config, { exclude: ['*.md'] });
                task.run(model).then(function () {
                    fs.existsSync(path.resolve('./data/url1/en.md')).should.equal(false);
                    fs.existsSync(path.resolve('./data/url1/en.meta.json')).should.equal(true);
                    fs.existsSync(path.resolve('./data/url1/en.html')).should.equal(true);
                    done();
                });
            });

            /*
            it('should accept and use include parameters', function (done) {
                task = new RsyncPages(config, { exclude: ['*.md', '*.json'], include: ['*.meta.json'] });
                task.run(model).then(function () {
                    fs.existsSync(path.resolve('./data/url1/en.md')).should.equal(false);
                    fs.existsSync(path.resolve('./data/url1/en.meta.json')).should.equal(true);
                    fs.existsSync(path.resolve('./data/url1/en.html')).should.equal(true);
                    done();
                });
            });
            */
        });
    });
});
