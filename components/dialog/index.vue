<template>
  <component
    :is="dialogType"
    ref="dialog"
    class="zvue-dialog"
    lock-scroll
    :modal-append-to-body="false"
    append-to-body
    v-if="options.destroyOnClose === false ? true : boxVisible"
    :direction="direction"
    :fullscreen="fullscreen"
    :visible.sync="boxVisible"
    :size="size?size:width"
    :top="setPx(dialogTop)"
    :width="setPx(width)"
    :title="options.title"
    :show-close="vaildData(options.showClose,true)"
    :modal="options.modal"
    :close-on-press-escape="vaildBoolean(options.dialogEscape,config.dialogEscape)"
    :close-on-click-modal="vaildBoolean(options.dialogClickModal,config.dialogClickModal)"
    :wrapperClosable="options.dialogClickModal"
    :destroy-on-close="options.destroyOnClose"
    v-dialogDrag="vaildData(options.dialogDrag,config.dialogDrag)"
    :custom-class="vaildData(options.customClass,config.customClass)"
    :before-close="handleClose"
    @open="()=>{this.$emit('open')}"
    @opened="()=>{this.$emit('opened')}"
    @close="()=>{this.$emit('close')}"
    @closed="()=>{this.$emit('closed')}"
  >
    <div slot="title" class="zvue-dialog__header">
      <span class="el-dialog__title">{{options.title}}</span>
      <div class="zvue-dialog__menu">
        <i v-if="options.showFullScreen === false ? false : true" @click="handleFullScreen" class="el-dialog__close el-icon-full-screen"></i>
      </div>
    </div>
    <el-scrollbar :style="styleName">
      <template #default>
        <!-- v-if="options.destroyOnClose ? true : boxVisible" -->
        <slot :visible="boxVisible"></slot>
      </template>
    </el-scrollbar>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </component>
</template>

<script>
import {
  vaildData,
  vaildBoolean,
  setPx
} from "../../utils/util";
import { validatenull } from '../../utils/validate';

const config = {
  top: 150,
  height: 'auto',
  dialogDrag: false,
  clientHeight: document.documentElement.clientHeight,
  customClass: '',
  dialogClickModal: false,
  dialogEscape: true
}

export default {
  name: "zDialog",
  data() {
    return {
      config: config,
      fullscreen: false,
      size: null,
      boxVisible: false,
      index: -1,
      lastTop: null,
      lastLeft: null
    };
  },
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    },
    beforeClose: {}
  },
  watch: {
    visible(val) {
      this._typeOf(val) === 'Boolean' ? this.boxVisible = val : '';
    },
    boxVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  computed: {
    styleName() {
      return {
        height: this.dialogHeight,
        overflow: 'hidden'
      }
    },
    direction() {
      return this.options.direction
    },
    width() {
      return this.options.width || '70%';
    },
    dialogType() {
      return this.isDrawer ? 'elDrawer' : 'elDialog'
    },
    dialogTop() {
      return this.options.dialogTop || config.top;
    },
    isDrawer() {
      return this.options.dialogType === 'drawer';
    },
    dialogHeight() {
      if (this.isDrawer) {
        return 'calc(100% - 100px)';
      }
      if (this.options.height === config.height) {
        return this.setPx(config.clientHeight - 3 * this.dialogTop);
      }
      return this.setPx(this.options.height);
    }
  },
  methods: {
    vaildData,
    setPx,
    vaildBoolean,
    validatenull,
    handleFullScreen() {
      const elDialog = this.$refs.dialog.$el.querySelector('.el-dialog');

      if (this.isDrawer) {
        if (this.validatenull(this.size)) {
          this.size = '100%'
        } else {
          this.size = ''
        }
      } else {
        if (this.fullscreen) {
          if (this.lastTop) {
            elDialog.style.top = this.lastTop
          }
          if (this.lastLeft) {
            elDialog.style.left = this.lastLeft
          }
          this.fullscreen = false;
        } else {
          // 记录弹框之前位置
          this.lastTop = elDialog.style.top;
          this.lastLeft = elDialog.style.left;
          elDialog.style.top = elDialog.style.left = '';

          this.fullscreen = true;
        }
      }
    },
    handleClose(done) {
      if (typeof this.beforeClose === 'function') {
        return this.beforeClose(done);
      }
      done();
    }
  }
};
</script>
<style lang="less" scoped>
.zvue-dialog {
  /deep/ .el-dialog__headerbtn {
    top: 24px !important;
  }
  .zvue-dialog__header {
    display: flex;
    justify-content: space-between;
    height: 100%;
  }
  .zvue-dialog__menu {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .zvue-dialog__menu {
    i {
      cursor: pointer;
      color: #909399;
      padding-right: 25px;
    }
  }
}
</style>