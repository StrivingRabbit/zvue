<template>
  <div>
    <div class="avue-tree__filter" v-if="vaildData(options.filter,true)">
      <el-input clearable placeholder="输入关键字进行过滤" :size="size" v-model="filterText">
        <el-button
          slot="append"
          :size="size"
          @click="parentAdd"
          icon="el-icon-plus"
          v-if="vaildData(options.addBtn,false)"
        ></el-button>
      </el-input>
    </div>
    <el-tree
      ref="tree"
      v-bind="options"
      :data="data"
      :props="props"
      :icon-class="iconClass"
      :highlight-current="!options.multiple"
      :show-checkbox="options.multiple"
      :node-key="nodeKey"
      :filter-node-method="filterNode"
      :expand-on-click-node="false"
      @check-change="handleCheckChange"
      @node-click="nodeClick"
      @node-contextmenu="nodeContextmenu"
    >
      <template v-if="$scopedSlots.default" #default="{node,data}">
        <slot :node="node" :data="data"></slot>
      </template>
    </el-tree>

    <transition name="el-zoom-in-top">
      <div
        v-if="client.show&&menu"
        class="el-cascader-panel is-bordered zvue-tree_menu"
        v-clickout="closeMenu"
        @click="client.show=false"
        :style="styleName"
      >
        <div class="zvue-tree_item" v-if="vaildData(options.addBtn,false)" @click="rowAdd">新增</div>
        <div class="zvue-tree_item" v-if="vaildData(options.editBtn,false)" @click="rowEdit">修改</div>
        <div class="zvue-tree_item" v-if="vaildData(options.delBtn,false)" @click="rowRemove">删除</div>
        <slot name="menu" :node="node" :Tree="instance"></slot>
      </div>
    </transition>

    <el-dialog
      :title="node[labelKey] || title"
      :visible.sync="box"
      modal-append-to-body
      append-to-body
      @close="hide"
      :width="vaildData(options.dialogWidth,'50%')"
    >
      <z-form v-model="form" :options="formOptions" ref="form" @submit="handleSubmit"></z-form>
    </el-dialog>
  </div>
</template>

