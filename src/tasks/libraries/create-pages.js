'use strict';

const path = require('path');
const Q = require('q');
const fsExtra = require('fs-extra');
const baseUtil = require('../../util');

const debug = require('debug')('libraries create-pages');

const DOCUMENTS = [
    {name: 'changelog', title: 'Changelog', files: ['CHANGELOG', 'Changelog', 'changelog']},
    {name: 'migration', title: 'Migration', files: ['MIGRATION', 'Migration', 'migration']},
    {name: 'license', title: 'License', files: ['LICENSE', 'License', 'license']},
    {name: 'showcase', title: 'Showcase', files: ['SHOWCASE', 'Showcase', 'showcase']}
];

const pathExists = Q.denodeify(fsExtra.pathExists);
const readFile = Q.denodeify(fsExtra.readFile);
const readdir = Q.denodeify(fsExtra.readdir);
const stat = Q.denodeify(fsExtra.stat);

/**
 * Creates model pages for library versions, documents and blocks.
 * @param {Model} model - application model instance
 * @param {Object} [options] - task options object
 * @param {String} [options.libsPath] - path to checked out libraries
 * @param {String} [options.language] - documentation language
 * @param {Function} [options.checkoutLibrary] - optional hook to prepare library checkout
 * @param {Function} [options.resolveLibraryPath] - optional hook to resolve version path
 * @returns {Function}
 */
