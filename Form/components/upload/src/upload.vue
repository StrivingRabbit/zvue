<template>
  <div class="z-form_upload" v-loading.lock="loading">
    <el-upload
      :class="{'picture-list':listType=='picture-img','el-upload_disabled':disabled}"
      :action="action"
      :accept="elAccept"
      :auto-upload="autoUpload"
      :list-type="listType"
      :on-remove="handleRemove"
      :on-preview="handlePictureCardPreview"
      :before-remove="beforeRemove"
      :multiple="multiple"
      :limit="limit"
      :http-request="autoUpload ? httpRequest : undefined"
      :disabled="disabled"
      :file-list="fileList"
      :drag="drag"
      :readonly="readonly"
      :show-file-list="isPictureImg?false:showFileList"
      :on-change="handleChange"
      :on-exceed="handleExceed"
      @click.native="handleClick"
    >
      <template v-if="listType=='picture-card'">
        <i class="el-icon-plus"></i>
      </template>
      <template v-else-if="listType=='picture-img'">
        <img v-if="imgUrl" :src="imgUrl" class="avatar" />
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </template>
      <template v-else-if="drag">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
      </template>
      <template v-else>
        <el-button size="small" type="primary">点击上传</el-button>
      </template>
      <div slot="tip" class="el-upload__tip">{{tip}}</div>
    </el-upload>
    <el-dialog append-to-body :modal-append-to-body="false" :visible.sync="dialogVisible">
      <div class="avue-dialog">
        <img v-if="dialogImgType" width="100%" :src="dialogImageUrl" alt />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import props from "../../../common/props";
