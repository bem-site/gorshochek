var fsExtra = require('fs-extra'),
    Meta = require('../../../lib/model/meta');

describe('Meta', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function() {
        sandbox.stub(fsExtra, 'readJSONSync');
        sandbox.stub(fsExtra, 'writeJSONSync');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid name of "meta" file', function() {
        Meta.getFileName().should.be.equal('meta.json');
    });

    it('should have getter for "authors" property', function() {
        var meta = new Meta({});
        meta.getAuthors.should.be.instanceof(Function);
    });

    it('should return valid "authors" property value', function() {
        var meta = new Meta({authors: ['john-smith']});
        meta.getAuthors().should.be.eql(['john-smith']);
    });

    it('should have getter for "translators" property', function() {
        var meta = new Meta({});
        meta.getTranslators.should.be.instanceof(Function);
    });

    it('should return valid "translators" property value', function() {
        var meta = new Meta({translators: ['john-smith']});
        meta.getTranslators().should.be.eql(['john-smith']);
    });

    it('should have getter for "tags" property', function() {
        var meta = new Meta({});
        meta.getTags.should.be.instanceof(Function);
    });

    it('should return valid "tags" property value', function() {
        var meta = new Meta({tags: ['some-tag']});
        meta.getTags().should.be.eql(['some-tag']);
    });

    it('should save meta information to given file', function() {
        var authors = {},
            translators = {},
            tags = {};

        Meta.save('some.json', authors, translators, tags);
        fsExtra.writeJSONSync.should.be.calledWith('some.json', {
            authors: {},
            translators: {},
            tags: {}
        });
    });
});
