var ChangesType = require('../../../../src/model/changes/type');

describe('model/changes/type', function () {
    it('should be initialized successfully by given type', function () {
        var ct = new ChangesType('pages');
        ct._type.should.equal('pages');
    });

    it('should not be in modified state', function () {
        var ct = new ChangesType('pages');
        ct.areModified().should.not.be.ok;
    });

    it('should have added empty collection', function () {
        var ct = new ChangesType('pages');
        ct.added.should.be.instanceof(Array).and.have.length(0);
    });

    it('should have modified empty collection', function () {
        var ct = new ChangesType('pages');
        ct.modified.should.be.instanceof(Array).and.have.length(0);
    });

    it('should have removed empty collection', function () {
        var ct = new ChangesType('pages');
        ct.removed.should.be.instanceof(Array).and.have.length(0);
    });

    it('should add new added items', function () {
        var ct = new ChangesType('pages');
        ct.addAdded('url1');
        ct.added.should.have.length(1);
        ct.areModified().should.be.ok;
    });

    it('should add new modified items', function () {
        var ct = new ChangesType('pages');
        ct.addModified('url1');
        ct.modified.should.have.length(1);
        ct.areModified().should.be.ok;
    });

    it('should add new removed items', function () {
        var ct = new ChangesType('pages');
        ct.addRemoved('url1');
        ct.removed.should.have.length(1);
        ct.areModified().should.be.ok;
    });
});
