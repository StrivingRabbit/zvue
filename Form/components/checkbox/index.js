import component from './src/checkbox.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
