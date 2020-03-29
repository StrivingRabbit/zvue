import component from './src/radio.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
