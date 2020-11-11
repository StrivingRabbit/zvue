<template>
  <!-- v-model="text" 在使用 'true' 字符串作为text时，v-model会将值改变为 false ，因此使用 :value-->
  <el-switch
    :value="text"
    @focus="handleFocus"
    @change="handleChange"
    @click.native="handleClick"
    :width="width"
    :inactive-icon-class="inactiveIconClass"
    :active-icon-class="activeIconClass"
    :active-text="active[labelKey]"
    :active-value="active[valueKey]"
    :inactive-value="inactive[valueKey]"
    :inactive-text="inactive[labelKey]"
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    :disabled="load ? true : disabled"
    :readonly="readonly"
    :size="size"
    :validate-event="validateEvent"
  ></el-switch>
</template>

<script>
import props from "../../../common/props";
import events from "../../../common/events";
export default {
  name: "zSwitch",
  mixins: [props(), events()],
  props: {
    value: {},
    width: Number,
    activeColor: {},
    inactiveColor: {},
    inactiveIconClass: String,
    activeIconClass: String,
    validateEvent: Boolean
  },
  data() {
    return {
      // 为了在表格行编辑的change中控制disabled状态而加
      load: false
    };
  },
  computed: {
    active() {
      return this.dic[1] || {};
    },
    inactive() {
      return this.dic[0] || {};
    }
  }
};
</script>

