<template>
  <el-tooltip :disabled="tooltipDisabled" :content="labelShow" :placement="placement">
    <el-select
      :size="size"
      ref="main"
      :value="labelShow"
      :clearable="disabled?false:clearable"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="true"
      @click.native="initScroll"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <div v-if="filter" style="padding:0 10px;margin:5px 0 0 0;">
        <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
      </div>
      <el-option :style="{height:'auto',padding:0}" :value="text">
        <div class="zvue-input-tree">
          <el-tree
            ref="tree"
            class="tree-option"
            style="padding:10px 0;"
            :highlight-current="!multiple"
            :data="dicList"
            :node-key="valueKey"
            :accordion="accordion"
            :show-checkbox="multiple"
            :props="treeProps"
            :lazy="lazy"
            :load="treeLoad"
            :check-strictly="checkStrictly"
            :current-node-key="multiple?'':text"
            :filter-node-method="filterNode"
            :default-expanded-keys="defaultExpandedKeys?defaultExpandedKeys:(defaultExpandAll?[]:keysList)"
            :default-checked-keys="defaultCheckedKeys?defaultCheckedKeys:keysList"
            :default-expand-all="defaultExpandAll"
            @check="checkChange"
            @node-click="handleNodeClick"
            :icon-class="iconClass"
          >
            <template #default="{ data }">
              <div style="width:100%;padding-right:10px;">
                <slot
                  :name="prop+'Type'"
                  :labelkey="labelKey"
                  :valuekey="valueKey"
                  :item="data"
                  v-if="typeslot"
                ></slot>
                <span v-else>{{getLabelText(data)}}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </el-option>
    </el-select>
  </el-tooltip>
</template>

