var fs = require('fs'),
    fsExtra = require('fs-extra'),
    should = require('should'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    DocsLoadGh = require('../../../lib/tasks/docs-gh-load');

describe('DocsLoadGh', function() {
    it('should return valid task name', function() {
       DocsLoadGh.getName().should.equal('docs load from gh');
    });

    it('should return valid gh url pattern', function() {
        should.deepEqual(DocsLoadGh.getGhUrlPattern(),
            /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/);
    });

    describe('instance methods', function() {
        var config,
            token,
            task;

        before(function() {
            token = [
                '92c5', 'a62f', '7ae4', '4c16', '40ed',
                '1195', 'd448', '4689', '669c', '5caa'
            ].join('');

            config = new Config('debug');
            task = new DocsLoadGh(config, {
                token: token,
                updateDate: true,
                hasIssues: true,
                getBranch: true
            });
        });

        it('_getAPI', function() {
            task.getAPI().should.be.instanceOf(Github);
        });

        describe('getCriteria', function() {
            it('should return false for missed lang version of page', function() {
                var page = {
                    url: '/url1'
                };
                task.getCriteria(page, 'en').should.equal(false);
            });

            it('should return false for missed sourceUrl field', function() {
                var page = {
                    url: '/url1',
                    en: {}
                };
                task.getCriteria(page, 'en').should.equal(false);
            });

            it('should return false if sourceUrl field does not match criteria', function() {
                var page = {
                    url: '/url1',
                    en: {
                        sourceUrl: '/foo/bar'
                    }
                };
                task.getCriteria(page, 'en').should.equal(false);
            });

            it('should return valid repository info object', function() {
                var page = {
                    url: '/url1',
                    en: {
                        sourceUrl: 'https://github.com/bem/bem-method/tree/bem-info-data/method/index/index.en.md'
                    }
                };
                should.deepEqual(task.getCriteria(page, 'en'), {
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method',
                    ref:  'bem-info-data',
                    path: 'method/index/index.en.md'
                });
            });
        });

        describe('getHeadersByCache', function() {
            it('should return header object', function() {
                should.deepEqual(task.getHeadersByCache({ etag: '123456789abcdef' }),
                    { 'If-None-Match': '123456789abcdef' });
            });

            it('should return null in case of missing etag', function() {
                should(task.getHeadersByCache({})).equal(null);
                should(task.getHeadersByCache()).equal(null);
            });
        });

        describe('processPage', function() {
            var model,
                languages = ['en', 'ru'],
                page = {
                    url: '/url1',
                    en: {
                        title: 'foo bar',
                        sourceUrl: 'https://github.com/bem/bem-method/tree/bem-info-data/method/index/index.en.md'
                    },
                    ru: {}
                };

            before(function() {
                fsExtra.ensureDirSync('./.builder/cache/url1');
            });

            beforeEach(function() {
                model = new Model();
            });

            after(function() {
                fsExtra.removeSync('./.builder');
            });

            it('should load file from gh and place it to cache at first time', function(done) {
                task.processPage(model, page, languages).then(function() {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(1);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(0);
                    should.deepEqual(model.getChanges().pages.added,
                        [{ type: 'doc', url: '/url1', title: 'foo bar' }]);
                    page['en'].contentFile.should.equal('/url1/en.md');
                    fs.existsSync('.builder/cache/url1/en.meta.json').should.equal(true);
                    fs.existsSync('.builder/cache/url1/en.md').should.equal(true);
                    done();
                });
            });

            it('should load cached file on the next verification', function(done) {
                task.processPage(model, page, languages).then(function() {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(0);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(0);
                    done();
                });
            });

            it('should load cached file if etag was changed but sha sum are equal', function(done) {
                var p = './.builder/cache/url1/en.meta.json',
                    o = { encoding: 'utf-8' },
                    cache = fs.readFileSync(p, o);
                cache = JSON.parse(cache);
                cache.etag = cache.etag + 'a';
                fs.writeFileSync(p, JSON.stringify(cache, null, 4), o);

                task.processPage(model, page, languages).then(function() {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(0);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(0);
                    done();
                });
            });

            it('should reload file if sha sum was changed', function(done) {
                var p = './.builder/cache/url1/en.meta.json',
                    o = { encoding: 'utf-8' },
                    cache = fs.readFileSync(p, o);
                cache = JSON.parse(cache);
                cache.sha = cache.sha + 'a';
                fs.writeFileSync(p, JSON.stringify(cache, null, 4), o);

                task.processPage(model, page, languages).then(function() {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(0);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(1);
                    should.deepEqual(model.getChanges().pages.modified,
                        [{ type: 'doc', url: '/url1', title: 'foo bar' }]);
                    done();
                });
            });
        });

        describe('processPage without meta options', function() {
            var model,
                languages = ['en', 'ru'],
                page = {
                    url: '/url1',
                    en: {
                        title: 'foo bar',
                        sourceUrl: 'https://github.com/bem/bem-method/tree/bem-info-data/method/index/index.en.md'
                    },
                    ru: {}
                },
                task1;

            before(function() {
                task1 = new DocsLoadGh(config, {
                    token: token,
                    updateDate: false,
                    hasIssues: false,
                    getBranch: false
                });
                fsExtra.ensureDirSync('./.builder/cache/url1');
            });

            beforeEach(function() {
                model = new Model();
            });

            after(function() {
                fsExtra.removeSync('./.builder');
            });

            it('should load file from gh and place it to cache at first time', function(done) {
                task1.processPage(model, page, languages).then(function() {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(1);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(0);
                    should.deepEqual(model.getChanges().pages.added,
                        [{ type: 'doc', url: '/url1', title: 'foo bar' }]);
                    page['en'].contentFile.should.equal('/url1/en.md');
                    fs.existsSync('./.builder/cache/url1/en.meta.json').should.equal(true);
                    fs.existsSync('./.builder/cache/url1/en.md').should.equal(true);
                    done();
                });
            });
        });
    });
});