<script>
import { DIC_PROPS } from '../../../global/variable';
import { deepClone, vaildData, setPx, setDefaultValue } from "../../../utils/util";
export default {
  name: "zTree",
  props: {
    iconClass: {
      type: String,
    },
    options: {
      type: Object,
      default: () => {
        return {};
      }
    },
    data: {
      type: Array,
      default: () => {
        return [];
      }
    },
    value: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      filterText: "",
      client: {
        x: 0,
        y: 0,
        show: false
      },
      box: false,
      type: "",
      node: {},
      obj: {},
      form: {},
      instance: null
    };
  },
  computed: {
    Tree() {
      return this.$refs.tree
    },
    styleName() {
      return {
        top: this.setPx(this.client.y - 10),
        left: this.setPx(this.client.x - 10),
        boxSizing: 'border-box',
        padding: '0 10px',
        boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)'
      }
    },
    menu() {
      let hasBtn = !!this.$scopedSlots.menu || this.options.addBtn || this.options.editBtn || this.options.delBtn;
      return this.vaildData(this.options.menu, true) && hasBtn;
    },
    title() {
      return this.options.title
    },
    addText() {
      return this.addFlag ? "新增" : "编辑";
    },
    addFlag() {
      return ["add", "parentAdd"].includes(this.type);
    },
    size() {
      return this.options.size || "small";
    },
    props() {
      let props = this.options.props || {};
      setDefaultValue(DIC_PROPS, props, this);
      return props;
    },
    leafKey() {
      return this.props.isLeaf || DIC_PROPS.isLeaf
    },
    valueKey() {
      return this.props.value || DIC_PROPS.value;
    },
    labelText() {
      return this.props.labelText || DIC_PROPS.labelText;
    },
    labelKey() {
      return this.props.label || DIC_PROPS.label;
    },
    childrenKey() {
      return this.props.children || DIC_PROPS.children;
    },
    nodeKey() {
      return this.props.nodeKey || DIC_PROPS.nodeKey;
    },
    formColumnOption() {
      return (this.options.formOptions || {}).forms || [];
    },
    formOptions() {
      return Object.assign(
        {
          submitText: this.addText,
          forms: [{
            label: this.valueKey,
            prop: this.valueKey,
            display: false
          },
          {
            label: this.labelText,
            prop: this.labelKey,
            rules: [
              {
                required: true,
                trigger: "blur"
              }
            ]
          },
          ...this.formColumnOption
          ]
        },
        (() => {
          let options = this.options.formOptions || {};
          delete options.forms;
          return options;
        })()
      );
    }
  },
  created() {
    this.vaildData = vaildData;
    this.deepClone = deepClone;
    this.setPx = setPx;
  },
  mounted() {
    this.initFun();
    this.instance = this.Tree;
  },
  watch: {
    options() {
      this.init();
    },
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    value(val) {
      this.form = val;
    },
    form(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    closeMenu() {
      this.client.show = false
    },
    initFun() {
      [
        'filter', 'updateKeyChildren', 'getCheckedNodes', 'setCheckedNodes', 'getCheckedKeys',
        'setCheckedKeys', 'setChecked', 'getHalfCheckedNodes', 'getHalfCheckedKeys', 'getCurrentKey', 'getCurrentNode',
        'setCurrentKey', 'setCurrentNode', 'getNode', 'remove', 'append', 'insertBefore', 'insertAfter'
      ].forEach(ele => {
        this[ele] = this.$refs.tree[ele];
      })
    },
    nodeContextmenu(e, data) {
      this.node = this.deepClone(data);
      this.client.x = e.clientX;
      this.client.y = e.clientY;
      this.client.show = true;
    },
    handleCheckChange(data, checked, indeterminate) {
      this.$emit('check-change', data, checked, indeterminate)
    },
    handleSubmit(form, done) {
      this.addFlag ? this.save(form, done) : this.update(form, done)
    },
    nodeClick(data, node, $tree) {
      this.$emit("node-click", data, node, $tree);
    },
    filterNode(value, data) {
      if (typeof this.options.filterNode === 'function') {
        return this.options.filterNode(value, data);
      }
      if (!value) return true;
      return data[this.labelKey].indexOf(value) !== -1;
    },
    hide() {
      this.box = false;
      this.$refs.form.resetForm();
      this.$refs.form.clearValidate();
    },
    save(data, done) {
      const callback = () => {
        let form = this.deepClone(this.form);
        if (this.type === "add") {
          this.$refs.tree.append(form, this.node[this.valueKey])
        } else if (this.type === "parentAdd") {
          this.$refs.tree.append(form)
        }
        this.hide();
        done()
      };
      this.$emit("save", data, callback, done);
    },
    update(data, done) {
      const callback = () => {
        let node = this.$refs.tree.getNode(this.node[this.valueKey]);
        let form = this.deepClone(this.form);
        node.data = form
        this.hide();
        done()
      };
      this.$emit("update", data, callback, done);
    },
    rowEdit(a) {
      this.type = "edit";
      this.form = this.node;
      this.show();
    },
    parentAdd() {
      this.type = "parentAdd";
      this.show();
    },
    rowAdd() {
      this.type = "add";
      this.show();
    },
    show() {
      this.client.show = false;
      this.box = true;
    },
    rowRemove() {
      this.client.show = false;

      const callback = () => {
        this.$refs.tree.remove(this.node[this.valueKey])
      }

      this.$confirm("是否删除改节点?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$emit("del", this.node, callback);
        })
        .catch(() => { });
    }
  }
};
</script>
<style lang="less" scoped>
.zvue-tree_menu {
  width: 200px;
  position: fixed;
  z-index: 1024;
  flex-wrap: wrap;
  background-color: #fff;
}
/deep/ .zvue-tree_item {
  height: 34px;
  line-height: 34px;
  outline: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  color: #666;

  &:hover {
    cursor: pointer;
    color: #409eff;
  }
}
</style>