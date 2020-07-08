<template>
  <el-input
    :clearable="disabled?false:clearable"
    :size="size"
    v-model="text"
    :type="typeParam"
    :autofocus="autofocus"
    :maxlength="maxlength"
    :minlength="minlength"
    :placeholder="placeholder"
    :prefix-icon="prefixIcon"
    :suffix-icon="suffixIcon"
    :readonly="readonly"
    :show-word-limit="showWordLimit"
    :disabled="disabled"
    :autocomplete="autocomplete"
    :show-password="showPassword"
    :autosize="{minRows:minRows,maxRows:maxRows}"
    @focus="handleFocus"
    @blur="handleBlur"
    @click.native="handleClick"
    @change="handleChange"
  >
    <template slot="prepend" v-if="prepend || prependSlot">
      <!-- <span @click="prependClick()">{{prepend}}</span> -->
      <div :style="pendStyle(prependClick)" @click="prependClick()" v-html="prepend"></div>
      <slot v-if="prependSlot" :name="prependSlot" :prependClick="prependClick"></slot>
    </template>
    <template slot="append" v-if="append || appendSlot">
      <!-- <span @click="appendClick()">{{append}}</span> -->
      <div :style="pendStyle(appendClick)" @click="appendClick()" v-html="append"></div>
      <slot v-if="appendSlot" :name="appendSlot" :appendClick="appendClick"></slot>
    </template>
    <template slot="suffix" v-if="suffix">
      <div v-html="suffix"></div>
    </template>
    <template slot="prefix" v-if="prefix">
      <div v-html="prefix"></div>
    </template>
  </el-input>
</template>
<script>
import props from "../../../common/props";
import events from "../../../common/events";
import { validatenull } from "../../../utils/validate";
import { DIC_SPLIT } from "../../../global/variable";

export default {
  name: "zInput",
  mixins: [props(), events()],
  props: {
    rawtype: {
      type: String
    },
    minlength: {
      type: Number
    },
    maxlength: {
      type: Number
    },
    prefixIcon: {
      type: String
    },
    suffixIcon: {
      type: String
    },
    showWordLimit: {
      type: Boolean,
      default: false
    },
    autocomplete: {
      type: String,
      default: "off"
    },
    showPassword: Boolean,
    minRows: {
      type: Number,
      default: 5
    },
    maxRows: {
      type: Number,
      default: 10
    },
    prependClick: {
      type: Function,
      default: () => { }
    },
    prepend: {
      type: String
    },
    appendClick: {
      type: Function,
      default: () => { }
    },
    append: {
      type: String
    },
    prependSlot: String,
    appendSlot: String,
    suffix: {},
    prefix: {},
    autofocus: Boolean,
  },
  data() {
    return {
      isFirst: true,
      dicTimer: null
    };
  },
  methods: {
    validatenull,
    pendStyle(fn) {
      if (typeof fn === "function") {
        return {
          cursor: "pointer"
        };
      }
    }
  },
  computed: {
    typeParam: function () {
      if (this.rawtype) return this.rawtype;
      switch (this.type) {
        case "textarea":
          return "textarea";
          break;
        case "password":
          return "password";
          break;
        default:
          return "text";
          break;
      }
    }
  },
  watch: {
    // 由于elementUI的input的change只有在失去焦点时会触发，所以监听text
    text: {
      immediate: true,
      handler(value) {
        if (!this.isFirst) {
          this.isFirst = false;
          // 不能加timeout，会造成校验延时
          this.handleChange(value);
        } else {
          this.isFirst = false;
        }
      }
    }
  }
};
</script>