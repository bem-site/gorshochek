var path = require('path'),
    should = require('should'),
    Meta = require('../../../lib/model/meta');

describe('Meta', function () {
    it('initialization', function () {
        var meta = new Meta({}, {}, {});
        meta._authors.should.be.instanceOf(Object);
        meta._translators.should.be.instanceOf(Object);
        meta._tags.should.be.instanceOf(Object);
    });

    describe('instance methods', function () {
        var meta;

        before(function () {
            meta = new Meta({}, {}, {});
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
