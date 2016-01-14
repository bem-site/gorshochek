'use strict';

import _ from 'lodash';
import Base from './base';

export default class Custom extends Base {

    constructor(options) {
        super(options);
    }

    getDefaultBranch(options, headers, callback) {
        return this.getRepo(options, headers, (error, result) => {
            return error ? callback(error) : callback(null, result['default_branch']);
        });
    }

    hasIssues(options, headers, callback) {
        return this.getRepo(options, headers, (error, result) => {
            return error ? callback(error) : callback(null, result['has_issues']);
        });
    }

    isBranchExists(options, headers, callback) {
        return this.getBranch(options, headers, error => {
            if(!error) {
                callback(null, true);
            } else if(error.code === 404) {
                callback(null, false);
            } else {
                callback(error);
            }
        });
    }
}
