<template>
  <div class="zvue-form-wrapper" :style="{width:setPx(parentOption.width,'100%')}">
    <el-form
      :ref="formRef"
      :status-icon="vaildData(parentOption.statusIcon,false)"
      :label-suffix="parentOption.labelSuffix || '：'"
      :rules="formRules"
      :model="model"
      :size="controlSize"
      :label-width="setPx(parentOption.labelWidth,90)"
      :label-position="parentOption.labelPosition"
      :hide-required-asterisk="parentOption.hideRequiredAsterisk"
      :show-message="parentOption.showMessage"
      :inline-message="parentOption.inlineMessage"
    >
      <el-row :span="24">
        <!-- :display="item.display" -->
        <z-group
          v-for="(group) in columnOption"
          v-show="vaildData(!group.hide,true)"
          :key="group.prop"
          :display="group.display"
          :icon="group.icon"
          :label="group.label"
          :card="parentOption.card"
        >
          <template slot="header" v-if="$slots[group.prop+'Header']">
            <slot :name="`${group.prop}Header`"></slot>
          </template>
          <div class="zvue-form-group">
            <template v-for="(column, cindex) in group.forms">
              <el-col
                :key="column.prop"
                :span="column.span || itemSpanDefault"
                :offset="column.offset || 0"
                :push="column.push || 0"
                :pull="column.pull || 0"
                :xs="24"
                v-show="vaildData(!column.hide,true)"
                v-if="vaildDisplay(column)"
              >
                <el-form-item
                  :class="[_.isEmpty(column.label)?'zvue-form-item_emptylabel' : '']"
                  :label="column.label"
                  :prop="column.prop"
                  :required="column.required"
                  :error="column.error"
                  :show-message="column.showMessage"
                  :inline-message="column.inlineMessage"
                  :size="column.size || controlSize"
                  :label-width="setPx(column.width,parentOption.labelWidth || 90)"
                >
                  <!-- 自定义label -->
                  <template slot="label" v-if="column.labelslot">
                    <slot
                      :name="column.prop+'Label'"
                      :column="column"
                      :value="model[column.prop]"
                      :disabled="vaildDiabled(column,group)"
                      :size="column.size || controlSize"
                      :dic="DIC[column.prop]"
                    ></slot>
                  </template>
                  <!-- 自定义error -->
                  <template slot="error" slot-scope="{error}" v-if="column.errorslot">
                    <slot
                      :name="column.prop+'Error'"
                      :column="column"
                      :error="error"
                      :value="model[column.prop]"
                      :disabled="vaildDiabled(column,group)"
                      :size="column.size || controlSize"
                      :dic="DIC[column.prop]"
                    ></slot>
                  </template>
                  <!-- 如果是禁用tooltip，则tabindex 为 -1 -->
                  <el-tooltip
                    :tabindex="!column.tip || column.type==='upload' ? -1 : 0"
                    :disabled="!column.tip || column.type==='upload'"
                    :content="vaildData(column.tip,getPlaceholder(column))"
                    :placement="column.tipPlacement"
                  >
                    <span v-if="textMode">{{displayText(column)}}</span>
                    <slot
                      v-if="column.formslot"
                      :name="column.prop"
                      :value="model[column.prop]"
                      :column="column"
                      :label="model['$'+column.prop]"
                      :size="column.size || controlSize"
                      :disabled="vaildDiabled(column,group)"
                      :dic="DIC[column.prop]"
                    ></slot>
                    <form-temp
                      v-else
                      v-model="model[column.prop]"
                      :column="column"
                      :dic="DIC[column.prop]"
                      :upload-before="uploadBefore"
                      :upload-after="uploadAfter"
                      :disabled="vaildDiabled(column,group)"
                    >
                      <!-- 自定义表单里内容 -->
                      <template
                        :slot="`${column.prop}Type`"
                        slot-scope="{item,labelkey,valuekey,childrenkey,node}"
                        v-if="column.typeslot"
                      >
                        <slot
                          :name="`${column.prop}Type`"
                          :size="column.size || controlSize"
                          :item="item"
                          :labelkey="labelkey"
                          :valuekey="valuekey"
                          :childrenkey="childrenkey"
                          :node="node"
                        ></slot>
                      </template>
                      <!-- input的slot处理 -->
                      <template
                        v-if="column.prependslot"
                        :slot="column.prependslot"
                        slot-scope="{prependClick}"
                      >
                        <slot
                          :name="column.prependslot"
                          :disabled="vaildDiabled(column,group)"
                          :clickevent="prependClick"
                        ></slot>
                      </template>
                      <template
                        v-if="column.appendslot"
                        :slot="column.appendslot"
                        slot-scope="{appendClick}"
                      >
                        <slot
                          :name="column.appendslot"
                          :disabled="vaildDiabled(column,group)"
                          :clickevent="appendClick"
                        ></slot>
                      </template>
                    </form-temp>
                  </el-tooltip>
                </el-form-item>
              </el-col>
              <!-- 用作空行填充 -->
              <el-col
                :key="cindex"
                tag="div"
                style="display:inline-block;height:42px;"
                :span="column.count"
                v-if="column.row && column.span!==24 && column.count"
              ></el-col>
            </template>
          </div>
        </z-group>
        <el-col :span="24" v-if="vaildData(parentOption.menuBtn,true)">
          <el-form-item>
            <!-- 菜单按钮组 -->
            <div :class="`zvue-form-menu-${menuPosition}`">
              <el-button
                type="primary"
                @click="submit"
                :size="controlSize"
                icon="el-icon-check"
                :loading="vaildBoolean(parentOption.submitDisabled,allDisabled)"
                v-if="vaildData(parentOption.submitBtn,true)"
              >{{vaildData(parentOption.submitText,'确 定')}}</el-button>
              <el-button
                icon="el-icon-delete"
                :size="controlSize"
                :loading="vaildBoolean(parentOption.emptyDisabled,allDisabled)"
                v-if="vaildData(parentOption.emptyBtn,true)"
                @click="resetForm"
              >{{vaildData(parentOption.emptyText,'清 空')}}</el-button>
              <slot name="menuBtn" :disabled="allDisabled" :size="controlSize"></slot>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>

