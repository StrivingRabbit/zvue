<template>
  <div
    :class="{'z-group-card':card,'z-group-header':!isHeader,'z-group-arrow':!arrow}"
    class="z-group"
    v-if="display"
  >
    <el-collapse :value="text">
      <el-collapse-item :name="1" :disabled="!arrow">
        <div slot="title" class="z-group_header" style="color:rgba(0, 0, 0, 0.85);" v-if="$slots.header">
          <slot name="header"></slot>
        </div>
        <div slot="title" class="z-group_header" v-else-if="label || icon">
          <i :class="['z-group_icon',icon]" v-if="icon"></i>
          <h1 class="z-group_title" v-if="label">{{label}}</h1>
        </div>
        <slot></slot>
      </el-collapse-item>
    </el-collapse>

    <!-- <el-row span="24" class="z-group_item">
      <div class="z-group_header" v-if="$slots.header">
        <slot name="header"></slot>
      </div>
      <div class="z-group_header" v-else-if="label || icon">
        <i :class="['z-group_icon',icon]" v-if="icon"></i>
        <h1 class="z-group_title" v-if="label">{{label}}</h1>
      </div>
      <slot></slot>
    </el-row>-->
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
    },
    arrow: {
      type: Boolean,
      default: false
    },
    collapse: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    text() {
      return this.collapse ? 1 : 0
    },
    isHeader() {
      return this.$slots.header || ((this.label || this.icon))
    }
  }
};
</script>
<style lang="less">
.z-group-arrow .el-collapse-item__arrow {
  display: none;
}

.z-group {
  // element修改
  .el-collapse-item__header {
    height: inherit;
    border: none;
  }
  .el-collapse-item__arrow {
    margin-top: -25px;
  }
  .el-collapse,
  .el-collapse-item__wrap {
    border-color: #fff;
  }

  .z-group_icon {
    margin-right: 8px;
    font-size: 20px;
    color: rgba(0, 0, 0, 0.85);
  }
  .z-group_header {
    width: 100%;
    margin-bottom: 20px;
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
}
</style>
