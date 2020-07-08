<template>
  <el-popover :disabled="disabled" v-model="show">
    <el-input
      slot="reference"
      :size="size"
      :value="labelShow"
      :clearable="disabled?false:clearable"
      :placeholder="placeholder"
      @focus="handleFocus"
      @blur="handleBlur"
      @clear="handleClear"
      :disabled="disabled"
      readonly
    ></el-input>
    <z-table
      @hook:mounted="tableMuntend"
      ref="inputTable"
      :options="options"
      @row-click="handleCurrentRowChange"
    ></z-table>
  </el-popover>
</template>

<script>
import props from "../../../common/props";
import events from "../../../common/events";
import { validatenull } from "../../../utils/validate";

export default {
  name: "zInputTable",
  mixins: [props(), events()],
  data() {
    return {
      active: null,
      show: false,
      create: false,
      options: {
        menuBtn: false,
        size: 'mini',
        headerAlign: 'center',
        align: 'center',
        uiConfig: {
          height: '400',
          pagination: {}
        },
        data: [],
        ...this.column.children
      }
    };
  },
  props: {
    formatter: Function,
    onLoad: Function,
    settempDisplayValue: Function
  },
  watch: {
    text: {
      immediate: true,
      handler(val) {
        if (this.create || validatenull(val)) {
          this.create = false;
          return;
        }
        // 初始化数据
        this.onList(val => {
          this.active = val;
          // 首次触发change事件
          this.handleCurrentRowChange(val);
        });
      }
    },
    // 监听children变化
    "column.children.data": {
      deep: true,
      handler(val) {
        this.options.data = val;
      }
    }
  },
  computed: {
    Table() {
      return this.$refs.inputTable;
    },
    labelShow() {
      let labelShow = '';
      if (validatenull(this.text) || this.active === null) {
        labelShow = '';
      } else {
        if (typeof this.formatter == 'function') {
          labelShow = this.formatter(this.active)
        }
        labelShow = this.active[this.labelKey] || ''
      }
      this.settempDisplayValue(labelShow);
      return labelShow;
    },
    isServerMode() {
      return !!this.options.serverMode;
    },
    listKey() {
      return this.Table ? this.Table.listKey : 'list'
    },
    totalKey() {
      return this.Table ? this.Table.totalKey : 'total'
    }
  },
  methods: {
    tableMuntend() {
      // 如果不是serverMode则走onLoad方法
      typeof this.onLoad === 'function' && this.onLoad({ page: '', value: '' }, data => {
        this.setTable({ data: data[this.listKey], total: data[this.totalKey] });
      })
    },
    setTable({ data = [], total }) {
      if (this.Table) {
        this.Table.setTotal(total);
        this.Table.setData(data);
      } else {
        this.options.data = data;
        this.options.uiConfig.pagination.total = total;
      }
    },
    handleClear() {
      this.handleCurrentRowChange({})
    },
    handleCurrentRowChange(val) {
      this.active = val;
      this.text = this.active[this.valueKey] || ''
      this.handleChange(this.text)
      this.show = false;
      this.create = true;
    },
    onList(callback) {
      // 加载数据
      if (this.isServerMode) {
        let { url, data } = this.options.serverMode;
        if (typeof url === 'function') {
          url({ ...data, [this.valueKey]: this.text }).then(res => {
            if (typeof callback == 'function') {
              callback(res[this.listKey][0])
            } else {
              this.setTable({ data: res[this.listKey], total: res[this.totalKey] });
            }
          })
        }
      } else if (typeof this.onLoad == 'function') {
        this.onLoad({ page: this.Table ? this.Table.pagination : '', value: this.text }, data => {
          if (typeof callback == 'function') {
            callback(data[this.listKey][0])
          } else {
            this.setTable({ data: data[this.listKey], total: data[this.totalKey] });
          }
        })
      }
    }
  }
};
</script>
