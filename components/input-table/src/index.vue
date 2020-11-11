<template>
  <el-popover :width="width" :disabled="disabled" v-model="show" transition="el-zoom-in-top">
    <el-input
      slot="reference"
      ref="input"
      :size="size"
      :value="labelShow"
      :clearable="disabled?false:clearable"
      :placeholder="placeholder"
      @focus="handleFocus"
      @blur="handleBlur"
      @clear="handleClear"
      :disabled="disabled"
    ></el-input>
    <z-table
      ref="inputTable"
      :options="options"
      @hook:mounted="tableMuntend"
      @selection-change="handleSelectChange"
      @row-click="handleCurrentRowChange"
      @handle-pagination="handlePagination"
      @search-submit="searchChange"
      @search-reset="searchChange"
    ></z-table>
  </el-popover>
</template>

<script>
import props from "../../../common/props";
import events from "../../../common/events";
import { validatenull } from "../../../utils/validate";
import { DIC_SPLIT, DIC_HTTP_PROPS } from "../../../global/variable";

// 需要自定义multiple
let mixinProps = props();
delete mixinProps.props.multiple;
const MinWidth = 500;

export default {
  name: "zInputTable",
  mixins: [mixinProps, events()],
  data() {
    return {
      active: null,
      show: false,
      create: false,
      width: null,
      options: {
        // menuBtn: false,
        size: "mini",
        headerAlign: "center",
        align: "center",
        uiConfig: {
          height: "400",
          pagination: {},
        },
        data: [],
        ...this.column.children,
      },
      searchModel: {}
    };
  },
  props: {
    formatter: Function,
    onLoad: Function,
    settempDisplayValue: Function,
  },
  watch: {
    text: {
      handler(val) {
        if (validatenull(val)) {
          if (this.$refs.inputTable) {
            this.$refs.inputTable.setCurrentRow();
            this.$refs.inputTable.clearSelection();
          }
          return;
        }
        // 开关区分行选中或者赋值
        if (this.create) {
          this.create = false;
          return;
        }
        // text改变后请求数据
        this.valueChangeOnList(val);
      },
    },
    value(val) {
      if (validatenull(val)) {
        this.multiple ? (this.active = []) : (this.active = {});
      }
    },
    // 监听children变化
    "column.children.data": {
      deep: true,
      handler(val) {
        this.options.data = val;
        this.$nextTick(() => {
          this.reserveShow();
        })
      },
    },
  },
  mounted() {
    let val = this.text;
    if (!validatenull(val)) {
      // 初始化数据
      // text改变后请求数据
      this.valueChangeOnList(val);
    }

    this.popoverWidth();
    window.addEventListener('resize', this.popoverWidth);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.popoverWidth);
  },
  computed: {
    Table() {
      return this.$refs.inputTable;
    },
    labelShow() {
      let labelShow = "";
      if (validatenull(this.text) || validatenull(this.active)) {
        return "";
      } else {
        if (typeof this.formatter == "function") {
          return this.formatter(this.active);
        }
        if (this._typeOf(this.active) === "Array") {
          labelShow =
            this.active.map((item) => item[this.labelKey]).join(DIC_SPLIT) ||
            "";
        } else {
          labelShow = this.active[this.labelKey] || "";
        }
      }
      this.settempDisplayValue(labelShow);
      return labelShow;
    },
    isServerMode() {
      return !!this.options.serverMode;
    },
    listKey() {
      return this.Table ? this.Table.listKey : DIC_HTTP_PROPS.list;
    },
    totalKey() {
      return this.Table ? this.Table.totalKey : DIC_HTTP_PROPS.total;
    },
    pageSizeKey() {
      return this.Table ? this.Table.pageSizeKey : DIC_HTTP_PROPS.pageSize;
    },
    pageNumKey() {
      return this.Table ? this.Table.pageNumKey : DIC_HTTP_PROPS.pageNum;
    },
    multiple() {
      return !!(
        this.options.uiConfig.selection || this.options.uiConfig.multiSelection
      );
    },
    selection() {
      return this.options.uiConfig.selection;
    },
    multiSelection() {
      return this.options.uiConfig.multiSelection;
    }
  },
  methods: {
    tableMuntend() {
      // 如果不是serverMode则走onLoad方法
      if (!this.isServerMode) {
        typeof this.onLoad === "function" &&
          this.onLoad({ page: null, value: "" }, (data) => {
            this.setTable({
              data: data[this.listKey],
              total: data[this.totalKey],
            });
          });
      }
    },
    setTable({ data = [], total }) {
      if (this.$refs.inputTable) {
        this.$refs.inputTable.setTotal(total);
        this.$refs.inputTable.setData(data);
      } else {
        this.options.data = data;
        this.options.uiConfig.pagination.total = total;
      }
      this.reserveShow();
    },
    reserveShow() {
      const data = this.$refs.inputTable.tableShowData || [];
      if (validatenull(data)) return;
      // 编写反显逻辑
      if (this.multiple) {
        const selected = data.map((item, index) =>
          (this._typeOf(this.text) === 'Array' ? this.text : [])
            .findIndex(textItem => textItem === item[this.valueKey]) !== -1 ? index : -1
        );
        if (!validatenull(selected)) {
          this.$refs.inputTable.toggleSelection(selected);
        }
      } else {
        const selectedIndex = data.findIndex(item => item[this.valueKey] === this.text);
        if (!validatenull(selectedIndex)) {
          this.$refs.inputTable.setCurrentRow(selectedIndex);
        }
      }
    },
    handleClear() {
      if (this.multiple) {
        this.text = [];
        this.handleSelectChange([], true);
      } else {
        this.text = "";
        this.handleCurrentRowChange({});
      }
    },
    // 单选
    handleCurrentRowChange(val) {
      if (val && !this.multiple) {
        this.active = val;
        this.text = this.active[this.valueKey] || this.text;
        this.handleChange(this.text);
        this.show = false;
        this.create = true;
      }
    },
    /**
     * 多选
     * selection 多选的值
     * formValueChange 是否是值改变引起的变化 为true时不取allSelectedData值
     */
    handleSelectChange(selection, formValueChange = false) {
      if (this.multiSelection && !formValueChange) {
        selection = this.Table.allSelectedData;
      }
      this.active = selection;
      this.text = !validatenull(this.active)
        ? this.active.map((item) => item[this.valueKey])
        : [];
      this.handleChange(this.text, selection);
      this.create = true;
      // 如果是值改变引起的变化，则需要再反显
      /* if (formValueChange) {
        this.reserveShow();
      } */
    },
    valueChangeOnList(val) {
      // text改变后请求数据
      this.onList((val) => {
        this.active = val;
        // 首次触发change事件
        if (this.multiple) {
          this.handleSelectChange(val, true);
        } else {
          this.handleCurrentRowChange(val);
        }
        // 反显
        setTimeout(() => {
          this.reserveShow();
        })
      });
    },
    onList(callback, params) {
      return new Promise((resolve, reject) => {
        // 加载数据
        if (this.isServerMode) {
          let { url, data } = this.options.serverMode;
          if (typeof url === "function") {
            url({ ...data, [this.valueKey]: this.text, ...params }).then((res) => {
              if (typeof callback == "function") {
                callback(
                  this.multiple ? res[this.listKey] : res[this.listKey][0]
                );
              } else {
                this.setTable({
                  data: res[this.listKey],
                  total: res[this.totalKey],
                });
              }
              resolve(res);
            });
          }
        } else if (typeof this.onLoad == "function") {
          this.onLoad(
            { page: this.Table ? this.Table.pagination : null, value: this.text, data: params },
            (data) => {
              if (typeof callback === "function") {
                callback(this.multiple ? data[this.listKey] : data);
              } else {
                this.setTable({
                  data: data[this.listKey],
                  total: data[this.totalKey],
                });
              }
              resolve(data);
            }
          );
        }
      })
    },
    handlePagination(pageSize, pageNum) {
      // 如果不是serverMode则走onLoad方法
      typeof this.onLoad === "function" &&
        this.onLoad(
          {
            page: { [this.pageSizeKey]: pageSize, [this.pageNumKey]: pageNum },
            value: ""
          }, (data) => {
            this.setTable({
              data: data[this.listKey],
              total: data[this.totalKey],
            });
          }
        );
    },
    popoverWidth() {
      let inputWidth = this.$parent.$el.getBoundingClientRect().width;
      this.width = inputWidth < MinWidth ? MinWidth : inputWidth;
    },
    searchChange(model, done) {
      this.onList(undefined, model).finally(() => {
        done && done();
      })
    }
  },
};
</script>
