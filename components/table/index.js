import component from './src/table.vue';
component.install = (Vue) => {
  Vue.component(component.name, component);
}
export default component;
