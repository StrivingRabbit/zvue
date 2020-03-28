<template>
  <span>
    <template v-for="col in columnConfig">
      <el-table-column
        v-if="!col.hide"
        show-overflow-tooltip
        :key="col.label"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :fixed="col.fixed"
        :sortable="col.sortable || false"
        :align="col.align || crud.options.align || crud.config.align"
        :header-align="col.headerAlign || crud.options.headerAlign || crud.config.headerAlign"
        :render-header="col.renderHeader"
      >
        <template v-if="col.headerSlot" slot="header">
          <slot :name="`${col.prop}Header`" :column="col"></slot>
        </template>
        <template slot-scope="scopeRow">
          <slot
            v-if="col.slot"
            :name="col.prop"
            :label="handleShowLabel(scopeRow.row,col,DIC[col.prop])"
            :scopeRow="scopeRow"
            :row="scopeRow.row"
            :size="crud.controlSize"
            :column="col"
            :disabled="col.disabled"
            :isEdit="cellEditFlag(scopeRow.row,col)"
            :dic="crud.DIC[col.prop]"
          ></slot>
          <form-temp
            v-else-if="cellEditFlag(scopeRow.row,col)"
            v-model="scopeRow.row[col.prop]"
            :column="col"
            :size="crud.controlSize"
            :dic="crud.DIC[col.prop]"
            :upload-before="col.uploadBefore"
            :upload-after="col.uploadAfter"
            :disabled="col.disabled"
            @click.native.stop
          ></form-temp>
          <template v-else>
            <span v-html="_columnFormatter(scopeRow,col)"></span>
          </template>
        </template>
      </el-table-column>
    </template>
  </span>
</template>
<script>
import { detail } from "../../Form/utils/detail";
import { validatenull } from "../../Form/utils/validate";
import formTemp from "../../Form/formtemp";

export default {
  name: "column",
  inject: ["crud"],
  props: {
    columnConfig: {
      type: Array,
      required: true,
      default: []
    }
  },
  components: { formTemp },
  data() {
    return {
      DIC: {}
    };
  },
  methods: {
    validatenull,
    cellEditFlag(row, column) {
      // && column.slot !== true
      return row.$cellEdit && column.cell;
    },
    // 由于slot-scope和formatter不能共存只能如此
    _columnFormatter(scopeRow, currentColumn) {
      let row = scopeRow.row;
      let column = scopeRow.column;

      if (typeof currentColumn.formatter === "function") {
        return currentColumn.formatter(row, column);
      } else {
        return this._globalColumnFormatter(row, column, currentColumn);
      }
    },
    // 全局初始化
    _globalColumnFormatter(row, column, currentColumn) {
      let value = row[column.property];
      if (
        this.validatenull(value) ||
        (typeof value === "string" && value.trim().length === 0) ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return "--";
      }
      return this.handleDetail(
        row,
        currentColumn,
        this.DIC[currentColumn.prop]
      );
    },
    handleDetail(row, column, DIC) {
      let result = row[column.prop];
      result = detail(row, column, this.tableOption, DIC);
      if (!this.validatenull(DIC)) {
        row["$" + column.prop] = result;
      }
      // 如果是级联，则对结果进行处理
      if (column.type === "cascader") {
        if (column.showAllLevels === false) {
          let list = result.split(DIC_SPLIT);
          result = list[list.length - 1];
        }
      }
      return result;
    },
    handleShowLabel(row, column, DIC) {
      let result = "";
      result = detail(row, column, this.tableOption, DIC);
      if (!this.validatenull(DIC)) {
        row["$" + column.prop] = result;
      }
      return result;
    }
  }
};
</script>