import component from './src/time.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
