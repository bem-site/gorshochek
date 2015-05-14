var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    BuildSiteMapXML = require('../../../lib/tasks/build-sitemap-xml');

describe('BuildSiteMapXML', function () {
    before(function () {
        process.chdir(path.resolve(__dirname, '../../stub'));
        fsExtra.mkdirsSync('./data');
    });

    describe('_getHosts', function () {
        var hosts = { en: 'https://bem.info', ru: 'https://ru.bem.info'},
            config = new Config(),
            task;

        it('should throw error if hosts were not set', function () {
            task = new BuildSiteMapXML(config, {});
            (function () {return task._getHosts(); }).should.throw('Hosts undefined');
        });

        it('should make host object in case of string param', function () {
            task = new BuildSiteMapXML(config, { hosts: 'https://bem.info' });
            should.deepEqual(task._getHosts(), {
                en: 'https://bem.info',
                ru: 'https://bem.info'
            });
        });
    });

    describe('_getDefaultSearchParams', function () {
        var config = new Config(),
            task;

        it('should return valid default search parameters', function () {
            task = new BuildSiteMapXML(config, {});
            should.deepEqual(task._getDefaultSearchParams(), { changefreq: 'weekly', priority: 0.5 });
        });
    })

    after(function () {
        fsExtra.removeSync('./data');
        process.chdir(path.resolve(__dirname, '../../../'));
    });
});
