<template>
  <div>
    <z-table ref="crud" :options="options">
      <!-- <template slot="indexHeader">
        <span v-if="addBtn">序号</span>
        <el-button
          v-else
          type="primary"
          size="mini"
          @click="addRow"
          icon="el-icon-plus"
          :disabled="disabled"
          circle
        ></el-button>
      </template> -->
      <template slot-scope="{scopeRow:scope}" slot="index">
        <el-button
          v-if="!delBtn && hoverList[scope.row.$index] && !disabled"
          @mouseout.native="mouseoutRow(scope.row.$index)"
          @click="delRow(scope.row.$index)"
          type="danger"
          size="mini"
          :disabled="disabled"
          icon="el-icon-delete"
          circle
        ></el-button>
        <span
          v-else-if="delBtn || !hoverList[scope.row.$index]"
          @mouseover="mouseoverRow(scope.row.$index)"
        >{{scope.row.$index+1}}</span>
      </template>
    </z-table>
  </div>
</template>

<script>

import props from "../../../common/props";
import events from "../../../common/events";
import { deepClone } from "../../../utils/util";

export default {
  name: "zDynamic",
  mixins: [props(), events()],
  data() {
    return {
      hoverList: []
    };
  },
  props: {
    children: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  computed: {
    tableMethods() {
      return this.children.tableMethods;
    },
    rowAdd() {
      return this.tableMethods ? this.tableMethods.rowAdd : false;
    },
    rowDel() {
      return this.tableMethods ? this.tableMethods.rowDel : false;
    },
    viewBtn() {
      return this.children.viewBtn === false;
    },
    delBtn() {
      return this.children.delBtn === false;
    },
    addBtn() {
      return this.children.addBtn === false;
    },
    columnOption() {
      return this.children.columnConfig || [];
    },
    options() {
      return Object.assign(
        (() => {
          let options = this.deepClone(this.children);
          // 分页配置
          if (options.uiConfig) {
            options.uiConfig.size = this.children.size;
            options.uiConfig.pagination = false;
            options.uiConfig.height = "auto";
          } else {
            options.uiConfig = {
              size: this.children.size,
              pagination: false,
              height: "auto"
            };
          }
          delete options.columnConfig;
          return options;
        })(),
        (() => {
          let list = [
            {
              label: "#",
              prop: "index",
              fixed: true,
              width: 50,
              slot: true,
              // headerSlot: true
              // 如果使用headerSlot，会有省略号
              // 使用headerSlot，disabled不能更新
              renderHeader: (h, { column, $index }) => {
                if (this.addBtn) {
                  return "序号";
                }
                return h("el-button", {
                  attrs: {
                    size: "mini",
                    type: "primary",
                    icon: "el-icon-plus",
                    disabled: this.disabled,
                    circle: true
                  },
                  on: {
                    click: this.addRow
                  }
                });
              }
            }
          ];
          this.columnOption.forEach((ele, index) => {
            // 设置默认值
            if (ele.valueDefault) {
              this.text.forEach((item, index) => {
                if (!item[ele.prop]) {
                  item[ele.prop] = ele.valueDefault;
                }
              });
            }

            list.push(
              Object.assign(this.deepClone(ele), {
                cell: true,
                disabled: ele.disabled || this.disabled || this.viewBtn
              })
            );
          });
          return {
            data: this.text,
            columnConfig: list
          };
        })()
      );
    }
  },
  mounted() {
    this.initData();
  },
  watch: {
    text() {
      this.initData();
    }
  },
  methods: {
    deepClone,
    initData() {
      this.text.forEach((ele, index) => {
        ele = Object.assign(ele, {
          $cellEdit: true
        });
      });
      this.handleChange(this.text);
    },
    mouseoverRow(index) {
      if (this.delBtn) return;
      this.flagList();
      this.$set(this.hoverList, index, true);
    },
    mouseoutRow(index) {
      if (this.delBtn) return;
      this.flagList();
      this.$set(this.hoverList, index, false);
    },
    flagList() {
      this.hoverList.forEach((ele, index) => {
        ele = false;
      });
    },
    delRow(index) {
      const callback = () => {
        this.text.splice(index, 1);
      };
      const row = this.text[index];
      if (typeof this.rowDel === "function") {
        this.rowDel(row, callback);
      } else {
        callback();
      }
    },
    addRow() {
      const callback = (obj = {}) => {
        this.$refs.crud.rowCellAdd(obj);
      };
      if (typeof this.rowAdd === "function") {
        this.rowAdd(callback);
      } else {
        callback();
      }
    }
  }
};
</script>
