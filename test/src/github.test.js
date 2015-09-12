var _ = require('lodash'),
    should = require('should'),
    nock = require('nock'),
    Github = require('../../lib/github');

describe('Github', function () {
    var token = 'secret-token',
        options = {
            token: token,
            logger: {
                level: 'debug'
            }
        };

    describe('initialization', function () {
        it('without tokens', function () {
            return new Github({});
        });
    });

    describe('after initialization', function () {
        var gh;

        before(function () {
            gh = new Github(options);
        });

        it('should have initialized private API', function () {
            gh.apis.get('private').should.be.ok;
        });

        it('should have initialized public API', function () {
            gh.apis.get('public').should.be.ok;
        });
    });

    describe('api calls', function () {
        var gh;

        before(function () {
            gh = new Github(options);
        });

        afterEach(function () {
            nock.cleanAll();
        });

        it('should get content of given file', function (done) {
            var o = {
                    host: 'https://github.com',
                    user: 'bem-site',
                    repo: 'test',
                    ref: 'master',
                    path: 'README.md'
                };

            nock('https://api.github.com', { reqheaders: getHeaders() })
                .get('/repos/bem-site/test/contents/README.md')
                .query({
                    ref: 'master',
                    'access_token': token
                })
                .reply(200,  {
                    content: 'test content',
                    name: 'README.md',
                    type: 'file',
                    html_url: 'https://github.com/bem-site/test/blob/master/README.md'
                });

            gh.getContent(o, null, function (error, result) {
                result.name.should.equal('README.md');
                result.type.should.equal('file');
                result['html_url' ].should.equal('https://github.com/bem-site/test/blob/master/README.md');
                done();
            });
        });

        it('should get commits for given file', function (done) {
            var o = {
                    host: 'https://github.com',
                    user: 'bem-site',
                    repo: 'test',
                    path: 'README.md'
                },
                expected = [
                    {
                        url: 'https://api.github.com/repos/octocat/Hello-World/commits/1',
                        sha: 1
                    },
                    {
                        url: 'https://api.github.com/repos/octocat/Hello-World/commits/2',
                        sha: 2
                    }
                ];

            nock('https://api.github.com', { reqheaders: getHeaders() })
                .get('/repos/bem-site/test/commits')
                .query({
                    path: 'README.md',
                    'access_token': token
                })
                .reply(200, expected);

            gh.getCommits(o, null, function (error, result) {
                result.should.be.instanceof(Array).and.have.length(2);
                should.deepEqual(result[0], expected[0]);
                should.deepEqual(result[1], expected[1]);
                done();
            });
        });

        it('should get branch information for given branch name', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'test',
                branch: 'master'
            };

            nock('https://api.github.com', { reqheaders: getHeaders() })
                .get('/repos/bem-site/test/branches/master')
                .query({
                    'access_token': token
                })
                .reply(200, {
                    name: 'master',
                    commit: {}
                });

            gh.getBranch(o, null, function (error, result) {
                result.name.should.equal('master');
                result.commit.should.be.instanceof(Object);
                done();
            });
        });

        it('should get repository information', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'test'
            };

            nock('https://api.github.com', { reqheaders: getHeaders() })
                .get('/repos/bem-site/test')
                .query({
                    'access_token': token
                })
                .reply(200, {
                    url: 'https://api.github.com/repos/bem-site/test',
                    name: 'test',
                    'html_url': 'https://github.com/bem-site/test'
                });

            gh.getRepo(o, null, function (error, result) {
                result.name.should.equal('test');
                result.url.should.equal('https://api.github.com/repos/bem-site/test');
                result['html_url'].should.equal('https://github.com/bem-site/test');
                done();
            });
        });

        it('should return default branch name', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'test'
            };

            nock('https://api.github.com', { reqheaders: getHeaders() })
                .get('/repos/bem-site/test')
                .query({
                    'access_token': token
                })
                .reply(200, {
                    url: 'https://api.github.com/repos/bem-site/test',
                    name: 'test',
                    'html_url': 'https://github.com/bem-site/test',
                    'default_branch': 'master'
                });

            gh.getDefaultBranch(o, null, function (error, result) {
                result.should.equal('master');
                done();
            });
        });

        it('should return true for existed branch', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'test',
                branch: 'master'
            };

            nock('https://api.github.com', { reqheaders: getHeaders() })
                .get('/repos/bem-site/test/branches/master')
                .query({
                    'access_token': token
                })
                .reply(200);

            gh.isBranchExists(o, null, function (error, result) {
                result.should.be.true;
                done();
            });
        });

        it('should return false for non-existed branch', function (done) {
            var o = {
                host: 'https://github.com',
                user: 'bem-site',
                repo: 'test',
                branch: 'invalid'
            };

            nock('https://api.github.com', { reqheaders: getHeaders() })
                .get('/repos/bem-site/test/branches/invalid')
                .query({
                    'access_token': token
                })
                .times(6)
                .reply(404);

            gh.isBranchExists(o, null, function (error, result) {
                result.should.be.false;
                done();
            });
        });
    });
});

function getHeaders() {
    return {
        host: 'api.github.com',
        'content-length': '0',
        'user-agent': 'NodeJS HTTP Client',
        accept: 'application/vnd.github.v3+json'
    };
}
