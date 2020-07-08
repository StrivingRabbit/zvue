import component from './src/input.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
