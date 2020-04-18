import { validatenull } from './validate';
import { getPasswordChar, findByValue } from './util';
import { dateTypeList } from './dataformat';
// import dayjs from 'dayjs';
import moment from 'moment';

export const detail = (row = {}, column = {}, option = {}, dic = []) => {
  let result = row[column.prop || column.value];
  let type = column.type;
  if (validatenull(type)) return result;
  if (validatenull(result)) {
    result = '';
    return result;
  };
  // 自定义格式化
  if (column.formatter && typeof column.formatter === 'function') {
    result = column.formatter(row, row[column.prop], column.label, column);
    return result;
  }

  if (!validatenull(result)) {
    // 日期处理  && column.format
    if (dateTypeList.concat('time', 'timerange').includes(type)) {
      const format = (column.format || column.valueFormat || 'YYYY-MM-DD HH:mm:ss').replace('dd', 'DD').replace('yyyy', 'YYYY');
      // 处理复杂时间值
      if (Array.isArray(result)) {
        let len = result.length;
        let str = '';

        result.map((item, index) => {
          str += moment(item).format(format);
          if (index !== len - 1) {
            str += (len === 2 ? ' 至 ' : ',');
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
    result = findByValue(
      dic,
      result,
      column.props || option.props,
      ['cascader', 'tree'].includes(column.type),
      column.group,
      column.dataType
    );
    return result;
  }

  return result;
};
