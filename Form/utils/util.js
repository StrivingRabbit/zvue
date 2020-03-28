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
                    resolve(_.get(res.data, resKey))
                }).catch(err => {
                    resolve([]);
                })
            } else if (method.toLowerCase() === 'post') {
                axios.post(url, query).then(res => {
                    resolve(_.get(res.data, resKey))
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
export const findByValue = (dic, value, props, isTree, isGroup, dataType) => {
    // 如果为空直接返回
    if (validatenull(dic)) return value;
    let result = '';
    props = props || DIC_PROPS;
    if (value instanceof Array) {
        result = [];
        // 如果是树，则传递整个数组为值
        if (isTree) {
            result = findLabelNode(dic, value, props, dataType, isTree) || value;
        } else {
            // 否则，一层层去查找
            for (let i = 0; i < value.length; i++) {
                const dicvalue = value[i];
                result.push(findArrayLabel(dic, dicvalue, props, isGroup, dataType));
            }
        }
        result = result.join(DIC_SPLIT).toString();
    } else if (['string', 'number', 'boolean'].includes(typeof value)) {
        result = findLabelNode(dic, value, props, dataType, false) || value;
    }
    return result;
};
export const findLabelNode = (dic, value, props, dataType, isTree) => {
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
                if (isTree) {
                    result.push(ele[labelKey]);
                    rev(children, value[++floors], props);
                } else {
                    return result = ele[labelKey];
                }
            } else if (!isTree) {
                // 如果不是树也往下遍历，例如只有一个Id需要反显的级联
                rev(children, value, props);
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
export const filterDefaultParams = (model, modelTranslate, translate = false) => {
    let data = deepClone(model);
    if (translate) return deepClone({ ...data, ...modelTranslate });
    for (let o in data) {
        if (o.indexOf('$') !== -1 || validatenull(data[o])) {
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