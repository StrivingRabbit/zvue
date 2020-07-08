<template>
  <el-collapse-transition>
    <div v-show="searchShow && searchFlag">
      <z-form
        :options="option"
        ref="form"
        @submit="searchChange"
        @reset-change="resetChange"
        v-model="searchForm"
      ></z-form>
    </div>
  </el-collapse-transition>
</template>

<script>
import cteate from "core/create";
import { vaildData } from "../../utils/util";
import { validatenull } from "../../utils/validate";
import {
  formInitVal,
  getSearchType,
  getPlaceholder
} from "../../utils/dataformat";
import config from "./config";

export default cteate({
  name: "crud__search",
  inject: ["crud"],
  data() {
    return {
      config: config,
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
    columnOption() {
      return this.option.column || []
    },
    option() {
      const option = this.crud.option;
      const detailColumn = (list = []) => {
        let column = [];
        list.forEach(ele => {
          if (ele.search) {
            ele = Object.assign(ele, {
              type: getSearchType(ele),
              multiple: ele.searchMultiple,
              detail: false,
              dicFlag: false,
              span: ele.searchSpan || option.searchSpan || 12,
              gutter: ele.searchGutter || option.searchGutter,
              labelWidth: ele.searchLabelWidth || option.searchLabelWidth,
              labelPosition: ele.searchLabelPosition || option.searchLabelPosition,
              tip: ele.searchTip,
              placeholder: getPlaceholder(ele, 'search'),
              filterable: ele.searchFilterable,
              tipPlacement: ele.searchTipPlacement,
              filterMethod: ele.searchFilterMethod,
              checkStrictly: ele.searchCheckStrictly || option.searchCheckStrictly,
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
        result.forms = detailColumn(this.deepClone(this.crud.columnFormOption))
        result = Object.assign(result, {
          submitText: option.submitText,
          submitBtn: option.submitBtn,
          submitIcon: option.submitIcon,
          emptyText: option.emptyText,
          emptyBtn: option.emptyBtn,
          emptyIcon: option.emptyIcon,
          dicData: this.crud.DIC
        })
        return result;
      }
      return dataDetail(option)
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
    searchInit() {
      this.searchForm = Object.assign(this.searchForm, this.search);
    },
    updateValue() {
      this.crud.$emit('update:search', this.searchForm)
    },
    //初始化
    init() {
      //扩展搜索的相关api
      this.crud.searchChange = this.searchChange;
      this.crud.searchReset = this.searchReset;
    },
    // 搜索回调
    searchChange(form, done) {
      this.crud.$emit("search-change", form, done);
    },
    // 搜索清空
    resetChange() {
      this.crud.$emit("search-reset", this.defaultForm.tableForm);
    },
    // 搜索清空
    searchReset() {
      this.$refs.form.resetForm();
    },
    handleSearchShow() {
      this.searchShow = !this.searchShow;
    },
    dataformat() {
      this.defaultForm = formInitVal(this.option.column);
      this.searchForm = this.deepClone(this.defaultForm.tableForm);
      this.searchShow = vaildData(
        this.crud.tableOption.searchShow,
        this.crud.config.searchShow
      );
    }
  }
});
</script>
