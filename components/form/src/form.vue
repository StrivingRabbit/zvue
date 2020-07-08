<template>
  <div class="zvue-form-wrapper" :style="{width:setPx(parentOption.width,'100%')}">
    <el-card :body-style="{ padding: '0px' }" shadow="never">
      <div
        class="clearfix"
        slot="header"
        v-if="$scopedSlots.header_left || $scopedSlots.header_right"
        style="padding:0 10px;"
      >
        <div style="float: left; padding: 3px 0">
          <slot v-bind="slotProps" name="header_left"></slot>
        </div>
        <div style="float: right; padding: 3px 0">
          <slot v-bind="slotProps" name="header_right"></slot>
        </div>
      </div>
      <!-- 表单主体 -->
      <el-form
        v-loading="load"
        :ref="formRef"
        :status-icon="vaildData(parentOption.statusIcon,false)"
        :label-suffix="parentOption.labelSuffix || ':'"
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
            :arrow="group.arrow"
            :collapse="group.collapse"
            :card="parentOption.card"
          >
            <template #header v-if="$slots[group.prop+'Header']">
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
                  :xs="{span:column.span < 24 ? 24 : column.span,offset:0}"
                  :sm="{span:column.span < 12 ? 12 : column.span,offset:0}"
                  :md="column.span < 8 ? 8 : column.span"
                  :lg="column.span || itemSpanDefault"
                  v-show="vaildData(!column.hide,true)"
                  v-if="vaildDisplay(column)"
                  :style="{
                    paddingLeft:setPx((parentOption.gutter || 20) / 2),
                    paddingRight:setPx((parentOption.gutter || 20) / 2)
                  }"
                >
                  <el-form-item
                    :class="[validatenull(column.label)?'zvue-form-item_emptylabel' : '']"
                    :label="column.label"
                    :prop="column.prop"
                    :required="column.required"
                    :error="column.error"
                    :show-message="column.showMessage"
                    :inline-message="column.inlineMessage"
                    :size="column.size || controlSize"
                    :label-width="setPx(column.width,validatenull(parentOption.labelWidth) ? 90 : parentOption.labelWidth)"
                  >
                    <!-- 自定义label -->
                    <template #label v-if="column.labelslot">
                      <slot
                        v-bind="slotProps"
                        :name="column.prop+'Label'"
                        :column="column"
                        :label="column.label"
                        :value="model[column.prop]"
                        :disabled="vaildDiabled(column,group)"
                        :size="column.size || controlSize"
                        :dic="DIC[column.prop]"
                      ></slot>
                    </template>
                    <!-- 自定义error -->
                    <template #error="{error}" v-if="column.errorslot">
                      <slot
                        v-bind="slotProps"
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
                      <!-- <span
                      v-if="textMode && !['dynamic','upload'].includes(column.type)"
                      >{{displayText(column)}}</span>-->
                      <slot
                        v-if="column.formslot"
                        v-bind="slotProps"
                        :name="column.prop"
                        :value="getValueByPath(model,column.prop)"
                        :column="column"
                        :label="model['$'+column.prop]"
                        :size="column.size || controlSize"
                        :dic="DIC[column.prop]"
                        :disabled="vaildDiabled(column,group)"
                        :textMode="vaildTextMode(column,group)"
                      ></slot>
                      <!-- v-model="model[column.prop]" -->
                      <form-temp
                        v-else
                        :value="getValueByPath(model,column.prop)"
                        :column="column"
                        :dic="DIC[column.prop]"
                        :upload-before="uploadBefore"
                        :upload-after="uploadAfter"
                        :upload-success="uploadSuccess"
                        :upload-error="uploadError"
                        :size="controlSize"
                        :disabled="vaildDiabled(column,group)"
                        :textMode="vaildTextMode(column,group)"
                        @input="modelInput($event,column)"
                      >
                        <!-- 自定义表单里内容 -->
                        <template
                          :slot="`${column.prop}Type`"
                          slot-scope="{item,labelkey,valuekey,childrenkey,node}"
                          v-if="column.typeslot"
                        >
                          <slot
                            :name="`${column.prop}Type`"
                            v-bind="slotProps"
                            :size="column.size || controlSize"
                            :item="item"
                            :labelkey="labelkey"
                            :valuekey="valuekey"
                            :childrenkey="childrenkey"
                            :node="node"
                            :disabled="vaildDiabled(column,group)"
                            :textMode="vaildTextMode(column,group)"
                          ></slot>
                        </template>
                        <!-- input的slot处理 -->
                        <template v-if="column.prependSlot" #[column.prependSlot]="{prependClick}">
                          <slot
                            :name="column.prependSlot"
                            v-bind="slotProps"
                            :size="controlSize"
                            :disabled="vaildDiabled(column,group)"
                            :textMode="vaildTextMode(column,group)"
                            :clickevent="prependClick"
                          ></slot>
                        </template>
                        <template v-if="column.appendSlot" #[column.appendSlot]="{appendClick}">
                          <slot
                            :name="column.appendSlot"
                            v-bind="slotProps"
                            :size="controlSize"
                            :disabled="vaildDiabled(column,group)"
                            :textMode="vaildTextMode(column,group)"
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
                  :xs="0"
                  :sm="column.count > 8 ? 0 : column.count"
                  :md="column.count > 12 ? 8 : column.count"
                  :lg="column.count"
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
                <slot name="menuBtn" v-bind="slotProps"></slot>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
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

