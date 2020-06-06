<template>
  <el-switch
    v-model="text"
    @change="handleChange"
    @click.native="handleClick"
    :active-text="active[labelKey]"
    :active-value="active[valueKey]"
    :inactive-value="inactive[valueKey]"
    :inactive-text="inactive[labelKey]"
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    :disabled="disabled"
    :readonly="readonly"
    :size="size"
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
    activeColor: {},
    inactiveColor: {}
  },
  data() {
    return {};
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

