var _ = require('lodash'),
    should = require('should'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    MergeModels = require('../../../lib/tasks/merge-models');

describe('MergeModels', function () {
    var config, task;

    before(function () {
        config = new Config('./test/stub/');
        task = new MergeModels(config, {});
    });

    it('should return valid task name', function () {
        MergeModels.getName().should.equal('merge models');
    });

    it('run', function (done) {
        var oldModel = [
                { url: '/url1', a: 'a1', b: 1, c: { c1: 'c11', c2: 'c21' } },
                { url: '/url2', a: 'a2', b: 2, c: { c1: 'c12', c2: 'c22' } },
                { url: '/url3', a: 'a3', b: 3, c: { c1: 'c13', c2: 'c23' } },
                { url: '/url4', a: 'a4', b: 4, c: { c1: 'c14', c2: 'c24' } },
                { url: '/url5', a: 'a5', b: 5, c: { c1: 'c15', c2: 'c25' } }
            ],
            newModel = [
                { url: '/url1', a: 'a1', b: 1, c: { c1: 'c11', c2: 'c21' } },
                { url: '/url4', a: 'b4', b: 4, c: { c1: 'c14', c2: 'd24' } },
                { url: '/url5', a: 'b5', b: 5, c: { c1: 'c15', c2: 'd25' } },
                { url: '/url6', a: 'a6', b: 6, c: { c1: 'c16', c2: 'c26' } },
                { url: '/url7', a: 'a7', b: 7, c: { c1: 'c17', c2: 'c27' } }
            ],
            model = new Model();

        model.setOldModel(oldModel);
        model.setNewModel(newModel);

        task.run(model).then(function (model) {
            model.getPages().should.be.instanceOf(Array).and.have.length(5);
            should.deepEqual(_.sortBy(model.getPages(), 'url'), _.sortBy(newModel, 'url'));
            should.deepEqual(model.getChanges().pages.added, [
                { type: 'page', url: '/url6' },
                { type: 'page', url: '/url7' }
            ]);
            should.deepEqual(model.getChanges().pages.removed, [
                { type: 'page', url: '/url2' },
                { type: 'page', url: '/url3' }
            ]);
            should.deepEqual(model.getChanges().pages.modified, [
                { type: 'page', url: '/url4' },
                { type: 'page', url: '/url5' }
            ]);
            done();
        });
    });
});

