<template>
  <div>
    <el-radio-group
      v-model="text"
      :size="size"
      @change="handleChange"
      @click.native="handleClick"
      :disabled="disabled"
    >
      <component
        :is="componentName"
        v-for="(item,index) in dicData"
        :label="item[valueKey]"
        :border="border"
        :readonly="readonly"
        :disabled="item[disabledKey]"
        :key="index"
      >{{item[labelKey]}}</component>
    </el-radio-group>
  </div>
</template>

<script>
import props from "../../../common/props";
import events from "../../../common/events";
export default {
  name: "zRadio",
  mixins: [props(), events()],
  data() {
    return {
      name: "radio"
    };
  },
  props: {
    value: {}
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {}
};
</script>