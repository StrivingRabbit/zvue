<template>
  <div v-if="dropDown.show ? dropDown.show(carryData) : true">
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
        <template v-for="item in dropDown.menus">
          <el-dropdown-item
            v-if="item.show ? item.show(carryData) : true"
            :carryData="carryData || item.carryData"
            :key="item.label"
            :command="item.handler"
            :disabled="item.disabled"
            :divided="item.divided"
          >{{item.label}}</el-dropdown-item>
        </template>
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
  methods: {
    //列操作下拉方法
    handleCommand(command, currentMenu) {
      //下拉回调执行
      command(currentMenu.$attrs.carryData);
    }
  }
};
</script>