<template>
  <el-collapse-transition>
    <div v-show="searchShow && searchFlag">
      <z-form
        ref="form"
        :options="options"
        @submit="searchSubmit"
        @change="searchChange"
        @reset-change="resetChange"
        v-model="searchForm"
      >
        <template :slot="item.prop" slot-scope="scope" v-for="item in columnOption">
          <slot
            :value="scope.value"
            :column="scope.column"
            :dic="scope.dic"
            :size="scope.size"
            :label="scope.label"
            :disabled="scope.disabled"
            :row="searchForm"
            :name="item.prop"
            v-if="item.searchslot"
          ></slot>
        </template>
        <template slot="menuBtn" slot-scope="{size}">
          <slot name="searchMenu" :row="searchForm" :size="size"></slot>
        </template>
        <template slot="search" slot-scope="{}">
          <slot name="search" :row="searchForm" :size="crud.controlSize"></slot>
        </template>
      </z-form>
    </div>
  </el-collapse-transition>
</template>

<script>
import { vaildData } from "../../utils/util";
import { validatenull } from "../../utils/validate";
import {
  formInitVal,
  getSearchType,
  getPlaceholder
} from "../../utils/dataformat";
// import config from "./config";

export default {
  name: "zTableSearch",
  inject: ["crud"],
  data() {
    return {
      // config: config,
      defaultForm: {
        searchForm: {}
      },
      searchShow: true,
      searchForm: {}
    };
  },
  props: {
    search: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  watch: {
    'crud.propOption': {
      handler() {
        this.dataformat();
      },
      immediate: true
    },
    search: {
      handler() {
        this.searchInit();
      },
      deep: true,
    },
    searchForm: {
      handler() {
        this.$emit("input", this.searchForm);
        this.updateValue();
      },
      deep: true
    }
  },
  created() {
    this.init();
    this.searchInit();
  },
  computed: {
    DIC() {
      return this.crud.DIC;
    },
    columnFormOption() {
      return this.crud.columnFormOption;
    },
    columnOption() {
      return this.options.forms || []
    },
    options() {
      const tableOptions = this.crud.options;
      const detailColumn = (list = []) => {
        let column = [];
        list.forEach(ele => {
          if (ele.search) {
            ele = Object.assign(ele, {
              type: getSearchType(ele),
              multiple: ele.searchMultiple,
              textMode: false,
              dicFlag: false,
              span: ele.searchSpan || tableOptions.searchItemSpan || 12,
              gutter: ele.searchGutter || tableOptions.searchGutter,
              width: ele.searchWidth || tableOptions.searchLabelWidth,
              labelPosition: ele.searchLabelPosition || tableOptions.searchLabelPosition,
              tip: ele.searchTip,
              placeholder: getPlaceholder(ele, 'search'),
              filterable: ele.searchFilterable,
              tipPlacement: ele.searchTipPlacement,
              filterMethod: ele.searchFilterMethod,
              checkStrictly: ele.searchCheckStrictly || tableOptions.searchCheckStrictly,
              tags: ele.searchTags,
              row: ele.searchRow,
              size: ele.searchSize,
              formslot: ele.searchslot,
              clearable: ele.searchClearable,
              rules: ele.searchRules,
              disabled: ele.searchDisabled,
              readonly: ele.searchReadonly,
              value: ele.searchValue
            })
            let whiteList = ['display', 'disabled', 'readonly']
            whiteList.forEach(key => {
              delete ele[key]
            })
            column.push(ele);
          }
        })
        return column;
      }
      const dataDetail = (list) => {
        let result = this.deepClone(list);
        result.translate = false;
        if (result.group) {
          delete result.group;
        }
        result.forms = detailColumn(this.deepClone(this.columnFormOption))
        result = Object.assign(result, {
          size: 'small',
          submitText: tableOptions.submitText,
          submitBtn: tableOptions.submitBtn,
          submitIcon: tableOptions.submitIcon,
          emptyText: tableOptions.emptyText,
          emptyBtn: tableOptions.emptyBtn,
          emptyIcon: tableOptions.emptyIcon,
          dicData: this.DIC,
          lineMenu: tableOptions.lineMenu || false
        })
        return result;
      }
      return dataDetail(tableOptions)
    },
    searchSlot() {
      return !validatenull(this.$slots.search);
    },
    searchFlag() {
      if (this.searchSlot) return true;
      else return !validatenull(this.searchForm);
    }
  },
  methods: {
    //初始化
    init() {
      //扩展搜索的相关api
      /* this.crud.searchSubmit = this.submit;
      this.crud.searchReset = this.reset; */
    },
    searchInit() {
      this.searchForm = Object.assign(this.searchForm, this.search);
    },
    updateValue() {
      this.crud.$emit('update:search', this.searchForm)
    },
    // 搜索回调
    searchSubmit(form, done) {
      this.crud.$emit("search-submit", form, done);
    },
    // 搜索变动
    searchChange(form) {
      this.crud.$emit("search-change", form);
    },
    // 搜索清空
    resetChange() {
      this.crud.$emit("search-reset", this.defaultForm.tableForm);
    },
    // 搜索清空
    reset() {
      this.$refs.form.resetForm();
    },
    // 搜索清空
    submit() {
      this.$refs.form.submit();
    },
    handleSearchShow(isShow) {
      if (this._typeOf(isShow) === 'Boolean') {
        this.searchShow = isShow;
      } else {
        this.searchShow = !this.searchShow;
      }
    },
    dataformat() {
      this.defaultForm = formInitVal(this.options.forms);
      this.searchForm = this.deepClone(this.defaultForm.tableForm);
      this.searchShow = vaildData(
        this.crud.tableOption.searchShow,
        this.crud.config.searchShow
      );
    }
  }
};
</script>