import {
  deepClone,
  vaildData,
  vaildBoolean,
  setPx,
  filterDefaultParams,
  findArray,
  _objKeysForeach
} from "../../../utils/util";
import {
  calcCascader,
  calcCount,
  getPlaceholder,
  formInitVal
} from "../../../utils/dataformat";
import init from "../../../common/init";
import formTemp from "../../formtemp";
import { validatenull } from "../../../utils/validate";
import { detail } from "../../../utils/detail";

const setDefaultValue = function(defaultOptions, options, vm) {
  _objKeysForeach(defaultOptions, function(key, value, index) {
    vm.$set(options, key, value);
  });
};

export default {
  name: "zForm",
  mixins: [init()],
  components: { formTemp },
  props: {
    uploadBefore: Function,
    uploadAfter: Function,
    value: {
      type: Object,
      required: true,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    textMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formRef: "form",
      itemSpanDefault: 12,
      formRules: {},
      formCreate: true, // 表单是否第一次创建
      modelOld: {}, // 表单上一次更新的model
      modelDefault: {}, // 表单的初始model
      model: {}, // 表单的model
      modelTranslate: {}, // 翻译的值
      allDisabled: false
    };
  },
  created() {
    // console.log("form create");
    //初始化字典
    this.columnOption.forEach(ele => {
      this.handleLoadDic(ele).then(res => {
        this.forEachLabel();
      });
    });
    // 初始化表单
    this.dataFormat();

    this.$root._zForm = this;
  },
  methods: {
    deepClone,
    validatenull,
    vaildData,
    vaildBoolean,
    getPlaceholder,
    setPx,
    findArray,
    dataFormat() {
      // 页面初始化
      let modelDefault = formInitVal(this.propOption);
      this.modelDefault = modelDefault;

      this.model = deepClone(modelDefault.tableForm);
      this.formVal();
    },
    formRulesInit() {
      _.map(this.propOption, (item, key) => {
        if (item.rules && item.disabled !== false && item.display !== false) {
          let currentRules = item.rules;
          // 必填时自动生成message
          if (
            validatenull(currentRules.validator) &&
            (!currentRules.message || currentRules.message.trim().length === 0)
          ) {
            if (currentRules.required) {
              currentRules.message = `必填，请填写${item.label}`;
              currentRules.trigger ? "" : (currentRules.trigger = `change`);
            }
          }
          // 添加进rules
          if (_.isArray(currentRules)) {
            this.$set(this.formRules, item.prop, currentRules);
          } else if (_.isObject(currentRules)) {
            this.$set(this.formRules, item.prop, [currentRules]);
          }
        }
      });
    },
    formVal() {
      _.map(this.value, (value, key) => {
        this.$set(this.model, key, value);
      });
      this.forEachLabel();
      this.$emit("input", this.model);
    },
    forEachLabel() {
      this.columnOption.forEach(group => {
        group.forms.forEach(column => {
          this.handleShowLabel(column, this.DIC[column.prop]);
        });
      });
    },
    handleShowLabel(column, DIC) {
      let result = "";
      if (!this.validatenull(DIC)) {
        result = detail(this.model, column, this.options, DIC);
        this.$set(this.modelTranslate, `$${column.prop}`, result);
      }
      return result;
    },
    //搜索指定的属性配置
    findColumnIndex(prop, group = false) {
      let list = [];
      let result;
      let hasForms = typeof this.options.forms !== "undefined";
      this.columnOption.forEach((column, index) => {
        const val = this.findArray(column.forms, prop, "prop");
        if (val !== -1) {
          // 如果有forms属性，则group的排序需要减一，因为forms会被当成一个group，添加在最前方
          hasForms && index > 0 ? list.push(index - 1) : list.push(index);
          list.push(val);
          result = val;
        }
      });
      if (list.length === 0) {
        return -1;
      }
      return group ? list : result;
    },
    // 根据prop设置属性
    setColumnByProp(prop, setOptions, isInGroup) {
      let isGroup =
        typeof isInGroup != "undefined"
          ? isInGroup
          : typeof this.options.group !== "undefined";
      let options = this.options;
      let index = this.findColumnIndex(prop, isGroup);
      if (index !== -1) {
        if (isGroup) {
          var formsOption = options.group[index[0]].forms[index[1]];
        } else {
          var formsOption = options.forms[index];
        }
        setDefaultValue(setOptions, formsOption, this);
      } else {
        this.$message({
          type: "error",
          message: `setColumnByProp -> 属性-${prop}-不存在`
        });
        console.error(`setColumnByProp -> 属性-${prop}-不存在`);
      }
    },
    // 判断该项是否可用
    vaildDiabled(column, group) {
      return this.vaildBoolean(
        column.disabled,
        group.disabled,
        this.allDisabled
      );
    },
    // 验证表单是否显隐
    vaildDisplay(column) {
      if (!this.validatenull(column.display)) {
        return this.vaildData(column.display, true);
      } else if (this.boxType === "add") {
        return this.vaildData(column.addDisplay, true);
      } else if (this.boxType === "edit") {
        return this.vaildData(column.editDisplay, true);
      } else if (this.boxType === "view") {
        return this.vaildData(column.viewDisplay, true);
      } else {
        return true;
      }
    },
    clearValidate() {
      this.Form.clearValidate();
    },
    /**
     * 清空表单字段
     * @param part:true 清空在column中字段,否则清空全部
     */
    resetForm(params = {}) {
      const part = params.part;
      if (part) {
        this.columnOption.forEach(ele => {
          ele.forms.forEach(form => {
            const prop = form.prop;
            this.model[prop] = this.modelDefault.tableForm[prop];
          });
        });
      } else {
        this.model = this.deepClone(this.modelDefault.tableForm);
      }
      this.$emit("input", this.model);
      this.$emit("reset-change");
      this.$nextTick(() => {
        this.clearValidate();
      });
    },
    validate(callback) {
      if (!callback) {
        return new Promise((resolve, reject) => {
          this.Form.validate(valid => {
            if (valid) {
              resolve(valid);
            } else {
              this.$message.warning("表单未填写完整，请检查后再提交");
              reject(valid);
            }
          });
        });
      } else {
        this.Form.validate(valid => {
          if (!valid) {
            this.$message.warning("表单未填写完整，请检查后再提交");
          }
          callback(valid);
        });
      }
    },
    submit() {
      this.validate(valid => {
        if (valid) {
          this.show();
          this.$emit(
            "submit",
            filterDefaultParams(
              this.model,
              this.modelTranslate,
              this.parentOption.translate
            ),
            this.hide
          );
        }
      });
    },
    show() {
      this.allDisabled = true;
    },
    hide() {
      this.allDisabled = false;
    },
    // get
    // 获取表单验证后的整个model
    getFormModel(cb) {
      if (cb) {
        this.validate(valid => {
          if (valid) {
            cb(
              filterDefaultParams(
                this.model,
                this.modelTranslate,
                this.parentOption.translate
              )
            );
          } else {
            console.error("验证失败，请检查表单");
          }
        });
      } else {
        return new Promise((resolve, reject) => {
          this.validate(valid => {
            if (valid) {
              resolve(
                filterDefaultParams(
                  this.model,
                  this.modelTranslate,
                  this.parentOption.translate
                )
              );
            } else {
              console.error("验证失败，请检查表单");
            }
          });
        });
      }
    },
    displayText(column) {
      let prop = column.prop;
      return this.modelTranslate[`$${prop}`] || this.model[prop];
    }
  },
  computed: {
    parentOption() {
      let option = this.deepClone(this.tableOption);

      let hasGroup = option.group;
      let hasForms = option.forms;

      if (!hasGroup) {
        option = Object.assign(option, {
          group: [this.deepClone(option)]
        });
      }
      if (hasGroup && hasForms) {
        option.group.unshift({ forms: hasForms });
      }
      delete option.forms;

      return option;
    },
    columnOption() {
      let list = [...this.parentOption.group] || [];
      list.forEach((ele, index) => {
        // 循环列的全部属性
        (ele.forms || []).forEach((form, cindex) => {
          //动态计算列的位置，如果为隐藏状态则或则手机状态不计算
          if (form.hide !== true && form.display !== false && !this.isMobile) {
            form = calcCount(form, this.itemSpanDefault, cindex === 0);
          }
        });
        //处理级联属性
        // ele.forms = calcCascader(ele.forms);
      });
      return list;
    },
    propOption() {
      let list = [];
      this.columnOption.forEach(option => {
        option.forms.forEach(form => {
          list.push(form);
        });
      });
      return list;
    },
    menuPosition() {
      if (this.parentOption.menuPosition) {
        return this.parentOption.menuPosition;
      }
      return "center";
    },
    optionsDisabled() {
      return this.options.disabled;
    },
    Form() {
      return this.$refs[this.formRef];
    }
  },
  watch: {
    model: {
      deep: true,
      handler(newVal, oldVal) {
        if (!this.formCreate) {
          this.$emit("input", this.model);
          this.$emit("change", this.model);
        }
      }
    },
    value: {
      deep: true,
      handler(newVal, oldVal) {
        this.modelOld = deepClone(oldVal);
        if (!this.formCreate) {
          this.formVal();
        } else {
          this.formCreate = false;
        }
      }
    },
    optionsDisabled: {
      immediate: true,
      handler(val) {
        if (typeof val === "boolean") {
          this.allDisabled = val;
        }
      }
    },
    disabled: {
      immediate: true,
      handler() {
        if (
          typeof this.disabled === "boolean" &&
          typeof this.options.disabled != "boolean"
        ) {
          this.allDisabled = this.disabled;
        }
      }
    }
  }
};
</script>
<style lang='less'>
.zvue-form-wrapper {
  .z-input-number,
  .el-cascader,
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner,
  .el-select {
    width: 100% !important;
  }
  .form_line {
    display: inline-block;
    height: 42px;
  }
  .zvue-form-menu-center {
    text-align: center;
  }
  .zvue-form-menu-left {
    text-align: left;
  }
  .zvue-form-menu-right {
    text-align: right;
  }
  .el-input-number__decrease,
  .el-input-number__increase {
    border: none !important;
    background: none;
  }
  .zvue-form-upload {
    // 头像上传
    .picture-list .el-upload {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    // 如果是禁用，隐藏上传的加号和上传按钮
    .el-upload_disabled {
      .el-upload--picture-card,
      .el-upload__tip,
      .el-upload--text {
        display: none;
      }
    }
    .picture-list .el-upload:hover {
      border-color: #409eff;
    }
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
    }
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
  }
  // 下拉树的样式调整
  .zvue-input-tree {
    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
    .el-tree-node__content {
      padding: 0;
    }
  }
  // 分组
  .zvue-form-group {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: start;
    -ms-flex-align: start;
    align-items: flex-start;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    height: auto;
  }
}
</style>