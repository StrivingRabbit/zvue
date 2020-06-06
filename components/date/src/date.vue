<template>
  <div>
    <div v-if="isDategroup">
      <div>
        <el-radio-group :size="size" @change="handleChange" v-model="text">
          <el-radio-button
            :label="item.value"
            v-for="(item,index) in menu"
            :key="index"
          >{{item.label}}</el-radio-button>
        </el-radio-group>
      </div>
      <div :class="b('date')">
        <el-date-picker
          v-model="datetime"
          type="daterange"
          :size="size"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          @focus="handleFocus"
          @change="handleChange"
          :range-separator="t('date.tip')"
          :start-placeholder="t('date.start')"
          :end-placeholder="t('date.end')"
        ></el-date-picker>
      </div>
    </div>
    <el-date-picker
      v-else
      :type="type"
      v-model="text"
      :size="size"
      :readonly="readonly"
      :default-value="defaultValue"
      :default-time="defaultTime"
      :range-separator="DATE_RANGE_SPLIT"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      :format="format"
      :clearable="disabled?false:clearable"
      :picker-options="pickerOptions"
      :value-format="valueFormat"
      :placeholder="placeholder"
      :editable="editable"
      :time-arrow-control="timeArrowControl"
      :popper-class="popperClass"
      :unlink-panels="unlinkPanels"
      :prefix-icon="prefixIcon"
      @blur="handleBlur"
      @focus="handleFocus"
      @click.native="handleClick"
      :disabled="disabled"
    ></el-date-picker>
  </div>
</template>

<script>

import { GetDateStr } from "../../../utils/date.js";
import props from "../../../common/props";
import events from "../../../common/events";
import { DATE_RANGE_SPLIT } from "../../../global/variable";

export default {
  name: "zDate",
  mixins: [props(), events()],
  data() {
    return {
      text: "",
      menu: [],
      datetime: [GetDateStr(0), GetDateStr(30)],
      DATE_RANGE_SPLIT
    };
  },
  props: {
    default: {
      type: Boolean,
      default: false
    },
    value: {},
    startPlaceholder: {
      type: String,
      default: "开始日期"
    },
    endPlaceholder: {
      type: String,
      default: "结束日期"
    },
    defaultValue: {
      type: String
    },
    defaultTime: {
      type: String
    },
    pickerOptions: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: "date"
    },
    valueFormat: {},
    format: {},
    editable: {
      type: Boolean,
      default: true
    },
    timeArrowControl: {
      type: Boolean,
      default: false
    },
    popperClass: String,
    unlinkPanels: {
      type: Boolean,
      default: false
    },
    prefixIcon: String
  },
  computed: {
    isDategroup() {
      return this.type === "dategroup";
    }
  },
  watch: {
    datetime() {
      this.text = "";
      this.setCurrent((this.datetime || []).join(","));
    },
    text: {
      handler(val) {
        this.handleChange(val);
      },
      deep: true,
    }
  },
  created() {
    if (this.isDategroup) {
      this.init();
    }
  },
  mounted() { },
  methods: {
    setCurrent(val) {
      this.$emit("input", val);
    },
    init() {
      this.menu = [
        {
          label: this.t("date.t"),
          value: GetDateStr(0)
        },
        {
          label: this.t("date.y"),
          value: GetDateStr(-1)
        },
        {
          label: this.t("date.n"),
          value: GetDateStr(-7) + "," + GetDateStr(0)
        },
        {
          label: this.t("date.a"),
          value: ""
        }
      ];
      if (this.default) {
        this.text = GetDateStr(0);
        this.setCurrent(this.text);
      }
    }
  }
};
</script>

