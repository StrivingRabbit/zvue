<template>
  <el-select
    ref="main"
    v-model="text"
    :size="size"
    :multiple="multiple"
    :filterable="remote?true:filterable"
    :clearable="disabled?false:clearable"
    :remote="remote"
    :readonly="readonly"
    :remote-method="handleRemoteMethod"
    :collapse-tags="collapseTags"
    :placeholder="placeholder"
    :multiple-limit="limit"
    :allow-create="allowCreate"
    :default-first-option="defaultFirstOption || allowCreate?true:false"
    :disabled="disabled"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
    @click.native="handleClick"
  >
    <template v-if="group">
      <el-option-group
        v-for="group in netDic"
        :key="group.label"
        :label="group.label"
        :disabled="group.disabled"
      >
        <el-option
          v-for="oitem in group[groupsKey]"
          :disabled="oitem.disabled"
          :key="getLabelText(oitem)"
          :label="getLabelText(oitem)"
          :value="oitem[valueKey]"
        >
          <slot :name="`${prop}Type`" :labelkey="labelKey" :valuekey="valueKey" :item="oitem"></slot>
        </el-option>
      </el-option-group>
    </template>
    <template v-else>
      <el-option
        v-for="oitem in netDic"
        :disabled="oitem.disabled"
        :key="getLabelText(oitem)"
        :label="getLabelText(oitem)"
        :value="oitem[valueKey]"
      >
        <slot :name="`${prop}Type`" :labelkey="labelKey" :valuekey="valueKey" :item="oitem"></slot>
      </el-option>
    </template>
  </el-select>
</template>
<script>
import { initVal } from "../../../utils/dataformat";
import { validatenull } from "../../../utils/validate";
import props from "../../../common/props";
import events from "../../../common/events";
import { miAjax } from "../../../utils/util";

export default {
  name: "zSelect",
  mixins: [props(), events()],
  props: {
    drag: {
      type: Boolean,
      default: false
    },
    remote: {
      type: Boolean,
      default: false
    },
    collapseTags: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      default: 99
    },
    filterable: {
      type: Boolean,
      default: false
    },
    allowCreate: {
      type: Boolean,
      default: false
    },
    defaultFirstOption: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultDic: [],
      netDic: []
    };
  },
  created() {},
  methods: {
    validatenull,
    handleRemoteMethod(query) {
      miAjax({
        axios: this.$axios,
        url: this.dicUrl,
        method: this.dicMethod,
        query: this.dicQuery
      }).then(res => {
        _.isArray(res) && this.validatenull(res) ? "" : (this.netDic = res);
      });
    }
  },
  computed: {},
  watch: {
    dic: {
      immediate: true,
      handler(val) {
        this.netDic = val;
        this.defaultDic = val;
      }
    } /* ,
    text: {
      // immediate: true,
      handler(value) {
        console.log("watch text", value);
        this.handleChange(value);
      }
    } */
  }
};
</script>