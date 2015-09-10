var should = require('should'),
    Config = require('../../../lib/config'),
    Github = require('../../../lib/github'),
    DocsBaseGh = require('../../../lib/tasks/docs-gh-base');

describe('DocsBaseGh', function () {
    it('should return valid task name', function () {
        DocsBaseGh.getName().should.equal('docs base github operations');
    });

    it('should return valid gh url pattern', function () {
        should.deepEqual(DocsBaseGh.getGhUrlPattern(),
            /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/);
    });

    describe('instance methods', function () {
        var config,
            task;

        before(function () {
            var token = [
                '92c5', 'a62f', '7ae4', '4c16', '40ed',
                '1195', 'd448', '4689', '669c', '5caa'
            ].join('');

            config = new Config('debug');
            task = new DocsBaseGh(config, { token: token });
        });

        it('_getAPI', function () {
            task.getAPI().should.be.instanceOf(Github);
        });

        describe('getCriteria', function () {
            it('should return false for missed lang version of page', function () {
                var page = {
                    url: '/url1'
                };
                task.getCriteria(page, 'en').should.equal(false);
            });

            it('should return false for missed sourceUrl field', function () {
                var page = {
                    url: '/url1',
                    en: {}
                };
                task.getCriteria(page, 'en').should.equal(false);
            });

            it('should return false if sourceUrl field does not match criteria', function () {
                var page = {
                    url: '/url1',
                    en: {
                        sourceUrl: '/foo/bar'
                    }
                };
                task.getCriteria(page, 'en').should.equal(false);
            });

            it('should return valid repository info object', function () {
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

        describe('getPagesByCriteria', function () {
            it('should return valid set of filtered pages', function () {
                var pages = [
                        { url: '/url1' },
                        { url: '/url2', en: {} },
                        {
                            url: '/url3',
                            ru: {
                                sourceUrl: 'https://github.com/bem/bem-method/' +
                                'tree/bem-info-data/method/index/index.en.md'
                            },
                            en: { sourceUrl: '/foo/bar' }
                        },
                        {
                            url: '/url4',
                            en: {
                                sourceUrl: 'https://github.com/bem/bem-method/' +
                                'tree/bem-info-data/method/index/index.en.md'
                            },
                            ru: {}
                        }
                    ],
                    result = task.getPagesByCriteria(pages, ['en', 'ru']);

                result.should.be.instanceOf(Array).and.have.length(2);
                should.deepEqual(result, [pages[2], pages[3]]);
            });
        });

        describe('getHeadersByCache', function () {
            it('should return header object', function () {
                should.deepEqual(task.getHeadersByCache({ etag: '123456789abcdef' }),
                    { 'If-None-Match': '123456789abcdef' });
            });

            it('should return null in case of missing etag', function () {
                should(task.getHeadersByCache({})).equal(null);
                should(task.getHeadersByCache()).equal(null);
            });
        });
    });
});
