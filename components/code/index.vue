<template>
	<div class="zvue-code-wrapper">
		<!-- <el-scrollbar :style="styleName"> -->
		<!-- <pre> -->
      <code :class="syntax" ref="container" v-html="block"></code>
    <!-- </pre> -->
		<!-- </el-scrollbar> -->
	</div>
</template>

<script>
	import { setPx } from '../../utils/util';

	export default {
		name: 'zCode',
		props: {
			height: {
				type: Number,
				default: 0,
			},
			syntax: {
				type: String,
				default: 'html',
			},
		},
		data() {
			return {
				block: '',
			};
		},
		created() {
			this.block = this.$hljs.highlightAuto(this.$slots.default[0].text).value;
		},
		computed: {
			styleName() {
				if (this.height !== 0) {
					return {
						height: setPx(this.height),
					};
				}
				return {};
			},
		},
		mounted() {
			// this.$refs['container'].indexHTML = hljs.highlightBlock();
		},
	};
</script>
