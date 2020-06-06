<template>
  <el-select
    ref="main"
    v-model="text"
    :size="size"
    :loading="loading"
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
    v-loadmore="load"
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
          :disabled="oitem[disabledKey]"
          :key="oitem[valueKey] || getLabelText(oitem)"
          :label="getLabelText(oitem)"
          :value="oitem[valueKey]"
        >
          <slot :name="`${prop}Type`" :labelkey="labelKey" :valuekey="valueKey" :item="oitem"></slot>
        </el-option>
      </el-option-group>
    </template>
    <template v-else>
      <el-option
        v-for="oitem in visibleDic"
        :disabled="oitem[disabledKey]"
        :key="oitem[valueKey] || getLabelText(oitem)"
        :label="getLabelText(oitem)"
        :value="oitem[valueKey]"
      >
        <slot :name="`${prop}Type`" :labelkey="labelKey" :valuekey="valueKey" :item="oitem"></slot>
      </el-option>
      <p
        v-if="infinitescroll && noMore"
        :style="{
        textAlign:'center',
        fontSize:'12px',
        color:'#666'
        }"
      >没有更多了~</p>
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
    infinitescroll: {
      // 无限下拉加载，但是如果value项没有加载出来，则反显会出错
      type: Boolean,
      default: false
    },
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
  directives: {
    loadmore: {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
        SELECTWRAP_DOM.addEventListener('scroll', function () {

          const CONDITION = this.scrollHeight - this.scrollTop <= this.clientHeight
          if (CONDITION) {
            binding.value()
          }
        })
      }
    }
  },
  data() {
    return {
      // 默认显示20条
      start: 0,
      end: 10,
      pageSize: 10,
      netDic: [],
      loading: false
    };
  },
  methods: {
    validatenull,
    handleRemoteMethod(query) {
      this.loading = true;
      miAjax({
        axios: this.$axios,
        url: this.dicUrl,
        method: this.dicMethod,
        query: this.dicQuery
      }).then(res => {
        _.isArray(res) && this.validatenull(res) ? "" : (this.netDic = res);
      }).finally(() => this.loading = false)
    },
    load() {
      if (this.noMore) {
        return;
      }
      this.end += this.pageSize;
    }
  },
  computed: {
    visibleDic() {
      let tempArr = [];
      if (this.infinitescroll) {
        tempArr = this.netDic.slice(this.start, this.end);
      } else {
        tempArr = this.netDic;
      }
      return tempArr;
    },
    noMore() {
      return this.end >= this.netDic.length;
    }
  },
  watch: {
    dic: {
      immediate: true,
      handler(val) {
        this.netDic = val;
        this.end = 10;
        // this.defaultDic = val;
      }
    }
    /* 会触发两次change ,
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