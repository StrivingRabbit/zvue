<template>
  <div>
    <template v-if="all">
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAll">全选</el-checkbox>
      <div style="margin: 5px 0;"></div>
    </template>
    <el-checkbox-group
      v-model="text"
      @change="handleCheckChange"
      :disabled="disabled"
      :size="size"
      :min="min"
      :max="max"
      @click.native="handleClick"
    >
      <component
        :is="componentName"
        v-for="(item,index) in dic"
        :label="item[valueKey]"
        :border="border"
        :size="size"
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
  props: {
    all: {
      type: Boolean,
      default: false
    }
  },
  mixins: [props(), events()],
  data() {
    return {
      checkAll: false,
      isIndeterminate: false,
      name: 'checkbox',
    };
  },
  watch: {
    dic() {
      this.handleCheckChange(this.text);
    },
    text: {
      handler(val) {
        this.handleChange(val)
        this.handleCheckChange(val);
      },
      immediate: true
    },
  },
  created() { },
  mounted() { },
  methods: {
    handleCheckAll(val) {
      if (!this.all) return
      this.text = val ? this.dic.map(ele => ele[this.valueKey]) : [];
      this.isIndeterminate = false;
    },
    handleCheckChange(value = []) {
      if (!this.all) return;
      let checkedCount = value.length;
      if (checkedCount === 0) {
        this.checkAll = this.isIndeterminate = false;
        return;
      }
      let dicLen = this.dic.length;
      this.checkAll = checkedCount === dicLen;
      this.isIndeterminate = checkedCount > 0 && checkedCount < dicLen
    }
  }
};
</script>

