export default function () {
    return {
        methods: {
            handleFocus(e) {
                typeof this.focus === 'function' && this.focus({
                    value: this.text,
                    column: this.column,
                    _self: this
                })
                this.$emit('focus', e)
            },
            handleBlur(e) {
                typeof this.blur === 'function' && this.blur({
                    value: this.text,
                    column: this.column,
                    _self: this
                });
                this.$emit('blur', e)
            },
            getLabelText(item) {
                if (this.validatenull(item)) return ''
                if (typeof this.typeformat === 'function') {
                    return this.typeformat(item, this.labelKey, this.valueKey);
                }
                return item[this.labelKey]
            },
            handleClick() {
                const result = this.isString && this.multiple ? this.text.join(',') : this.text;
                if (typeof this.click === 'function') {
                    this.click({ value: result, column: this.column, _self: this });
                }
            },
            handleChange(value, selectValue) {
                let result = value;
                this.text = result;

                if (this.isString || this.isNumber) {
                    if (this.multiple || ['checkbox', 'cascader', 'dynamic'].includes(this.type)) {
                        result = value.join(',')
                    } else if (this.isNumber) {
                        result = parseFloat(result);
                        if (isNaN(result)) {
                            this.text = undefined;
                            result = undefined;
                        }
                    }
                }

                if (this.listType === "picture-img") {
                    result = value.join(',')
                }

                // change方法触发
                if (typeof this.change === 'function') {
                    this.change({ value: result, column: this.column, _self: this, selectValue });
                }

                // 数据流触发
                this.$emit('input', result);
                this.$emit('change', result);
            }
        }
    };
}
