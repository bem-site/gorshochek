var _ = require('lodash'),
    nock = require('nock'),
    Github = require('../../lib/github');

describe('Github', function() {
    var token = 'secret-token',
        options = {
            token: token,
            logger: {
                level: 'debug'
            }
        };

    describe('initialization', function() {
        it('without tokens', function() {
            return new Github({});
        });
    });

    describe('after initialization', function() {
        var gh;

        before(function() {
            gh = new Github(options);
        });

        it('should have initialized private API', function() {
            gh.apis.get('private').should.be.ok;
        });

        it('should have initialized public API', function() {
            gh.apis.get('public').should.be.ok;
        });
    });

    describe('api calls', function() {
        var gh;

        before(function() {
            gh = new Github(options);
        });

        afterEach(function() {
            nock.cleanAll();
        });

        describe('getContent', function() {
            it('should get content of given file', function(done) {
                nock('https://api.github.com', {reqheaders: getHeaders()})
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

                gh.getContent(_.extend({ref: 'master', path: 'README.md'}, getOptions()), null, function(error, result) {
                    result.name.should.equal('README.md');
                    result.type.should.equal('file');
                    result['html_url' ].should.equal('https://github.com/bem-site/test/blob/master/README.md');
                    done();
                });
            });
        });

        describe('getCommits', function() {
            it('should get commits for given file', function(done) {
                var expected = [
                    {
                        url: 'https://api.github.com/repos/octocat/Hello-World/commits/1',
                        sha: 1
                    },
                    {
                        url: 'https://api.github.com/repos/octocat/Hello-World/commits/2',
                        sha: 2
                    }
                ];

                nock('https://api.github.com', {reqheaders: getHeaders()})
                    .get('/repos/bem-site/test/commits')
                    .query({
                        path: 'README.md',
                        'access_token': token
                    })
                    .reply(200, expected);

                gh.getCommits(_.extend({path: 'README.md'}, getOptions()), null, function(error, result) {
                    result.should.be.instanceof(Array).and.have.length(2);
                    should.deepEqual(result[0], expected[0]);
                    should.deepEqual(result[1], expected[1]);
                    done();
                });
            });
        });

        describe('getBranch', function() {
            it('should get branch information for given branch name', function(done) {
                nock('https://api.github.com', {reqheaders: getHeaders()})
                    .get('/repos/bem-site/test/branches/master')
                    .query({
                        'access_token': token
                    })
                    .reply(200, {
                        name: 'master',
                        commit: {}
                    });

                gh.getBranch(_.extend({branch: 'master'}, getOptions()), null, function(error, result) {
                    result.name.should.equal('master');
                    result.commit.should.be.instanceof(Object);
                    done();
                });
            });
        });

        describe('getRepo', function() {
            it('should get repository information', function(done) {
                nock('https://api.github.com', {reqheaders: getHeaders()})
                    .get('/repos/bem-site/test')
                    .query({
                        'access_token': token
                    })
                    .reply(200, {
                        url: 'https://api.github.com/repos/bem-site/test',
                        name: 'test',
                        'html_url': 'https://github.com/bem-site/test'
                    });

                gh.getRepo(getOptions(), null, function(error, result) {
                    result.name.should.equal('test');
                    result.url.should.equal('https://api.github.com/repos/bem-site/test');
                    result['html_url'].should.equal('https://github.com/bem-site/test');
                    done();
                });
            });
        });

        describe('getDefaultBranch', function() {
            it('should return default branch name', function(done) {
                nock('https://api.github.com', {reqheaders: getHeaders()})
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

                gh.getDefaultBranch(getOptions(), null, function(error, result) {
                    result.should.equal('master');
                    done();
                });
            });
        });

        describe('hasIssues', function() {
            it('should detect if repo has issues', function(done) {
                nock('https://api.github.com', {reqheaders: getHeaders()})
                    .get('/repos/bem-site/test')
                    .query({
                        'access_token': token
                    })
                    .reply(200, {
                        url: 'https://api.github.com/repos/bem-site/test',
                        name: 'test',
                        'html_url': 'https://github.com/bem-site/test',
                        'has_issues': true
                    });

                gh.hasIssues(getOptions(), null, function(error, result) {
                    result.should.equal(true);
                    done();
                });
            });
        });

        describe('isBranchExists', function() {
            it('should return true for existed branch', function(done) {
                nock('https://api.github.com', {reqheaders: getHeaders()})
                    .get('/repos/bem-site/test/branches/master')
                    .query({
                        'access_token': token
                    })
                    .reply(200);

                gh.isBranchExists(_.extend({branch: 'master'}, getOptions()), null, function(error, result) {
                    result.should.be.true;
                    done();
                });
            });

            it('should return false for non-existed branch', function(done) {
                nock('https://api.github.com', {reqheaders: getHeaders()})
                    .get('/repos/bem-site/test/branches/invalid')
                    .query({
                        'access_token': token
                    })
                    .times(6)
                    .reply(404);

                gh.isBranchExists(_.extend({branch: 'invalid'}, getOptions()), null, function(error, result) {
                    result.should.be.false;
                    done();
                });
            });
        });

        describe('getContentP', function() {
            it('return resolved promise with content and meta info', function() {
                nock('https://api.github.com', {reqheaders: getHeaders()})
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

                return gh.getContentP(_.extend({ref: 'master', path: 'README.md'}, getOptions()), null)
                    .then(function(error, result) {
                        result.name.should.equal('README.md');
                        result.type.should.equal('file');
                        result['html_url' ].should.equal('https://github.com/bem-site/test/blob/master/README.md');
                    });
            });

            it('return rejected promise with error in case of missed file', function() {
                nock('https://api.github.com', { reqheaders: getHeaders() })
                    .get('/repos/bem-site/test/contents/invalid.md')
                    .query({
                        ref: 'master',
                        'access_token': token
                    })
                    .replyWithError({'message': 'file not found', 'code': 'NOT-FOUND'});

                return gh.getContentP(_.extend({ref: 'master', path: 'invalid.md'}, getOptions()), null)
                    .catch(function(error) {
                        error.message.should.be.equal('file not found');
                    });
            });
        });

        describe('getLastCommitDateP', function() {
            it('should return resolved promise with date of last commit', function() {
                nock('https://api.github.com', { reqheaders: getHeaders() })
                    .get('/repos/bem-site/test-promise/commits')
                    .query({
                        path: 'README.md',
                        'access_token': token
                    })
                    .reply(200, [
                        {
                            url: 'https://api.github.com/repos/octocat/Hello-World/commits/1',
                            sha: 1,
                            committer: {
                                name: 'Monalisa Octocat',
                                email: 'support@github.com',
                                date: '2011-04-14T16:00:49Z'
                            }
                        }
                    ]);

                return gh.getLastCommitDateP(_.extend({path: 'README.md'}, getOptions(), {repo: 'test-promise'}), null)
                    .then(function(result) {
                        result.should.be.equal((new Date('2011-04-14T16:00:49Z')).getTime())
                    });
            });

            it('should return rejected promise in case of missed file', function() {
                nock('https://api.github.com', { reqheaders: getHeaders() })
                    .get('/repos/bem-site/test-promise/commits')
                    .query({
                        path: 'README.md',
                        'access_token': token
                    })
                    .replyWithError({'message': 'file not found', 'code': 'NOT-FOUND'});

                return gh.getLastCommitDateP(_.extend({path: 'README.md'}, getOptions(), {repo: 'test-promise'}), null)
                    .catch(function(error) {
                        error.message.should.be.equal('file not found');
                    });
            });

            it('should return rejected promise in case of empty commits array', function() {
                nock('https://api.github.com', { reqheaders: getHeaders() })
                    .get('/repos/bem-site/test/commits')
                    .query({
                        path: 'README.md',
                        'access_token': token
                    })
                    .reply(200, []);

                return gh.getLastCommitDateP(_.extend({path: 'README.md'}, getOptions()), null)
                    .catch(function(error) {
                        error.message.should.be.equal('Can not read commits');
                    });
            });
        });

        describe('hasIssuesP', function() {
            it('should return resolved promise with true value if repo has issues', function() {
                nock('https://api.github.com', { reqheaders: getHeaders() })
                    .get('/repos/bem-site/test')
                    .query({
                        'access_token': token
                    })
                    .reply(200, {
                        url: 'https://api.github.com/repos/bem-site/test',
                        name: 'test',
                        'html_url': 'https://github.com/bem-site/test',
                        'has_issues': true
                    });

                return gh.hasIssuesP(getOptions(), null)
                    .then(function(result) {
                        result.should.be.equal(true);
                    });
            });

            it('should return rejected promise in case of missed file', function() {
                nock('https://api.github.com', { reqheaders: getHeaders() })
                    .get('/repos/bem-site/test')
                    .query({
                        'access_token': token
                    })
                    .replyWithError({'message': 'file not found', 'code': 'NOT-FOUND'});

                return gh.hasIssuesP(getOptions(), null)
                    .catch(function(error) {
                        error.message.should.be.equal('file not found');
                    });
            });
        });

        describe('getBranchOrDefaultP', function() {

        });
    });
});

function getOptions() {
    return {
        host: 'https://github.com',
        user: 'bem-site',
        repo: 'test'
    };
}

function getHeaders() {
    return {
        host: 'api.github.com',
        'content-length': '0',
        'user-agent': 'NodeJS HTTP Client',
        accept: 'application/vnd.github.v3+json'
    };
}
