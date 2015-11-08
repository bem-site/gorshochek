var _ = require('lodash'),
    vow = require('vow'),
    sinon = require('sinon'),
    should = require('should'),
    Version = require('../../../../lib/model/libraries/version'),
    Document = require('../../../../lib/model/libraries/document'),
    Level = require('../../../../lib/model/libraries/level');

describe('Version', function() {
    var sandbox = sinon.sandbox.create(),
        version;

    beforeEach(function() {
        version = new Version('/libraries', '/base-path', 'some-lib', 'v1', ['en']);
        sandbox.stub(version, 'saveFile').returns(vow.resolve());
        sandbox.stub(Document.prototype, 'processData').returns(vow.resolve({name: 'readme'}));
        sandbox.stub(Level.prototype, 'processData').returns(vow.resolve({name: 'desktop'}));
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should set valid value for "baseUrl" property after initialization', function() {
        version.baseUrl.should.equal('/libraries');
    });

    it('should set valid value for "basePath" property after initialization', function() {
        version.basePath.should.equal('/base-path');
    });

    it('should set valid value for "languages" property after initialization', function() {
        version.languages.should.eql(['en']);
    });

    it('should set valid value for "lib" property after initialization', function() {
        version.lib.should.equal('some-lib');
    });

    it('should set valid value for "version" property after initialization', function() {
        version.version.should.equal('v1');
    });

    describe('processData', function() {
        var versionData = {
            ref: 'v1',
            url: '/base-library-url',
            deps: {},
            hasIssues: true
        };

        it('should set valid value for "url" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().url.should.be.equal('/libraries/some-lib/v1');
            });
        });

        it('should set valid value for "aliases" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().aliases.should.be.eql([]);
            });
        });

        it('should set valid value for "view" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().view.should.be.equal('post');
            });
        });

        it('should set valid value for "lib" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().lib.should.be.equal('some-lib');
            });
        });

        it('should set valid value for "version" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().version.should.be.equal('v1');
            });
        });

        it('should set valid value for "deps" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().deps.should.be.eql({});
            });
        });

        it('should set valid value for "title" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().en.title.should.be.equal('v1');
            });
        });

        it('should set valid value for "published" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().en.published.should.be.equal(true);
            });
        });

        it('should set valid value for "updateDate" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().en.updateDate.should.be.above(+(new Date()) - 100);
            });
        });

        it('should set valid value for "hasIssues" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().en.hasIssues.should.equal(true);
            });
        });

        it('should set valid value for "sourceUrl" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().en.sourceUrl.should.equal('/base-library-url/tree/v1');
            });
        });

        it('should set null value for "sourceUrl" property if version data has not "url" property', function() {
            return version.processData(_.omit(versionData, 'url')).then(function() {
                should(version.getData().en.sourceUrl).equal(null);
            });
        });

        it('should save file with content of library README documentation (old version data format)', function() {
            var data = _.extend({readme: {content: {en: 'Hello World'}}}, versionData);
            return version.processData(data).then(function() {
                version.saveFile.should.be.calledOnce;
                version.saveFile.calledWith('/base-path/some-lib/v1/en.html')
            });
        });

        it('should save file with content of library README documentation (new version data format)', function() {
            var data = _.extend({docs: {readme: {content: {en: 'Hello World'}}}}, versionData);
            return version.processData(data).then(function() {
                version.saveFile.should.be.calledOnce;
                version.saveFile.calledWith('/base-path/some-lib/v1/en.html')
            });
        });

        it('should set valid value for "contentFile" property after saving doc file', function() {
            var data = _.extend({docs: {readme: {content: {en: 'Hello World'}}}}, versionData);
            return version.processData(data).then(function() {
                version.getData().en.contentFile.should.equal('/libraries/some-lib/v1/en.html');
            });
        });

        it('should add nested document process data', function() {
            var data = _.extend({docs: {changelog: {content: {en: 'Hello World'}}}}, versionData);
            return version.processData(data).then(function() {
                var expectedPath = '/base-path/some-lib/v1/cache.json',
                    expectedContent = [version.getData(), {name: 'readme'}];
                version.saveFile.calledWith(expectedPath, expectedContent, true).should.be.equal(true);
            });
        });

        it('should add nested level processed data', function() {
            var data = _.extend({levels: [{name: 'desktop'}]}, versionData);
            return version.processData(data).then(function() {
                var expectedPath = '/base-path/some-lib/v1/cache.json',
                    expectedContent = [version.getData(), {name: 'desktop'}];
                version.saveFile.calledWith(expectedPath, expectedContent, true).should.be.equal(true);
            });
        });

        it('should add nested document and level processed data together', function() {
            var data = _.extend({
                docs: {changelog: {content: {en: 'Hello World'}}},
                levels: [{name: 'desktop'}]
            }, versionData);
            return version.processData(data).then(function() {
                var expectedPath = '/base-path/some-lib/v1/cache.json',
                    expectedContent = [version.getData(), {name: 'readme'}, {name: 'desktop'}];
                version.saveFile.calledWith(expectedPath, expectedContent, true).should.be.equal(true);
            });
        });
    });
});
