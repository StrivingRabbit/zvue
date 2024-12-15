import ZvueElementUI from 'zvue-element-ui'
import './css/index.scss'
import _ from 'lodash';

import Table from './components/table'
import Pagination from './components/table/pagination'
import Dropdown from './components/table/dropDown'

import Form from './components/form'
import Cascader from './components/cascader';
import Checkbox from './components/checkbox';
import Date from './components/date';
import Group from './components/group';
import Input from './components/input';
import InputTree from './components/input-tree';
import InputTable from './components/input-table';
import InputNumber from './components/input-number';
import Radio from './components/radio';
import Select from './components/select';
import Slider from './components/slider';
import Switch from './components/switch';
import Time from './components/time';
import Tree from './components/tree';
import Upload from './components/upload';
import Dynamic from './components/dynamic';
import Dialog from './components/dialog';

import VeLine from 'v-charts/lib/line.common' //折线图
import VeBar from 'v-charts/lib/bar.common' //条形图
import VeHistogram from 'v-charts/lib/histogram.common' //柱状图
import VePie from 'v-charts/lib/pie.common' //饼图
import VeRing from 'v-charts/lib/ring.common' //环图
import "v-charts/lib/style.css"
import vcharts from './components/vcharts'

// directive
import Clickout from "./directive/clickout"
import Appendtobody from "./directive/appendtobody"
import DialogDrag from "./directive/dialogDrag"

// functions
import { deepClone, vaildData, findArray, setPx, _typeOf, getValueByPath, getPropByPath } from './utils/util';
const prototypes = { deepClone, vaildData, findArray, setPx, _typeOf, getValueByPath, getPropByPath }

const components = [
    Dropdown,
    Pagination,
    Dynamic,
    Dialog,
    Table,
    Cascader,
    Checkbox,
    Date,
    Input,
    InputTree,
    InputTable,
    InputNumber,
    Radio,
    Select,
    Slider,
    Switch,
    Time,
    Tree,
    Upload,
    Group,
    Form,
    VeLine,
    VeBar,
    VeHistogram,
    VePie,
    VeRing,
    vcharts
]

const install = (Vue) => {
    Clickout(Vue);
    Appendtobody(Vue);
    DialogDrag(Vue);

    Vue.use(ZvueElementUI);
    Vue.prototype._ = _;

    components.forEach(component => {
        if (component.install) {
            component.install(Vue);
        } else {
            Vue.component(component.name, component);
        }
    });

    Object.keys(prototypes).forEach((key) => {
        Vue.prototype[key] = prototypes[key];
    });
}

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    author: 'lxh',
    version: '1.5',
    install
}
