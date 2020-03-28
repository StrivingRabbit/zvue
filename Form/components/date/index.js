import component from './src/date.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
