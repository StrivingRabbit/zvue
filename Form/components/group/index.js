import component from './src/group.vue';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
