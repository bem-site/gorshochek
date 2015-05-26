var should = require('should'),
    Github = require('../../lib/github');

describe('api/github', function () {
    var token = ['7a07', '3062', 'f428', '0dd2', 'ef3b', '7c04', '72b0', '8ba2', '95e3', 'c8ed'].join(''),
        options = {
            token: token,
            logger: {
                level: 'debug'
            }
        };

    describe('initialization', function () {
        it('without tokens', function () {
            new Github({});
        });
    });

    describe('after initialization', function () {
        var gh;

        before(function () {
            gh = new Github(options);
        });

        it('should have private API', function () {
            gh.apis.get('private').should.be.ok;
        });

        it('should have public API', function () {
            gh.apis.get('public').should.be.ok;
        });
    });

    describe('api calls', function () {
        var gh;
        before(function () {
            gh = new Github(options);
        });

        it('should get content of given file', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'builder-core',
                ref: 'master',
                path: 'README.md'
            };
            gh.getContent(o, null, function (error, result) {
                should(error).not.be.ok;
                result.should.be.ok;
                result.content.should.be.ok;
                result.name.should.equal('README.md');
                result.type.should.equal('file');
                result['html_url' ].should.equal('https://github.com/bem-site/builder-core/blob/master/README.md');
                done();
            });
        });

        it('should get commits for given file', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'builder-core',
                path: 'README.md'
            };

            gh.getCommits(o, null, function (error, result) {
                should(error).not.be.ok;
                result.should.be.ok;
                result.should.be.instanceof(Array);
                done();
            });
        });

        it('should get branch information for given branch name', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'builder-core',
                branch: 'master'
            };

            gh.getBranch(o, null, function (error, result) {
                should(error).not.be.ok;
                result.should.be.ok;
                result.name.should.equal('master');
                result.commit.should.be.ok;
                done();
            });
        });

        it('should get repository information', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'builder-core'
            };

            gh.getRepo(o, null, function (error, result) {
                should(error).not.be.ok;
                result.should.be.ok;
                result.url.should.equal('https://api.github.com/repos/bem-site/builder-core');
                result.private.should.equal(false);
                result.name.should.equal('builder-core');
                result['html_url'].should.equal('https://github.com/bem-site/builder-core');
                done();
            });
        });

        it('should return default branch name', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'builder-core'
            };

            gh.getDefaultBranch(o, null, function (error, result) {
                should(error).not.be.ok;
                result.should.be.ok;
                result.should.equal('master');
                done();
            });
        });

        it('should return true for existed branch', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'builder-core',
                branch: 'master'
            };
            gh.isBranchExists(o, null, function (error, result) {
                should(error).not.be.ok;
                result.should.be.ok;
                result.should.be.true;
                done();
            });
        });

        it('should return false for non-existed branch', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'builder-core',
                branch: 'invalid'
            };
            gh.isBranchExists(o, null, function (error, result) {
                should(error).not.be.ok;
                result.should.not.be.ok;
                result.should.be.false;
                done();
            });
        });
    });
});
