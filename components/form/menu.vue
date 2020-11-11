<template>
  <el-col :span="menuSpan">
    <el-form-item :class="{'zvue-form-item_emptylabel': formSafe.menuPosition === 'center'}">
      <!-- 菜单按钮组 -->
      <div :class="`zvue-form-menu-${formSafe.menuPosition}`">
        <el-button
          type="primary"
          @click="()=>{this.$emit('submit')}"
          :size="formSafe.controlSize"
          :icon="vaildData(parentOption.submitIcon,'el-icon-check')"
          :loading="vaildBoolean(parentOption.submitDisabled,formSafe.allDisabled)"
          v-if="vaildData(parentOption.submitBtn,true)"
        >{{vaildData(parentOption.submitText,'确 定')}}</el-button>
        <el-button
          :icon="vaildData(parentOption.emptyIcon,'el-icon-delete')"
          :size="formSafe.controlSize"
          :loading="vaildBoolean(parentOption.emptyDisabled,formSafe.allDisabled)"
          v-if="vaildData(parentOption.emptyBtn,true)"
          @click="()=>{this.$emit('resetForm')}"
        >{{vaildData(parentOption.emptyText,'清 空')}}</el-button>
        <slot name="menuBtn"></slot>
      </div>
    </el-form-item>
  </el-col>
</template>
<script>
export default {
  inject: ['formSafe'],
  data() {
    return {}
  },
  methods: {
    vaildBoolean(...args) { return this.formSafe.vaildBoolean(...args) },
    vaildData(...args) { return this.formSafe.vaildData(...args) }
  },
  computed: {
    parentOption() {
      return this.formSafe.parentOption;
    },
    menuSpan() {
      return this.parentOption.menuSpan || 24;
    }
  }
}
</script>
<style lang='scss' scoped>
</style>