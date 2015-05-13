var fs = require('fs'),
    path = require('path'),
    fsExtra = require('fs-extra'),
    should = require('should'),
    Meta = require('../../../lib/model/meta');

describe('Meta', function () {
    before(function () {
        process.chdir(path.resolve(__dirname, '../../stub'));
    });

    it('should return valid name of file', function () {
        Meta.getFileName().should.equal('meta.json');
    });

    it('static initialization', function () {
        var meta = Meta.init('./model/meta.json');
        meta._authors.should.be.instanceOf(Object);
        meta._translators.should.be.instanceOf(Object);
        meta._tags.should.be.instanceOf(Object);
    });

    it('static save', function () {
        var file = './model/meta-save.json',
            authors = { en: new Set(), ru: new Set() },
            translators = { en: new Set(), ru: new Set() },
            tags = { en: new Set(), ru: new Set() };

        Meta.save(file, authors, translators, tags);
        fs.existsSync(file).should.equal(true);
        should.deepEqual(Meta.init(file)._authors, { en: [], ru: [] });
        should.deepEqual(Meta.init(file)._translators, { en: [], ru: [] });
        should.deepEqual(Meta.init(file)._tags, { en: [], ru: [] });
    });

    describe('instance methods', function () {
        var meta;

        before(function () {
            meta = new Meta({
                authors: {},
                translators: {},
                tags: {}
            });
        });

        it('getAuthors', function () {
            should.deepEqual(meta.getAuthors(), meta._authors);
        });

        it('getTranslators', function () {
            should.deepEqual(meta.getTranslators(), meta._translators);
        });

        it('getTags', function () {
            should.deepEqual(meta.getTags(), meta._tags);
        });
    });

    after(function () {
        fsExtra.removeSync('./model/meta-save.json');
        process.chdir(path.resolve(__dirname, '../../../'));
    });
});
