var fsExtra = require('fs-extra'),
    Base = require('../../../../lib/tasks/libraries/model/base');

describe('task-libraries/model/Base', function() {
    var sandbox = sinon.sandbox.create(),
        base;

    beforeEach(function() {
        sandbox.stub(console, 'error');
        sandbox.stub(fsExtra, 'outputJSON');
        sandbox.stub(fsExtra, 'outputFile');
        base = new Base();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should have empty data after initialization', function() {
        base.getData().should.be.instanceOf(Object).and.be.empty;

    });

    it('should set value for given key', function() {
        base.setValue('foo', 'bar');
        base.getData().foo.should.equal('bar');
    });

    describe('saveFile', function() {
        it('should call valid method for saving JSON file', function() {
            fsExtra.outputJSON.yields(null, './file.json');
            base.saveFile('./file.json', {foo: 'bar'}, true).then(function() {
                fsExtra.outputJSON.should.be.calledOnce();
            });
        });

        it('should call valid method for saving text/html file', function() {
            fsExtra.outputFile.yields(null, './file.txt');
            base.saveFile('./file.json', {foo: 'bar'}, false).then(function() {
                fsExtra.outputFile.should.be.calledOnce();
            });
        });

        it('should return file path of saved file on successfully saving', function() {
            fsExtra.outputJSON.yields(null, './file.json');
            base.saveFile('./file.json', {foo: 'bar'}, true).should.eventually.equal('./file.json');
        });

        it('should trow error if error was occur while saving file', function() {
            fsExtra.outputJSON.yields(new Error('file error'));
            base.saveFile('./file.json', {foo: 'bar'}, true).should.be.rejectedWith('file error');
        });
    });
});
