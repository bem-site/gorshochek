var fs = require('fs'),
    fsExtra = require('fs-extra'),
    should = require('should'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    DocsLoadGh = require('../../../lib/tasks/docs-gh-load');

describe('DocsLoadGh', function () {
    it('should return valid task name', function () {
       DocsLoadGh.getName().should.equal('docs load from gh');
    });

    it('should return valid gh url pattern', function () {
        should.deepEqual(DocsLoadGh.getGhUrlPattern(),
            /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/);
    });

    describe('instance methods', function () {
        var config,
            token,
            task;

        before(function () {
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

        describe('_getContentFromGh', function () {
            it('should get valid content of file from gh', function (done) {
                task._getContentFromGh({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method',
                    ref:  'bem-info-data',
                    path: 'method/index/index.en.md'
                }, null).then(function (result) {
                    result.should.be.instanceOf(Object);
                    done();
                });
            });

            it('should return rejected promise in case of invalid repo info', function (done) {
                task._getContentFromGh({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method',
                    ref:  'bem-info-data',
                    path: 'method/index/invalid-path'
                }, null).catch(function (error) {
                    error.should.be.ok;
                    done();
                });
            });
        });

        describe('_getUpdateDateInfo', function () {
            it ('should return resolved promise with null value for disable option', function (done) {
                var task1 = new DocsLoadGh(config, {
                    token: token,
                    updateDate: false,
                    hasIssues: true,
                    getBranch: true
                });

                task1._getUpdateDateInfo({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method',
                    ref:  'bem-info-data',
                    path: 'method/index/index.en.md'
                }, null).then(function (result) {
                    should(result).equal(null);
                    done();
                });
            });

            it('should get valid date of last file commit', function (done) {
                task._getUpdateDateInfo({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method',
                    ref:  'bem-info-data',
                    path: 'method/index/index.en.md'
                }, null).then(function (result) {
                    result.should.be.instanceOf(Number);
                    result.should.be.lessThan(+(new Date()));
                    done();
                });
            });

            it('should return rejected promise in case of invalid repo info', function (done) {
                task._getUpdateDateInfo({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method',
                    ref:  'bem-info-data',
                    path: 'method/index/invalid-path'
                }, null).catch(function (error) {
                    error.should.be.ok;
                    done();
                });
            });
        });

        describe('_getIssuesInfo', function () {
            it ('should return resolved promise with null value for disable option', function (done) {
                var task1 = new DocsLoadGh(config, {
                    token: token,
                    updateDate: true,
                    hasIssues: false,
                    getBranch: true
                });

                task1._getIssuesInfo({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method'
                }, null).then(function (result) {
                    should(result).equal(null);
                    done();
                });
            });

            it('should get valid has_issues repo option value', function (done) {
                task._getIssuesInfo({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method'
                }, null).then(function (result) {
                    result.should.equal(true);
                    done();
                });
            });

            it('should return rejected promise in case of invalid repo info', function (done) {
                task._getIssuesInfo({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method-invalid-path'
                }, null).catch(function (error) {
                    error.should.be.ok;
                    done();
                });
            });
        });

        describe('_getBranch', function () {
            it ('should return resolved promise with null value for disable option', function (done) {
                var task1 = new DocsLoadGh(config, {
                    token: token,
                    updateDate: true,
                    hasIssues: true,
                    getBranch: false
                });

                task1._getBranch({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method'
                }, null).then(function (result) {
                    should(result).equal(null);
                    done();
                });
            });

            it('should valid branch name', function (done) {
                task._getBranch({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method',
                    ref:  'bem-info-data',
                    path: 'method/index/index.en.md'
                }, null).then(function (result) {
                    result.should.equal('bem-info-data');
                    done();
                });
            });

            it('should return rejected error in case of invalid repository info', function () {
                return task._getBranch({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method'
                }, null).catch(function (error) {
                    error.code.should.equal('400');
                    error.message.should.equal('Empty value for parameter \'branch\': undefined');
                });
            });

            it('should return default branch name', function (done) {
                task._getBranch({
                    host: 'github.com',
                    user: 'bem',
                    repo: 'bem-method',
                    ref:  'invalid-ref'
                }, null).then(function (result) {
                    result.should.equal('bem-info-data');
                    done();
                });
            });
        });

        describe('processPage', function () {
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

            before(function () {
                fsExtra.ensureDirSync('./.builder/cache/url1');
            });

            beforeEach(function () {
                model = new Model();
            });

            after(function () {
                fsExtra.deleteSync('./.builder');
            });

            it('should load file from gh and place it to cache at first time', function (done) {
                task.processPage(model, page, languages).then(function () {
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

            it('should load cached file on the next verification', function (done) {
                task.processPage(model, page, languages).then(function () {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(0);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(0);
                    done();
                });
            });

            it('should load cached file if etag was changed but sha sum are equal', function (done) {
                var p = './.builder/cache/url1/en.meta.json',
                    o = { encoding: 'utf-8' },
                    cache = fs.readFileSync(p, o);
                cache = JSON.parse(cache);
                cache.etag = cache.etag + 'a';
                fs.writeFileSync(p, JSON.stringify(cache, null, 4), o);

                task.processPage(model, page, languages).then(function () {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(0);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(0);
                    done();
                });
            });

            it('should reload file if sha sum was changed', function (done) {
                var p = './.builder/cache/url1/en.meta.json',
                    o = { encoding: 'utf-8' },
                    cache = fs.readFileSync(p, o);
                cache = JSON.parse(cache);
                cache.sha = cache.sha + 'a';
                fs.writeFileSync(p, JSON.stringify(cache, null, 4), o);

                task.processPage(model, page, languages).then(function () {
                    model.getChanges().pages.added.should.be.instanceOf(Array).and.have.length(0);
                    model.getChanges().pages.modified.should.be.instanceOf(Array).and.have.length(1);
                    should.deepEqual(model.getChanges().pages.modified,
                        [{ type: 'doc', url: '/url1', title: 'foo bar' }]);
                    done();
                });
            });
        });

        describe('processPage without meta options', function () {
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

            before(function () {
                task1 = new DocsLoadGh(config, {
                    token: token,
                    updateDate: false,
                    hasIssues: false,
                    getBranch: false
                });
                fsExtra.ensureDirSync('./.builder/cache/url1');
            });

            beforeEach(function () {
                model = new Model();
            });

            after(function () {
                fsExtra.deleteSync('./.builder');
            });

            it('should load file from gh and place it to cache at first time', function (done) {
                task1.processPage(model, page, languages).then(function () {
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

