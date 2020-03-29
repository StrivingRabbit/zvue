import component from './src/dynamic.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
