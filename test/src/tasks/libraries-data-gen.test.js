var Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    LibrariesDataGen = require('../../../lib/tasks/libraries-data-gen');

describe('LibrariesDataGen', function() {
    it('should return valid task name', function() {
        LibrariesDataGen.getName().should.equal('generate libraries files');
    });

    describe('instance methods', function() {
        var config, task;

        beforeEach(function() {
            config = new Config('debug');
            task = new LibrariesDataGen(config, { baseUrl: '/libraries' });
        });

        describe('_findLibraryChanges', function() {
            it('should filter changes model and return only library changes (added)', function() {
                var model = new Model();
                model.getChanges().pages.addAdded({ url: '/url1', title: '/title1' });
                model.getChanges().pages.addAdded({ lib: 'lib1', version: 'version1' });
                model.getChanges().pages.addAdded({ url: '/url2', title: '/title2' });
                model.getChanges().pages.addAdded({ lib: 'lib2', version: 'version2' });

                should.deepEqual(task._findLibraryChanges(model, 'added'), [
                    { lib: 'lib1', version: 'version1' },
                    { lib: 'lib2', version: 'version2' }
                ]);
            });

            it('should filter changes model and return only library changes (modified)', function() {
                var model = new Model();
                model.getChanges().pages.addModified({ url: '/url1', title: '/title1' });
                model.getChanges().pages.addModified({ lib: 'lib1', version: 'version1' });
                model.getChanges().pages.addModified({ url: '/url2', title: '/title2' });
                model.getChanges().pages.addModified({ lib: 'lib2', version: 'version2' });

                should.deepEqual(task._findLibraryChanges(model, 'modified'), [
                    { lib: 'lib1', version: 'version1' },
                    { lib: 'lib2', version: 'version2' }
                ]);
            });
        });

        describe('_spreadByProcesses', function() {
            var libVersions;

            beforeEach(function() {
                libVersions = [
                    { lib: 'lib1', version: 'version1' },
                    { lib: 'lib1', version: 'version2' },
                    { lib: 'lib1', version: 'version3' },
                    { lib: 'lib2', version: 'version1' },
                    { lib: 'lib2', version: 'version2' },
                    { lib: 'lib3', version: 'version1' },
                    { lib: 'lib4', version: 'version1' }
                ];
            });

            it('should spread items (numOfProcesses = 2)', function() {
                var numOfProcesses = 2;
                should.deepEqual(task._spreadByProcesses(libVersions, numOfProcesses), [
                    [
                        { lib: 'lib1', version: 'version1' },
                        { lib: 'lib1', version: 'version3' },
                        { lib: 'lib2', version: 'version2' },
                        { lib: 'lib4', version: 'version1' }
                    ],
                    [
                        { lib: 'lib1', version: 'version2' },
                        { lib: 'lib2', version: 'version1' },
                        { lib: 'lib3', version: 'version1' }
                    ]
                ]);
            });

            it('should spread items (numOfProcesses = 3)', function() {
                var numOfProcesses = 3;
                should.deepEqual(task._spreadByProcesses(libVersions, numOfProcesses), [
                    [
                        { lib: 'lib1', version: 'version1' },
                        { lib: 'lib2', version: 'version1' },
                        { lib: 'lib4', version: 'version1' }
                    ],
                    [
                        { lib: 'lib1', version: 'version2' },
                        { lib: 'lib2', version: 'version2' }
                    ],
                    [
                        { lib: 'lib1', version: 'version3' },
                        { lib: 'lib3', version: 'version1' }
                    ]
                ]);
            });
        });
    });
});
