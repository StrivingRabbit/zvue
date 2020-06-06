<template>
  <div
    v-if="showDisplayValue && !isLazyCascader"
    class="text-overflow-eliipsis"
    :title="displayValue"
  >
    <!-- <slot v-else :name="column.prependslot" :textMode="textMode"></slot> -->
    <span v-if="column.prepend && comDisplayValue !== EMPTY_VALUE">{{column.prepend}}</span><!--
    --><span>{{comDisplayValue}}</span><!--
    --><span v-if="column.append && comDisplayValue !== EMPTY_VALUE">{{column.append}}</span>
    <!-- <slot v-else :name="column.appendslot" :textMode="textMode"></slot> -->
  </div>
  <component
    v-else
    :class="{'zvue-text-mode':(this.showDisplayValue && this.isLazyCascader)}"
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
    <template v-if="column.prependslot" #[column.prependslot]="{prependClick}">
      <slot :name="column.prependslot" :prependClick="prependClick"></slot>
    </template>
    <template v-if="column.appendslot" #[column.appendslot]="{appendClick}">
      <slot :name="column.appendslot" :appendClick="appendClick"></slot>
    </template>
  </component>
</template>

<script>
import { getComponent, getPlaceholder, setModelTranslate, dateTypeList } from "../../utils/dataformat";
import { validatenull } from "../../utils/validate";
import { detail } from "../../utils/detail";
import { DIC_PROPS, DIC_SPLIT, EMPTY_VALUE } from '../../global/variable';

export default {
  name: "formTemp",
  props: {
    value: {},
    t: Function,
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
    isLazyCascader() {
      let res = false;
      if (this.column.type === 'cascader' && this.column.props && this.column.props.lazy) {
        res = true
      }
      return res;
    },
    showDisplayValue() {
      return this.textMode && !['upload', 'dynamic'].includes(this.column.type)
    },
    valueKey() {
      return this.column.props ? this.column.props.value : DIC_PROPS.value;
    },
    labelKey() {
      return this.column.props ? this.column.props.label : DIC_PROPS.label;
    },
    comDisabled() {
      // 这个disabled是相对于lazy模式的cascader和showDisplayValue相对而言
      return (this.showDisplayValue && this.isLazyCascader) ? true : this.disabled;
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
      // 变化后，将显示的值赋值在modelTranslate 和 displayValue 上，除lazy模式的cascader
      if (!['upload', 'dynamic'].includes(this.column.type) && ![this.column.props || this.props].lazy) {
        displayValue = detail({ [this.column.prop]: this.text }, this.column, this.column.props, this.dic);

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

      // 如果是级联，取最后一个
      /* if (this.column.type === 'cascader') {
        displayValue = _.last(displayValue.split(DIC_SPLIT));
      } */

      // 给当前组件设置
      this.displayValue = displayValue;
      // 设置到顶层Form的modelTranslate
      if (dateTypeList.concat('switch', 'time', 'timerange').includes(this.type)) {
        setModelTranslate(this, this.prop, displayValue)
      }
    }
  }
};
/**
 * :action="column.action"
    :append="column.append"
    :accordion="column.accordion"
    :allowCreate="column.allowCreate"
    :autocomplete="column.autocomplete"
    :autofocus="column.autofocus"
    :autoUpload="column.autoUpload"
    :accept="column.accept"
    :activeColor="column.activeColor"
    :border="column.border"
    :button="column.button"
    :children="column.children"
    :checked="column.checked"
    :clearable="column.clearable"
    :colors="column.colors"
    :canvasOption="column.canvasOption"
    :controls-position="column.controlsPosition"
    :checkStrictly="column.checkStrictly"
    :collapseTags="column.collapseTags"
    :data="column.data"
    :dataType="column.dataType"
    :defaultCheckedKeys="column.defaultCheckedKeys"
    :defaultExpandedKeys="column.defaultExpandedKeys"
    :defaultExpandAll="column.defaultExpandAll"
    :defaultTime="column.defaultTime"
    :dicData="column.dicData"
    :dicUrl="column.dicUrl"
    :dicMethod="column.dicMethod"
    :dicQuery="column.dicQuery"
    :drag="column.drag"
    :defaultValue="column.defaultValue"
    :defaultFirstOption="column.defaultFirstOption"
    :endPlaceholder="column.endPlaceholder"
    :filter="column.filter"
    :filesize="column.filesize"
    :filterable="column.filterable"
    :format="column.format"
    :formatTooltip="column.formatTooltip"
    :iconClasses="column.iconClasses"
    :iconList="column.iconList"
    :inactiveColor="column.inactiveColor"
    :group="column.group"
    :label="column.label"
    :limit="column.limit"
    :listType="column.listType"
    :loadText="column.loadText"
    :min="column.min"
    :max="column.max"
    :minlength="column.minlength"
    :maxlength="column.maxlength"
    :minRows="column.minRows"
    :maxRows="column.maxRows"
    :multiple="column.multiple"
    :options="column.options"
    :onRemove="column.onRemove"
    :parent="column.parent"
    :pickerOptions="column.pickerOptions"
    :precision="column.precision"
    :prefixIcon="column.prefixIcon"
    :prefix="column.prefix"
    :prepend="column.prepend"
    :prependslot="column.prependslot"
    :appendslot="column.appendslot"
    :prop="column.prop"
    :showPassword="column.showPassword"
    :readonly="column.readonly"
    :remote="column.remote"
    :remoteOptions="column.remoteOptions"
    :range="column.range"
    :showFileList="column.showFileList"
    :showInput="column.showInput"
    :showStops="column.showStops"
    :showAllLevels="column.showAllLevels"
    :showText="column.showText"
    :startPlaceholder="column.startPlaceholder"
    :step="column.step"
    :suffix="column.suffix"
    :suffixIcon="column.suffixIcon"
    :showWordLimit="column.showWordLimit"
    :separator="column.separator"
    :texts="column.texts"
    :tip="column.tip"
    :type="column.type"
    :typeslot="column.typeslot"
    :typeformat="column.typeformat"
    :rawtype="column.rawtype"
    :value-format="column.valueFormat"
    :voidIconClass="column.voidIconClass"
    :appendClick="column.appendClick"
    :blur="column.blur"
    :click="column.click"
    :change="column.change"
    :changeOnSelect="column.changeOnSelect"
    :changeoOnSelect="column.changeoOnSelect"
    :expand-trigger="column.expandTrigger"
    :focus="column.focus"
    :prependClick="column.prependClick"
    :nodeClick="column.nodeClick"

    // upload
    onlyButton
    buttonText
 */
</script>

<style lang="less">
.zvue-text-mode {
  .el-input__inner {
    color: #000 !important;
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
