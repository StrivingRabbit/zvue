import Table from './Table'
import Pagination from './Table/components/pagination.vue'
import Dropdown from './Table/components/dropdown.vue'

import Form from './Form'
import Cascader from './Form/components/Cascader';
import Checkbox from './Form/components/checkbox';
import Date from './Form/components/date';
import Group from './Form/components/group';
import Input from './Form/components/input';
import InputNumber from './Form/components/input-number';
import Radio from './Form/components/radio';
import Select from './Form/components/select';
import Slider from './Form/components/slider';
import Switch from './Form/components/switch';
import Time from './Form/components/time';
import Tree from './Form/components/tree';
import Upload from './Form/components/upload';
import Dynamic from './Form/components/dynamic';

import VeLine from 'v-charts/lib/line.common' //折线图
import VeBar from 'v-charts/lib/bar.common' //条形图
import VeHistogram from 'v-charts/lib/histogram.common' //柱状图
import VePie from 'v-charts/lib/pie.common' //饼图
import VeRing from 'v-charts/lib/ring.common' //环图
import "v-charts/lib/style.css"
import vcharts from './vcharts'

// directive
import Clickout from "./directive/clickout"

const components = [
    Dropdown,
    Pagination,
    Dynamic,
    Table,
    Cascader,
    Checkbox,
    Date,
    Input,
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
    components.forEach(component => {
        Vue.component(component.name, component)
    });
}

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    author: 'lxh',
    version: '1.5',
    install,
    Table,
    Cascader,
    Checkbox,
    Date,
    Input,
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
}