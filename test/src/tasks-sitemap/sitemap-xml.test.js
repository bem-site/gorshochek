var EOL = require('os').EOL,
    fs = require('fs'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    BuildSiteMapXML = require('../../../lib/tasks-sitemap/sitemap-xml');

function buildExpectedXML(items) {
    var items = items.map(function(item) {
        return [
            '\t<url>',
            '\t\t<loc>' + item.loc + '</loc>',
            '\t\t<changefreq>' + item.changefreq + '</changefreq>',
            '\t\t<priority>' + item.priority + '</priority>',
            '\t</url>'
        ].join(EOL);
    });

    items.unshift([
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset>'
    ].join(EOL));
    items.push('</urlset>');
    return items.join(EOL);
}

describe('SiteMapXML', function() {
    var config = new Config('debug'),
        sandbox = sinon.sandbox.create(),
        model,
        task;

    beforeEach(function() {
        sandbox.stub(fs, 'writeFile').yields(null);
        model = new Model();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid task name', function() {
        BuildSiteMapXML.getName().should.equal('build sitemap xml');
    });

    it('should throw error if hosts parameter was not set on initialization', function() {
        (function() {new BuildSiteMapXML(config, {})}).should.throw('Hosts undefined')
    });

    it('should create valid content for sitemap.xml file (single language)', function() {
        model.setPages([
            {
                url: '/url1',
                en: {published: true}
            }
        ]);
        config.setLanguages(['en']);

        task = new BuildSiteMapXML(config, {hosts: {en: 'https://en.site.com'}});
        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 0.5}
            ]));
        });
    });

    it('should create valid content for sitemap.xml file (multiple languages)', function() {
        model.setPages([
            {
                url: '/url1',
                en: {published: true},
                ru: {published: true}
            }
        ]);
        config.setLanguages(['en', 'ru']);

        task = new BuildSiteMapXML(config, {hosts: {en: 'https://en.site.com', ru: 'https://ru.site.com'}});
        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 0.5},
                {loc: 'https://ru.site.com/url1', changefreq: 'weekly', priority: 0.5}
            ]));
        });
    });

    it('should set common host for each of given language in case of string host parameter', function() {
        model.setPages([
            {
                url: '/url1',
                en: {published: true},
                ru: {published: true}
            }
        ]);
        config.setLanguages(['en', 'ru']);

        task = new BuildSiteMapXML(config, {hosts: 'https://my.site.com'});
        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://my.site.com/url1', changefreq: 'weekly', priority: 0.5},
                {loc: 'https://my.site.com/url1', changefreq: 'weekly', priority: 0.5}
            ]));
        });
    });

    it('should use custom value for "changefreq" property if it was given in page model', function() {
        model.setPages([
            {
                url: '/url1',
                search: {
                    changefreq: 'daily',
                    priority: 0.5
                },
                en: {
                    published: true
                }
            }
        ]);
        config.setLanguages(['en']);

        task = new BuildSiteMapXML(config, {hosts: {en: 'https://en.site.com'}});
        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'daily', priority: 0.5}
            ]));
        });
    });

    it('should use custom value for "priority" property if it was given in page model', function() {
        model.setPages([
            {
                url: '/url1',
                search: {
                    changefreq: 'weekly',
                    priority: 1.0
                },
                en: {
                    published: true
                }
            }
        ]);
        config.setLanguages(['en']);

        task = new BuildSiteMapXML(config, {hosts: {en: 'https://en.site.com'}});
        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 1.0}
            ]));
        });
    });

    it('should also append nodes for page aliases', function() {
        model.setPages([
            {
                url: '/url1',
                aliases: ['/url11'],
                en: {published: true}
            }
        ]);
        config.setLanguages(['en']);

        task = new BuildSiteMapXML(config, {hosts: {en: 'https://en.site.com'}});
        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 0.5},
                {loc: 'https://en.site.com/url11', changefreq: 'weekly', priority: 0.5}
            ]));
        });
    });

    it('should return fulfilled promise with model instance', function() {
        model.setPages([
            {
                url: '/url1',
                en: {published: true}
            }
        ]);
        config.setLanguages(['en']);

        task = new BuildSiteMapXML(config, {hosts: {en: 'https://en.site.com'}});
        return task.run(model).should.eventually.be.instanceof(Model);
    });

    it('should return rejected promise with error if error occur on file saving', function() {
        model.setPages([
            {
                url: '/url1',
                en: {published: true}
            }
        ]);
        config.setLanguages(['en']);
        fs.writeFile.yields(new Error('error'));

        task = new BuildSiteMapXML(config, {hosts: {en: 'https://en.site.com'}});
        return task.run(model).should.be.rejectedWith('error');
    });

    it('should not add sitemap nodes for missed page locale versions', function() {
        model.setPages([
            {
                url: '/url1',
                en: {published: true}
            }
        ]);
        config.setLanguages(['en', 'ru']);

        task = new BuildSiteMapXML(config, {hosts: {en: 'https://en.site.com'}});
        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 0.5}
            ]));
        });
    });

    it('should not add sitemap nodes for unpublished page locale versions', function() {
        model.setPages([
            {
                url: '/url1',
                en: {published: true},
                ru: {published: false}
            }
        ]);
        config.setLanguages(['en', 'ru']);

        task = new BuildSiteMapXML(config, {hosts: {en: 'https://en.site.com'}});
        return task.run(model).then(function() {
            fs.writeFile.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 0.5}
            ])).should.equal(true);
        });
    });
});
