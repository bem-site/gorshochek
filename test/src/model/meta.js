var path = require('path'),
    should = require('should'),
    Meta = require('../../../lib/model/meta');

describe('Meta', function () {
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
});
