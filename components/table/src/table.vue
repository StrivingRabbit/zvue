<template>
  <div class="zvue-table-wrapper" :style="{ height: wrapperHeight, width: setPx(tableOption.width) }">
    <header-search :search="search" ref="headerSearch">
      <template #search="{ size, row }">
        <slot name="search" :row="row" :size="size"></slot>
      </template>
      <template slot="searchMenu" slot-scope="{ size, row }">
        <slot name="searchMenu" :row="row" :size="size"></slot>
      </template>
      <template #{item.prop}="{ value, column, dic, size, label, disabled }" v-for="item in columnFormOption">
        <slot
          :value="value"
          :column="column"
          :dic="dic"
          :size="size"
          :label="label"
          :disabled="disabled"
          :row="search"
          :name="item.prop + 'Search'"
          v-if="item.searchslot"
        ></slot>
      </template>
    </header-search>
    <!-- v-if="uiConfig.multiSelection || options.customTop || $scopedSlots['custom-top']" -->
    <div
      v-if="uiConfig.multiSelection || options.customTop || $scopedSlots['custom-top']"
      style="display: flex; justify-content: space-between; flex-direction: row-reverse; margin-bottom: 20px"
      ref="customTop"
    >
      <div
        v-if="options.customTop || $scopedSlots['custom-top']"
        :style="{
          textAlign: options.customTopPosition || config.customTopPosition,
          height: 'auto',
          margin: '0 20px',
        }"
      >
        <slot
          :name="config.topSlotName"
          :size="controlSize"
          :columnConfig="columnConfig"
          :allData="allData"
          :tableShowData="tableShowData"
          :selectedData="selectedData"
          :currentRowData="currentRowData"
          :lastCurrentRowData="lastCurrentRowData"
          :allSelectedData="allSelectedData"
        ></slot>
      </div>
      <!-- 跨页多选 -->
      <el-tooltip
        v-if="uiConfig.multiSelection"
        :content="allSelectedData.length ? `分别为${allSelectedDataPages}页` : '暂无数据'"
        placement="top"
        style="margin: 0 20px"
      >
        <el-tag type="primary">
          跨页多选：{{ allSelectedData.length }}条
          <el-link
            style="vertical-align: top"
            type="danger"
            :underline="false"
            @click="_emptyAllSelectedData"
            v-if="!!allSelectedData.length"
          >
            清空
          </el-link>
        </el-tag>
      </el-tooltip>
    </div>
    <div v-loading="loading" class="zvue-table-body">
      <el-table
        ref="dataBaseTable"
        highlight-current-row
        :border="tableOption.border || config.border"
        :header-row-class-name="headerRowClassName"
        :header-row-style="tableOption.headerRowStyle"
        :row-class-name="tableOption.rowClassName"
        :cell-class-name="cellClassName"
        :row-key="rowKey"
        :lazy="tableOption.lazy"
        :tree-props="
          tableOption.treeProps || {
            children: 'children',
            hasChildren: 'hasChildren',
          }
        "
        :load="_treeLoad"
        :expand-row-keys="expandList"
        :default-expand-all="tableOption.defaultExpandAll"
        :row-style="tableOption.rowStyle || config.rowStyle"
        :cell-style="tableOption.cellStyle || config.cellStyle"
        :header-cell-style="tableOption.headerCellStyle || config.headerCellStyle"
        :key="key"
        :data="tableShowData"
        :height="tableHeight"
        :size="controlSize"
        :show-header="tableOption.showHeader"
        :show-summary="tableOption.showSummary"
        :summary-method="_tableSummaryMethod"
        :span-method="_tableSpanMethod"
        @current-change="_currentChange"
        @expand-change="_expandChagne"
        @row-click="rowClick"
        @row-dblclick="rowDblclick"
        @sort-change="sortChange"
        @select-all="selectAll"
        @selection-change="selectionChange"
        @select="select"
        @cell-mouse-enter="_cellMouseEnter"
        @cell-mouse-leave="_cellMouseLeave"
      >
        <!-- 折叠面板  -->
        <el-table-column
          key="expand"
          type="expand"
          align="center"
          v-if="tableOption.expand"
          :width="tableOption.expandWidth || config.expandWidth"
          :fixed="vaildData(tableOption.expandFixed, config.expandFixed)"
        >
          <template #default="{ row, index }">
            <slot :row="row" :index="index" name="expand"></slot>
          </template>
        </el-table-column>

        <!-- 多选 -->
        <el-table-column
          v-if="uiConfig.selection"
          key="selection"
          fixed="left"
          type="selection"
          :width="config.selectionWidth"
          :selectable="_selectable"
          align="center"
        ></el-table-column>

        <!-- 索引 -->
        <el-table-column
          v-if="uiConfig.showIndex"
          key="table_column_index"
          fixed="left"
          type="index"
          :index="uiConfig.showIndex.handler"
          :width="uiConfig.showIndex.width || config.indexWidth"
          :align="uiConfig.showIndex.align || 'center'"
        >
          <template slot="header">{{ uiConfig.showIndex.label || config.indexLabel }}</template>
        </el-table-column>

        <!-- 解决使用 column 组件多选索引顺序错位 -->
        <el-table-column width="1px"></el-table-column>
        <column :columnConfig="columnConfig">
          <template v-for="col in columnConfig" slot-scope="{ column }" :slot="`${col.prop}Header`">
            <slot :name="`${col.prop}Header`" :column="column"></slot>
          </template>
          <template
            v-for="col in columnConfig"
            #[col.prop]="{ scopeRow, label, row, size, column, disabled, isEdit, dic }"
          >
            <slot
              :name="col.prop"
              v-bind="{
                scopeRow,
                label,
                row,
                size,
                column,
                disabled,
                isEdit,
                dic,
              }"
            ></slot>
          </template>
        </column>

        <!-- 列操作 -->
        <el-table-column
          v-if="btnConfig"
          key="column_operation"
          class-name="zvue-table_operation"
          :fixed="btnConfig.fixed || 'right'"
          :prop="btnConfig.prop"
          :label="btnConfig.label"
          :width="btnConfig.width"
          :align="btnConfig.align || parentOption.align || 'center'"
          :header-align="btnConfig.headerAlign || parentOption.headerAlign || 'center'"
        >
          <!-- 搜索框 -->
          <template v-if="uiConfig.searchable" #header>
            <el-input v-model="searchVal" :size="controlSize" placeholder="检索" />
          </template>
          <!-- 按钮 -->
          <template #default="{ row, $index, column }">
            <!-- 编辑按钮 -->
            <el-button
              type="text"
              :size="controlSize"
              :disabled="row.$btnDisabled"
              @click.stop="rowCell(row, $index)"
              v-if="vaildBoolean(tableOption.editBtn, config.editBtn)"
            >
              {{ _editBtnText(row) }}
            </el-button>
            <!-- 取消按钮 -->
            <el-button
              v-if="row.$cellEdit && vaildBoolean(tableOption.calcelBtn, config.calcelBtn)"
              type="text"
              :size="controlSize"
              :disabled="row.$btnDisabled"
              @click.stop="rowCanel(row, $index)"
            >
              {{ parentOption.cancelBtnText || config.cancelBtnText }}
            </el-button>
            <!-- 操作列的slot -->
            <slot
              v-if="vaildData(tableOption.operation, !!$scopedSlots.operation)"
              :name="config.operationSlotName"
              :scopeRow="{ row, $index, column }"
              :row="row"
              :column="column"
              :index="$index"
              :isEdit="vaildBoolean(row.$cellEdit, false)"
              :disabled="row.$btnDisabled"
              :size="controlSize"
            ></slot>
            <!-- 基础模式，如删除，编辑。参数为scopeRow -->
            <template v-for="btn in btnConfig.btns">
              <!-- :size="btn.size || uiConfig.size" -->
              <el-button
                v-if="btn.type === 'basic' || !btn.type"
                :size="btn.size || controlSize"
                type="text"
                :key="btn.label"
                @click.stop="btn.handler({ row, $index, column })"
              >
                <i v-if="btn.icon" :class="btn.icon"></i>
                {{ btn.label }}
              </el-button>
              <!-- 带下拉按钮，参数为scopeRow -->
              <z-dropdown
                v-if="btn.type === 'dropDown'"
                :size="btn.size || controlSize"
                :key="btn.label"
                :dropDown="btn"
                :carryData="{ row, $index, column }"
                :style="{ display: 'inline-block' }"
              />
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div :ref="config.paginationSlotName" v-if="uiConfig.pagination" class="zvue-table-pagination">
        <z-pagination
          :key="`${options.ref}_pagination`"
          :paginationConfig="uiConfig.pagination"
          :currentPage="paginationObj.currentPage"
          :pageSize="paginationObj.pageSize"
          :total="uiConfig.pagination.total || tableData.length"
          :handleSizeChange="_handleSizeChange"
          :handleCurrentChange="_handleCurrentChange"
        >
          <template #default>
            <slot
              :currentPage="paginationObj.currentPage"
              :pageSize="paginationObj.pageSize"
              :total="uiConfig.pagination.total || tableData.length"
              name="pagination"
            ></slot>
          </template>
        </z-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import column from '../column'
