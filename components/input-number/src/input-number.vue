<template>
  <el-input-number
    v-model="text"
    class="z-input-number"
    :precision="precision"
    :size="size"
    :min="minRows"
    :max="maxRows"
    :clearable="disabled?false:clearable"
    :readonly="readonly"
    :controls-position="controlsPosition"
    :label="placeholder"
    :disabled="disabled"
    @click.native="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  ></el-input-number>
</template>

<script>
import props from "../../../common/props";
import events from "../../../common/events";
export default {
  name: "zInputNumber",
  mixins: [props(), events()],
  data() {
    return {};
  },
  props: {
    step: {
      type: Number,
      default: 1
    },
    controlsPosition: {
      type: String,
      default: "right"
    },
    precision: {
      type: Number,
      default: 0
    },
    minRows: {
      type: Number,
      default: -Infinity
    },
    maxRows: {
      type: Number,
      default: Infinity
    }
  },
  watch: {
    text: {
      handler(val) {
        this.handleChange(val);
      }
    }
  },
  created() { },
  mounted() { },
  methods: {}
};
</script>