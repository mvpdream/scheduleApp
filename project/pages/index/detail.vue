<template>
	<view class="root">
		<!-- <uni-nav-bar color="#ffffff" background-color="#409eff" fixed="true" left-icon="back" @click-left="back" title="添加排期"></uni-nav-bar> -->
		<view class="uni-padding-wrap animated slideInRight" style="animation-duration: 0.5s">

			<view class="uni-list">
				<view class="uni-list-cell">
					<view class="uni-title uni-common-pl"><span class="til">日期：</span>{{selectedDate}}</view>
				</view>
				<view class="uni-list-cell" @tap="goStudent()">
					<view class="uni-title uni-common-pl"><span class="til">学员：</span>{{studentName}}</view>
				</view>
				<view class="uni-list-cell">
					<view class="uni-list-cell-db rightBorder" @tap="showMulLinkageTwoPicker(0)">
						<view class="uni-flex uni-row timecell">
							<view class="uni-list-cell-left">
								开始时间
							</view>
							<view class="uni-input">{{selectedTime}}</view>
						</view>
					</view>

					<view class="uni-list-cell-db" @tap="showMulLinkageTwoPicker(1)">
						<view class="uni-flex uni-row timecell">
							<view class="uni-list-cell-left">
								结束时间
							</view>
							<view class="uni-input">{{selectedEndTime}}</view>
						</view>
					</view>
				</view>
			</view>
			<!-- <button type="default" @click="showMulLinkageTwoPicker">二级联动</button> -->
			<button type="primary" v-if="status!=2" class="confirmBtn" :disabled="disabled" :loading="loading" @tap="goback()">确定</button>
			
			
		</view>
		<view class="bottomView" v-if="status!=0">
			<button type="default" class="leftBtn" :disabled="false" :loading="false" @tap="remove()">删除课程</button>
			<button type="primary" v-if="status!=2" class="rightBtn" :disabled="false" :loading="false" @tap="finish()">完成课程</button>
			<button type="default" v-if="status==2" class="rightBtn1" :disabled="false" :loading="false">课程已完成</button>
		</view>
		<mpvue-picker :themeColor="themeColor" ref="mpvuePicker" :mode="mode" :deepLength="deepLength" :pickerValueDefault="pickerValueDefault"
		 @onConfirm="onConfirm" @onCancel="onCancel" :pickerValueArray="pickerValueArray"></mpvue-picker>
		<mpvue-picker :themeColor="themeColor" ref="mpvuePicker1" :mode="mode" :deepLength="deepLength" :pickerValueDefault="pickerValueDefault1"
		 @onConfirm="onConfirm1" @onCancel="onCancel1" :pickerValueArray="pickerValueArray"></mpvue-picker>
	</view>
