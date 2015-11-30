var _ = require('lodash');
var Q = require('q');
var Api = require('github');

var PublicAPI = require('../../../../lib/tasks-docs/github/public');
var PrivateAPI = require('../../../../lib/tasks-docs/github/private');
var GithubAPI = require('../../../../lib/tasks-docs/github');

describe('github API', function() {
    var sandbox = sinon.sandbox.create(),
        token = 'secret-token',
        options = {token: token, logger: {level: 'debug'}},
        baseOpts = {
            host: 'github.com',
            user: 'some-user',
            repo: 'some-repo'
        },
        publicApiStub,
        privateApiStub,
        githubAPI;

    beforeEach(function() {
        githubAPI = new GithubAPI(options);
        publicApiStub = sandbox.stub(githubAPI.apis.get('public').api);
        privateApiStub = sandbox.stub(githubAPI.apis.get('private').api);
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should have initialized private API', function() {
        githubAPI.apis.get('private').should.be.instanceOf(PrivateAPI);
    });

    it('should have initialized public API', function() {
        githubAPI.apis.get('public').should.be.instanceOf(PublicAPI);
    });

    it('should throw error if token for public API was not set', function() {
        githubAPI = new GithubAPI({logger: {level: 'debug'}});
        publicApiStub.authenticate.should.not.be.called;
    });

    describe('getContent', function() {
        var options = _.extend({ref: 'some-ref', path: 'some-path'}, baseOpts);

        it('should call corresponded github API method', function() {
            sandbox.stub(publicApiStub.repos, 'getContent').yields(null);
            return githubAPI.getContent(options, {}).then(function() {
                publicApiStub.repos.getContent.should.be.calledOnce;
            });
        });

        it('should return fulfilled promise with content of repo for given options', function() {
            sandbox.stub(publicApiStub.repos, 'getContent').yields(null, 'Hello World');
            return githubAPI.getContent(options, {}).should.eventually.equal('Hello World');
        });

        it('should return rejected promise in case of github error call', function() {
            sandbox.stub(publicApiStub.repos, 'getContent').yields(new Error('github error'));
            return githubAPI.getContent(options, {}).should.be.rejectedWith('github error');
        });
    });

    describe('getLastCommitDate', function() {
        var options = _.extend({ref: 'some-ref', path: 'some-path'}, baseOpts);

        it('should call corresponded github API method', function() {
            sandbox.stub(publicApiStub.repos, 'getCommits').yields(null, [
                {commit: {committer: {date: new Date()}}}
            ]);
            return githubAPI.getLastCommitDate(options, {}).then(function() {
                publicApiStub.repos.getCommits.should.be.calledOnce;
            });
        });

        it('should return fulfilled promise with date of latest commit', function() {
            var result = [
                {commit: {committer: {date: new Date()}}}
            ];
            sandbox.stub(publicApiStub.repos, 'getCommits').yields(null, result);
            return githubAPI.getLastCommitDate(options, {})
                .should.eventually.equal(result[0].commit.committer.date.getTime());
        });

        it('should return rejected promise in case of github error call', function() {
            sandbox.stub(publicApiStub.repos, 'getCommits').yields(new Error('github error'));
            return githubAPI.getLastCommitDate(options, {}).should.be.rejectedWith('github error');
        });

        it('should return rejected promise in case of not existed result', function() {
            sandbox.stub(publicApiStub.repos, 'getCommits').yields(null);
            return githubAPI.getLastCommitDate(options, {}).should.be.rejectedWith('Can not read commits');
        });

        it('should return rejected promise in case of empty result', function() {
            sandbox.stub(publicApiStub.repos, 'getCommits').yields(null, []);
            return githubAPI.getLastCommitDate(options, {}).should.be.rejectedWith('Can not read commits');
        });
    });

    describe('hasIssues', function() {
        var options = _.extend({}, baseOpts);

        it('should call corresponded github API method', function() {
            sandbox.stub(publicApiStub.repos, 'get').yields(null, {});
            return githubAPI.hasIssues(options, {}).then(function() {
                publicApiStub.repos.get.should.be.calledOnce;
            });
        });

        it('should return fulfilled promise with hasIssues flag', function() {
            sandbox.stub(publicApiStub.repos, 'get').yields(null, {has_issues: true});
            return githubAPI.hasIssues(options, {}).should.eventually.equal(true);
        });

        it('should return rejected promise in case of github error call', function() {
            sandbox.stub(publicApiStub.repos, 'get').yields(new Error('github error'));
            return githubAPI.hasIssues(options, {}).should.be.rejectedWith('github error');
        });
    });

    describe('getBranchOrDefault', function() {
        var options = _.extend({ref: 'some-ref'}, baseOpts);

        it('should call corresponded github API method', function() {
            sandbox.stub(publicApiStub.repos, 'getBranch').yields(null, {});
            return githubAPI.getBranchOrDefault(options, {}).then(function() {
                publicApiStub.repos.getBranch.should.be.called;
            });
        });

        it('should return fulfilled promise with name of requested branch', function() {
            sandbox.stub(publicApiStub.repos, 'getBranch').yields(null, {});
            return githubAPI.getBranchOrDefault(options, {}).should.eventually.equal('some-ref');
        });

        it('should return fulfilled promise with name of default branch if request branch does not exist', function() {
            sandbox.stub(publicApiStub.repos, 'getBranch').yields({code: 404});
            sandbox.stub(publicApiStub.repos, 'get').yields(null, {default_branch: 'master'});
            return githubAPI.getBranchOrDefault(options, {}).should.eventually.equal('master');
        });

        it('should return rejected promise in case of github error call', function() {
            sandbox.stub(publicApiStub.repos, 'getBranch').yields(new Error('github error'));
            githubAPI.getBranchOrDefault(options, {}).should.be.rejectedWith('github error');
        });
    });
});
