<template>
  <div
    v-if="showDisplayValue && !noTextMode"
    class="text-overflow-eliipsis"
    :title="displayValue"
  >
    <!-- <slot v-else :name="column.prependSlot" :textMode="textMode"></slot> -->
    <span v-if="column.prepend && comDisplayValue !== EMPTY_VALUE">{{column.prepend}}</span><!--
    --><span>{{comDisplayValue}}</span><!--
    --><span v-if="column.append && comDisplayValue !== EMPTY_VALUE">{{column.append}}</span>
    <!-- <slot v-else :name="column.appendSlot" :textMode="textMode"></slot> -->
  </div>
  <component
    v-else
    :class="{'zvue-text-mode':(showDisplayValue && noTextMode)}"
    :is="getComponent(column.type,column.component)"
    :placeholder="getPlaceholder(column,column.type,comDisabled)"
    v-model="text"
    :isCrud="isCrud"
    :dic="dic"
    :disabled="comDisabled"
    :column="column"
    :props="column.props || props"
    :propsHttp="column.propsHttp || propsHttp"
    :size="column.size || size"
    :upload-before="uploadBefore"
    :upload-after="uploadAfter"
    :upload-success="uploadSuccess"
    :upload-error="uploadError"
    :textMode="textMode"
    :settempDisplayValue="setDisplayValue"
    @change="handleChange"
    v-bind="column"
  >
    <template
      :slot="column.prop+'Type'"
      slot-scope="{item,labelkey,valuekey,childrenkey,node}"
      v-if="column.typeslot"
    >
      <slot
        :name="column.prop+'Type'"
        :node="node"
        :item="item"
        :valuekey="valuekey"
        :labelkey="labelkey"
        :childrenkey="childrenkey"
      ></slot>
    </template>
    <!-- input的slot处睆 -->
    <template v-if="column.prependSlot" #[column.prependSlot]="{prependClick}">
      <slot :name="column.prependSlot" :prependClick="prependClick"></slot>
    </template>
    <template v-if="column.appendSlot" #[column.appendSlot]="{appendClick}">
      <slot :name="column.appendSlot" :appendClick="appendClick"></slot>
    </template>
  </component>
</template>

<script>
import { getComponent, getPlaceholder, setModelTranslate, dateTypeList } from "../../utils/dataformat";
import { validatenull } from "../../utils/validate";
import { detail } from "../../utils/detail";
import { DIC_PROPS, DIC_SPLIT, EMPTY_VALUE } from '../../global/variable';
import { setValueByPath } from "../../utils/util";

export default {
  name: "formTemp",
  props: {
    value: {},
    uploadBefore: Function,
    uploadAfter: Function,
    uploadSuccess: Function,
    uploadError: Function,
    props: {
      type: Object
    },
    clearable: {
      type: Boolean
    },
    propsHttp: {
      type: Object,
      default: () => {
        return {};
      }
    },
    dic: {
      type: Array
    },
    placeholder: {
      type: String
    },
    size: {
      type: String
    },
    disabled: {
      type: Boolean
    },
    column: {
      type: Object,
      default: () => {
        return {};
      }
    },
    isCrud: {
      type: Boolean,
      default: false
    },
    textMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      first: true,
      text: null,
      displayValue: '',
      EMPTY_VALUE
    };
  },
  watch: {
    text: {
      handler(val) {
        if (!this.first || !validatenull(val)) {
          this.first = false;
          this.$emit("input", val);
        } else {
          this.first = false;
        }
      }
    },
    value: {
      handler(val) {
        this.text = val;
        // 设置displayValue值，用来显示详情
        this.$nextTick(() => {
          this.setDisplayValue();
        })
      },
      immediate: true
    },
    dic(newDic, oldDic) {
      this.$nextTick(() => {
        this.setDisplayValue();
      })
    }
  },
  computed: {
    valueKey() {
      return this.column.props ? this.column.props.value : DIC_PROPS.value;
    },
    labelKey() {
      return this.column.props ? this.column.props.label : DIC_PROPS.label;
    },
    // 没有textMode的组件，需要在组件内部手动使用方法设置displayValue
    noTextMode() {
      if (['table'].includes(this.column.type)) {
        return true
      }
      if (this.column.type === 'cascader' && this.column.props && this.column.props.lazy) {
        return true
      }
      return false;
    },
    // 不可用detail处理的组件
    noDetailHandler(){
      // 变化后，将显示的值赋值在modelTranslate 和 displayValue 上，除lazy模式的cascader
      return !['upload', 'dynamic', 'table'].includes(this.column.type);
    },
    showDisplayValue() {
      // 不可用detail处理组件，和显示display组件不同，不可复用
      // 例如table，既要显示displayValue，又要不可用detail组件处理
      return this.textMode && !['upload', 'dynamic'].includes(this.column.type);
    },
    comDisabled() {
      // 这个disabled是相对于lazy模式的cascader和showDisplayValue相对而言
      // 如果需要显示displayValue当时textMode，则禁用组件
      return (this.showDisplayValue && this.noTextMode) ? true : this.disabled;
    },
    comDisplayValue() {
      let displayValue = this.displayValue;
      if (validatenull(displayValue)) {
        displayValue = EMPTY_VALUE;
      }
      return displayValue
    }
  },
  methods: {
    getComponent,
    getPlaceholder,
    validatenull,
    handleChange(val) {
      this.$emit("change", val);
    },
    getDisplayValue() {
      let displayValue = '';
      if (this.noDetailHandler && ![this.column.props || this.props].lazy) {
        let obj = {};
        setValueByPath(obj, this.column.prop, this.text)
        displayValue = detail(obj, this.column, this.column.props, this.dic);

        displayValue instanceof Array ? displayValue = displayValue.join(DIC_SPLIT) : '';
      }
      return displayValue;
    },
    setDisplayValue(displayValue) {
      displayValue = displayValue ? displayValue : this.getDisplayValue();

      // switch属性特殊处理
      if (['switch'].includes(this.column.type) && typeof displayValue === 'boolean') {
        displayValue = displayValue
          ? this.dic ? this.dic[1][this.labelKey] : '是'
          : this.dic ? this.dic[0][this.labelKey] : '否';
      }

      // 给当前组件设置
      this.displayValue = displayValue;
      // 设置到顶层Form的modelTranslate
      if (dateTypeList.concat('switch', 'time', 'timerange').includes(this.type)) {
        setModelTranslate(this, this.prop, displayValue)
      }
    }
  }
};
</script>

<style lang="less">
.zvue-text-mode {
  .el-input__inner {
    color: #606266 !important;
    padding: 0 !important;
    background-color: inherit !important;
    border: none !important;
  }
  .el-input__suffix {
    visibility: hidden !important;
  }
}
.text-overflow-eliipsis {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
