import { KEY_COMPONENT_NAME } from '../global/variable'
import { validatenull } from './validate'
import { detailDataType, setValueByPath } from './util';

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
    tree: 'input-tree',
    table: 'input-table'
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

    // 如果是范围滑块，则需要初始化为[0,0]
    if (type === 'slider') {
        if (curentForm.range) {
            if (!value.length) value = [0, 0];
            value = value.map(item => {
                return (validatenull(item) || isNaN(item)) ? 0 : item;
            })
        }
    }

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
 * 搜索框获取动态组件
 */
export const getSearchType = (column, component = false) => {
    const type = column.type;
    const range = column.searchRange;
    let result = type || 'input';
    if (['select', 'radio', 'checkbox', 'switch'].includes(type)) {
        result = 'select';
    } else if (dateList.includes(type)) {
        if (range) {
            if (type === 'date') {
                result = 'daterange';
            } else if (type === 'datetime') {
                result = 'datetimerange';
            } else if (type === 'time') {
                result = 'timerange';
            } else {
                result = type;
            }
        } else {
            if (type === 'daterange') {
                result = 'date';
            } else if (type === 'datetimerange') {
                result = 'datetime';
            } else if (type === 'timerange') {
                result = 'time';
            } else {
                result = type;
            }
        }
    } else if (['cascader'].includes(type)) {
        result = 'cascader';
    } else if (['number'].includes(type)) {
        result = 'input-number';
    } else if (['textarea'].includes(type)) {
        result = 'input';
    }
    if (component) {
        result = KEY_COMPONENT_NAME + result;
    }
    return result;
};
/**
 * 计算空白列row
 */
let count = 0;
export const calcCount = (ele, spanDefault = 12, init = false) => {
    /**
     * count  // 当前行已分配span
     * spanAll // 当前行总span
     */
    if (init) count = 0;
    const spanAll = 24;
    // 每次循环都要计算当前行已分配span
    count = count + (ele.span || spanDefault) + (ele.offset || 0);
    if (count === spanAll) {
        // 如果 已分配span 等于 总span，则当前行分配完毕，重置count为0
        count = 0;
    } else if (count > spanAll) {
        // 如果 已分配span 大于 总span，则说明另起一行，则需要重置 已分配span
        count = 0 + (ele.span || spanDefault) + (ele.offset || 0);
    } else if (ele.row && count !== spanAll) {
        // 如果有row属性，并且 已分配span 不等于 总span，既当前行span没有分配完毕
        // 则分配ele剩余count，并且重置 已分配span
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
        let currentValue = null;

        if (
            ['checkbox', 'cascader', 'dynamic', 'dates'].includes(ele.type) ||
            (ele.type === 'upload' && ele.listType !== 'picture-img') ||
            ele.multiple || ele.range || ele.dataType === 'array'
        ) {
            currentValue = [];
        } else if (
            ['number', 'rate', 'slider'].includes(ele.type) ||
            ele.dataType === 'number'
        ) {
            currentValue = undefined;
        } else if (['switch'].includes(ele.type) || ele.dataType === 'boolean') {
            currentValue = false;
        } else {
            currentValue = '';
        }
        // 表单默认值设置
        if (!validatenull(ele.valueDefault)) {
            if (ele.type === 'number' || ele.dataType === 'number') {
                currentValue = parseFloat(ele.valueDefault);
            } else {
                currentValue = ele.valueDefault;
            }
        }

        setValueByPath(tableForm, ele.prop, currentValue);
        if (ele.search)
            setValueByPath(searchForm, ele.prop, currentValue);

        // 搜索表单默认值设置
        if (!validatenull(ele.searchDefault)) {
            setValueByPath(searchForm, ele.prop, ele.searchDefault);
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
