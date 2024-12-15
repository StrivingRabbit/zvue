```sh
pnpm i @lxh/zvue
```

```js
import ZVue from '@liuxiaohang/zvue'
Vue.use(ZVue)
```

```js
// FIX: element-ui 多级级联在延迟赋值时不生效的 Bug。element-ui 级联的`lazyload`只支持从当`resolve([])传进来的数组中`读取相应的选项，修改后可从`上一级和当前传进来的数组`中获取选项
// FIX: element-ui `tree`的`lazy`模式，只可一层一层获取，即使上一层有`children`，在使用`lazy`时也会不渲染`children`。修改过后如果有`children`，则将其拼接在请求数据之前。
// vue.config.js

module.exports = {
  chainWebpack(config) {
		config.resolve.alias.set('element-ui', 'zvue-element-ui');
  }
}
```
