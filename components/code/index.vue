<template>
  <div class="zvue-code-wrapper">
    <!-- <el-scrollbar :style="styleName"> -->
    <pre>
      <code :class="syntax" ref="container">
        <slot></slot>
      </code>
    </pre>
    <!-- </el-scrollbar> -->
  </div>
</template>

<script>

import { setPx } from "../../utils/util";

export default {
  name: "zCode",
  props: {
    height: {
      type: Number,
      default: 0
    },
    syntax: {
      type: String,
      default: "javascript"
    }
  },
  computed: {
    styleName() {
      if (this.height !== 0) {
        return {
          height: setPx(this.height)
        };
      }
      return {};
    }
  },
  mounted() {
    if (window.hljs && typeof window.hljs.highlightBlock === "function") {
      window.hljs.highlightBlock(this.$refs["container"]);
    }
  }
};
</script>
