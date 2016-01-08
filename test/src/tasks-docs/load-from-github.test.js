var fs = require('fs'),
    fsExtra = require('fs-extra'),
    Q = require('q'),
    _ = require('lodash'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    GithubAPI = require('../../../lib/tasks-docs/github'),
    DocsLoadGithub = require('../../../lib/tasks-docs/load-from-github');

describe('DocsLoadGithub', function() {
    var sandbox = sinon.sandbox.create(),
        task = new DocsLoadGithub(new Config('debug'), {}),
        model;

    beforeEach(function() {
        sandbox.stub(fsExtra);
        sandbox.stub(task, 'readFileFromCache');
        sandbox.stub(task, 'writeFileToCache');
        model = new Model();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid task name', function() {
        DocsLoadGithub.getName().should.equal('docs load from github');
    });

    it('should initialize github API on task creation', function() {
        task.getAPI().should.be.instanceof(GithubAPI);
    });

    describe('getCriteria', function() {
        it('should return false on missed sourceUrl field of page', function() {
            var page = {url: '/url1'};
            task.getCriteria(page).should.equal(false);
        });

        it('should return false if sourceUrl value does not match regular expression', function() {
            var page = {
                url: '/url1',
                sourceUrl: '//foo/bar'
            };
            task.getCriteria(page).should.equal(false);
        });

        describe('sourceUrl matches on task criteria', function() {
            it('should match on file path like a "http://github.com/org/user/blob/ref/path"', function() {
                var page = {url: '/url', sourceUrl: 'http://github.com/org/user/blob/ref/path'};
                task.getCriteria(page).should.equal(true);
            });

            it('should match on file path like a "https://github.com/org/user/blob/ref/path"', function() {
                var page = {url: '/url', sourceUrl: 'https://github.com/org/user/blob/ref/path'};
                task.getCriteria(page).should.equal(true);
            });

            it('should match on file path like a "http://github.com/org/user/tree/ref/path"', function() {
                var page = {url: '/url', sourceUrl: 'http://github.com/org/user/tree/ref/path'};
                task.getCriteria(page).should.equal(true);
            });

            it('should match on file path like a "https://github.com/org/user/tree/ref/path"', function() {
                var page = {url: '/url', sourceUrl: 'https://github.com/org/user/tree/ref/path'};
                task.getCriteria(page).should.equal(true);
            });
        });
    });

    describe('processPage', function() {
        var page,
            githubStubRes = {meta: {}, name: 'some-name.ext', sha: 'some-sha', content: 'some-content'};

        beforeEach(function() {
            task.writeFileToCache.returns(Q());
            page = {url: '/url', sourceUrl: 'https://github.com/org/user/blob/ref/path.ext'};
        });

        it('should load file from github via github API', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            sandbox.stub(task.getAPI(), 'getContent').returns(Q(githubStubRes));
            return task.processPage(model, page).then(function() {
                task.getAPI().getContent.should.be.calledOnce;
            });
        });

        it('should save loaded file to cache by valid path', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            sandbox.stub(task.getAPI(), 'getContent').returns(Q(githubStubRes));
            return task.processPage(model, page).then(function() {
                task.writeFileToCache.should.be.calledWithMatch('/url/index.ext');
            });
        });

        it('should mark loaded doc as added', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            sandbox.stub(task.getAPI(), 'getContent').returns(Q(githubStubRes));
            return task.processPage(model, page).then(function() {
                model.getChanges().pages.added.should.have.length(1);
            });
        });

        it('should set valid value to "contentFile" field', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            sandbox.stub(task.getAPI(), 'getContent').returns(Q(githubStubRes));
            return task.processPage(model, page).then(function() {
                page.contentFile.should.equal('/url/index.ext');
            });
        });

        it('should return fulfilled promise with page value', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            sandbox.stub(task.getAPI(), 'getContent').returns(Q(githubStubRes));
            return task.processPage(model, page).then(function(_page) {
                _page.url.should.equal(page.url);
                _page.sourceUrl.should.equal(page.sourceUrl);
            });
        });

        it('should save valid meta.json file to cache', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            sandbox.stub(task.getAPI(), 'getContent')
                .returns(Q(_.extend({}, githubStubRes, {meta: {etag: 'some-etag'}})));
            return task.processPage(model, page).then(function() {
                var expectedContent = JSON.stringify({
                    etag: 'some-etag',
                    sha: 'some-sha',
                    fileName: '/url/index.ext'
                }, null, 4);
                task.writeFileToCache.firstCall.should.be.calledWith('/url/index.meta.json', expectedContent);
            });
        });

        it('should skip loading if github return 304 status code', function() {
            task.readFileFromCache.returns(Q({}));
            sandbox.stub(task.getAPI(), 'getContent')
                .returns(Q(_.extend({}, githubStubRes, {meta: {etag: 'some-etag', status: '304 Not Modified'}})));
            return task.processPage(model, page).then(function() {
                model.getChanges().pages.added.should.have.length(0);
                model.getChanges().pages.modified.should.have.length(0);
            });
        });

        it('should skip loading if sha sums of github and cache files are equal', function() {
            task.readFileFromCache.returns(Q({sha: 'some-sha'}));
            sandbox.stub(task.getAPI(), 'getContent')
                .returns(Q(_.extend({}, githubStubRes)));
            return task.processPage(model, page).then(function() {
                model.getChanges().pages.added.should.have.length(0);
                model.getChanges().pages.modified.should.have.length(0);
            });
        });

        it('should load file from github if it was modified', function() {

        });

        it('should mark doc as modified if it was modified and reloaded', function() {
            task.readFileFromCache.returns(Q({sha: 'some-another-sha'}));
            sandbox.stub(task.getAPI(), 'getContent')
                .returns(Q(_.extend({}, githubStubRes)));
            return task.processPage(model, page).then(function() {
                model.getChanges().pages.modified.should.have.length(1);
            });
        });

        it('should have "updateDate" field with null value if "updateDate" option was not set', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            sandbox.stub(task.getAPI(), 'getContent').returns(Q(githubStubRes));
            return task.processPage(model, page).then(function() {
                (page.updateDate == null).should.equal(true);
            });
        });

        it('should have "hasIssues" field with null value if "hasIssues" option was not set', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            sandbox.stub(task.getAPI(), 'getContent').returns(Q(githubStubRes));
            return task.processPage(model, page).then(function() {
                (page.hasIssues == null).should.equal(true);
            });
        });

        it('should have "branch" field with null value if "branch" option was not set', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            sandbox.stub(task.getAPI(), 'getContent').returns(Q(githubStubRes));
            return task.processPage(model, page).then(function() {
                (page.branch == null).should.equal(true);
            });
        });
    });
});