import events from "../../../common/events";
import { validatenull } from "../../../utils/validate";
let packages = {};
export default {
  name: "zUpload",
  mixins: [props(), events()],
  data() {
    return {
      loading: false,
      dialogImageUrl: "",
      dialogImgType: true,
      dialogVisible: false,
      text: [],
      file: {}
    };
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      }
    },
    value: {},
    onRemove: Function,
    showFileList: {
      type: Boolean,
      default: true
    },
    oss: {
      type: String
    },
    limit: {
      type: Number,
      default: 10
    },
    headers: {
      type: Object,
      default: () => {
        return {};
      }
    },
    accept: {
      type: [String, Array],
      default: ""
    },
    canvasOption: {
      type: Object,
      default: () => ({})
    },
    filesize: {
      type: String
    },
    drag: {
      type: Boolean,
      default: false
    },
    loadText: {
      type: String,
      default: "文件上传中,请稍等"
    },
    action: {
      type: String,
      default: ""
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    uploadBefore: Function,
    uploadAfter: Function
  },
  computed: {
    fileName() {
      return this.propsHttp.fileName || "file";
    },
    isPictureImg() {
      return this.listType === "picture-img";
    },
    //单个头像图片
    imgUrl() {
      if (!this.validatenull(this.text)) {
        return this.text[0];
      }
    },
    fileList() {
      let list = [];
      const flag = this.isArray || this.isString;
      this.text.forEach((ele, index) => {
        let name;
        //处理单个url链接取最后为label
        if (flag) {
          let i = ele.lastIndexOf("/");
          name = ele.substring(i + 1);
        }
        list.push({
          uid: index + "",
          status: "done",
          name: flag ? name : ele[this.labelKey],
          url: flag ? ele : ele[this.valueKey]
        });
      });
      return list;
    },
    elAccept() {
      let accept = "";
      let acceptList = Array.isArray(this.accept) ? this.accept : [this.accept];
      acceptList = this.validatenull(acceptList[0]) ? undefined : acceptList;
      if (!this.validatenull(acceptList)) {
        acceptList.forEach(item => {
          accept += `.${item},`;
        });
        return accept.substring(0, accept.length);
      }
      return "*";
    }
  },
  created() {},
  watch: {},
  mounted() {},
  methods: {
    validatenull,
    handleClick() {
      if (typeof this.click === "function")
        this.click({ value: this.text, column: this.column });
    },
    handleChange(file, fileList) {
      if (this.autoUpload) {
        fileList.splice(fileList.length - 1, 1);
      } else {
        this.show(file);
      }
      if (typeof this.change === "function")
        this.change({ value: this.text, column: this.column });
    },
    handleSuccess(file) {
      if (this.isArray || this.isString) {
        this.text.push(file[this.urlKey]);
      } else if (this.isPictureImg) {
        this.text.unshift(file[this.urlKey]);
      } else {
        let obj = {};
        obj[this.labelKey] = file[this.nameKey];
        obj[this.valueKey] = file[this.urlKey];
        this.text.push(obj);
      }
      this.$message.success("上传成功");
      this.setVal();
    },
    handleRemove(file, fileList) {
      this.onRemove && this.onRemove(file, fileList);
      this.delete(file);
      this.$message.success("删除成功");
      this.setVal();
    },
    handleError(msg) {
      console.error(new Error(msg));
      this.$message.error(msg || "上传失败");
    },
    delete(file) {
      if (this.isArray || this.isString) {
        this.text.forEach((ele, index) => {
          if (ele === file.url) this.text.splice(index, 1);
        });
      } else {
        this.text.forEach((ele, index) => {
          if (ele[this.valueKey] === file.url) this.text.splice(index, 1);
        });
      }
    },
    show(data) {
      this.loading = false;
      this.handleSuccess(data);
    },
    hide(msg) {
      this.loading = false;
      this.handleError(msg);
    },
    httpRequest(config) {
      this.loading = true;
      let file = config.file;
      this.file = config.file;
      if (!this.validateFile(file)) {
        return;
      }
      // 设置额外头部
      const headers = Object.assign(this.headers, {
        "Content-Type": "multipart/form-data"
      });
      // 属性
      let param = new FormData();
      //附加属性
      for (let o in this.data) {
        param.append(o, this.data[o]);
      }
      const done = () => {
        let url = this.action;
        param.append(this.fileName, file, file.name);
        const callack = () => {
          this.$axios
            .post(url, param, { headers })
            .then(res => {
              // 兼容项目，axios经过处理，返回的就是数据
              let list = res;
              /* let list = {};
              list = _.get(res, this.resKey, {}); */
              if (typeof this.uploadAfter === "function") {
                this.uploadAfter(
                  list,
                  () => {
                    this.show(list);
                  },
                  () => {
                    this.loading = false;
                  },
                  this.column
                );
              } else this.show(list);
            })
            .catch(error => {
              if (typeof this.uploadAfter === "function") {
                this.uploadAfter(
                  error,
                  this.hide,
                  () => {
                    this.loading = false;
                  },
                  this.column
                );
              } else this.hide(error);
            });
        };
        if (typeof this.uploadBefore === "function") {
          this.uploadBefore(
            this.file,
            callack,
            () => {
              this.loading = false;
            },
            this.column
          );
        } else callack();
      };
      //是否开启水印
      if (!this.validatenull(this.canvasOption)) {
        detailImg(file, this.canvasOption).then(res => {
          file = res;
          done();
        });
      } else {
        done();
      }
    },
    validateFile(file) {
      // 验证文件类型和大小
      // const accept = file.type.split("/")[1];
      const nameSplit = file.name.split(".");
      const accept = nameSplit[nameSplit.length - 1];
      const filesize = file.size;
      let acceptList = Array.isArray(this.accept) ? this.accept : [this.accept];
      acceptList = this.validatenull(acceptList[0]) ? undefined : acceptList;

      if (!this.validatenull(acceptList) && !acceptList.includes(accept)) {
        this.hide("文件类型不符合");
        return false;
      }
      if (!this.validatenull(filesize) && this.isOversize(filesize)) {
        this.hide(`文件太大，只能上传${this.filesize}大小文件`);
        return false;
      }

      return true;
    },
    isOversize(filesize) {
      if (!this.filesize) {
        return false;
      }
      let unit = this.filesize.toUpperCase();
      let fileSizeLimit = parseFloat(this.filesize);

      if (unit.indexOf("KB") != -1) {
        return filesize / Math.pow(1024, 1) > fileSizeLimit;
      } else if (unit.indexOf("MB") != -1) {
        return filesize / Math.pow(1024, 2) > fileSizeLimit;
      } else if (unit.indexOf("GB") != -1) {
        return filesize / Math.pow(1024, 3) > fileSizeLimit;
      }
    },
    setVal() {
      let result = "";

      if (this.isString) {
        result = this.text.join(",");
      } else if (this.isPictureImg) {
        result = this.text[0];
      } else {
        result = this.text;
      }
      this.$emit("input", result);
      this.$emit("change", result);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 ${this.limit} 个文件，本次选择了 ${
          files.length
        } 个文件，共上传了 ${files.length + fileList.length} 个文件`
      );
    },
    handlePictureCardPreview(file) {
      // if (this.disabled) return;
      //判断是否为图片
      this.dialogImageUrl = file.url;
      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)/.test(file.url)) {
        this.dialogImgType = false;
        window.open(this.dialogImageUrl);
        return;
      } else {
        this.dialogImgType = true;
        this.dialogVisible = true;
      }
    },
    beforeRemove(file) {
      return this.$confirm(`是否确定移除该选项？`);
    }
  }
};
</script>