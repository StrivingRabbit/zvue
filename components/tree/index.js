import component from './src/tree.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
