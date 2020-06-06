<template>
  <div>
    <el-pagination
      :current-page.sync="curPage"
      v-bind="paginationConfig"
      :page-size="size || pageSizes[0]"
      :total="total"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <slot></slot>
    </el-pagination>
  </div>
</template>
<script>
/**
 * 0218修改
 * :pagi-size去除了.sync修饰符，因为下拉切换页面数量时会报错
 */
export default {
  name: "zPagination",
  props: {
    paginationConfig: {
      type: Object,
      required: true
    },
    pageSize: Number,
    currentPage: Number,
    total: Number,
    handleSizeChange: Function,
    handleCurrentChange: Function
  },
  data() {
    return {};
  },
  methods: {
    sizeChange(...args) {
      this.handleSizeChange(...args);
    },
    currentChange(...args) {
      this.handleCurrentChange(...args);
    }
  },
  computed: {
    curPage: {
      get() {
        return this.currentPage;
      },
      set() { }
    },
    size: {
      get() {
        return this.pageSize;
      },
      set(...args) { }
    }
  }
};
</script>