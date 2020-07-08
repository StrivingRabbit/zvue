<template>
  <el-table-column
    v-if="!col.hide"
    show-overflow-tooltip
    :prop="col.prop"
    :label="col.label"
    :width="col.width"
    :min-width="col.minWidth"
    :align="align"
    :header-align="headerAlign"
    :render-header="col.renderHeader"
  >
    <!-- 使用column组件会排序错乱，如果加 width 1px的column，则边框会变粗 -->
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
        show-overflow-tooltip
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
      >
        <template v-if="col.headerSlot" slot="header">
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
            :disabled="col.disabled"
            :isEdit="cellEditFlag(scopeRow.row,col)"
            :dic="DIC[col.prop]"
          ></slot>
          <form-temp
            v-else-if="cellEditFlag(scopeRow.row,col)"
            :value="getValueByPath(scopeRow.row, col.prop)"
            :isCrud="true"
            :column="col"
            :size="controlSize"
            :dic="DIC[col.prop]"
            :upload-before="col.uploadBefore"
            :upload-after="col.uploadAfter"
            :disabled="col.disabled"
            :textMode="col.textMode"
            @click.native.stop
            @input="modelInput($event,scopeRow.row,col)"
          ></form-temp>
          <template v-else>
            <span
              v-if="['array'].includes(col.type)"
            >{{_detailData(getValueByPath(scopeRow.row, col.prop),col.dataType).join(' | ')}}</span>
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
            <span :style="{display:'flex'}" v-else-if="['img'].includes(col.type)">
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
  </el-table-column>
</template>
<script>
import zImg from './z-img';

export default {
  name: 'multiHeaderColumn',
  inject: ['multiColumn'],
  props: {
    'align': {},
    'header-align': {},
    col: {
      type: Object,
      required: true
    }
  },
  created() {
    let methodList = [
      'config',
      'parentOption',
      'validatenull',
      'cellEditFlag',
      '_detailData',
      '_columnFormatter',
      '_globalColumnFormatter',
      'handleDetail',
      'modelInput'
    ]

    methodList.forEach(method => {
      this[method] = this.multiColumn[method]
    });
  },
  data() {
    return {}
  },
  computed: {
    columnConfig() {
      return [...this.col.children];
    }
  },
  methods: {}
}
</script>