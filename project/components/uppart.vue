<template>
	<view class="item-am" :class="[setClass,setBorder]" @tap="goDetail">{{studentName}}
		<uni-icon v-if="setFinish=='finished'" type="checkmarkempty" size="25" class="item-finish"></uni-icon>
	</view>
</template>

<script>
	import uniIcon from "@/components/uni-icon.vue"
	export default {
		components: {
			uniIcon
		},
		data() {
			return {
				studentName: '',
				nameValue: ''
			}
		},
		props: {
			item_data: {
				type: Object
			},
			time: {
				type: String,
				default: ''
			},
			index: {
				type: Number,
				default: 0
			},
			oldTime: {
				type: String,
				default: ''
			},
			date: {
				type: String
			}

		},
		computed: {
			setClass() {
				if(this.item_data){
					let curdate = this.item_data['schedule'];
					this.studentName = '';
					for (let i = 0; i < curdate.length; i++) {
						if (curdate[i]['times'].indexOf(this.time) > -1) {
							if (curdate[i]['times'].indexOf(this.time) == 0) {
								this.studentName = curdate[i]['name'][0];
							} else {
								this.studentName = ''
							}
							this.nameValue = curdate[i]['name'][0];
							if (curdate[i]['status'] == 0) {
								return 'amselected';
							}
							if (curdate[i]['status'] == 2) {
								return 'amselectedFinish';
							}
							break;
						} else {
							this.studentName = ''
						}
					}
				}
			},
			setFinish() {
				if(this.item_data){
					let curdate = this.item_data['schedule'];
					for (let i = 0; i < curdate.length; i++) {
						if (curdate[i]['times'].indexOf(this.time) > -1) {
							if (curdate[i]['status'] == 2 && curdate[i]['times'].indexOf(this.time) == curdate[i]['times'].length - 1) {
								return 'finished'
							} else {
								return ''
							}
							break;
						}
					}
				}
			},
			setBorder() {
				if(this.item_data){
					//当前日程时间段等于2且开头是xx:00,或者时间段长度大于2
					let curdate = this.item_data['schedule'];
					for (let i = 0; i < curdate.length; i++) {
						if (curdate[i]['times'].indexOf(this.time) > -1) {
							// curdate[i]['times'][0].substring(3, 5) == '00'
							if ((curdate[i]['times'].length == 2 && curdate[i]['times'][0].substring(3, 5) == '00') || (curdate[i]['times'].length >
								2 && curdate[i]['times'].indexOf(this.time) > 0)) {
								if (curdate[i]['status'] == 0) {
									return 'selectBorder';
								}
								if (curdate[i]['status'] == 2) {
									return 'selectBorderFinish';
								}
							}
							break;
						}
					}
				}
			}
		},
		methods: {
			goDetail() {
				this.$emit('wzhclick', {
					e: this.index,
					time: this.oldTime,
					name: this.nameValue
				});
			}
		}
	}
</script>

<style>
	.item-am {
		border-top: 4upx solid #FFFFFF;
		background-color: #f6f5fa;
		height: 49upx;
		color: #6f9dbc;
		font-size: 27upx;
	}

	.amselected {
		background-color: #d9efdb;
	}

	.selectBorder {
		border-top: 4upx solid #d9efdb;
	}

	.item-pm {
		background-color: #f6f5fa;
		height: 49upx;
	}

	.pmselected {
		background-color: #d9efdb;
	}

	.item-finish {
		padding-left: 20px;
	}
</style>
