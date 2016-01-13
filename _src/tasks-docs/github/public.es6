'use strict';

import _ from 'lodash';
import Api from 'github';

import Base from './base';
import Custom from './custom';

export default class Public extends Custom {

    constructor(options) {
        super(options);
        this.api = new Api(_.extend({host: 'api.github.com'}, Base.getBaseConfig()));

        if(!this.options.token) {
            this.logger.warn('No github authorization token were set. ' +
                'Number of requests will be limited by 60 requests per hour according to API rules');
            return;
        }

        this.api['authenticate']({type: 'oauth', token: this.options.token});
    }

    static getType() {
        return 'public';
    }
}
