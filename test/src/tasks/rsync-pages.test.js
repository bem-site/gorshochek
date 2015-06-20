var fs = require('fs'),
    mockFs = require('mock-fs'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    RsyncPages = require('../../../lib/tasks/rsync-pages');

describe('RsyncPages', function () {
    beforeEach(function () {
        mockFs({
            '.builder': {
                cache: {
                    url1: {
                        'en.md': 'en md',
                        'en.json': 'en json',
                        'en.html': 'en html'
                    }
                }
            },
            data: {}
        });
    });

    afterEach(function () {
        mockFs.restore();
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
                    fs.existsSync(path.resolve('./data/url1/en.json')).should.equal(true);
                    fs.existsSync(path.resolve('./data/url1/en.html')).should.equal(true);
                    done();
                });
            });

            it('should create valid files in target path', function () {
                task.run(model).then(function () {
                    fs.readFileSync(path.resolve('./data/url1/en.md'), 'utf-8').should.equal('en md');
                    fs.readFileSync(path.resolve('./data/url1/en.json'), 'utf-8').should.equal('en json');
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
                    fs.existsSync(path.resolve('./data/url1/en.json')).should.equal(true);
                    fs.existsSync(path.resolve('./data/url1/en.html')).should.equal(true);
                    done();
                });
            });

            it('should accept and use include parameters', function (done) {
                task = new RsyncPages(config, { exclude: ['*.md', '*.json'], include: ['*.json'] });
                task.run(model).then(function () {
                    fs.existsSync(path.resolve('./data/url1/en.md')).should.equal(false);
                    fs.existsSync(path.resolve('./data/url1/en.json')).should.equal(true);
                    fs.existsSync(path.resolve('./data/url1/en.html')).should.equal(true);
                    done();
                });
            });
        });
    });
});
