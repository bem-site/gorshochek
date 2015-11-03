var ChangesType = require('../../../../lib/model/changes/type'),
    Changes = require('../../../../lib/model/changes');

describe('model/changes', function() {
    it('should be initialized successfully', function() {
        return new Changes();
    });

    it('should have pages changes model', function() {
        var changes = new Changes();
        changes.should.have.property('pages');
        changes.pages.should.be.instanceof(ChangesType);
    });

    it('should not be in modified state', function() {
        var changes = new Changes();
        changes.areModified().should.not.be.ok;
    });
});
