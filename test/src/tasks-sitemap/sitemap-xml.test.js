var EOL = require('os').EOL,
    fs = require('fs'),
    _ = require('lodash'),
    Model = require('../../../lib/model'),
    createSiteMapXML = require('../../../index').tasks.sitemap.createSitemapXML;

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

describe('tasks-sitemap/sitemap-xml', function() {
    var sandbox = sinon.sandbox.create(),
        basePage = {url: '/url1', published: true},
        options = {host: 'https://en.site.com'},
        expecedFilePath = '.builder/cache/sitemap.xml',
        model;

    beforeEach(function() {
        sandbox.stub(console, 'error');
        sandbox.stub(fs, 'writeFile').yields(null);
        model = new Model();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should throw error if hosts parameter was not set on initialization', function() {
        (function() {return createSiteMapXML(model)}).should
            .throw('Host parameter undefined. It is necessary for sitemap.xml creation');
    });

    it('should return function as result', function() {
        createSiteMapXML(model, options).should.be.instanceOf(Function);
    });

    it('should create valid content for sitemap.xml file', function() {
        model.setPages([basePage]);

        return createSiteMapXML(model, options)().then(function() {
            fs.writeFile.should.be.calledWith(expecedFilePath, buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 0.5}
            ]));
        });
    });

    it('should use custom value for "changefreq" property if it was given in page model', function() {
        model.setPages([_.extend({}, basePage, {search: {changefreq: 'daily', priority: 0.5}})]);

        return createSiteMapXML(model, options)().then(function() {
            fs.writeFile.should.be.calledWith(expecedFilePath, buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'daily', priority: 0.5}
            ]));
        });
    });

    it('should use custom value for "priority" property if it was given in page model', function() {
        model.setPages([_.extend({}, basePage, {search: {changefreq: 'weekly', priority: 1.0}})]);

        return createSiteMapXML(model, options)().then(function() {
            fs.writeFile.should.be.calledWithMatch(expecedFilePath, buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 1.0}
            ]));
        });
    });

    it('should also append nodes for page aliases', function() {
        model.setPages([_.extend({}, basePage, {aliases: ['/url11']})]);

        return createSiteMapXML(model, options)().then(function() {
            fs.writeFile.should.be.calledWithMatch(expecedFilePath, buildExpectedXML([
                {loc: 'https://en.site.com/url1', changefreq: 'weekly', priority: 0.5},
                {loc: 'https://en.site.com/url11', changefreq: 'weekly', priority: 0.5}
            ]));
        });
    });

    it('should return fulfilled promise with model instance', function() {
        model.setPages([basePage]);

        return createSiteMapXML(model, options)().should.eventually.be.instanceof(Model);
    });

    it('should return rejected promise with error if error occur on file saving', function() {
        model.setPages([basePage]);
        fs.writeFile.yields(new Error('error'));

        return createSiteMapXML(model, options)().should.be.rejectedWith('error');
    });

    it('should not add sitemap nodes for unpublished pages', function() {
        model.setPages([_.extend({}, basePage, {published: false})]);

        return createSiteMapXML(model, options)().then(function() {
            fs.writeFile.calledWithMatch(expecedFilePath, buildExpectedXML([])).should.equal(true);
        });
    });
});
