'use strict';

import _ from 'lodash';
import Api from 'github';

import Base from './base';
import Custom from './custom';

export default class Private extends Custom {

    constructor(options) {
        super(options);
        this.api = new Api(_.extend({
            host: 'github.yandex-team.ru',
            pathPrefix: '/api/v3'
        }, Base.getBaseConfig()));
    }

    static getType() {
        return 'private';
    }
}