import config from '../../../global/config'
import props from '../../../common/props'
import init from '../../../common/init'

import formTemp from '../../formtemp'
import { validatenull, asyncValidator } from '../../../utils/validate'
import { deepClone, vaildData, vaildBoolean, setDefaultValue, setPx, getPropByPath } from '../../../utils/util'
import { EMPTY_VALUE } from '../../../global/variable'

import headerSearch from '../header-search'

// 单双击冲突timer
let dblclickTimer = null
let paginationTimer = null

// 多选数组
let multiSelectionArray = []

//点击事件屏蔽列
let preventClick = ['selection', 'operation', 'img']

export default {
  name: 'zTable',
  mixins: [props('crud'), init('crud')],
  components: { formTemp, column, headerSearch },
  props: {
    propsHttp: {
      type: Object,
      default: () => ({}),
    },
    load: {
      type: Boolean,
      default: false,
    },
    search: {
      type: Object,
      default: () => ({}),
    },
    summaryMethod: Function,
    spanMethod: Function,
    selectable: Function,
  },
  provide() {
    return {
      crud: this,
    }
  },
  data() {
    return {
      config,
      prevSelectedData: [], //表格当前多选数据
      selectedData: [], //表格当前多选数据
      allData: [], //保存数组原始数据，用来复原数据
      tableData: [], //表格传入数据，用作分页使用
      tableShowData: [], //表格实际展示数据
      tableMethods: {}, //触发方法
      methodsQueue: [], //方法队列，因为可能是ajax请求的数据，所以需要在加载未成功前缓存方法，加载成功后再执行
      key: 1, //在doLayout中改变，为保证每次Table都是重新渲染
      loading: false, //是否呈加载状态
      currentPage: 1, // 内部使用
      pageSize: Infinity, // 内部使用
      searchVal: '',
      tableHeight: undefined,
      layoutHeight: [], //高度数组，用来决定整体高度
      // 规则
      formRules: {},
      formCellRules: {},
      formCascaderList: [],
      formIndexList: [],
      currentRowData: [], // 当前选中行
      lastCurrentRowData: [], // 上一选中行
      expandList: [], // 展开的列
      sumsList: [],
    }
  },
  created() {
    const options = this.options
    /**
     * 事件配置处理
     */
    this.tableMethods = options.tableMethods ? options.tableMethods : {}
    //如果行单击和行双击都设置了，则需要解决事件冲突
    if (
      (this.tableMethods.rowClick && this.tableMethods.rowDblclick) ||
      (this.$listeners['row-click'] && this.$listeners['row-dblclick'])
    ) {
      this.clickConflict = true
    }

    //服务器模式
    this.isServerMode = options.serverMode

    // 折叠
    this.expandList.concat(this.options.expandedRows)

    //ui配置处理
    if (options.uiConfig && options.uiConfig.pagination === true) {
      this.options.uiConfig.pagination = {}
    }

    this._tableInit()
      .then(res => {
        this._dataIndexInit()
        // 数据加载完成
        this.$emit('onloadeddata', res, this)
      })
      .catch(err => {
        // 数据未加载完成，报错
        this.$emit('unloadeddata', err, this)
      })
    this.handleLoadDic()
  },
  mounted() {
    this.$nextTick(() => {
      this._computedLayoutHeight()
    })
  },
  methods: {
    vaildData,
    vaildBoolean,
    setPx,
    $log(...args) {
      console.log(...args)
    },
    /**
     * 内部使用方法
     */
    _tableInit(reload) {
      return new Promise((resolve, reject) => {
        //服务器模式处理
        // console.log(this.currentPage, this.pageSize);
        if (this.isServerMode) {
          this._loadServerMode(this.isServerMode.data)
            .then(res => {
              resolve(res)
            })
            .catch(err => {
              reject(err)
            })
        } else {
          //如果是刷新表格，如果data为空，说明是在外部使用ajax请求数据，则出现加载动画，3秒后加载动画关闭
          //  || !this.options.data || this.options.data.length === 0
          if (reload) {
            this.loading = true
            setTimeout(() => {
              this.loading = false
            }, 2000)
          }

          if (!this.options.data) this.options.data = []

          this._setTableData(this.options.data)
          this.setTotal(this.options.data.length)

          resolve({ data: this.options.data, total: this.options.data.length })
        }
      })
    },
    // 检索
    _getFilterTableData() {
      return this.allData.filter((row, index) => {
        //如果开启搜索则进行检索，否则直接返回true
        if (this.uiConfig.searchable) {
          //获取要检索的prop
          let filterColumnConfig = Array.isArray(this.uiConfig.searchable)
            ? this.uiConfig.searchable
            : this.columnConfig
          //如果列中有一项符合则返回  问题
          return filterColumnConfig.some((col, colIndex) => {
            //如果设置了筛选项，则不用再从prop中读取，其值即为prop
            let currentProp = col.prop ? col.prop : col

            //如果不存在，则跳过
            if (!row[currentProp]) return false

            let isMatch =
              typeof row[currentProp] === 'number'
                ? row[currentProp] == this.searchVal.toLowerCase()
                : row[currentProp].toLowerCase().includes(this.searchVal.toLowerCase())

            return !this.searchVal || isMatch
          })
        } else {
          return true
        }
      })
    },
    // 获取分页数据
    _getPatinationData() {
      return new Promise((resolve, reject) => {
        let currentPage = this.currentPage
        let pageSize = this.pageSize
        let paginationConfig = this.uiConfig.pagination

        if (paginationConfig) {
          //如果采用服务端分页模式
          if (this.isServerMode) {
            this._loadServerMode(
              Object.assign(this.isServerMode.data, {
                [this.pageSizeKey]: pageSize,
                [this.pageNumKey]: currentPage,
              })
            )
              .then(res => {
                resolve(res)
              })
              .catch(err => {
                reject(err)
              })
          } else {
            //如果不是服务器模式
            // 如果tableData.length >= total，说明allData是全部数据，使用tableData分页即可
            if (this.tableData.length >= this.uiConfig.pagination.total) {
              let currentIndex = currentPage * pageSize
              this.tableShowData = this.tableData.slice(currentIndex - pageSize, currentIndex)
            } else {
              // 否则直接显示设置数据
              this.tableShowData = this.tableData
            }
            resolve()
          }
        } else {
          this.tableShowData = this.tableData
          resolve()
        }
        // 重置搜索数据
        this.searchVal = ''
      })
    },
    // 加载服务端数据
    _loadServerMode(data) {
      return new Promise((resolve, reject) => {
        //加载中开始
        this.loading = true

        let serverMode = this.isServerMode
        let url = this.isServerMode.url
        this._axios({
          mehtod: this.isServerMode.type,
          url: url,
          data: data,
        })
          .then(res => {
            this._setTableData(getPropByPath(res, this.listKey).v)
            this.setTotal(getPropByPath(res, this.totalKey).v)
            resolve(res)
          })
          .catch(err => {
            reject(err)
          })
          .finally(() => {
            //加载中结束
            this.loading = false
          })
      })
    },
    // AXIOS
    _axios({ mehtod = 'get', url = '', data = {} }) {
      if (url instanceof Function) {
        return url(data)
      } else if (typeof url === 'string') {
        return this.$axios({ mehtod, url, data })
      }
    },
    //放进方法队列
    _pushInMethodsQueue(fn, params) {
      this.methodsQueue.push({
        fn: fn,
        params: params,
      })
    },
    // 计算高度
    _computedLayoutHeight() {
      // 如果是 auto 或者 没有配置height 且 pagination为false 则根据内容自适应
      if (this.uiConfig.height === 'auto' || (!this.uiConfig.height && this.uiConfig.pagination === false)) return

      // 拿到设置高度
      let _height = this.uiConfig.height ? parseFloat(this.uiConfig.height) : this.$el.parentNode.clientHeight

      // 放进layout数组中
      this.layoutHeight.push(_height)

      // 计算组件中$refs的高度
      for (const key in this.$refs) {
        if (this.$refs.hasOwnProperty(key)) {
          const curRef = this.$refs[key]

          let element = null
          if (curRef.nodeType === 1) {
            element = curRef
          } else {
            element = curRef.$el
          }

          if (element.clientHeight && key !== 'dataBaseTable') {
            _height = _height - element.clientHeight
          }
        }
      }

      // 分页有20px的margin-top
      this.tableHeight = _height - 20
    },
    _dataIndexInit() {
      //初始化序列的参数 在外部拿到数据后，可以通过$index来进行 行编辑 函数调用
      ;(this.isServerMode ? this.tableShowData : this.tableData).forEach((ele, index) => {
        if (ele.$cellEdit) {
          this.formCascaderList[index] = deepClone(ele)
        }
        ele.$index = index
      })
    },
    _setTableData(data) {
      // 如果开启修改模式，则data默认开启修改
      if (this.options.edit === true) {
        data = data.map(item => ({
          ...item,
          $cellEdit: true,
        }))
      }

      if (!(data instanceof Array)) return
      if (this.isServerMode) {
        this.tableShowData = data
      } else {
        this.tableData = data
        // 在本地模式下，重新赋值后，重设total 会造成请求完后设置total无效
        // this.setTotal(data.length);
      }
      this.allData = data
      // 设置总页数为null，这样在数据更新后没有手动设置total，会自动读取数据长度
      // this.setTotal(null);
    },
    //分页模式，每页显示数量变化时触发
    _handleSizeChange(pageSize) {
      this.pageSize = pageSize
    },
    //分页模式，切换页时触发
    _handleCurrentChange(currentPage) {
      this.currentPage = currentPage
    },
    // 当前行发生变化
    _currentChange(currentRow, oldCurrentRow) {
      this.currentRowData = currentRow
      this.lastCurrentRowData = oldCurrentRow

      this.$emit('current-change', currentRow, oldCurrentRow)
    },
    _expandChagne(row, expandedRows) {
      this.$emit('expand-change', row, expandedRows)

      // 手风琴模式，只展开一个
      if (this.parentOption.expandOne) {
        this.toggleRowExpansion()
        if (expandedRows.length) {
          this.expandList.push(row[this.rowKey])
        }
      } else if (this._typeOf(expandedRows) === 'Array') {
        this.expandList = [...expandedRows]
      }
    },
    //合集统计逻辑
    _tableSummaryMethod(param) {
      //如果自己写逻辑则调用summaryMethod方法
      if (typeof this.summaryMethod === 'function') return this.summaryMethod(param)
      const { columns, data } = param
      const sums = []
      if (columns.length > 0) {
        columns.forEach((column, index) => {
          let currItem = this.sumColumnList.find(item => item.name === column.property)
          if (index === 0) {
            sums[index] = this.tableOption.sumText || config.sumText
          } else if (currItem) {
            switch (currItem.type) {
              case 'count':
                sums[index] = '计数：' + data.length
                break
              case 'avg':
                let avgValues = data.map(item => Number(item[column.property]))
                let nowindex = 1
                sums[index] = avgValues.reduce((perv, curr) => {
                  let value = Number(curr)
                  if (!isNaN(value)) {
                    return (perv * (nowindex - 1) + curr) / nowindex++
                  } else {
                    return perv
                  }
                }, 0)
                sums[index] = '平均：' + sums[index].toFixed(2)
                break
              case 'sum':
                let values = data.map(item => Number(item[column.property]))
                sums[index] = values.reduce((perv, curr) => {
                  let value = Number(curr)
                  if (!isNaN(value)) {
                    return perv + curr
                  } else {
                    return perv
                  }
                }, 0)
                sums[index] = '合计：' + sums[index].toFixed(2)
                break
            }
          } else {
            sums[index] = EMPTY_VALUE
          }
        })
      }
      this.sumsList = sums
      return sums
    },
    //合并行
    _tableSpanMethod(...args) {
      if (typeof this.spanMethod === 'function') return this.spanMethod(...args)
    },
    //树懒加载
    _treeLoad(tree, treeNode, resolve) {
      this.$emit('tree-load', tree, treeNode, data => {
        tree.children = data
        resolve(data)
      })
    },
    // 当前行是否可多选
    _selectable(...args) {
      if (typeof this.selectable === 'function') return this.selectable(...args)
      return true
    },
    // 反选之前在当前页选中的项
    _setPrevSelectedData() {
      // 因为直接用prevSelectedData值，不能进行反选，所以
      // 将rowKey取出来再从tableShowData中取值反选
      const currentPageSelectedData = this.prevSelectedData[this.currentPage]
      if (currentPageSelectedData) {
        let prevSelectedRowKeys = currentPageSelectedData.map(item => item[this.rowKey])

        let prevSelected = this.tableShowData.filter((item, index) => prevSelectedRowKeys.includes(item[this.rowKey]))

        this.toggleSelection(prevSelected, true)
      }
    },
    // 鼠标移入移出
    _cellMouseEnter(row, column, cell, event) {
      this.$emit('cell-mouse-enter', row, column, cell, event)
    },
    _cellMouseLeave(row, column, cell, event) {
      this.$emit('cell-mouse-leave', row, column, cell, event)
    },

    /**
     * 以下行编辑
     */
    _editBtnText(row) {
      return row.$cellEdit === true
        ? this.parentOption.saveBtnText || this.config.saveBtnText
        : this.parentOption.editBtnText || this.config.editBtnText
    },
    formRulesInit() {
      for (let index = 0; index < this.propOption.length; index++) {
        const item = this.propOption[index]
        if (item.rules && item.disabled !== true && item.display !== false) {
          let currentRules = item.rules
          // 添加进rules
          if (Array.isArray(currentRules)) {
            // 必填时自动生成message
            currentRules.forEach(currentRule => {
              fillRequiredRule(currentRule, item)
            })
            this.$set(this.formRules, item.prop, currentRules)
            if (item.cell) {
              this.$set(this.formCellRules, item.prop, currentRules)
            }
          } else if (this._typeOf(currentRules) === 'Object') {
            // 必填时自动生成message
            this.fillRequiredRule(currentRules, item)
            this.$set(this.formRules, item.prop, [currentRules])
            if (item.cell) {
              this.$set(this.formCellRules, item.prop, [currentRules])
            }
          }
        }
      }
    },
    // 必填时自动生成message
    fillRequiredRule(currentRules, item) {
      if (validatenull(currentRules.validator) && (!currentRules.message || currentRules.message.trim().length === 0)) {
        if (currentRules.required) {
          currentRules.message = `必填，请填写${item.label}`
        }
      }
    },
    rowCell(row, index) {
      debugger
      if (row.$cellEdit) {
        this.rowCellUpdate(row, index)
      } else {
        this.rowCellEdit(row, index)
      }
    },
    //单元格新增
    rowCellAdd(obj = {}) {
      const len = this.tableShowData.length
      this.tableShowData.push(
        deepClone(
          Object.assign(
            {
              $cellEdit: true,
              $index: len,
            },
            obj
          )
        )
      )
      this.formIndexList.push(len)
      return len
    },
    //行取消
    rowCanel(row, index) {
      if (row.$cellEdit) {
        if (validatenull(row[this.rowKey])) {
          this.tableShowData.splice(index, 1)
          return
        }
        // this.$set(row, '$cellEdit', false);
        // 行编辑状态重设
        this.rowCancelSaveCurStatus(row, index)
        // 编辑取消事件
        this.$emit('row-edit-cancel', row, index)
      }
    },
    // 单元格编辑
    rowCellEdit(row, index) {
      if (row.$cellEdit !== true) {
        this.$set(row, '$cellEdit', true)
        // this.$set(this.tableShowData, index, row);
        // 行编辑状态保存
        this.rowEditSaveCurStatus(row, index)
        // 编辑事件
        this.$emit('row-edit', row, index)
      }
    },
    //单元格更新
    rowCellUpdate(row, index) {
      return new Promise((resolve, reject) => {
        asyncValidator(this.formCellRules, row)
          .then(res => {
            this.$set(row, '$btnDisabled', true)

            // 返回参数
            const cbParams = [
              row,
              index,
              () => {
                /* row.$cellEdit = false;
              this.$set(this.tableShowData, index, row); */
                this.$set(row, '$cellEdit', false)
                this.$set(row, '$btnDisabled', false)
                this.formCascaderList[index] = row
              },
              () => {
                this.$set(row, '$btnDisabled', false)
              },
            ]

            this.$emit('row-update', ...cbParams)

            resolve(...cbParams)
            // 通过promise返回
          })
          .catch(errors => {
            setTimeout(() => {
              errors[0].message = `第${index + 1}行：${errors[0].message}`
              this.$message.warning(errors[0])
            }, 0)
            reject(errors)
          })
      })
    },
    rowEditSaveCurStatus(row, index) {
      //缓存行数据
      this.formCascaderList[index] = deepClone(row)
      setTimeout(() => {
        this.formIndexList.push(index)
      }, 1000)
    },
    rowCancelSaveCurStatus(row, index) {
      let cacheRow = this.formCascaderList[index]
      // 如果没有缓存数据，则为当前行数据
      if (!cacheRow) {
        cacheRow = this.tableShowData[index]
      }
      // 将编辑状态改变
      cacheRow.$cellEdit = false
      // 重新设置回行数据
      this.$set(this.tableShowData, index, cacheRow)

      this.formIndexList.splice(this.formIndexList.indexOf(index), 1)

      this.clearSelection()
    },
    _emptyAllSelectedData() {
      multiSelectionArray = []
      this.prevSelectedData = multiSelectionArray
      this.clearSelection()
    },

    /**
     * table触发方法
     */
    //行单击事件
    rowClick(row, column, e) {
      //如果是操作列则不执行
      if (
        (!this.$listeners['row-click'] && !this.tableMethods.rowClick) ||
        preventClick.includes(column.property) ||
        preventClick.includes(column.type)
      )
        return

      clearTimeout(dblclickTimer)
      dblclickTimer = setTimeout(
        () => {
          this.tableMethods.rowClick && this.tableMethods.rowClick(row, column, e)
          this.$emit('row-click', row, column, e)
        },
        this.clickConflict ? 200 : 0
      )
    },
    //行双击事件
    rowDblclick(row, column, e) {
      //如果是操作列则不执行
      if (
        (!this.$listeners['row-dblclick'] && !this.tableMethods.rowDblclick) ||
        preventClick.includes(column.property) ||
        preventClick.includes(column.type)
      )
        return

      clearTimeout(dblclickTimer)

      this.tableMethods.rowDblclick && this.tableMethods.rowDblclick(row, column, e)
      this.$emit('row-dblclick', row, column, e)
    },
    //单选选择当前行
    setCurrentRow(index) {
      if (this.loading) {
        this._pushInMethodsQueue(this.setCurrentRow, [index])
        return
      }

      let row = this.tableShowData[index]
      let column = this.columnConfig[index]
      this.$refs.dataBaseTable.setCurrentRow(row)
      this.$emit('row-click', row, column)
    },
    //多选选择当前项
    toggleSelection(rowsIndex, selectedArr) {
      if (this.loading) {
        this._pushInMethodsQueue(this.toggleSelection, [rowsIndex, selectedArr])
        return
      }
      /**
       * rowsIndex为  [0,2,5]形式的行标号 或 [row,row,row] 或 0 或 row
       * selectedArr为 [true,false] 或 true 形式的boolean数组，表明对应行选中与否
       */
      if (typeof rowsIndex !== 'undefined') {
        // 如果选中状态时数组
        if (Array.isArray(rowsIndex)) {
          for (let index = 0; index < rowsIndex.length; index++) {
            const row = typeof rowsIndex[index] === 'number' ? this.tableShowData[rowsIndex[index]] : rowsIndex[index]
            const rowSelected = Array.isArray(selectedArr) ? selectedArr[index] : selectedArr
            if (!row) continue

            this.$refs.dataBaseTable.toggleRowSelection(row, rowSelected)
          }
        } else {
          const row = typeof rowsIndex === 'number' ? this.tableShowData[rowsIndex] : rowsIndex

          this.$refs.dataBaseTable.toggleRowSelection(row, selectedArr)
        }
      } else {
        this.clearSelection()
      }
    },
    //多选切换全选状态
    toggleAllSelection() {
      this.$refs.dataBaseTable.toggleAllSelection()
    },
    //用于可展开表格与树形表格
    toggleRowExpansion(rowsIndex, expanded) {
      if (this.loading) {
        this._pushInMethodsQueue(this.toggleRowExpansion, [rowsIndex, expanded])
        return
      }

      if (typeof rowsIndex !== 'undefined') {
        if (Array.isArray(rowsIndex)) {
          for (let index = 0; index < rowsIndex.length; index++) {
            const curRowExpanded = Array.isArray(expanded) ? expanded[index] : expanded
            const row = typeof rowsIndex[index] === 'number' ? this.tableShowData[rowsIndex[index]] : rowsIndex[index]
            if (!row) continue

            this.$refs.dataBaseTable.toggleRowExpansion(row, curRowExpanded)
          }
        } else {
          const row = typeof rowsIndex === 'number' ? this.tableShowData[rowsIndex] : rowsIndex

          this.$refs.dataBaseTable.toggleRowExpansion(row, expanded)
        }
      } else {
        // 此处关联着options.expandRowKyes，改变都改变
        this.expandList.length = 0
      }
    },
    //点击排序触发
    sortChange(sortObj) {
      //如果排序没有，则恢复数据
      if (!sortObj.order) {
        this.tableData = this.allData
        return
      }
      //如果有排序方法，则执行
      if (this.tableMethods.sortChange) {
        this.tableMethods.sortChange(sortObj, this)
      }

      //如果采用服务端分页模式
      if (this.isServerMode) {
        let currentPage = this.currentPage
        let pageSize = this.pageSize

        this._loadServerMode({
          [this.pageSizeKey]: pageSize,
          [this.pageNumKey]: currentPage,
          [this.orderTypeKey]: sortObj.order == 'ascending' ? this.ascKey : this.descKey,
          [this.orderPropKey]: sortObj.prop,
        })
      }

      this.$emit('sort-change', sortObj, this)
    },
    // 当勾选数据行的checkbox时触发
    select(selection, row) {
      if (this.tableMethods.select) {
        this.tableMethods.select(selection, row, this)
      }

      this._setMultiSelection(selection)

      this.$emit('select', selection, row, this)
    },
    // 当勾选全选checkbox时触发
    selectAll(selection) {
      if (this.tableMethods.selectAll) {
        this.tableMethods.selectAll(selection, this)
      }

      this._setMultiSelection(selection)

      this.$emit('select-all', selection, this)
    },
    // 当选择项发生变化时触发该事件
    selectionChange(selection) {
      this.selectedData = selection
      if (this.tableMethods.selectionChange) {
        this.tableMethods.selectionChange(selection, this)
      }

      this.$emit('selection-change', selection, this)
    },
    //多选清除选择项
    clearSelection() {
      this.$refs.dataBaseTable.clearSelection()
    },
    //重新布局
    doLayout() {
      this.$refs.dataBaseTable.doLayout()
      this.key++
    },
    // 清除排序
    clearSort() {
      this.$refs.dataBaseTable.clearSort()
      this.tableData = this.allData
    },
    // 清除过滤
    clearFilter(columnKey) {
      this.$refs.dataBaseTable.clearFilter(columnKey)
    },
    _setMultiSelection(selection) {
      // 是否跨页多选
      if (this.uiConfig.multiSelection) {
        multiSelectionArray[this.currentPage] = deepClone(selection)
        // 将当前页选中数据缓存
        this.prevSelectedData = [].concat(multiSelectionArray)
        // this.prevSelectedData[this.currentPage] = selection;
      }
    },

    /**
     * search form
     */
    searchReset() {
      this.$refs.headerSearch.reset()
    },
    searchSubmit() {
      this.$refs.headerSearch.submit()
    },
    searchShow(isShow) {
      this.$refs.headerSearch.handleSearchShow(isShow)
    },

    /**
     * 外部调用方法
     */
    //get
    getSelectedData() {
      return this.selectedData
    },
    // 表格全部选中数据
    getAllSelectedData() {
      return this.allSelectedData
    },
    //set
    // 设置表格数据
    setData(data) {
      this._setTableData(data)
    },
    // 设置分页每页显示条数
    setPageSize(pageSize) {
      this.pageSize = pageSize
    },
    // 设置分页显示当前第几页
    setCurrentPage(pageNum) {
      this.currentPage = pageNum
    },
    // 设置数据总条数，计算页数使用
    setTotal(totalNum) {
      if (typeof this.uiConfig.pagination === 'object') {
        this.uiConfig.pagination.total = totalNum
      }
    },
    // 设置列配置
    setColumnConfig(columnConfig) {
      this.columnConfig = columnConfig
    },
    //refresh
    refreshTable() {
      return new Promise((resolve, reject) => {
        this._tableInit(true)
          .then(res => resolve(res))
          .catch(err => reject(err))
        this.doLayout()
        // 清空多选数据
        this.selectedData = []
      })
    },
    //搜索指定的属性配置
    findColumnIndex(prop) {
      for (let index = 0; index < this.columnConfig.length; index++) {
        const column = this.columnConfig[index]
        if (column.prop === prop) {
          return index
        }
      }
      return -1
    },
    // 根据prop设置属性
    setColumnByProp(prop, setOptions) {
      let index = this.findColumnIndex(prop)
      if (index !== -1) {
        for (const key in setOptions) {
          if (setOptions.hasOwnProperty(key)) {
            const element = setOptions[key]
            this.$set(this.columnConfig[index], key, element)
          }
        }
      } else {
        this.$message({
          type: 'error',
          message: `setColumnByProp -> 属性-${prop}-不存在`,
        })
        console.error(`setColumnByProp -> 属性-${prop}-不存在`)
      }
    },
  },
  computed: {
    columnConfig: {
      get() {
        if (this.options.columnConfig) {
          return this.options.columnConfig
        } else {
          console.error('表格列配置为必须项')
          return
        }
      },
      set(columnConfig) {
        this.options.columnConfig = columnConfig
      },
    },
    btnConfig() {
      let { operation, btnConfig } = this.options

      // 如果都没有配置，则没有操作列
      if (!(operation || btnConfig)) {
        return false
      }

      let returnConfig = this.config.defaultBtnConfig
      // 如果有btnConfig，则将btnConfig和defaultBtnConfig合并
      if (this._typeOf(btnConfig) === 'Object') {
        returnConfig = setDefaultValue(returnConfig, btnConfig, this)
      }

      // 如果有operation，则代表要使用slot的列操作，权重为最高
      if (this._typeOf(operation) === 'Object') {
        returnConfig = setDefaultValue(returnConfig, operation, this)
      }

      return returnConfig
    },
    uiConfig() {
      let uiConfig = this.options.uiConfig || {}
      // 设置默认值
      uiConfig = setDefaultValue(this.config.defaultUiConfig, uiConfig, this)
      // 初始化currentPage和pageSize
      this.currentPage = uiConfig.pagination.currentPage
      this.pageSize = uiConfig.pagination.pageSize
      //如果没有配置的pagination，则使用默认的配置项
      return uiConfig
    },
    wrapperHeight() {
      if (this.layoutHeight.length === 0) return

      let layoutHeight = this.layoutHeight.reduce((last, next) => {
        return last + (next ? parseFloat(next) : 0)
      }, 0)
      // console.log(layoutHeight + "px");
      return layoutHeight + 'px'
    },
    paginationObj() {
      const { currentPage, pageSize } = this
      return { currentPage, pageSize }
    },
    parentOption() {
      return this.tableOption || {}
    },
    columnFormOption() {
      let list = []
      if (this.isGroup) {
        this.groupOption.forEach(ele => {
          if (!ele.column) return
          ele.column.forEach(column => {
            list.push(column)
          })
        })
      } else {
        list = this.propOption
      }
      return list
    },
    propOption() {
      let result = []
      const safe = this
      function findProp(list) {
        if (!Array.isArray(list)) return
        list.forEach(ele => {
          if (ele.prop) {
            result.push(ele)
          }
          if (ele.children) {
            safe.isChild = true
            findProp(ele.children)
          }
        })
      }
      findProp(this.columnConfig)
      return result
    },
    isGroup() {
      return !validatenull(this.tableOption.group)
    },
    sumColumnList() {
      return this.tableOption.sumColumnList || []
    },
    cellClassName() {
      const defaultClass = 'zvue-table-cell'
      if (typeof this.tableOption.cellClassName === 'function') {
        return this.tableOption.cellClassName
      }
      if (typeof this.tableOption.cellClassName === 'string') {
        return `${this.tableOption.cellClassName} ${defaultClass}`
      }
      return defaultClass
    },
    headerRowClassName() {
      const defaultClass = 'zvue-table-header'
      if (typeof this.tableOption.headerRowClassName === 'function') {
        return this.tableOption.headerRowClassName
      }
      if (typeof this.tableOption.headerRowClassName === 'string') {
        return `${this.tableOption.headerRowClassName} ${defaultClass}`
      }
      return defaultClass
    },
    // 表格全部选中数据
    // 此处反显时执行次数太多，后期如果有性能问题，改为方法获取
    allSelectedData() {
      // 是否跨页多选
      let res = this.prevSelectedData.reduce((prev, cur, curIndex) => {
        cur ? (prev = prev.concat(cur)) : ''
        return prev
      }, [])
      return res
    },
    allSelectedDataPages() {
      return this.prevSelectedData
        .map((item, index) => {
          if (item) return `${index}(${item.length})`
        })
        .filter(item => !!item)
        .join(', ')
    },
  },
  watch: {
    load: {
      immediate: true,
      handler(newVal) {
        this.loading = newVal
      },
    },
    //开启服务器模式且已经加载完毕，执行已经保存的方法队列
    loading(val) {
      if (!val && this.methodsQueue.length > 0) {
        this.$nextTick(() => {
          this.methodsQueue.forEach(element => {
            element.fn.apply(this, element.params)
          })
          // 如果在这里清除，调用刷新方法后无法再次执行
          // 2020-6-10 如果不清除，会导致重复调用方法
          this.methodsQueue = []
        })
      }
    },
    //检索
    searchVal(val) {
      let filterData = this._getFilterTableData()
      if (!this.searchVal) {
        this.isServerMode ? (this.tableShowData = filterData) : (this.tableData = filterData)
      } else {
        this.tableShowData = filterData
      }
    },
    //如果开启分页，则根据设置的分页规则进行分页，后期还需要添加ajax服务器分页
    paginationObj: {
      deep: true,
      handler: function (newVal, oldVal) {
        // oldVal.pageSize != Number.POSITIVE_INFINITY
        if (Number.isFinite(oldVal.pageSize)) {
          //为防止在极短的时间内重复请求
          clearTimeout(paginationTimer)
          paginationTimer = setTimeout(() => {
            // 触发pagination方法
            this.$emit('handle-pagination', newVal.pageSize, newVal.currentPage, this)

            // 如果有handler，则拦截分页方法。为了兼容服务端自己写请求数据方法
            if (this.uiConfig.pagination.handler) {
              let returnedValue = this.uiConfig.pagination.handler(newVal.pageSize, newVal.currentPage, this)
              // 如果返回一个promise则执行跨页多选
              if (this._typeOf(returnedValue) === 'Promise') {
                returnedValue.then(_ => {
                  // 是否跨页多选
                  if (this.uiConfig.multiSelection) {
                    this._setPrevSelectedData()
                  }
                })
              }
              return
            }

            // 加载分页
            this._getPatinationData().then(_ => {
              // 是否跨页多选
              if (this.uiConfig.multiSelection) {
                this._setPrevSelectedData()
              }
            })
          }, 0)
        }
      },
    },
    //动态监测tableConfig.data的改变，有可能外部ajax改变data值
    'options.data'(val) {
      this._setTableData(val)
      this._dataIndexInit()
    },
    tableData(newVal, oldVal) {
      if (newVal instanceof Array) {
        this._getPatinationData()
        //加载中结束
        // this.loading = false;
      } else {
        this.$notify({
          type: 'error',
          message: this.config.LOG.error.tableData.TypeError,
        })
      }
    },
  },
}
</script>

