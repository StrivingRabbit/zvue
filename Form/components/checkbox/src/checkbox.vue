<template>
  <div>
    <el-checkbox-group
      v-model="text"
      :size="size"
      :disabled="disabled"
      @change="handleChange"
      @click.native="handleClick"
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
    </el-checkbox-group>
  </div>
</template>

<script>
import props from "../../../common/props";
import events from "../../../common/events";
export default {
  name: "zCheckbox",
  mixins: [props(), events()],
  data() {
    return {
      name: "checkbox"
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