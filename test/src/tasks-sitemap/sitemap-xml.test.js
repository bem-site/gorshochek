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
    var sandbox = sinon.sandbox.create(),
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
        (function() {new BuildSiteMapXML(new Config('debug'), {})}).should
            .throw('Host parameter undefined. It is necessary for sitemap.xml creation');
    });

    it('should create valid content for sitemap.xml file', function() {
        model.setPages([{url: '/url1', published: true}]);

        task = new BuildSiteMapXML(new Config('debug'), {host: 'https://en.site.com'});
        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 0.5}
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
                published: true
            }
        ]);

        task = new BuildSiteMapXML(new Config('debug'), {host: 'https://en.site.com'});
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
                published: true
            }
        ]);

        task = new BuildSiteMapXML(new Config('debug'), {host: 'https://en.site.com'});
        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 1.0}
            ]));
        });
    });

    it('should also append nodes for page aliases', function() {
        model.setPages([{url: '/url1', aliases: ['/url11'], published: true}]);

        task = new BuildSiteMapXML(new Config('debug'), {host: 'https://en.site.com'});
        return task.run(model).then(function() {
            fs.writeFile.should.be.calledWithMatch('data/sitemap.xml', buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 0.5},
                {loc: 'https://en.site.com/url11', changefreq: 'weekly', priority: 0.5}
            ]));
        });
    });

    it('should return fulfilled promise with model instance', function() {
        model.setPages([{url: '/url1', published: true}]);

        task = new BuildSiteMapXML(new Config('debug'), {host: 'https://en.site.com'});
        return task.run(model).should.eventually.be.instanceof(Model);
    });

    it('should return rejected promise with error if error occur on file saving', function() {
        model.setPages([{url: '/url1', published: true}]);
        fs.writeFile.yields(new Error('error'));

        task = new BuildSiteMapXML(new Config('debug'), {host: 'https://en.site.com'});
        return task.run(model).should.be.rejectedWith('error');
    });

    it('should not add sitemap nodes for unpublished pages', function() {
        model.setPages([{url: '/url1', published: false}]);

        task = new BuildSiteMapXML(new Config('debug'), {host: 'https://en.site.com'});
        return task.run(model).then(function() {
            fs.writeFile.calledWithMatch('data/sitemap.xml', buildExpectedXML([])).should.equal(true);
        });
    });
});
