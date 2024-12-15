<template>
  <el-image :style="{display:'flex'}" :fit="fit" :src="imgSrc" :preview-src-list="previewSrcList" @load="loaded" @error="errored">
    <template slot="placeholder">
      <!-- <slot name="placeholder" :scope="scope"></slot> -->
      <span class="dot">加载中...</span>
    </template>
    <template slot="error">
      <i class="el-icon-picture-outline"></i>
      <!-- <slot name="error" :scope="scope"></slot> -->
    </template>
  </el-image>
</template>
<script>
export default {
  name: 'zImg',
  props: {
    value: {},
    alt: {},
    fit: {
      default: 'contain'
    },
    'referrer-policy': {},
    lazy: {
      default: false
    },
    'scroll-container': {},
    'z-index': { default: 2000 },
    load: {
      default: () => { }
    },
    error: {
      default: () => { }
    },
  },
  data() {
    return {}
  },
  computed: {
    isArray(value) {
      return Array.isArray(value);
    },
    imgSrc() {
      return this.isArray ? this.value[0] : this.value
    },
    previewSrcList() {
      return this.isArray ? this.value : [this.value]
    }
  },
  methods: {
    loaded(...args) {
      if (typeof this.load === 'function') {
        this.load(...args);
      }
    },
    errored(...args) {
      if (typeof this.error === 'function') {
        this.load(...args);
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.dot {
  font-size: 12px;
  color: #ccc;
}
</style>
