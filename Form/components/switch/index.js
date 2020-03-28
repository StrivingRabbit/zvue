import component from './src/switch.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
