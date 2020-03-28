import Schema from 'async-validator';

/**
 * 判断是否为空
 */
export const validatenull = (value) => {
    return _.isEmpty(value) &&
        !_.isNumber(value) &&
        !_.isDate(value) &&
        !_.isBoolean(value) &&
        !_.isFunction(value);
}

export const asyncValidator = (rules, form, option = { firstFields: true }) =>
    new Promise((resolve, reject) => {
        const schema = new Schema(rules);
        schema.validate(form, option, errors => {
            if (errors) {
                reject(errors);
            } else {
                resolve();
            }
        });
    });
