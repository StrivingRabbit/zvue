<template>
  <div class="z-form_cascader">
    <component
      ref="cascader"
      :is="componentId"
      v-model="text"
      :options="getTreeData(dic)"
      :props="props"
      :size="size"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :multiple="multiple"
      :clearable="disabled?false:clearable"
      :collapse-tags="collapseTags"
      :show-all-levels="showAllLevels"
      :filterable="filterable"
      :separator="separator"
      @change="handlechange"
      @blur="handleBlur"
      @focus="handleFocus"
      @click.native="handleClick"
    >
      <template #default="{ node, data }">
        <slot
          v-if="typeslot"
          :name="`${prop}Type`"
          :node="node"
          :item="data"
          :labelkey="labelKey"
          :valuekey="valueKey"
          :childrenkey="childrenKey"
        ></slot>
        <span v-else>{{ data[labelKey] }}</span>
      </template>
    </component>
  </div>
</template>
<script>

// :change-on-select="changeOnSelect"  :expand-trigger="expandTrigger"
import { validatenull } from "../../../utils/validate";
import { setModelTranslate } from "../../../utils/dataformat";
import props from "../../../common/props";
import events from "../../../common/events";
import { DIC_SPLIT } from "../../../global/variable";

export default {
  name: "zCascader",
  mixins: [props(), events()],
  data() {
    return {
      defaultDic: [],
      netDic: [],
      componentId: "el-cascader",
      runLazyLoad: true,
      lazyTimer: null,
      runLazyTimer: false,
      expandchage: false,
      runHandleChange: false,
    };
  },
  props: {
    changeOnSelect: {
      type: Boolean,
      default: false
    },
    expandTrigger: {
      type: String,
      default: "click"
    },
    showAllLevels: {
      type: Boolean,
      default: true
    },
    filterable: {
      type: Boolean,
      default: false
    },
    separator: {
      type: String,
      default: "/"
    },
    collapseTags: {
      type: Boolean,
      default: false
    },
    isCrud: {
      type: Boolean,
      default: false
    },
    settempDisplayValue: Function
  },
  methods: {
    getTreeData(dic) {
      // 递归将子节点为 空数组 置为 undefined
      // 如果是远程请求，或者不是数组，则原样返回
      if (this.props.lazy || !this.itemIsArray(dic)) {
        return dic;
      }
      let data = dic;
      // 循环遍历json数据
      for (let i = 0, len = data.length; i < len; i++) {
        let childrenNode = data[i][this.childrenKey];
        if (this.itemIsArray(childrenNode) && childrenNode.length === 0) {
          // children若为空数组，则将children设为undefined
          data[i][this.childrenKey] = undefined;
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.getTreeData(childrenNode);
        }
      }
      return data;
    },
    itemIsArray(item) {
      return Object.prototype.toString.call(item) === "[object Array]";
    },
    handlechange(value) {
      // console.log("value");
      this.runHandleChange = true;
      this.handleChange(value);
      // console.log(this.$refs["cascader"].inputValue);
    },
    execLazyLoad() {
      // 调用elementUI的lazyLoad方法，加载异步数据
      if (this.props.lazy && this.runLazyLoad && !validatenull(this.text)) {
        // 拿到elementUI的cascader-panel组件
        const elCascaderPanel = this.$refs["cascader"].$refs["panel"];
        // 将loadCount置为0，可以使组件的checkedValue重新跑，在 elCascaderPanel 的 lazyLoad方法中
        elCascaderPanel.loadCount = 0;
        // 将activePath数组置为空，则可以防止 elCascaderPanel 中 expandNodes 方法中遍历nodes报错，不置空nodes会是null
        elCascaderPanel.activePath.length = 0;
        // 手动调用lazyLoad方法，可以加载异步数据
        elCascaderPanel.lazyLoad();
      }
    },
    setFromModelTranslate(presentText) {
      presentText = presentText.split(this.separator || "\\").join(DIC_SPLIT);

      if (this.isCrud) {
        this.$set(this.column, "presentText", presentText);
      } else {
        // 赋值到modelTranslate
        setModelTranslate(this, this.prop, presentText);
      }

      // 如果是懒加载，需要在此处进行displayValue赋值
      if (this.props.lazy) {
        this.settempDisplayValue(presentText);
      }
    }
  },
  watch: {
    text: {
      // immediate: true,
      handler(value) {
        // 只用当值改变时，表明是手动点击，此时不调用lazyLoad方法
        if (this.runHandleChange) {
          this.runLazyLoad = false;
          this.runHandleChange = false;
        }
        // 如果创建和值变化小于1000毫秒，则不可手动执行lazyLoad
        // 组件新创建时会用值直接去请求，值改变也会去请求，两个请求会冲突
        if (_.now() - this.createdTimeStamp < 1000) {
          this.runLazyLoad = false;
        }
        this.execLazyLoad();
      }
    },
    value: {
      handler(value) {
        // 当外部值改变则取置此标志位true，此处和handlechange联动协调runLazyLoad
        this.runLazyLoad = true;
      }
    }
  },
  created() {
    if (this.multiple) {
      this.props.multiple = this.multiple;
    }
    // 级联面板
    if (this.type === "cascader-panel") {
      this.componentId = "el-cascader-panel";
    }
    this.createdTimeStamp = _.now();
  },
  mounted() {
    // tags的处理
    this.$refs["cascader"].$watch("presentTags", (newVal, oldVal) => {
      if (newVal instanceof Array) {
        newVal = newVal.map(item => _.last(item.text.split(this.separator))).join(DIC_SPLIT);
      }
      this.setFromModelTranslate(newVal);
    });

    // 级联反显的处理
    this.$refs["cascader"].$watch("presentText", (newVal, oldVal) => {
      if (typeof newVal !== "string") {
        newVal = "";
      }
      newVal = newVal.trim();
      if (newVal.length) {
        if (this.showAllLevels === false) {
          newVal = _.last(newVal.split(DIC_SPLIT));
        }
        // 赋值到modelTranslate
        this.setFromModelTranslate(newVal);
      }
    });
  }
};
</script>