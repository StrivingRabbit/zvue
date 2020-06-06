<template>
  <el-slider
    v-model="text"
    :disabled="disabled"
    :step="step"
    :min="min"
    :max="max"
    :range="range"
    :show-tooltip="showTooltip"
    :show-stops="showStops"
    :show-input="showInput"
    :format-tooltip="formatTooltip"
    :marks="marks"
    :vertical="vertical"
    :debounce="debounce"
    :tooltip-class="tooltipClass"
    @click.native="handleClick"
    @change="handleChange"
  ></el-slider>
</template>

<script>

import props from "../../../common/props";
import events from "../../../common/events";
export default {
  name: "zSlider",
  mixins: [props(), events()],
  props: {
    value: {},
    step: {
      type: Number
    },
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    range: {
      type: Boolean,
      default: false
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    showInput: {
      type: Boolean,
      default: false
    },
    showStops: {
      type: Boolean,
      default: false
    },
    formatTooltip: Function,
    marks: {},
    vertical: {
      type: Boolean
    },
    debounce: {},
    tooltipClass: {}
  },
  data() {
    return {};
  },
  watch: {},
  created() { },
  mounted() { },
  methods: {}
};
</script>
