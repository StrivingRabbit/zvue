import component from './src/input-number.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
