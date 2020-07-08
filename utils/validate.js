import Schema from 'async-validator';

/**
 * 判断是否为空
 */
export const validatenull = (val) => {
    // null or undefined
    if (val == null) return true;

    if (typeof val === 'boolean') return false;

    if (typeof val === 'number') return false;

    if (val instanceof Error) return val.message === '';

    switch (Object.prototype.toString.call(val)) {
        // String or Array
        case '[object String]':
        case '[object Array]':
            return !val.length;

        // Map or Set or File
        case '[object File]':
        case '[object Map]':
        case '[object Set]': {
            return !val.size;
        }
        // Plain Object
        case '[object Object]': {
            return !Object.keys(val).length;
        }
    }

    return false;
    /* return _.isEmpty(value) &&
        !_.isNumber(value) &&
        !_.isDate(value) &&
        !_.isBoolean(value) &&
        !_.isFunction(value); */
}

export const asyncValidator = (rules, form, option = { firstFields: true }) => new Promise((resolve, reject) => {
        const schema = new Schema(rules);
        schema.validate(form, option, errors => {
            if (errors) {
                reject(errors);
            } else {
                resolve();
            }
        });
    });
