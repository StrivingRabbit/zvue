import component from './src/form';
component.install = (Vue) => {
  Vue.component(component.name, component);
}
export default component;
