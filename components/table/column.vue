<template>
  <span>
    <!-- 正常列 -->
    <template v-for="col in columnConfig">
      <multi-header-column
        v-if="col.children && col.children.length"
        :key="col.prop"
        :col="col"
        :align="col.align || parentOption.align || config.align"
        :header-align="col.headerAlign || parentOption.headerAlign || config.headerAlign"
      ></multi-header-column>
      <el-table-column
        v-else-if="!col.hide"
        :show-overflow-tooltip="vaildBoolean(col.showOverflowTooltip,true)"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :fixed="col.fixed"
        :sortable="col.sortable || false"
        :align="col.align || parentOption.align || config.align"
        :header-align="col.headerAlign || parentOption.headerAlign || config.headerAlign"
        :render-header="col.renderHeader"
        filter-placement="bottom-end"
        :filters="_handleFilters(col)"
        :filter-method="col.filter? _handleFiltersMethod : undefined"
        :filter-multiple="vaildBoolean(col.filterMultiple,true)"
      >
        <template v-if="col.headerSlot" #header>
          <slot :name="`${col.prop}Header`" :column="col"></slot>
        </template>
        <template #default="scopeRow">
          <slot
            v-if="col.slot"
            :name="col.prop"
            :value="getValueByPath(scopeRow.row, col.prop)"
            :label="handleDetail(scopeRow.row,col,DIC[col.prop])"
            :scopeRow="scopeRow"
            :row="scopeRow.row"
            :size="controlSize"
            :column="col"
            :readonly="col.readonly"
            :clearable="vaildBoolean(col.clearable,true)"
            :disabled="vaildBoolean(col.disabled,scopeRow.row.$btnDisabled)"
            :isEdit="cellEditFlag(scopeRow.row,col)"
            :dic="DIC[col.prop]"
          ></slot>
          <form-temp
            v-else-if="cellEditFlag(scopeRow.row,col)"
            :value="getValueByPath(scopeRow.row, col.prop)"
            :isCrud="true"
            :column="delete col.width ? col : col"
            :size="controlSize"
            :dic="DIC[col.prop]"
            :upload-before="col.uploadBefore"
            :upload-after="col.uploadAfter"
            :readonly="col.readonly"
            :clearable="vaildBoolean(col.clearable,true)"
            :disabled="vaildBoolean(col.disabled,scopeRow.row.$btnDisabled)"
            :textMode="col.textMode"
            @click.native.stop
            @input="modelInput($event,scopeRow.row,col)"
          ></form-temp>
          <template v-else>
            <span v-if="['array'].includes(col.type)">{{_detailData(scopeRow,col)}}</span>
            <span v-else-if="['url'].includes(col.type)">
              <el-link
                type="primary"
                v-bind="!!col.click ? '' :{
                  href: getValueByPath(scopeRow.row, col.prop),
                  target:col.target || '_blank'
                }"
                @click="col.click(getValueByPath(scopeRow.row, col.prop),scopeRow.row,col)"
              >{{getValueByPath(scopeRow.row, col.prop)}}</el-link>
            </span>
            <span v-else-if="col.displayAs=='switch' && ['switch'].includes(col.type)">
              <z-switch
                :size="controlSize"
                :value="getValueByPath(scopeRow.row, col.prop)"
                :activeColor="col.activeColor"
                :inactiveColor="col.inactiveColor"
                disabled
              />
            </span>
            <span v-else-if="['img'].includes(col.type)">
              <z-img
                :value="getValueByPath(scopeRow.row, col.prop)"
                :load="col.load"
                :error="col.error"
              >
                <!-- <template #placeholder="scope">
                  <slot :name="`${col.prop}Placeholder`" :scope="scope"></slot>
                </template>
                <template #error="scope">
                  <slot :name="`${col.prop}Error`" :scope="scope"></slot>
                </template>-->
              </z-img>
            </span>
            <span v-else v-html="_columnFormatter(scopeRow,col)"></span>
          </template>
        </template>
      </el-table-column>
    </template>
  </span>
</template>
<script>
import { detail } from "../../utils/detail";
import { validatenull } from "../../utils/validate";
import { deepClone, vaildBoolean } from "../../utils/util";
import formTemp from "../formtemp";
import { DIC_PROPS, DIC_SPLIT, EMPTY_VALUE } from "../../global/variable";
import multiHeaderColumn from './multiHeaderColumn';
import zImg from './z-img';

