import { validatenull } from "./validate"
import { DIC_PROPS, DIC_SPLIT, DIC_HTTP_PROPS, DIC_GROUP_SPLIT } from '../global/variable'
import AXIOS from 'axios'

export const deepClone = (value) => {
    return _.cloneDeep(value)
}
export const miAjax = ({ axios = this.$axios || AXIOS, url, method = 'get', query, resKey = DIC_HTTP_PROPS.res }) => {
    return new Promise((resolve, reject) => {
        if (typeof url === 'function') {
            url(query).then(res => {
                // _.get(res.data, resKey)
                resolve(res);
            }).catch(err => {
                resolve([]);
            })
        } else {
            if (method.toLowerCase() === 'get') {
                axios.get(url, {
                    params: query
                }).then(res => {
                    resolve(getValueByPath(res.data, resKey) || res.data)
                }).catch(err => {
                    resolve([]);
                })
            } else if (method.toLowerCase() === 'post') {
                axios.post(url, query).then(res => {
                    resolve(getValueByPath(res.data, resKey) || res.data)
                }).catch(err => {
                    resolve([]);
                })
            }
        }
    })
}
export const getPasswordChar = (result = '', char) => {
    return result;
};
export const findByValue = (dic, value, props, isTree, isCascader, isGroup, dataType) => {
    // 如果为空直接返回
    if (validatenull(dic)) return value;
    let result = '';
    props = props || DIC_PROPS;
    if (value instanceof Array) {
        result = [];
        // 如果是级联，则传递整个数组为值
        if (isCascader) {
            // 由于项目的级联中，同深度的树的id可能会重复，因此改为从根部匹配id，如果匹配到再向下查找
            result = findLabelNode(dic, value, props, dataType, isCascader) || value;
        } else {
            // 否则，一层层去查找
            for (let i = 0; i < value.length; i++) {
                const dicvalue = value[i];
                if (isTree) {
                    result.push(findLabelNode(dic, dicvalue, props, dataType) || dicvalue);
                } else {
                    result.push(findArrayLabel(dic, dicvalue, props, isGroup, dataType));
                }
            }
        }
        result = result.join(DIC_SPLIT).toString();
    } else if (['string', 'number', 'boolean'].includes(typeof value)) {
        result = findLabelNode(dic, value, props, dataType) || value;
    }
    return result;
};
export const findLabelNode = (dic, value, props, dataType, isCascader) => {
    // 不可在此处赋值，会造成死循环
    let result;
    let floors = 0;

    let rev = (dic1, value1, props1) => {
        const labelKey = props1.label || DIC_PROPS.label;
        const valueKey = props1.value || DIC_PROPS.value;
        const childrenKey = props1.children || DIC_PROPS.children;
        for (let i = 0; i < dic1.length; i++) {
            const ele = dic1[i];
            const children = ele[childrenKey] || [];
            if (ele[valueKey] === detailDataType(value1, dataType)) {
                // 如果是树，则找到root后，递归向下找
                if (isCascader) {
                    // 如果是级联，为了节省性能，需要每一个id匹配
                    result.push(ele[labelKey]);
                    rev(children, value[++floors], props);
                } else {
                    return result = ele[labelKey];
                }
            } else if (!isCascader) {
                // 如果不是树也往下遍历，例如只有一个Id需要反显的级联
                rev(children, value1, props);
            }
        }
    };

    if (value instanceof Array) {
        // 如果value是数组，则一层层查找，返回数组
        result = [];
        rev(dic, value[floors], props);
    } else {
        result = '';
        rev(dic, value, props);
    }
    return result;
};
export const findArrayLabel = (dic, value, props, isGroup, dataType) => {
    const valueKey = props.value || DIC_PROPS.value;
    const labelKey = props.label || DIC_PROPS.label;
    const groupsKey = props.groups || DIC_PROPS.groups;

    if (!isGroup) {
        for (let i = 0; i < dic.length; i++) {
            if (dic[i][valueKey] === detailDataType(value, dataType)) {
                return dic[i][labelKey];
            }
        }
    } else {
        // 如果分组
        for (let i = 0; i < dic.length; i++) {
            const groups = dic[i][groupsKey];
            const groupLabel = dic[i][labelKey];

            for (let j = 0; j < groups.length; j++) {
                if (groups[j][valueKey] === detailDataType(value, dataType)) {
                    return groups[j][labelKey];
                }
            }
        }
    }
    return value;
};
export const findArray = (dic, value, valueKey) => {
    valueKey = valueKey || DIC_PROPS.value;
    for (let i = 0; i < dic.length; i++) {
        if (dic[i][valueKey] === value) {
            return i;
        }
    }
    return -1;
};
export const vaildData = (val, dafult) => {
    if (typeof val === 'boolean') {
        return val;
    }
    return !validatenull(val) ? val : dafult;
};
export const vaildBoolean = (...args) => {
    for (let index = 0; index < args.length; index++) {
        const item = args[index];
        if (typeof item === 'boolean') {
            return item;
        }
    }
    return false;
}
/**
 * 转换数据类型
 */