<script>
import props from "../../../common/props";
import events from "../../../common/events";
import { validatenull } from "../../../utils/validate";
import { DIC_SPLIT } from "../../../global/variable";
import { findLabelNode } from "../../../utils/util";
export default {
  name: "zInputTree",
  mixins: [props(), events()],
  data() {
    return {
      node: [],
      filterText: "",
      box: false,
      labelText: [],
      tooltipContent: ''
    };
  },
  props: {
    nodeClick: Function,
    treeLoad: Function,
    checked: Function,
    value: {},
    lazy: {
      type: Boolean,
      default: false
    },
    leafOnly: {
      type: Boolean,
      default: false
    },
    includeHalfChecked: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Boolean,
      default: true
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    accordion: {
      type: Boolean,
      default: false
    },
    parent: {
      type: Boolean,
      default: true
    },
    defaultExpandedKeys: {
      type: Array,
    },
    iconClass: {
      type: String,
    },
    defaultCheckedKeys: {
      type: Array,
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    showAllLevels: {
      type: Boolean,
      default: true
    },
    placement: {
      type: String
    }
  },
  watch: {
    text: {
      handler(value) {
        // 空值会触发select的change
        if (this.validatenull(value)) {
          this.clearHandle();
        }
        this.handleChange(value);
      },
    },
    dic() {
      this.init();
    },
    value() {
      this.initVal();
      this.init();
    },
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  computed: {
    treeProps() {
      return Object.assign(this.props, {
        isLeaf: this.leafKey
      })
    },
    dicList() {
      function addParent(result, parent) {
        result.forEach(ele => {
          const children = ele.children;
          if (children) {
            addParent(children, ele);
          }
          if (parent) {
            ele.$parent = parent;
          }
        });
      }
      let list = this.dic;
      addParent(list);
      return list;
    },
    keysList() {
      if (this.validatenull(this.text)) {
        return [];
      }
      return this.multiple ? this.text : [this.text];
    },
    labelShow() {
      if (this.typeformat) {
        let list = [];
        this.node.forEach(ele => {
          list.push(this.getLabelText(ele))
        })
        return list.join(DIC_SPLIT).toString()
      }
      return (this.labelText || []).join(DIC_SPLIT).toString()
    },
    tooltipDisabled() {
      return !(this.labelShow.length > 0);
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    findLabelNode,
    validatenull,
    // 初始化滚动条
    initScroll() {
      setTimeout(() => {
        this.$nextTick(() => {
          let scrollBar = document.querySelectorAll('.el-scrollbar .el-select-dropdown__wrap')
          scrollBar.forEach(ele => {
            ele.scrollTop = 0;
          })
        })
      }, 0)
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.labelKey].indexOf(value) !== -1;
    },
    checkChange(checkedNodes, { checkedKeys, halfCheckedKeys, halfCheckedNodes }) {
      this.text = [];
      this.node = [];
      this.labelText = [];
      const list = this.$refs.tree.getCheckedNodes();
      for (let index = 0; index < list.length; index++) {
        const node = list[index];
        // 不保存显示父级，只保存选中自己id
        if (this.showAllLevels === false && !this.validatenull(node[this.childrenKey])) continue;
        this.node.push(node)
        this.text.push(node[this.valueKey]);
        this.labelText.push(node[this.labelKey]);
      }
      if (typeof this.checked === "function") this.checked(checkedNodes);
      const result = this.isString && this.multiple
        ? this.text.join(",")
        : this.text;
      this.$emit("input", result);
      this.$emit("change", result);
    },
    init() {
      this.$nextTick(() => {
        this.labelText = [];
        this.node = [];
        if (this.multiple) {
          let list = this.$refs.tree.getCheckedNodes(this.leafOnly, this.includeHalfChecked)
          for (let index = 0; index < list.length; index++) {
            const ele = list[index];
            // 不保存显示父级，只保存选中自己id
            if (this.showAllLevels === false && !this.validatenull(ele[this.childrenKey])) continue;
            this.labelText.push(ele[this.labelKey])
            this.node.push(ele);
          }
        } else {
          let node = this.$refs.tree.getNode(this.text)
          if (node) {
            this.labelText.push(node.data[this.labelKey])
            if (this.showAllLevels) {
              // 拿取从父级到当前点击路径
              this.labelText = this.getAllLabelByNode(node)
            }
            this.node.push(node.data);
          }
        }
      })
      //是否禁止父类
      this.disabledParentNode(this.dic, this.parent);
    },
    disabledParentNode(dic, parent) {
      dic.forEach(ele => {
        const children = ele[this.childrenKey];
        if (!this.validatenull(children)) {
          if (!parent) {
            ele.disabled = true;
          }
          this.disabledParentNode(children, parent);
        }
      });
    },
    clearHandle() {
      let allNode = document.querySelectorAll('.tree-option .el-tree-node')
      allNode.forEach((element) => element.classList.remove('is-current'))
      this.$refs.tree.setCheckedKeys([]);
    },
    handleNodeClick(data, node, $tree) {
      if (data.disabled) return
      if (typeof this.nodeClick === "function") this.nodeClick(data, node, $tree);
      if (this.multiple) return;
      if (
        (this.validatenull(data[this.childrenKey]) && !this.multiple) ||
        this.parent
      ) {
        // 触发input后，value会改变，labelText在init中进行设置
        // 拿取从父级到当前点击路径
        // let parentLabelText = this.getAllLabelByNode(node);

        const value = data[this.valueKey];
        const label = data[this.labelKey];
        const result = this.isString && this.multiple ? value.join(",") : value;

        this.text = value;
        this.node = [data];
        /* this.labelText = [label];

        if (this.showAllLevels) {
          this.labelText = parentLabelText;
        } */
        this.$refs.main.blur();
        this.$emit("input", result);
        this.$emit("change", result);
      }
    },
    handleClick() {
      const result =
        this.isString && this.multiple ? this.text.join(",") : this.text;
      if (typeof this.click === "function")
        this.click({ value: result, column: this.column });
    },
    getAllLabelByNode(node) {
      // 拿取从父级到当前点击路径
      let parentLabelText = [node.data[this.labelKey]];
      let $parent = node.parent;
      while ($parent) {
        this._typeOf($parent.data) === 'Object'
          ? parentLabelText.push($parent.data[this.labelKey])
          : '';
        $parent = $parent.parent;
      }
      return parentLabelText.reverse();
    },
    handleChange(value) {
      let text = this.text;
      const result = this.isString && this.multiple ? value.join(",") : value;
      if (typeof this.change === "function") {
        this.change({ value: result, column: this.column });
      }
      this.$emit("input", result);
      this.$emit("change", result);
    }
  }
};
</script>
