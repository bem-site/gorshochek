var ChangesType = require('../../../../lib/model/changes/type'),
    Changes = require('../../../../lib/model/changes');

describe('model/changes', function() {
    it('should have pages changes model', function() {
        var changes = new Changes();
        changes.pages.should.be.instanceof(ChangesType);
    });

    it('should not be in modified state after initialization', function() {
        var changes = new Changes();
        changes.areModified().should.be.equal(false);
    });
});
