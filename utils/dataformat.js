import { KEY_COMPONENT_NAME } from '../global/variable'
import { validatenull } from './validate'
import { detailDataType } from './util';

const dateList = [
    'dates',
    'date',
    'datetime',
    'datetimerange',
    'daterange',
    'week',
    'month',
    'monthrange',
    'dategrpup',
    'year'
];
export const dateTypeList = dateList;
let typeMap = {
    'select': "select",
    "radio": "radio",
    "checkbox": "checkbox",
    "cascader": "cascader",
    "cascader-panel": "cascader",
    "rate": "rate",
    "upload": "upload",
    "slider": "slider",
    "dynamic": "dynamic",
    "color": "color",
    "time": "time",
    'timerange': 'time',
    'icon-select': 'icon-select',
    switch: 'switch',
    number: 'input-number',
    password: 'input',
}

export const getComponent = function (type, component) {
    let result = 'input';
    if (!validatenull(component)) {
        result = component;
    } else if (typeMap[type]) {
        result = typeMap[type];
    } else if (dateList.includes(type)) {
        result = 'date';
    }
    return KEY_COMPONENT_NAME + result;
}

export const getPlaceholder = function (column, type, isDisabled) {
    // return column.placeholder;
    const placeholder = column.placeholder;
    const label = column.label;
    /* if (type === 'search') {
        const searchPlaceholder = column.searchPlaceholder;
        if (!validatenull(searchPlaceholder)) {
            return searchPlaceholder;
        } else {
            return label;
        }
    } else  */
    // 如果禁用状态，则取消占位显示
    if (isDisabled === true) {
        return '';
    }
    if (validatenull(placeholder)) {
        if (['select', 'checkbox', 'cascader', 'radio', 'tree'].includes(column.type)) {
            return `请选择 ${label}`;
        } else {
            return `请输入 ${label}`;
        }
    }

    return placeholder;
}

/**
 * 初始化数据格式
 */
export const initVal = ({ listType, type, multiple, dataType, value, curentForm = {} }) => {
    // cascader 去除处理
    if (
        (['select', 'tree'].includes(type) && multiple) ||
        ['cascader', 'checkbox', 'dynamic', 'upload'].includes(type)
    ) {
        let isCascader = type === 'cascader';
        // 头像框特殊处理
        if (listType === 'picture-img' && type === 'upload') {
            if (typeof value === 'string' && value.trim().length > 0) {
                value = [value];
            } else if (curentForm.autoUpload === false && value instanceof File) {
                value = [URL.createObjectURL(value)];
            } else {
                value = [];
            }
        }
        if (Array.isArray(value) || typeof value === 'number') {
            // 如果是数组，number不做处理，这两个elementUI官方级联支持
        } else if (!validatenull(value) && typeof value === 'string') {
            const list = (value || '').split(',') || [];
            // 如果只有一项，则重新转换为字符串，对应一个id反显级联
            if (list.length <= 1 && isCascader) {
                value = list.join(',')
            } else {
                value = list;
            }
        } else {
            value = [];
        }
    }

    // 日期处理，不是很恰当，后面可能需要去除
    /* if (dateList.includes(type) || ['time', 'timerange'].includes(type)) {
        if (value instanceof Array && value.length > 0) {
            value = value.map(date => {
                if (validatenull(date)) {
                    return new Date();
                }
                if (typeof date === 'string') {
                    return new Date(date);
                } else {
                    return date;
                }
            });
        } else if (typeof value === "string" && value.length != 0) {
            value = new Date(value);
        }
    } */

    // 如果是范围滑块，则需要初始化为[0,0]
    if (type === 'slider') {
        if (curentForm.range) {
            if (!value.length) value = [0, 0];
            value = value.map(item => {
                return (validatenull(item) || isNaN(item)) ? 0 : item;
            })
        }
    }

    // 数字处理
    /* if ((type === 'number' || curentForm.rawtype === 'number'
        || dataType === 'number') && typeof value !== 'undefined') {
        value = parseFloat(value);
        if (isNaN(value)) {
            value = undefined;
        }
    } */

    // 数据转换，解决数据不匹配问题
    if (dataType) {
        if (Array.isArray(value)) {
            // 数据转化
            value = value.map((ele, index) => detailDataType(ele, dataType));
        } else {
            value = detailDataType(value, dataType);
        }
    }
    return value;
};
/**
 * 计算级联属性
 */
export const calcCascader = (list = []) => {
    list.forEach((ele, index) => {
        if (ele.cascaderItem) {
            let cascader = [...ele.cascaderItem];
            let parentProp = ele.prop;
            list[index].cascader = [...cascader];
            cascader.forEach((citem, cindex) => {
                const columnIndex = index + cindex + 1;
                list[columnIndex].parentProp = parentProp;
                list[columnIndex].cascaderChange = ele.cascaderChange;
                list[columnIndex].cascader = [...cascader].splice(cindex + 1);
                parentProp = list[columnIndex].prop;
            });
        }
    });
    return list;
};
/**
 * 计算空白列row
 */
let count = 0;
export const calcCount = (ele, spanDefault = 12, init = false) => {
    if (init) count = 0;
    const spanAll = 24;
    count = count + (ele.span || spanDefault) + (ele.offset || 0);
    if (count === spanAll) {
        count = 0;
    } else if (count > spanAll) {
        count = 0 + (ele.span || spanDefault) + (ele.offset || 0);
    } else if (ele.row && count !== spanAll) {
        ele.count = spanAll - count;
        count = 0;
    }
    return ele;
};
/**
 * 表格初始化值
 */
export const formInitVal = (list = []) => {
    let tableForm = {};
    let searchForm = {};
    list.forEach(ele => {
        if (ele.notModel) return;
        if (
            ['checkbox', 'cascader', 'dynamic', 'dates'].includes(ele.type) ||
            (ele.type === 'upload' && ele.listType !== 'picture-img') ||
            ele.multiple || ele.range || ele.dataType === 'array'
        ) {
            tableForm[ele.prop] = [];
            if (ele.search) searchForm[ele.prop] = [];
        } else if (
            ['number', 'rate', 'slider'].includes(ele.type) ||
            ele.dataType === 'number'
        ) {
            tableForm[ele.prop] = undefined;
            if (ele.search) {
                searchForm[ele.prop] = undefined;
            }
        } else if (['switch'].includes(ele.type) || ele.dataType === 'boolean') {
            tableForm[ele.prop] = false;
            if (ele.search) {
                searchForm[ele.prop] = false;
            }
        } else {
            tableForm[ele.prop] = '';
            if (ele.search) {
                searchForm[ele.prop] = '';
            }
        }
        // 表单默认值设置
        if (!validatenull(ele.valueDefault)) {
            if (ele.type === 'number' || ele.dataType === 'number') {
                tableForm[ele.prop] = parseFloat(ele.valueDefault);
            } else {
                tableForm[ele.prop] = ele.valueDefault;
            }
        }
        // 搜索表单默认值设置
        if (!validatenull(ele.searchDefault)) {
            searchForm[ele.prop] = ele.searchDefault;
        }
    });
    return {
        tableForm,
        searchForm
    };
};

// 将数据设置到Form的modelTranslate
export const setModelTranslate = (vm, prop, value) => {
    let Form = vm;
    while (Form && !Form.modelTranslate) {
        Form = Form.$parent;
    }
    // displayValue
    Form.$set(Form.modelTranslate, `$${prop}`, value);
}
