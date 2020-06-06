<template>
  <div class="zvue-form-upload" v-loading.lock="loading" :style="[uploadStyle]">
    <el-upload
      :class="{'picture-list':listType=='picture-img','el-upload_disabled':allDisabled}"
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
      :disabled="allDisabled"
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
          <em>{{buttonText}}</em>
        </div>
      </template>
      <template v-else>
        <el-button size="small" type="primary">{{buttonText}}</el-button>
      </template>
      <div v-if="!onlyButton" slot="tip" class="el-upload__tip">{{tip}}</div>
    </el-upload>
    <el-dialog append-to-body :modal-append-to-body="false" :visible.sync="dialogVisible">
      <!-- <div class="avue-dialog">
        <img v-if="dialogImgType" width="100%" :src="dialogImageUrl" alt />
      </div>-->
      <el-carousel
        :autoplay="false"
        trigger="click"
        indicator-position="outside"
        :initial-index="initialIndex"
      >
        <el-carousel-item v-for="item in fileList" :key="item.url">
          <img v-if="dialogImgType" width="100%" :src="item.url" alt="item.url" />
        </el-carousel-item>
      </el-carousel>
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
      file: {},
      initialIndex: 0,
      insideFileList: [] // 当不自动上传时，file保存进这个对象
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
      type: [String, Number]
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
    onlyButton: {
      type: Boolean,
      default: false
    },
    buttonText: {
      type: String,
      default: "点击上传"
    },
    uploadBefore: Function,
    uploadAfter: Function,
    uploadSuccess: Function,
    uploadError: Function
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
    },
    uploadStyle() {
      if (this.onlyButton) {
        return {
          display: "inline-block"
        };
      }
      return {};
    },
    allDisabled() {
      return this.textMode ? true : this.disabled
    },
    resultList() {
      return this.autoUpload ? this.text : this.insideFileList
    }
  },
  created() { },
  watch: {},
  mounted() { },
  methods: {
    validatenull,
    handleClick() {
      if (typeof this.click === "function")
        this.click({ value: this.resultList, column: this.column });
    },
    handleChange(file, fileList) {
      if (this.autoUpload) {
        fileList.splice(fileList.length - 1, 1);
      } else {
        this.show(file);
      }
      if (typeof this.change === "function")
        this.change({ value: this.resultList, column: this.column, file, fileList });
    },
    handleSuccess(file) {
      // 如果不自动上传，则将计算url
      if (!this.autoUpload) {
        file[this.urlKey] = URL.createObjectURL(file.raw);
      }

      if (this.isArray || this.isString) {
        this.text.push(file[this.urlKey]);
        this.insideFileList.push(file.raw)
      } else if (this.isPictureImg) {
        this.text.unshift(file[this.urlKey]);
        this.insideFileList.unshift(file.raw)
      } else {
        let obj = {};
        obj[this.labelKey] = file[this.nameKey];
        obj[this.valueKey] = file[this.urlKey];
        this.text.push(obj);
        this.insideFileList.push(file.raw)
      }
      this.$message.success("上传成功");
      this.setVal();
      
      if (typeof this.uploadSuccess === 'function') {
        this.uploadSuccess(file, this.column);
      }
    },
    handleRemove(file, fileList) {
      this.onRemove && this.onRemove(file, fileList);
      this.delete(file);
      this.$message.success("删除成功");
      this.setVal();
    },
    handleError(msg) {
      console.error(new Error(msg));
      this.$message.error(typeof msg === "string" ? msg : "上传失败");
      if (typeof this.uploadError === 'function') {
        this.uploadError(error, this.column);
      }
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
      if (typeof data === "object" && data != null) {
        this.handleSuccess(data);
      } else {
        this.$message.success("上传成功");
      }
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
      let vmFileSize = this.filesize;
      if (typeof vmFileSize === "number") {
        vmFileSize = vmFileSize.toString() + "kb";
      }
      let unit = vmFileSize.toUpperCase();
      let fileSizeLimit = parseFloat(vmFileSize);

      if (unit.indexOf("KB") != -1) {
        return filesize / Math.pow(1024, 1) > fileSizeLimit;
      } else if (unit.indexOf("MB") != -1) {
        return filesize / Math.pow(1024, 2) > fileSizeLimit;
      } else if (unit.indexOf("GB") != -1) {
        return filesize / Math.pow(1024, 3) > fileSizeLimit;
      }
    },
    setVal() {
      let res = '';
      let result = this.resultList;

      if (this.isString) {
        res = result.join(",");
      } else if (this.isPictureImg) {
        res = result[0];
      } else {
        res = result;
      }

      this.$emit("input", res);
      this.$emit("change", res);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 ${this.limit} 个文件，本次选择了 ${
        files.length
        } 个文件，共上传了 ${fileList.length} 个文件`
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
        this.initialIndex = this.fileList.map(item => item.url).indexOf(file.url);
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