const setDefaultValue = function (defaultOptions, options, vm) {
  _objKeysForeach(defaultOptions, function (key, value, index) {
    vm.$set(options, key, value);
  });
};
// input事件的timer，防止更新过快
let modelInputTimer = null;

export default {
  name: "zForm",
  mixins: [init()],
  components: { formTemp },
  props: {
    uploadBefore: Function,
    uploadAfter: Function,
    uploadSuccess: Function,
    uploadError: Function,
    value: {
      type: Object,
      required: true,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    load: {
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
      allDisabled: false,
      noModelFileds: [] // 不返回的model值
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
  mounted() {
    /* setTimeout(() => {
      if (this.options.menuBtn === false) {
        const wrap = document.querySelector('.zvue-form-wrapper');
        const zGroup = wrap.querySelectorAll('.z-group');
        console.log("mounted -> zGroup", zGroup)
      }
    }, 0); */
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
      this.modelDefault = formInitVal(this.propOption);
      this.model = deepClone(this.modelDefault.tableForm);
      this.formVal();
    },
    formRulesInit() {
      for (const key in this.propOption) {
        if (this.propOption.hasOwnProperty(key)) {
          const item = this.propOption[key];

          if (item.rules && item.disabled !== false && item.display !== false) {
            let currentRules = item.rules;
            // 添加进rules
            if (Array.isArray(currentRules)) {
              currentRules.forEach(currentRule => {
                this.fillRequiredRule(currentRule, item);
              });
              this.$set(this.formRules, item.prop, currentRules);
            } else if (this._typeOf(currentRules) === 'Object') {
              this.fillRequiredRule(currentRules, item);
              this.$set(this.formRules, item.prop, [currentRules]);
            }
          }
        }
      }
    },
    // 必填时自动生成message
    fillRequiredRule(currentRules, item) {
      if (
        validatenull(currentRules.validator) &&
        (!currentRules.message || currentRules.message.trim().length === 0)
      ) {
        if (currentRules.required) {
          currentRules.message = `必填，请填写${item.label}`;
          currentRules.trigger ? "" : (currentRules.trigger = `change`);
        }
      }
    },
    formVal() {
      if (!this.formCreate && this.validatenull(this.value)) {
        this.resetForm();
      } else {
        Object.keys(this.value).forEach(ele => {
          this.$set(this.model, ele, this.value[ele]);
        });
        this.forEachLabel();
      }
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
    // 根据prop获取forms
    getFormByProp(prop, group = false) {
      let formsOption = {};
      let index = this.findColumnIndex(prop, group);
      if (index !== -1) {
        if (group) {
          formsOption = this.options.group[index[0]].forms[index[1]];
        } else {
          formsOption = this.options.forms[index];
        }
        return formsOption;
      } else {
        this.$message({
          type: "error",
          message: `setColumnByProp -> 属性-${prop}-不存在`
        });
        console.error(`setColumnByProp -> 属性-${prop}-不存在`);
      }
      return -1;
    },
    // 根据prop设置属性
    setColumnByProp(prop, setOptions, isInGroup) {
      let isGroup =
        typeof isInGroup != "undefined"
          ? isInGroup
          : typeof this.options.group !== "undefined";
      let options = this.options;
      let formsOption = this.getFormByProp(prop, isGroup);
      if (formsOption !== -1) {
        setDefaultValue(setOptions, formsOption, this);
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
    // 判断该项是否为不可编辑
    vaildTextMode(column, group) {
      return this.vaildBoolean(column.textMode, group.textMode, this.textMode);
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

      // 重置model
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

      // 重置modelTranslate
      this.modelTranslate = {};
      this.forEachLabel();

      // 触发input方法，修改外部model
      this.$emit("input", this.model);
      this.$emit("reset-change");

      // 清除表单验证
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
              this.parentOption.translate,
              this.noModelFileds
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
    modelInput(value, { type, prop }) {
      // 如果是input类型，会有快速输入的情况，所以添加一个延时器
      // 添加延时器会造成表单校验慢一拍
      /* if (['input', 'password'].includes(type)) {
        clearTimeout(modelInputTimer);
        modelInputTimer = setTimeout(() => {
          let parentObj = this.getPropByPath(this.model, prop).o;
          parentObj[prop.split('.').pop()] = value;
        }, 100);
      } else {
        let parentObj = this.getPropByPath(this.model, prop).o;
        parentObj[prop.split('.').pop()] = value;
      } */
      let parentObj = this.getPropByPath(this.model, prop).o;
      parentObj[prop.split('.').pop()] = value;
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
                this.parentOption.translate,
                this.noModelFileds
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
                  this.parentOption.translate,
                  this.noModelFileds
                )
              );
            } else {
              console.error("验证失败，请检查表单");
            }
          });
        });
      }
    },
    getGroupByProp(prop) {
      let groups = this.options.group;
      for (let index = 0; index < groups.length; index++) {
        let group = groups[index];
        if (group.prop === prop) {
          return group;
        }
      }
      return -1;
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
          if (form.noModel) this.noModelFileds.push(form.prop);
          //动态计算列的位置，如果为隐藏状态则或则手机状态不计算
          if (form.hide !== true && form.display !== false && !this.isMobile) {
            // 如果该项没有设置span，且设置了itemSpan，则赋值itemSpan
            if (typeof form.span === 'undefined' && typeof this.options.itemSpan !== 'undefined') {
              form.span = this.options.itemSpan;
            }
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
    },
    textMode() {
      return this.options.textMode;
    },
    slotProps() {
      return {
        size: this.controlSize,
        disabled: this.allDisabled,
        textMode: this.textMode
      };
    }
  },
  watch: {
    model: {
      deep: true,
      handler(newVal, oldVal) {
        if (!this.formCreate) {
          this.$emit("input", newVal);
          this.$emit("change", newVal);
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
    },
    textMode(newVal) {
      if (newVal === true) {
        this.clearValidate();
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
  // el-card
  .el-card {
    border: 0;
  }
  .el-card__header {
    padding: 0;
  }
  .clearfix:before,
  .clearfix:after {
    display: block;
    content: "";
  }
  .clearfix:after {
    clear: both;
  }
  // 折叠面板去除padding-bottom
  .el-collapse-item__content {
    padding-bottom: 0;
  }
}
// 下拉树的样式调整
.zvue-input-tree {
  .el-tree-node__content {
    padding: 0;
  }
}
</style>