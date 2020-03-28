<template>
  <el-time-picker
    v-model="text"
    :is-range="isRange"
    :size="size"
    :default-value="defaultValue"
    range-separator="至"
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
    :format="format"
    :readonly="readonly"
    :clearable="disabled?false:clearable"
    :value-format="valueFormat"
    :placeholder="placeholder"
    @change="handleChange"
    @click.native="handleClick"
    :disabled="disabled"
  ></el-time-picker>
</template>

<script>
import props from "../../../common/props";
import events from "../../../common/events";
// import locale from "../../../../../../core/common/locale";
export default {
  name: "zTime",
  mixins: [props(), events()],
  data() {
    return {
      text: "",
    };
  },
  props: {
    startPlaceholder: {
      type: String,
      default: "开始时间"
    },
    endPlaceholder: {
      type: String,
      default: "结束时间"
    },
    value: {
      required: true
    },
    defaultValue: {
      type: String
    },
    valueFormat: {
      default: ""
    },
    type: {
      default: ""
    },
    format: {
      default: ""
    }
  },
  computed: {
    isRange () {
      return this.type === "timerange";
    }
  }
};
</script>

