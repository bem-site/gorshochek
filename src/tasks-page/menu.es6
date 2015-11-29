import PageBase from './base';

export default class PageMenu extends PageBase {

    /**
     * Returns logger module
     * @returns {module|Object|*}
     */
    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {String}
     */
    static getName() {
        return 'create page menu';
    }

    /**
     * Performs task
     * @returns {Promise}
     * @public
     */
    run(model) {
        // TODO implement menu creation here

        this.logger.info(`Successfully finish task "${this.constructor.getName()}"`);
        return Promise.resolve(model);
    }
}
