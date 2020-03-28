import { DIC_HTTP_PROPS, DIC_PROPS } from "../global/variable";
const getKeyFromProps = (options, keyName) => {
    return options.props ? options.props[keyName] || DIC_PROPS[keyName] : DIC_PROPS[keyName];
}
const getKeyFromPropsHttp = (options, keyName) => {
    return options.propsHttp ? options.propsHttp[keyName] || DIC_HTTP_PROPS[keyName] : DIC_HTTP_PROPS[keyName];
}

export default function () {
    return {
        data() { },
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
}