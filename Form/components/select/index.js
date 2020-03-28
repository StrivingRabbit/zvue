import component from './src/select.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
