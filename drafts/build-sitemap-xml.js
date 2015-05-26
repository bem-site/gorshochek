var mockFs = require('mock-fs'),
    should = require('should'),
    Config = require('../../../lib/config'),
    BuildSiteMapXML = require('../../../lib/tasks/build-sitemap-xml');

describe('BuildSiteMapXML', function () {
    before(function () {
        mockFs({
            data: {}
        });
    });

    after(function () {
        mockFs.restore();
    });

    describe('_getHosts', function () {
        var hosts = { en: 'https://my.site.com', ru: 'https://my.site.ru'},
            config = new Config('./test/stub/'),
            task;

        it('should throw error if hosts were not set', function () {
            task = new BuildSiteMapXML(config, {});
            (function () {return task['_getHosts'](); }).should.throw('Hosts undefined');
        });

        it('should make host object in case of string param', function () {
            task = new BuildSiteMapXML(config, { hosts: 'https://my.site.com' });
            should.deepEqual(task['_getHosts'](), {
                en: 'https://my.site.com',
                ru: 'https://my.site.com'
            });
        });
    });

    describe('_getDefaultSearchParams', function () {
        var config = new Config('./test/stub/'),
            task;

        it('should return valid default search parameters', function () {
            task = new BuildSiteMapXML(config, {});
            should.deepEqual(task['_getDefaultSearchParams'](), { changefreq: 'weekly', priority: 0.5 });
        });
    });

    describe('_getSiteMapXmlFilePath', function () {
        var config = new Config('./test/stub/'),
            task;

        it('should return valid sitemap.xml file path', function () {
            task = new BuildSiteMapXML(config, {});
            task['_getSiteMapXmlFilePath']().indexOf('data/sitemap.xml').should.above(-1);
        });
    });

    describe('_buildSiteMapModel', function () {

    });
});
