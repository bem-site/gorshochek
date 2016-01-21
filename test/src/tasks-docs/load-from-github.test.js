var Q = require('q'),
    _ = require('lodash'),
    Model = require('../../../lib/model'),
    baseUtil = require('../../../lib/util'),
    GithubAPI = require('../../../lib/tasks/docs/github'),
    loadFromGithub = require('../../../index').tasks.docs.loadFromGithub;

describe('tasks-docs/load-from-github', function() {
    var pageStub = {
            url: '/url',
            sourceUrl: 'https://github.com/org/user/blob/ref/path.ext'
        },
        githubStubRes = {
            meta: {},
            name: 'some-name.ext',
            sha: 'some-sha',
            content: 'some-content'
        },
        sandbox = sinon.sandbox.create(),
        githubGetContentStub,
        githubGetCommitsStub,
        githubGetStub,
        githubGetBranchStub,
        model;

    beforeEach(function() {
        sandbox.stub(console, 'warn');
        sandbox.stub(baseUtil, 'readFileFromCache').returns(Q.reject('Error'));
        sandbox.stub(baseUtil, 'writeFileToCache').returns(Q());

        var githubStub = sandbox.stub(GithubAPI.prototype, 'executeAPIMethod')
        githubGetContentStub = githubStub.withArgs('getContent').yields(null, githubStubRes);
        githubGetCommitsStub = githubStub.withArgs('getCommits');
        githubGetStub = githubStub.withArgs('get');
        githubGetBranchStub = githubStub.withArgs('getBranch');
        model = new Model();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return function as result', function() {
        loadFromGithub(model).should.be.instanceOf(Function);
    });

    it('should not process pages without "sourceUrl" property', function() {
        model.setPages([{url: '/url1'}]);
        return loadFromGithub(model)().then(function() {
            githubGetContentStub.should.not.be.called;
        });
    });

    it('should not process page if "sourceUrl" value does not match github url regular expression', function() {
        model.setPages([{url: '/url1', sourceUrl: '//foo/bar'}]);
        return loadFromGithub(model)().then(function() {
            githubGetContentStub.should.not.be.called;
        });
    });

    describe('sourceUrl matches github url criteria', function() {
        function testAsseptedSourceUrl(url) {
            model.setPages([{url: '/url', sourceUrl: url}]);
            return loadFromGithub(model)().then(function() {
                githubGetContentStub.should.be.calledOnce;
            });
        }

        it('should process page with sourceUrl like a "http://github.com/org/user/blob/ref/path"', function() {
            return testAsseptedSourceUrl('http://github.com/org/user/blob/ref/path');
        });

        it('should process page with sourceUrl like a "https://github.com/org/user/blob/ref/path"', function() {
            return testAsseptedSourceUrl('https://github.com/org/user/blob/ref/path');
        });

        it('should process page with sourceUrl like "http://github.com/org/user/tree/ref/path"', function() {
            return testAsseptedSourceUrl('http://github.com/org/user/tree/ref/path');
        });

        it('should process page with sourceUrl like "https://github.com/org/user/tree/ref/path"', function() {
            return testAsseptedSourceUrl('https://github.com/org/user/tree/ref/path');
        });
    });

    it('should load file from github via github API', function() {
        model.setPages([_.extend({}, pageStub)]);
        return loadFromGithub(model)().then(function() {
            githubGetContentStub.should.be.calledOnce;
        });
    });

    it('should save loaded file to cache by valid path', function() {
        model.setPages([_.extend({}, pageStub)]);
        return loadFromGithub(model)().then(function() {
            baseUtil.writeFileToCache.secondCall.should.be.calledWithMatch('/url/index.ext');
        });
    });

    it('should mark loaded doc as added', function() {
        model.setPages([_.extend({}, pageStub)]);
        return loadFromGithub(model)().then(function() {
            model.getChanges().added.should.have.length(1);
        });
    });

    it('should set valid value to "contentFile" field', function() {
        model.setPages([_.extend({}, pageStub)]);
        return loadFromGithub(model)().then(function() {
            model.getPages()[0].contentFile.should.equal('/url/index.ext');
        });
    });

    it('should save valid meta.json file to cache', function() {
        model.setPages([_.extend({}, pageStub)]);
        githubGetContentStub.yields(null, _.extend({}, githubStubRes, {meta: {etag: 'some-etag'}}));
        return loadFromGithub(model)().then(function() {
            var expectedContent = JSON.stringify({
                etag: 'some-etag',
                sha: 'some-sha',
                fileName: '/url/index.ext'
            }, null, 4);
            baseUtil.writeFileToCache.firstCall.should.be.calledWith('/url/index.meta.json', expectedContent);
        });
    });

    it('should skip loading if github return 304 status code', function() {
        model.setPages([_.extend({}, pageStub)]);
        baseUtil.readFileFromCache.returns(Q({}));
        githubGetContentStub
            .yields(_.extend({}, githubStubRes, {meta: {etag: 'some-etag', status: '304 Not Modified'}}));
        return loadFromGithub(model)().then(function() {
            model.getChanges().added.should.be.empty;
            model.getChanges().modified.should.be.empty;
        });
    });

    it('should skip loading if sha sums of github and cache files are equal', function() {
        model.setPages([_.extend({}, pageStub)]);
        baseUtil.readFileFromCache.returns(Q({sha: 'some-sha'}));
        return loadFromGithub(model)().then(function() {
            model.getChanges().added.should.be.empty;
            model.getChanges().modified.should.be.empty;
        });
    });

    it('should mark doc as modified if it was modified and reloaded', function() {
        model.setPages([_.extend({}, pageStub)]);
        baseUtil.readFileFromCache.returns(Q({sha: 'some-another-sha'}));

        return loadFromGithub(model)().then(function() {
            model.getChanges().modified.should.have.length(1);
        });
    });

    it('should have "updateDate" field with null value if "updateDate" option was not set', function() {
        model.setPages([_.extend({}, pageStub)]);

        return loadFromGithub(model)().then(function() {
            (model.getPages()[0].updateDate == null).should.equal(true);
        });
    });

    it('should have "hasIssues" field with null value if "hasIssues" option was not set', function() {
        model.setPages([_.extend({}, pageStub)]);

        return loadFromGithub(model)().then(function() {
            (model.getPages()[0].hasIssues == null).should.equal(true);
        });
    });

    it('should have "branch" field with null value if "branch" option was not set', function() {
        model.setPages([_.extend({}, pageStub)]);

        return loadFromGithub(model)().then(function() {
            (model.getPages()[0].branch == null).should.equal(true);
        });
    });

    it('should receive last update date of doc if "updateDate" option was set', function() {
        var expected = (new Date()).getTime();
        model.setPages([_.extend({}, pageStub)]);
        githubGetCommitsStub.yields(null, [{commit: {committer: {date: expected}}}]);

        return loadFromGithub(model, {updateDate: true})().then(function() {
            model.getPages()[0].updateDate.should.equal(expected);
        });
    });

    it('should set update date to null if "updateDate" option was set but error was occured on commits loading',
        function() {
            model.setPages([_.extend({}, pageStub)]);
            githubGetCommitsStub.yields(new Error());

            return loadFromGithub(model, {updateDate: true})().then(function() {
                (model.getPages()[0].updateDate == null).should.equal(true);
            });
    });

    it('should set update date to null if "updateDate" option was set but source has not any commits',
        function() {
            model.setPages([_.extend({}, pageStub)]);
            githubGetCommitsStub.yields(null, []);

            return loadFromGithub(model, {updateDate: true})().then(function() {
                (model.getPages()[0].updateDate == null).should.equal(true);
            });
        });

    it('should receive info about issues section of repo if "hasIssues" option was set', function() {
        model.setPages([_.extend({}, pageStub)]);
        githubGetStub.yields(null, {has_issues: true});

        return loadFromGithub(model, {hasIssues: true})().then(function() {
            model.getPages()[0].hasIssues.should.equal(true);
        });
    });

    it('should set hasIssues value to null if "hasIssues" option was set but error was occured on gh data loading',
        function() {
            model.setPages([_.extend({}, pageStub)]);
            githubGetStub.yields(new Error());

            return loadFromGithub(model, {hasIssues: true})().then(function() {
                (model.getPages()[0].hasIssues == null).should.equal(true);
            });
        });

    it('should receive info about source branch if "branch" option was set', function() {
        model.setPages([_.extend({}, pageStub)]);
        githubGetBranchStub.yields(null, {});

        return loadFromGithub(model, {branch: true})().then(function() {
            model.getPages()[0].branch.should.equal('ref');
        });
    });

    it('should set default repo branch if "branch" option was set and source branch was not retrieved', function() {
        model.setPages([_.extend({}, pageStub)]);
        githubGetBranchStub.yields(new Error());
        githubGetStub.yields(null, {default_branch: 'some-branch'});

        return loadFromGithub(model, {branch: true})().then(function() {
            model.getPages()[0].branch.should.equal('some-branch');
        });
    });

    it('should set null if "branch" option was set and source and default branches were not retrieved', function() {
        model.setPages([_.extend({}, pageStub)]);
        githubGetBranchStub.yields(new Error());
        githubGetStub.yields(new Error());

        return loadFromGithub(model, {branch: true})().then(function() {
            (model.getPages()[0].branch == null).should.equal(true);
        });
    });

    it('should be resolved with model instance', function() {
        model.setPages([_.extend({}, pageStub)]);
        return loadFromGithub(model)().should.eventually.be.instanceOf(Model);
    });
});
