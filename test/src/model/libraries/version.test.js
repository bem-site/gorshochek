var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Version = require('../../lib/model/libraries/version');

describe('version', function () {
    var baseUrl = '/libraries',
        basePath = './builder/cache/libraries';

    describe('constructor', function () {
        var version;

        it('should be successfully initialized', function () {
            version = new Version(baseUrl, basePath, 'bem-core', 'v2', ['en']);
            version.should.be.instanceOf(Version);
        });
    });
});
