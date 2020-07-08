import component from './src';
component.install = (Vue) => {
    Vue.component(component.name, component);
}
export default component;
