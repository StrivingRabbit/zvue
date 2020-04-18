<template>
  <component
    ref="myCharts"
    width="100%"
    height="100%"
    :is="componentId"
    :loading="loading"
    :data-empty="dataEmpty"
    v-bind="options"
    :legend-visible="legendVisible"
    :tooltip-visible="tooltipVisible"
    :mark-line="markLine"
    :mark-area="markArea"
    :mark-point="markPoint"
    @ready="_ready"
    @ready-once="_readyOnce"
  ></component>
</template>
<script>
// ready 图表渲染完成后触发，每次渲染都会触发一次3
// ready-once 只会在首次渲染完成后触发

const EMPTY_DATA = {
  columns: [],
  rows: []
};

export default {
  name: "zCharts",
  props: {
    load: {
      type: Boolean
    },
    options: {
      type: Object,
      required: true
    },
    "mark-line": {
      type: Object
    },
    "mark-area": {
      type: Object
    },
    "mark-point": {
      type: Object
    },
    "legend-visible": {
      type: Boolean,
      default: true
    },
    "tooltip-visible": {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      ...this.options,
      chartWidth: "",
      loading: false,
      dataEmpty: false
    };
  },
  mounted() {
    this._chartInit();
    this.charts = this.$refs["myCharts"];
  },
  methods: {
    _ready(...args) {
      this.$emit("ready", ...args);
    },
    _readyOnce(...args) {
      this.$emit("ready-once", ...args);
    },
    _chartInit() {
      // 服务器模式
      if (this._isServerMode) {
        this._getServerData();
      } else {
        this.data = this.options.data;
      }
    },
    _getServerData() {
      this.loading = true;

      let serverMode = this.data.serverMode;
      let url = serverMode.url;
      let dataSrc = serverMode.dataSrc;

      this._axios({
        mehtod: serverMode.type,
        url: url,
        data: serverMode.data
      })
        .then(res => {
          let data = res[dataSrc];
          if (data.length) {
            this._setchartData({
              rows: data
            });
          } else {
            this._setchartData(EMPTY_DATA);
          }
          //加载中结束
          this.loading = false;
        })
        .catch(err => {
          //加载中结束
          this.loading = false;
          this.dataEmpty = true;
          throw err;
        });
    }, // AXIOS
    _axios({ mehtod = "get", url = "", data = {} }) {
      if (url instanceof Function) {
        return url(data);
      } else if (typeof url === "string") {
        return this.$axios({ mehtod, url, data });
      }
    },
    _afterConfig(options) {
      console.log(options);
      return options;
    },
    _setchartData({ columns, rows }) {
      this.options.data = {
        columns: columns || this.data.columns,
        rows
      };
    },
    resize() {
      this.charts.echarts.resize();
    },
    refreshByData(data) {
      if (data instanceof Array) {
        this._setchartData({ rows: data });
      }
    }
  },
  computed: {
    _isServerMode() {
      return (
        this.data.serverMode &&
        (typeof this.data.rows === "undefined" || this.data.rows.length === 0)
      );
    },
    componentId() {
      return "ve-" + this.options.type;
    }
  },
  watch: {
    load(newVal) {
      this.loading = newVal;
    },
    "options.data"(newvalue, oldvalue) {
      if (!(newvalue.rows instanceof Array) || newvalue.rows.length === 0) {
        this.dataEmpty = true;
      } else {
        this.dataEmpty = false;
      }
    }
  }
};

/**
 * :data="options.data"
    :grid="options.grid"
    :colors="options.colors"
    :visualMap="options.visualMap"
    :dataZoom="options.dataZoom"
    :toolbox="options.toolbox"
    :title="options.title"
    :legend="options.legend"
    :yAxis="options.yAxis"
    :xAxis="options.xAxis"
    :radar="options.radar"
    :tooltip="options.tooltip"
    :axisPointer="options.axisPointer"
    :brush="options.brush"
    :geo="options.geo"
    :timeline="options.timeline"
    :graphic="options.graphic"
    :series="options.series"
    :backgroundColor="options.backgroundColor"
    :textStyle="options.textStyle"
    :animation="options.animation"
    :settings="options.settings"
    :extend="options.extend"
    :events="options.events"
    :legend-visible="options.legendVisible"
    :tooltip-visible="options.tooltipVisible"
    :init-options="options.initOptions"
    :theme-name="options.themeName"
    :theme="options.theme"
    :set-option-opts="options.setOptionOpts"
    :log="options.log"
    background-color
    // hooks
    :before-config="beforeConfig"
    :after-config="afterConfig"
    :after-set-option="afterSetOption"
    :after-set-option-once="afterSetOptionOnce"

    @ready="ready"
    @ready-once="readyOnce"

    resizeable
    resize-delay

    load
 */
</script>
