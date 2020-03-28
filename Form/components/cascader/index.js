import component from './src/cascader.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
