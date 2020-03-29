<template>
  <div class="z-group" v-if="display">
    <el-row span="24" class="z-group_item">
      <div class="z-group_header" v-if="$slots.header">
        <slot name="header"></slot>
      </div>
      <div class="z-group_header" v-else-if="label || icon">
        <i :class="['z-group_icon',icon]" v-if="icon"></i>
        <h1 class="z-group_title" v-if="label">{{label}}</h1>
      </div>
      <!-- 表坕主体 -->
      <slot></slot>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "zGroup",
  props: {
    icon: {
      type: String
    },
    display: {
      type: Boolean,
      default: true
    },
    card: {
      type: Boolean,
      default: false
    },
    label: {
      type: String
    }
  }
};
</script>
<style lang="less" scoped>
.z-group_icon {
  margin-right: 8px;
  font-size: 20px;
}
.z-group_header {
  margin-bottom: 30px;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 50px;
  line-height: 50px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
}
.z-group_title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}
</style>
