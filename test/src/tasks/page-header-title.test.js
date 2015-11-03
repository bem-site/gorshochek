var Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    PageHeaderTitle = require('../../../lib/tasks/page-header-title');

describe('PageHeaderTitle', function() {
    it('should return valid task name', function() {
        PageHeaderTitle.getName().should.equal('create page titles');
    });

    describe('instance methods', function() {
        var config,
            task;

        before(function() {
            config = new Config('debug');
            config.setLanguages(['en', 'ru']);
            task = new PageHeaderTitle(config, {});
        });

        describe('run', function() {
            it('should add header.title to pages', function(done) {
                var pages = [
                        {
                            url: '/',
                            en: { title: 'index en title' },
                            ru: { title: 'index ru title' }
                        },
                        {
                            url: '/url1',
                            ru: { title: 'url1 ru title' }
                        },
                        {
                            url: '/url1/url2',
                            ru: { title: 'url2 ru title' }
                        }
                    ],
                    model = new Model();
                model.setPages(pages);
                task.run(model).then(function(m) {
                    m.getPages()[0]['en'].header.title
                        .should.equal('index en title');
                    m.getPages()[0]['ru'].header.title
                        .should.equal('index ru title');
                    m.getPages()[1]['ru'].header.title
                        .should.equal('url1 ru title/index ru title');
                    m.getPages()[2]['ru'].header.title
                        .should.equal('url2 ru title/url1 ru title/index ru title');
                    done();
                });
            });
        });
    });
});
