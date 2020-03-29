<template>
  <div>
    <el-dropdown @command="handleCommand">
      <span @click="dropDown.handler && dropDown.handler(carryData)" class="el-dropdown-link">
        <i v-if="dropDown.icon" :class="dropDown.icon"></i>
        {{dropDown.label}}
        <i
          v-if="typeof dropDown.showMore != 'undefined' ? dropDown.showMore : true"
          class="el-icon-arrow-down el-icon--right"
        ></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="item in dropDown.menus"
          :carryData="carryData || item.carryData"
          :key="item.label"
          :command="item.handler"
          :disabled="item.disabled"
          :divided="item.divided"
        >{{item.label}}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
export default {
  name: "zDropdown",
  props: {
    dropDown: {
      type: Object,
      required: true
    },
    carryData: {}
  },
  data() {
    return {
      btns: {
        label: "",
        icon: "el-icon-more",
        showMore: false,
        handler(row) {
          console.log(row);
        },
        menus: [
          {
            label: "租用",
            handler: function(row) {
              console.log("租用", row);
              console.log("zuyong");
            }
          },
          {
            label: "借用",
            handler: function(row) {
              console.log("借用", row);
              console.log("jieyong");
            }
          }
        ]
      }
    };
  },
  methods: {
    //列操作下拉方法
    handleCommand(command, currentMenu) {
      //下拉回调执行
      command(currentMenu.$attrs.carryData);
    }
  }
};
</script>