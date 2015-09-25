var fs = require('fs'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    DocsMdHtml = require('../../../lib/tasks/docs-md-html');

describe('DocsMdHtml', function () {
    it('should return valid task name', function () {
        DocsMdHtml.getName().should.equal('docs markdown to html');
    });

    describe('instance methods', function () {
        var config,
            task;

        beforeEach(function () {
            config = new Config('debug');
            task = new DocsMdHtml(config, {});

            fsExtra.ensureDirSync('./.builder/cache/url1');
            fs.writeFileSync('./.builder/cache/url1/en.md', 'Hello World', { encoding: 'utf-8' });
        });

        afterEach(function () {
            fsExtra.removeSync('./.builder');
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
                        contentFile: '/foo/bar.json'
                    }
                };
                task.getCriteria(page, 'en').should.equal(false);
            });

            it('should return true if contentFile value matches regular expression', function () {
                var page = {
                    url: '/url1',
                    en: {
                        contentFile: '/foo/bar.md'
                    }
                };
                task.getCriteria(page, 'en').should.equal(true);
            });
        });

        describe('_mdToHtml', function () {
            var page = { url: '/url1' },
                language = 'en';

            it('should successfully parse markdown to html', function (done) {
                task._mdToHtml(page, language, '# Hello World').then(function (html) {
                    html.should.equal(
                        '<h1 id="hello-world"><a href="#hello-world" class="anchor"></a>Hello World</h1>\n');
                    done();
                });
            });

            it('should return  rejected promise on missed markdown source', function (done) {
                task._mdToHtml(page, language, null).catch(function (error) {
                    error.message.should.equal('Markdown string should be passed in arguments');
                    done();
                });
            });
        });

        describe('processPage', function () {
            var languages = ['en'];

            it('for non-md content file', function (done) {
                var page = {
                        url: '/url1',
                        en: { contentFile: '/url1/en.json' }
                    },
                    model = new Model();

                task.processPage(model, page, languages).then(function (page) {
                    page['en'].contentFile.should.equal('/url1/en.json');
                    fs.existsSync('./.builder/cache/url1/en.html', { encoding: 'utf-8' }).should.equal(false);
                    done();
                });
            });

            it('should successfully transform *.md to *.html file via marked', function (done) {
                var page = {
                        url: '/url1',
                        en: { contentFile: '/url1/en.md' }
                    },
                    model = new Model();

                task.processPage(model, page, languages).then(function (page) {
                    page['en'].contentFile.should.equal('/url1/en.html');
                    fs.existsSync('./.builder/cache/url1/en.html', { encoding: 'utf-8' }).should.equal(true);
                    done();
                });
            });
        });
    });
});