export default {
  name: "column",
  inject: ["crud"],
  provide() {
    return {
      multiColumn: this
    }
  },
  props: {
    columnConfig: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  components: { formTemp, multiHeaderColumn, zImg },
  data() {
    return {
      DIC: this.crud.DIC,
      config: this.crud.config,
      controlSize: this.crud.controlSize,
      parentOption: this.crud.parentOption,
      tableOption: this.crud.tableOption
    }
  },
  methods: {
    vaildBoolean,
    validatenull,
    cellEditFlag(row, column) {
      // && column.slot !== true
      // console.log("isEdit", row, column, row.$cellEdit && column.cell);
      return !!(row.$cellEdit && column.cell);
    },
    _detailData({ row }, col) {
      let { prop, dataType, props: { label } } = col
      let list = this.getValueByPath(row, prop);
      let res = EMPTY_VALUE;

      if (!Array.isArray(list) && ["string", "number"].includes(dataType)) {
        res = list.split(",").join(' | ');
      } else if (Array.isArray(list) && list.length) {
        res = list.map(item => item[label]).join(' | ');
      }

      return res;
    },
    // 由于slot-scope和formatter不能共存只能如此
    _columnFormatter(scopeRow, currentColumn) {
      let row = scopeRow.row;
      let column = scopeRow.column;

      if (typeof currentColumn.formatter === "function") {
        return currentColumn.formatter(row, this.getValueByPath(row, currentColumn.prop), currentColumn.label, currentColumn);
      } else {
        return this._globalColumnFormatter(row, column, currentColumn);
      }
    },
    // 全局初始化
    _globalColumnFormatter(row, column, currentColumn) {
      let value = this.getValueByPath(row, column.property);

      if (this.validatenull(value)) {
        return EMPTY_VALUE;
      }
      return this.handleDetail(
        row,
        currentColumn,
        this.DIC[currentColumn.prop]
      );
    },
    handleDetail(row, column, DIC) {
      let result = this.getValueByPath(row, column.prop);

      if (typeof column.type === "undefined") return result;
      // 如果是级联，切值为字符串，则需要对值进行处理
      if (column.type === "cascader" && typeof result === "string") {
        let list = result.split(",");
        if (list.length > 1) {
          row = deepClone(row);
          row[column.prop] = list;
        }
      }
      // 进行取值处理，取出对应的label值
      result = detail(row, column, this.tableOption, DIC);
      if (!this.validatenull(DIC)) {
        row["$" + column.prop] = result;
      }
      // 如果是级联，则对结果进行处理
      if (column.type === "cascader") {
        let { prop, props, presentText, showAllLevels } = column;
        // 如果开启了elementUI级联的lazy模式，则从column.presentText中读值，此值在cascader的mounted中赋值
        if (props && props.lazy) {
          result = presentText;
          row["$" + prop] = presentText;
        }
        if (showAllLevels === false && typeof result === "string") {
          let list = result.split(DIC_SPLIT);
          result = list[list.length - 1];
        }
      }
      return result;
    },
    modelInput(value, model, { type, prop }) {
      let parentObj = this.getPropByPath(model, prop).o;
      parentObj[prop.split('.').pop()] = value;
    },
    //表格筛选逻辑
    _handleFiltersMethod(value, row, column) {
      const columnNew = this.columnConfig.filter(
        ele => ele.prop === column.property
      )[0];
      if (typeof columnNew.filtersMethod === "function") {
        return columnNew.filtersMethod(value, row, columnNew);
      } else {
        return row[columnNew.prop] === value;
      }
    },
    //表格筛选字典
    _handleFilters(column) {
      if (column.filter !== true) return undefined;
      if (this.validatenull(column.dicFilters)) {
        let list = [];
        (this.DIC[column.prop] || []).forEach(ele => {
          const props = column.props || this.tableOption.props || {};
          list.push({
            text: ele[props.label || DIC_PROPS.label],
            value: ele[props.value || DIC_PROPS.value]
          });
        });
        return list;
      }
      return column.dicFilters;
    }
  }
};
</script>