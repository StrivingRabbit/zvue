import component from './src/upload.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
