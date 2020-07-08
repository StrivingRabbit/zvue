import { validatenull } from './validate';
import { getPasswordChar, findByValue, getValueByPath } from './util';
import { dateTypeList } from './dataformat';
// import dayjs from 'dayjs';
import moment from 'moment';

export const detail = (row = {}, column = {}, option = {}, dic = []) => {
  let result = getValueByPath(row, column.prop || column.value);
  let type = column.type;
  if (validatenull(type)) return result;
  if (validatenull(result)) {
    result = '';
    return result;
  };

  const formatterFuncs = ['formatter']
  for (let index = 0; index < formatterFuncs.length; index++) {
    const formatterFunc = formatterFuncs[index];
    // 自定义格式化
    if (column[formatterFunc] && typeof column[formatterFunc] === 'function') {
      result = column[formatterFunc](row, result, column.label, column);
      return result;
    }
  }

  // slider特殊处理
  if (['slider'].includes(type)) {
    result = typeof column.formatTooltip === 'function' ? column.formatTooltip(result) : result;
    return result;
  }

  // 日期处理  && column.format
  if (!validatenull(result)) {
    if (dateTypeList.concat('time', 'timerange').includes(type)) {
      const splitStr = type === 'dates' ? ' , ' : ' 至 ';
      // 日期，月，年，月范围，格式化特殊处理
      let defaultFormat = '';
      switch (type) {
        case 'month':
          defaultFormat = 'YYYY-MM';
          break;
        case 'daterange':
        case 'monthrange':
        case 'date':
          defaultFormat = 'YYYY-MM-DD';
          break;
        case 'year':
          defaultFormat = 'YYYY'
          break;
        default:
          defaultFormat = 'YYYY-MM-DD HH:mm:ss';
          break;
      }

      const format = (column.format || column.valueFormat || defaultFormat).replace('dd', 'DD').replace('yyyy', 'YYYY');
      // 处理复杂时间值
      if (Array.isArray(result)) {
        let len = result.length;
        let str = '';

        result.map((item, index) => {
          str += moment(item).format(format);
          if (index !== len - 1) {
            str += (len === 2 ? splitStr : ' , ');
          }
        })

        result = str;
      } else {
        result = moment(result).format(format);
      }
      return result;
    }
  }

  // 密码处理
  if (['password'].includes(type)) {
    result = getPasswordChar(result, '*');
    return result;
  }

  // 字典处理
  if (!validatenull(dic)) {
    const isCascader = ['cascader'].includes(column.type);
    if (isCascader) {
      result = typeof result === 'string' ? result.split(',') : result
    }
    result = findByValue(
      dic,
      result,
      column.props || option.props,
      ['tree'].includes(column.type),
      isCascader,
      column.group,
      column.dataType
    );
    return result;
  }

  return result;
};