module.exports = (model, options) => {
    options = options || {};
    options.libsPath = options.libsPath || './.cache/libs';
    options.language = options.language || options.lang || 'en';

    function normalizeUrl(url) {
        return url + (url.charAt(url.length - 1) === '/' ? '' : '/');
    }

    function trimSlashes(value) {
        return String(value).replace(/^\/+|\/+$/g, '');
    }

    function appendUrl(baseUrl) {
        const parts = Array.prototype.slice.call(arguments, 1).map(trimSlashes);
        return normalizeUrl(normalizeUrl(baseUrl) + parts.filter(Boolean).join('/'));
    }

    function normalizeVersion(version) {
        return String(version).replace(/\//g, '-');
    }

    function getLibraryName(page) {
        if(page.lib) {
            return page.lib;
        }

        if(page.title) {
            return page.title;
        }

        return normalizeUrl(page.url).split('/').filter(Boolean).pop();
    }

    function getVersionPath(page, version, lib, versionName) {
        if(options.resolveLibraryPath) {
            return options.resolveLibraryPath(page, version, lib, versionName);
        }

        return path.join(options.libsPath, `${lib}-${versionName}`);
    }

    function isLibraryPage(page) {
        return baseUtil.isPagePublished(page) && page.type === 'lib' && page.versions && page.versions.length;
    }

    function getLocalizedFileNames(fileNames) {
        return fileNames.reduce((prev, fileName) => {
            return prev.concat([
                `${fileName}.${options.language}.md`,
                `${fileName}.${options.language}.markdown`,
                `${fileName}.md`,
                `${fileName}.markdown`,
                fileName
            ]);
        }, []);
    }

    function readFirstExisting(filePaths) {
        return filePaths.reduce((prev, filePath) => {
            return prev.then(content => {
                if(content !== null) {
                    return content;
                }

                return pathExists(filePath).then(exists => {
                    return exists ? readFile(filePath, {encoding: 'utf-8'}) : null;
                });
            });
        }, Q(null));
    }

    function readLocalizedFile(basePath, fileNames) {
        return readFirstExisting(getLocalizedFileNames(fileNames).map(fileName => path.join(basePath, fileName)));
    }

    function assertVersionPath(versionPath) {
        return pathExists(versionPath).then(exists => {
            if(!exists) {
                throw new Error(`Library checkout does not exist: ${versionPath}`);
            }
        });
    }

    function listDirectories(dirPath) {
        return readdir(dirPath)
            .then(names => {
                return Q.all(names.sort().map(name => {
                    const fullPath = path.join(dirPath, name);
                    return stat(fullPath).then(stats => {
                        return stats.isDirectory() ? name : null;
                    });
                }));
            })
            .then(names => names.filter(Boolean))
            .catch(error => {
                if(error.code === 'ENOENT') {
                    return [];
                }

                throw error;
            });
    }

    function createVersionPage(page, lib, versionName, versionUrl, readme) {
        return {
            url: versionUrl,
            site: versionUrl,
            title: `${lib} ${versionName}`,
            content: readme || '',
            type: 'lib',
            lib,
            version: versionName,
            bundle: page.bundle,
            aliases: [],
            published: true
        };
    }

    function createDocumentPage(page, lib, versionName, versionUrl, document, content) {
        return {
            url: appendUrl(versionUrl, document.name),
            site: versionUrl,
            title: document.title,
            content,
            document: document.name,
            lib,
            version: versionName,
            bundle: page.bundle,
            aliases: [],
            published: true
        };
    }

    function createBlockPage(page, lib, versionName, versionUrl, platform, block) {
        return {
            url: appendUrl(versionUrl, platform, block),
            site: versionUrl,
            title: block,
            content: block,
            type: 'block',
            platform,
            block,
            lib,
            version: versionName,
            bundle: page.bundle,
            aliases: [],
            published: true
        };
    }

    function createDocumentPages(page, lib, versionName, versionUrl, versionPath) {
        return Q.all(DOCUMENTS.map(document => {
            return readLocalizedFile(versionPath, document.files).then(content => {
                return content === null ? null :
                    createDocumentPage(page, lib, versionName, versionUrl, document, content);
            });
        })).then(pages => pages.filter(Boolean));
    }

    function createBlockPages(page, lib, versionName, versionUrl, versionPath) {
        return listDirectories(versionPath)
            .then(names => names.filter(name => /\.docs$/.test(name)))
            .then(levels => {
                return Q.all(levels.map(level => {
                    const platform = level.replace(/\.docs$/, '');
                    return listDirectories(path.join(versionPath, level)).then(blocks => {
                        return blocks.map(block => createBlockPage(
                            page,
                            lib,
                            versionName,
                            versionUrl,
                            platform,
                            block
                        ));
                    });
                }));
            })
            .then(levels => levels.reduce((prev, pages) => prev.concat(pages), []));
    }

    function prepareLibrary(page, version, versionPath) {
        if(!options.checkoutLibrary) {
            return Q();
        }

        return Q(options.checkoutLibrary(page, version, versionPath));
    }

    function createVersionPages(page, version) {
        const lib = getLibraryName(page);
        const versionName = normalizeVersion(version);
        const versionUrl = appendUrl(page.url, versionName);
        const versionPath = getVersionPath(page, version, lib, versionName);

        debug(`create library pages for ${lib}@${version}: ${versionPath}`);

        return prepareLibrary(page, version, versionPath)
            .then(() => assertVersionPath(versionPath))
            .then(() => {
                return Q.all([
                    readLocalizedFile(versionPath, ['README', 'Readme', 'readme']),
                    createDocumentPages(page, lib, versionName, versionUrl, versionPath),
                    createBlockPages(page, lib, versionName, versionUrl, versionPath)
                ]);
            })
            .spread((readme, documents, blocks) => {
                return [createVersionPage(page, lib, versionName, versionUrl, readme)]
                    .concat(documents)
                    .concat(blocks);
            });
    }

    function createPagesForLibrary(page) {
        return Q.all(page.versions.map(version => createVersionPages(page, version)))
            .then(versions => versions.reduce((prev, pages) => prev.concat(pages), []));
    }

    return () => {
        const libraryPages = model.getPages().filter(isLibraryPage);

        return Q.all(libraryPages.map(createPagesForLibrary))
            .then(results => {
                const generatedPages = results.reduce((prev, pages) => prev.concat(pages), []);
                model.setPages(model.getPages().concat(generatedPages));
                return model;
            });
    };
};
