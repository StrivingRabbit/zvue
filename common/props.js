import { initVal } from '../utils/dataformat';
import { validatenull } from '../utils/validate'
import { DIC_PROPS, DIC_HTTP_PROPS } from '../global/variable';
export default function (type) {
    const isCrud = type === 'crud';
    if (isCrud) {
        const getKeyFromProps = (options, keyName) => {
            return options.props ? options.props[keyName] || DIC_PROPS[keyName] : DIC_PROPS[keyName];
        }
        const getKeyFromPropsHttp = (options, keyName) => {
            return options.propsHttp ? options.propsHttp[keyName] || DIC_HTTP_PROPS[keyName] : DIC_HTTP_PROPS[keyName];
        }
        return {
            computed: {
                // 列表list字段
                listKey() {
                    return getKeyFromPropsHttp(this.options, 'list');
                },
                // 第几页字段
                pageNumKey() {
                    return getKeyFromPropsHttp(this.options, 'pageNum');
                },
                // 一页几条字段
                pageSizeKey() {
                    return getKeyFromPropsHttp(this.options, 'pageSize');
                },
                // 总数量字段
                totalKey() {
                    return getKeyFromPropsHttp(this.options, 'total');
                },
                // res返回结果字段
                resKey() {
                    return getKeyFromPropsHttp(this.options, 'res');
                },
                // 降序字段
                descKey() {
                    return getKeyFromPropsHttp(this.options, 'desc');
                },
                // 升序字段
                ascKey() {
                    return getKeyFromPropsHttp(this.options, 'asc');
                },
                // 升降序类型字段
                orderTypeKey() {
                    return getKeyFromPropsHttp(this.options, 'orderType');
                },
                // 根据什么属性排序字段
                orderPropKey() {
                    return getKeyFromPropsHttp(this.options, 'orderBy');
                },
                rowKey() {
                    return getKeyFromProps(this.options, 'rowKey');
                }
            },
        }
    } else {
        return {
            data() {
                return {
                    name: '',
                    text: undefined,
                    propsHttpDefault: DIC_HTTP_PROPS,
                    propsDefault: DIC_PROPS,
                    // displayValue: ''
                };
            },
            props: {
                blur: Function,
                focus: Function,
                change: Function,
                click: Function,
                value: {},
                button: {
                    type: Boolean,
                    default: false
                },
                border: {
                    type: Boolean,
                    default: false
                },
                clearable: {
                    type: Boolean,
                    default: true
                },
                column: {
                    type: Object,
                    default: () => ({})
                },
                dic: {
                    type: Array,
                    default: () => []
                },
                disabled: {
                    type: Boolean,
                    default: false
                },
                dataType: {
                    type: String
                },
                group: {
                    type: Boolean,
                    default: false
                },
                listType: {
                    type: String,
                    default: 'text'
                },
                label: {
                    type: String,
                    default: ''
                },
                min: {
                    type: Number
                },
                max: {
                    type: Number
                },
                multiple: {
                    type: Boolean,
                    default: false
                },
                placeholder: {
                    type: String,
                    default: ''
                },
                prop: {
                    type: String,
                    default: ''
                },
                propsHttp: {
                    type: Object,
                    default: () => DIC_HTTP_PROPS
                },
                props: {
                    type: Object,
                    default: () => DIC_PROPS
                },
                readonly: {
                    type: Boolean,
                    default: false
                },
                rules: {
                    type: [Array, Object]
                },
                row: {
                    type: Boolean,
                    default: false
                },
                size: {
                    type: String,
                    default: ''
                },
                tip: {
                    type: String,
                    default: ''
                },
                type: {
                    type: String,
                    default: ''
                },
                typeformat: Function,
                typeslot: {
                    type: Boolean,
                    default: false
                },

                dicData: {
                    type: Array,
                    default: () => []
                },
                dicUrl: {
                    // type: String || Function,
                    default: ''
                },
                dicMethod: {
                    type: String,
                    default: ''
                },
                dicQuery: {
                    type: Object,
                    default: () => ({})
                },

                textMode: {
                    type: Boolean,
                    default: false
                },
                settempDisplayValue: {
                    type: Function,
                    default: () => () => { }
                }
            },
            watch: {
                value: {
                    handler(val) {
                        this.initVal();
                    },
                    immediate: true
                }
            },
            computed: {
                componentName() {
                    const type = 'el';
                    const result = `${type}-${this.name}${this.button ? '-button' : ''}`
                    return result
                },
                required() {
                    return !validatenull(this.rules);
                },
                isArray() {
                    return this.dataType === 'array';
                },
                isString() {
                    return this.dataType === 'string';
                },
                isNumber() {
                    return this.dataType === 'number';
                },
                nameKey: function () {
                    return this.propsHttp.name || this.propsHttpDefault.name;
                },
                urlKey: function () {
                    return this.propsHttp.url || this.propsHttpDefault.url;
                },
                resKey: function () {
                    return this.propsHttp.res || this.propsHttpDefault.res;
                },
                groupsKey: function () {
                    return this.props.groups || this.propsDefault.groups;
                },
                valueKey: function () {
                    return this.props.value || this.propsDefault.value;
                },
                labelKey: function () {
                    return this.props.label || this.propsDefault.label;
                },
                childrenKey: function () {
                    return this.props.children || this.propsDefault.children;
                },
                disabledKey: function () {
                    return this.props.disabled || this.propsDefault.disabled;
                },
                idKey: function () {
                    return this.props.id || this.propsDefault.id;
                }
            },
            methods: {
                initVal() {
                    this.text = initVal({
                        type: this.type,
                        listType: this.listType,
                        multiple: this.multiple,
                        dataType: this.dataType,
                        value: this.value,
                        "curentForm": this
                    });
                }
            }
            /* render(h) {
                console.log("render -> this.textMode", this.textMode)
                if (this.textMode) {
                    return h('span', this.displayValue);
                } else {
                    return this.$vnode;
                }
            }, */
        };
    }
}
