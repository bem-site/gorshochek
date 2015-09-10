var fs = require('fs'),
    fsExtra = require('fs-extra'),
    should = require('should'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    DocsLoadFile = require('../../../lib/tasks/docs-file-load');

describe('DocsLoadFile', function () {
    it('should return valid task name', function () {
        DocsLoadFile.getName().should.equal('docs load from file');
    });

    it('should return valid portion size', function () {
        DocsLoadFile.getPortionSize().should.equal(20);
    });

    describe('instance methods', function () {
        var config,
            task;

        beforeEach(function () {
            config = new Config('debug');
            task = new DocsLoadFile(config, {});
            fsExtra.ensureDirSync('./.builder/cache/url1');
            fsExtra.ensureDirSync('./foo/bar');
            fs.writeFileSync('./foo/bar/test-file.md', 'Hello World', { encoding: 'utf-8' });
        });

        afterEach(function () {
            fsExtra.deleteSync('./.builder');
            fsExtra.deleteSync('./foo');
        });

        describe('getCriteria', function () {
            it('should return false on missed language version of page', function () {
                var page = { url: '/url1' };
                task.getCriteria(page, 'en').should.equal(false);
            });

            it('should return false on missed contentFile field for lang version of page', function () {
                var page = { url: '/url1', en: {} };
                task.getCriteria(page, 'en').should.equal(false);
            });

            it('should return false if contentFile value does not match regular expression', function () {
                var page = {
                    url: '/url1',
                    en: {
                        sourceUrl: 'http://github.com/foo/bar'
                    }
                };
                task.getCriteria(page, 'en').should.equal(false);
            });

            it('should return true if contentFile value matches regular expression', function () {
                var page1 = { url: '/url1', en: { sourceUrl: '/foo/bar.md' } },
                    page2 = { url: '/url2', en: { sourceUrl: './foo/bar.md' } },
                    page3 = { url: '/url3', en: { sourceUrl: '../foo/bar.md' } },
                    page4 = { url: '/url4', en: { sourceUrl: '../../foo/bar.md' } };

                task.getCriteria(page1, 'en').should.equal(true);
                task.getCriteria(page2, 'en').should.equal(true);
                task.getCriteria(page3, 'en').should.equal(true);
                task.getCriteria(page4, 'en').should.equal(true);
            });
        });

        describe('_readFile', function () {
            it('should return rejected promise on read file error', function (done) {
                var page = { url: '/url1' },
                    language = 'en';

                task._readFile(page, language, './foo/bar/invalid').catch(function (error) {
                    error.code.should.equal('ENOENT');
                    done();
                });
            });

            it('should return resolved promise on success file read', function (done) {
                var page = { url: '/url1' },
                    language = 'en';

                task._readFile(page, language, './foo/bar/test-file.md').then(function (result) {
                    result.should.equal('Hello World');
                    done();
                });
            });
        });

        describe('processPage', function () {
            var languages = ['en'];

            it('for non-matched local file path', function (done) {
                var page = {
                        url: '/url1',
                        en: { sourceUrl: 'https://github.com/foo/bar.md' }
                    },
                    model = new Model();

                task.processPage(model, page, languages).then(function (page) {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(0);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(0);
                    should(page['en']['contentFile']).equal(undefined);
                    done();
                });
            });

            it('for missed local file', function (done) {
                var page = {
                        url: '/url1',
                        en: { sourceUrl: './foo/bar/invalid' }
                    },
                    model = new Model();

                task.processPage(model, page, languages).then(function (page) {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(0);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(0);
                    should(page['en']['contentFile']).equal(undefined);
                    done();
                });
            });

            it('for new local file', function (done) {
                var page = {
                        url: '/url1',
                        en: { sourceUrl: './foo/bar/test-file.md' }
                    },
                    model = new Model();

                task.processPage(model, page, languages).then(function (page) {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(1);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(0);
                    should(page['en']['contentFile']).equal('/url1/en.md');
                    fs.existsSync('./.builder/cache/url1/en.md').should.equal(true);
                    done();
                });
            });

            it('for modified local file', function (done) {
                var page = {
                        url: '/url1',
                        en: { sourceUrl: './foo/bar/test-file.md' }
                    },
                    model = new Model();

                task.processPage(model, page, languages).then(function (page) {
                    fs.writeFileSync('./foo/bar/test-file.md', 'Hello World 2', { encoding: 'utf-8' });
                    return task.processPage(model, page, languages).then(function (page) {
                        model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(1);
                        model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(1);
                        should(page['en']['contentFile']).equal('/url1/en.md');
                        fs.existsSync('./.builder/cache/url1/en.md').should.equal(true);
                        fs.readFileSync('./.builder/cache/url1/en.md', { encoding: 'utf-8' })
                            .should.be.equal('Hello World 2');
                        done();
                    });
                });
            });

            it('for non-modified local file', function (done) {
                var page = {
                        url: '/url1',
                        en: { sourceUrl: './foo/bar/test-file.md' }
                    },
                    model = new Model();

                task.processPage(model, page, languages).then(function (page) {
                    return task.processPage(model, page, languages).then(function (page) {
                        model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(1);
                        model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(0);
                        should(page['en']['contentFile']).equal('/url1/en.md');
                        fs.existsSync('./.builder/cache/url1/en.md').should.equal(true);
                        fs.readFileSync('./.builder/cache/url1/en.md', { encoding: 'utf-8' })
                            .should.be.equal('Hello World');
                        done();
                    });
                });
            });
        });
    });
});