export const detailDic = (list, props = {}, type) => {
    let valueKey = props.value || DIC_PROPS.value;
    let childrenKey = props.children || DIC_PROPS.children;
    list.forEach(ele => {
        if (type === 'number') {
            ele[valueKey] = Number(ele[valueKey]);
        } else if (type === 'string') {
            ele[valueKey] = ele[valueKey] + '';
        }
        if (ele[childrenKey]) {
            detailDic(ele[childrenKey], props, type);
        }
    });
    return list;
};
/**
 * 设置px
 */
export const setPx = (val, defval = '') => {
    if (validatenull(val)) val = defval;
    if (validatenull(val)) return '';
    val = val + '';
    if (val.indexOf('%') === -1) {
        val = val + 'px';
    }
    return val;
};
/**
 * 
 * @param {form的model} model
 * @param {是否去除空值和带$的值} translate 
 */
export const filterDefaultParams = (model, modelTranslate, translate = false, noModelFileds = []) => {
    let data = deepClone(model);
    if (translate) return deepClone({ ...data, ...modelTranslate });
    for (let o in data) {
        if (o.indexOf('$') !== -1 || validatenull(data[o]) || noModelFileds.includes(o)) {
            delete data[o];
        }
    }
    return data;
};
/**
 * 字符串数据类型转化
 */
export const detailDataType = (value, type) => {
    if (type === 'number') {
        return isNaN(Number(value)) ? undefined : Number(value);
    } else if (type === 'string') {
        return value + '';
    } else {
        return value;
    }
};
// 对对象进行循环
export const _objKeysForeach = (obj, cb) => {
    Object.keys(obj).forEach(function (key, index) {
        cb(key, obj[key], index)
    });
};
// 设置默认值
export const setDefaultValue = (defaultOptions, options, vm) => {
    _objKeysForeach(defaultOptions, function (key, value, index) {
        if (!options.hasOwnProperty(key)) {
            vm.$set(options, key, deepClone(value));
        } else {
            if (typeof value === "object" && typeof options[key] === "object") {
                setDefaultValue(value, options[key], vm);
            }
        }
    })
};
// 获取对象类型
export const _typeOf = (obj) => {
    return Object.prototype.toString.call(obj).split(' ')[1].slice(0, -1);
}

// 根据prop取值
export const getValueByPath = function (object, prop) {
    prop = prop || '';
    const paths = prop.split('.');
    let current = object;
    let result = null;
    for (let i = 0, j = paths.length; i < j; i++) {
        const path = paths[i];
        if (!current) break;

        if (i === j - 1) {
            result = current[path];
            break;
        }
        current = current[path];
    }
    return result;
};

// 根据path取值
export function getPropByPath(obj = {}, path = '', strict) {
    let tempObj = obj;
    path = path.replace(/\[(\w+)\]/g, '.$1');
    path = path.replace(/^\./, '');

    let keyArr = path.split('.');
    let i = 0;
    for (let len = keyArr.length; i < len - 1; ++i) {
        if (!tempObj && !strict) break;
        let key = keyArr[i];
        if (key in tempObj) {
            tempObj = tempObj[key];
        } else {
            if (strict) {
                throw new Error('please transfer a valid prop path to form item!');
            }
            break;
        }
    }
    return {
        o: tempObj,
        k: keyArr[i],
        v: tempObj ? tempObj[keyArr[i]] : null
    };
};

// 通过path赋值obj
export const setValueByPath = (obj = {}, path = '', value) => {
    let tempObj = obj;
    path = path.replace(/\[(\w+)\]/g, '.$1');
    path = path.replace(/^\./, '');

    let keyArr = path.split('.');
    let i = 0;
    for (let len = keyArr.length; i < len; ++i) {
        let key = keyArr[i];
        if (!(key in tempObj)) {
            if (i !== len - 1) {
                tempObj[key] = {};
                tempObj = tempObj[key];
            } else {
                tempObj[key] = value;
            }
        } else {
            if (i !== len - 1) {
                tempObj = tempObj[key];
            } else {
                tempObj[key] = value;
            }
        }
    }

    return obj;
}

// 节流
export const throttle = (fn, interval, isFirstAutoRun) => {
    /**
     * 
     * @param {要执行的函数} fn 
     * @param {在操作多长时间后可再执行，第一次立即执行} interval 
     */
    var _self = fn;
    var timer = null;
    var first = true;

    if (isFirstAutoRun) {
        _self();
    }

    return function () {
        var args = arguments;
        var _me = this;

        if (first) {
            first = false;
            _self.apply(_me, args);
        }

        if (timer) {
            return false;
        }

        timer = setTimeout(function () {
            clearTimeout(timer);
            timer = null;
            _self.apply(_me, args);
        }, interval || 200);
    }
}