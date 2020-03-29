import component from './src/slider.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