<style lang="scss">
$headerBgc: #f4f6fc;
$headerTextColor: #666;
$TableFontFamily: "Microsoft YaHei";
$TableFontSize: 14px;
$borderColor: #e5eaf2;

.zvue-table-wrapper {
  font-family: $TableFontFamily;
  font-size: $TableFontSize;
  width: 100%;

  .el-table {
    border: 1px solid $borderColor;
    border-bottom: 0px;
    .el-table__fixed-right-patch {
      background-color: $headerBgc;
    }
    // 去除多选宽度不够会显示省略号
    .el-table-column--selection {
      text-overflow: inherit !important;
      .cell {
        text-overflow: inherit !important;
      }
    }
    // 列标题
    .zvue-table-header {
      th {
        background-color: $headerBgc !important;
        color: $headerTextColor;
        font-weight: bold;
      }
      button {
        width: auto !important;
      }
      .cell {
        text-overflow: unset;
      }
    }
    .zvue-table-cell {
      color: #666;
      font-weight: 400;
      button {
        width: auto !important;
      }
    }
    // 下拉
    .el-dropdown {
      margin-left: 10px;
      font-size: 12px;
      .el-dropdown-link {
        cursor: pointer;
        color: #409eff;
      }
      .el-icon--right {
        margin-left: 0;
      }
    }
    // 空表头空数据1px问题解决
    .el-table__empty-block {
      width: 100% !important;
    }
  }
  // 分页
  .zvue-table-pagination {
    margin-top: 20px;
    color: #bababa;
    background-color: #f4f5f7;
    .btn-prev,
    .btn-next,
    ul.el-pager li {
      background-color: inherit;
    }
  }
  // 编辑
  .z-input-number,
  .el-cascader,
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner,
  .el-select {
    width: 100% !important;
  }
  // 合计footer
  .el-table__fixed-footer-wrapper,
  .el-table__footer-wrapper {
    td {
      padding: 0 !important;
    }
  }
  // 列操作兼容span间隔，否则span和button会紧贴着
  .zvue-table_operation {
    .el-button + span {
      margin-left: 10px;
    }
    span + .el-button {
      margin-left: 10px;
    }
  }
}
</style>
