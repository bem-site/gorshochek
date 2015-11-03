var fs = require('fs'),
    should = require('should'),
    mockFs = require('mock-fs'),
    Meta = require('../../../lib/model/meta');

describe('Meta', function() {
    before(function() {
        var metaData = fs.readFileSync('./test/stub/meta.json', { encoding: 'utf-8' });
        mockFs({
            cache: {
                'meta.json': metaData
            },
            data: {}
        })
    });

    after(function() {
        mockFs.restore();
    });

    it('should return valid name of file', function() {
        Meta.getFileName().should.equal('meta.json');
    });

    it('static initialization', function() {
        var meta = Meta.init('./cache/meta.json');
        meta._authors.should.be.instanceOf(Object);
        meta._translators.should.be.instanceOf(Object);
        meta._tags.should.be.instanceOf(Object);
    });

    it('static save', function() {
        var file = './cache/meta.json',
            authors = { en: [], ru: [] },
            translators = { en: [], ru: [] },
            tags = { en: [], ru: [] };

        Meta.save(file, authors, translators, tags);
        fs.existsSync(file).should.equal(true);
        should.deepEqual(Meta.init(file)._authors, { en: [], ru: [] });
        should.deepEqual(Meta.init(file)._translators, { en: [], ru: [] });
        should.deepEqual(Meta.init(file)._tags, { en: [], ru: [] });
    });

    describe('instance methods', function() {
        var meta;

        before(function() {
            meta = new Meta({
                authors: {},
                translators: {},
                tags: {}
            });
        });

        it('getAuthors', function() {
            should.deepEqual(meta.getAuthors(), meta._authors);
        });

        it('getTranslators', function() {
            should.deepEqual(meta.getTranslators(), meta._translators);
        });

        it('getTags', function() {
            should.deepEqual(meta.getTags(), meta._tags);
        });
    });
});