</template>
<script>
	var onfire = require("onfire.js");
	var util = require('../../common/util.js');
	import mpvuePicker from '../../components/mpvue-picker/mpvuePicker.vue';
	import uniNavBar from '@/components/uni-nav-bar.vue'
	import uniIcon from '@/components/uni-icon.vue'
	var db = require('../../common/db.js');
	var Config=require('../../common/config.js')
	export default {
		components: {
			mpvuePicker,
			uniNavBar,
			uniIcon
		},
		data() {
			return {
				time: '12:00',
				mulLinkageTwoPicker: [],
				themeColor: '#007AFF',
				pickerText: '',
				mode: '',
				deepLength: 1,
				pickerValueDefault: [],
				pickerValueDefault1: [],
				timeData: [],
				selectedDate: '',
				selectedTime: '',
				selectedEndTime: '',
				pickerValueArray: [],
				t: [],
				oldtimes:[],
				studentName: '请选择学员',
				loading: false,
				disabled: false,
				status:0 //1删除状态 2完成状态 3可编辑状态
			}
		},
		onLoad: async function(e){
			if (e.selectedTime) {
				this.selectedDate = e.selectedDate.split('-')[0] + '年' + e.selectedDate.split('-')[1] + '月' + e.selectedDate.split(
					'-')[2] + '日';
					let value = uni.getStorageSync('activeDom');
					let schedules=value['aData']['schedule'];
					if(schedules.length>0){
						for (let i = 0; i < schedules.length; i++) {
							let times=schedules[i]['oldTimes'];
							if(times.indexOf(e.selectedTime)>-1&&schedules[i]['name'].indexOf(e.name)>-1){
								this.selectedTime = times[0];
								this.selectedEndTime = times[times.length-1];
								this.studentName=schedules[i]['name'][0];
								if(schedules[i]['status']==0){
									this.status=3;
								}else{
									this.status=schedules[i]['status'];
								}
								break;
							}else{
								this.selectedTime = e.selectedTime;
								let hour = Number(e.selectedTime.substring(0, 2)) + 1;
								let m = e.selectedTime.substring(3, 5);
								this.selectedEndTime = util.addPreForTime(hour) + ':' + m;
								this.status=0
							}
						}
					}else{
						this.selectedTime = e.selectedTime;
						let hour = Number(e.selectedTime.substring(0, 2)) + 1;
						let m = e.selectedTime.substring(3, 5);
						this.selectedEndTime = util.addPreForTime(hour) + ':' + m;
						this.status=0
					}
				
			}
			this.timeData = this.setTimeData(6, 23);
			var that = this;
			onfire.on('setStudent', function(info) {
				// 				info:{
				// 					id:1
				// 					name: '1333'
				// 					phone: '1231232'
				// 				} 
				if (info) {
					that.studentName = info.name
				}


			})
		},
		methods: {
			setTimeData(start, end) {
				let arr = []
				for (let i = start; i < end; i++) {
					let obj = {
						value: util.addPreForTime(i),
						label: util.addPreForTime(i),
						children: [{
							value: "00",
							label: "00"
						}, {
							value: "30",
							label: "30"
						}]

					};
					arr.push(obj)
				}
				return arr;
			},
			back() {
				// document.getElementsByClassName('root')[0].setAttribute('class','root animated slideOutRight')
				// setTimeout(()=>{
					uni.navigateBack();
				// },500)
				
			},
			goback() {
				if (this.studentName.length == 0 || this.studentName == '请选择学员') {
					uni.showToast({
						title: '请先选择学员',
						icon: 'none',
						duration: 2000
					});
				} else {
					this.loading = true;
					this.disabled = true;
					setTimeout(() => {
						//根据开始结束时间 循环包含的时间段 集合
						this.t = this.getTimeQuantums(this.selectedTime);
						onfire.fire('setSchedule', {
							times: this.t,
							oldTimes:this.oldtimes,
							status: 0,
							name: [this.studentName]
						});
						this.loading = false;
						uni.navigateBack();
					}, 1000)

				}
			},
			goStudent() {
				if(this.status==2) return
				uni.navigateTo({
					url: '/pages/index/students'
				})
			},
			//获取两个时间内的时间间隔(半小时为单位)
			getTimeQuantums(time) {
				let hour = Number(time.substring(0, 2));
				// let m = time.substring(3, 5);
				if (time > this.selectedEndTime) {
					//this.oldtimes=this.t;
					//超出范围
					if (this.t.length > 0) {
						this.t = this.t.splice(1);
					}
					console.log(this.t)
					return this.t;
				} else if (time.substring(3, 5) == '30') {
					this.t.push(time);
					this.oldtimes.push(time)
					//此处注意要加return,否则外界接收到不到值
					return this.getTimeQuantums(util.addPreForTime(hour + 1) + ':00')
				} else {
					this.t.push(time);
					this.oldtimes.push(time)
					return this.getTimeQuantums(util.addPreForTime(hour) + ':30')
				}
			},
			bindTimeChange: function(e) {
				this.time = e.target.value
			},
			// 二级联动选择 type=0 开始时间 type=1 结束时间
			showMulLinkageTwoPicker(type) {
				if(this.status==2) return
				this.pickerValueArray = this.timeData
				this.mode = 'multiLinkageSelector'
				this.deepLength = 2
				if (type == 0) {
					let hourIndex = 0;
					let mIndex = 0;
					for (let i = 0; i < this.timeData.length; i++) {
						if (this.timeData[i].value == this.selectedTime.substring(0, 2)) {
							hourIndex = i;
							break;
						}
					}
					for (let i = 0; i < this.timeData[hourIndex]['children'].length; i++) {
						if (this.timeData[hourIndex]['children'][i] == this.selectedTime.substring(3, 5)) {
							mIndex = i;
							break;
						}
					}
					console.log('hourIndex:' + hourIndex);
					console.log('mIndex:' + mIndex);
					this.pickerValueDefault = [hourIndex, mIndex]
					this.$refs.mpvuePicker.show()
				} else {
					let hourIndex = 0;
					let mIndex = 0;
					for (let i = 0; i < this.timeData.length; i++) {
						if (this.timeData[i].value == this.selectedEndTime.substring(0, 2)) {
							hourIndex = i;
							break;
						}
					}
					for (let i = 0; i < this.timeData[hourIndex]['children'].length; i++) {
						if (this.timeData[hourIndex]['children'][i] == this.selectedEndTime.substring(3, 5)) {
							mIndex = i;
							break;
						}
					}
					console.log('hourIndex1:' + hourIndex);
					console.log('mIndex1:' + mIndex);
					this.pickerValueDefault1 = [hourIndex, mIndex]
					this.$refs.mpvuePicker1.show()
				}
			},
			onConfirm(e) {
				console.log(e);
				this.selectedTime = e.value.join(':')
			},
			onCancel(e) {
				console.log(e)
			},
			onConfirm1(e) {
				console.log(e);
				let endTime = e.value.join(':');
				if (endTime == this.selectedTime || endTime < this.selectedTime) {
					alert('结束时间不能小于等于开始时间')
					return
				} else {
					this.selectedEndTime = e.value.join(':')
				}

			},
			onCancel1(e) {
				console.log(e)
			},
			remove(){
				uni.showModal({
					title: '提示',
					content: '确认删除该课程？',
					success: (res) => {
						if (res.confirm) {
							this.t = this.getTimeQuantums(this.selectedTime);
							onfire.fire('setSchedule', {
								times: this.t,
								oldTimes:this.oldtimes,
								status: 1,
								name: [this.studentName]
							});
							uni.navigateBack();
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			finish(){
				uni.showModal({
					title: '提示',
					content: '确认完成该课程？',
					success: (res) => {
						if (res.confirm) {
							this.t = this.getTimeQuantums(this.selectedTime);
							onfire.fire('setSchedule', {
								times: this.t,
								oldTimes:this.oldtimes,
								status: 2,
								name: [this.studentName]
							});
							uni.navigateBack();
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			}
		}
	}
</script>
<style>
	.timecell {
		align-items: center;
	}

	.rightBorder {
		border-right: 0.5px solid #c8c7cc;
	}

	.uni-padding-wrap {
		padding-top: 5px;
		min-height: 100%;
	}

	.uni-list-cell:after {
		left: 0;
		height: 1px;
	}

	.uni-list:before {
		height: 0;
	}

	.uni-list {
		margin: 15px 0px 25px 0;
	}

	.uni-title {
		font-weight: normal;
	}

	.confirmBtn {
		background-color: #409eff;
	}
	
	.bottomView{
		position: absolute;
		bottom: 0;
		display: flex;
		width: 100%;
		flex-direction: row;
		border-top: 1px solid #d4d4d4;
		align-items: flex-end;
	}
	
	.rightBtn ,.leftBtn ,.rightBtn1{
		flex:1;
		border: none;
		border-radius: 0;
		font-size: 14px;
		height: 40px;
		justify-content: center;
		align-items: center;
		line-height: 40px;
	}
	.rightBtn1{
		color: #FFFFFF;
		background-color: #d4d4d4;
	}
	.leftBtn:after{
		border-radius: 0;
		border: none;
	}
	.rightBtn1:after{
		border-radius: 0;
		border: none;
	}
	.leftBtn{
		color: #7C8489
	}
	.uni-list-cell-left,.til{
		font-size: 14px;
		font-weight: 600;
	}
</style>