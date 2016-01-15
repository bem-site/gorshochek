var ChangesType = require('../../lib/changes');

describe('model/changes/type', function() {
    var changesType;

    beforeEach(function() {
        changesType = new ChangesType('pages');
    });

    describe('after initialization', function() {
        it('should not be in modified state', function() {
            changesType.areModified().should.not.be.ok;
        });

        it('should have empty added  collection', function() {
            changesType.added.should.be.instanceof(Array).and.have.length(0);
        });

        it('should have empty modified collection', function() {
            changesType.modified.should.be.instanceof(Array).and.have.length(0);
        });

        it('should have empty removed collection', function() {
            changesType.removed.should.be.instanceof(Array).and.have.length(0);
        });
    });

    it('should add new items to added collection', function() {
        changesType.addAdded('url1');
        changesType.added.shift().should.be.equal('url1');
    });

    it('should mark changes as modified after pushing new item into added collection', function() {
        changesType.addAdded('url1');
        changesType.areModified().should.be.equal(true);
    });

    it('should add new items to modified collection', function() {
        changesType.addModified('url1');
        changesType.modified.shift().should.be.equal('url1');
    });

    it('should mark changes as modified after pushing new item into modified collection', function() {
        changesType.addModified('url1');
        changesType.areModified().should.be.equal(true);
    });

    it('should add new items to removed collection', function() {
        changesType.addRemoved('url1');
        changesType.removed.shift().should.be.equal('url1');
    });

    it('should mark changes as modified after pushing new item into removed collection', function() {
        changesType.addRemoved('url1');
        changesType.areModified().should.be.equal(true);
    });
});
