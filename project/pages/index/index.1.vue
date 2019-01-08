<template>
	<view class="uni-tab-bar">
		<swiper :current="currentIndex" class="swiper-box" duration="200" circular @change="changeTab" @animationfinish="animationfinish">
			<swiper-item v-for="(week,key,index1) in weekData" :key="key">

				<view class="topitem">
					<view class="topitem-month">{{week[0].belongToMonth}}月</view>
					<view class="loadingView" v-if="loaded">
						<loading />
					</view>
					<view v-if="!loaded" class="topitemcell" v-for="(weekofdays,index11) in week" :key="weekofdays.key">
						<view class="topitemcell-chil">
							<view class="nav-day">{{weekofdays.day}}</view>
							<span class="nav-weekday">{{weekofdays.dayofweek}}</span>
						</view>
					</view>
				</view>
				<scroll-view class="list" scroll-y>
					<view v-for="(time,index2) in timequantum" :key="index2" class="cell">
						<view class="cell-tq">{{time}}</view>
						<view class="cell-content" v-for="(weekofday,index111) in week" :key="index111+weekofday.key">
							<view class="cell-content-item">
								<uppart :item_data="weekofday" :time="time.substring(0,2)+':30'" :index="index111" :oldTime="time" @wzhclick="wzhclick" />
								<downpart :item_data="weekofday" :time="addHour(time)" :index="index111" :oldTime="time.substring(0,2)+':30'"
								 @wzhclick="wzhclick" />
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>
<script>
	var currentFirstDate;
	var prevIndex = 0; //上一个swiper index
	var infoArr = []
	var moment = require('moment');
	var util = require('../../common/util.js');
	var onfire = require("onfire.js");
	import uppart from '@/components/uppart.vue';
	import downpart from '@/components/downpart.vue';
	import loading from "@/components/loading.vue";
	var db = require('../../common/db.js');
	var db1 = require('../../common/db.1.js');
	var db, dbName = 'demoDB',
		dbVersion = 1,
		personStore = 'schedules';
	export default {
		components: {
			uppart,
			downpart,
			loading
		},
		data() {
			return {
				weekData: {},
				currentIndex: 0,
				timequantum: [], //时间段集合
				flag: '',
				loaded: false
			}
		},
		computed: {

		},
		onNavigationBarButtonTap: function(data) {
			uni.navigateTo({
				url: '/pages/index/students'
			})
		},

		onLoad: function() {
			var that=this;
			onfire.on('setSchedule', function(info) {
				that.updatePage(info)
			})
			// 			uni.setNavigationBarTitle({
			// 				title: "默认导航栏"
			// 			})
			if (new Date().getDay() == 0) {
				//默认周期是以周日为第一天的,所以此处初始时间=6(周日)时减一天!
				let day = new Date();
				day.setTime(day.getTime() - 24 * 60 * 60 * 1000);
				this.weekData = this.getLastNextWeek(day);
			} else {
				this.weekData = this.getLastNextWeek(new Date())
			}
			this.timequantum = this.getTimequantum(6, 22);

			let dbVersion = uni.getStorageSync('dbVersion') == '' ? 1 : uni.getStorageSync('dbVersion');
			db.openIndexedDB(dbName, dbVersion, personStore, () => {
				db.loadAllData(personStore, (data) => {
					debugger
					if (data) {

					}
				})
			})
		},
		watch: {
			'flag': function(newVal) {
				console.log('changed', this.weekData);
				this.loaded = true;
				if (newVal == 'last') {
					let arr = {};
					let indexs = [-2, -1, 0];
					for (let i = 0; i < indexs.length; i++) {
						let result = indexs[i] - 1;
						if (result < 0) {
							result = Math.abs(result); //返回绝对值
							let currentFirstDay = this.weekData['week0'][0]['ftext']
							arr['week' + i] = this.setDate(this.addDate(new Date(currentFirstDay), -(7 * result)));
						}
					}
					this.weekData = arr;
				}
				if (newVal == 'next') {
					let arr = {};
					let indexs = [2, 3, 4];
					for (let i = 0; i < indexs.length; i++) {
						let result = indexs[i] - 1;
						if (result > 0) {
							let currentLastDay = this.weekData['week2'][5]['ftext']
							arr['week' + i] = this.setDate(this.addDate(new Date(currentLastDay), 7 * result));
						}
					}
					this.weekData = arr;
				}
				this.$nextTick(function() {
					console.log('nextTick');
					setTimeout(() => {
						this.loaded = false;
					}, 200)

				})
			},
		},
		methods: {
			updatePage(info) {
				debugger
				var that = this;
				infoArr.push(info);
				let a = {}
				let keyNames = info['name'].join('');
				let keyTimes = info['times'].join('');
				a[keyNames] = info['name'].join('');
				a[keyTimes] = info['times'].join('');
				let arr = Object.assign([], that.weekData['week' + prevIndex], a);
				let value = uni.getStorageSync('activeDom');
				if (value) {
					//加半小时
					let valueTime = that.addHalfHour(value['time']);
					let curdate = arr[value['e']]['schedule'];
					let curIndex = -1;
					for (let i = 0; i < curdate.length; i++) {
						if (curdate[i]['times'].indexOf(valueTime) > -1) {
							curIndex = i;
							break;
						} else {
							curIndex = -1;
						}
					}
					if (curIndex != -1) {
						curdate[curIndex] = info
					} else {
						curdate.push(info)
					}


					let obj = Object.assign({}, that.weekData['week' + prevIndex][value['e']], a);
					//删除多余的属性
					let lastObj = infoArr[infoArr.length - 2];
					delete obj[info['name'].join('')];
					delete obj[info['times'].join('')]
					that.$set(that.weekData['week' + prevIndex], value['e'], obj)
					// 					that.$set(that.weekData['week'+prevIndex][value['e']],info['times'].join(''),info['times'].join(''))
					//that.weekData['weekData'+oldIndex]=arr
					// this.gc[0] ={name:'lisi',age:22} //这样直接修改不能被vue监听到
					//					that.$set(that.weekData,'week'+prevIndex,arr) //这样就能被vue监控到，更新视图 
					//存数据库
					let key = value['aData']['key'];
					db.insert(personStore, {
						key,
						date: key,
						info
					}, (data) => {
						debugger
					})


				}
			},
			wzhclick(data) {
				//获取当前元素所属时间段，传递到创建页面 
				let curdate = this.weekData['week' + prevIndex][data.e];
				let selectedTime = data.time;
				let selectedDate = curdate.ftext;
				let selectInfo = {
					aData: curdate,
					time: data.time,
					e: data.e
				};
				uni.setStorage({
					key: 'activeDom',
					data: selectInfo,
					success: function() {
						uni.navigateTo({
							url: '/pages/index/detail?selectedTime=' + selectedTime + '&selectedDate=' + selectedDate
						})
					}
				});

			},
			addHalfHour(time) {
				let hour = Number(time.substring(0, 2));
				let m = time.substring(3, 5);
				if (m == '30') {
					hour += 1;
					m = '00';
				} else if (m == '00') {
					m = '30';
				}
				return util.addPreForTime(hour) + ':' + m;
			},
			addHour(time) {
				let hour = Number(time.substring(0, 2)) + 1;
				let m = time.substring(3, 5);
				return util.addPreForTime(hour) + ':' + m;
			},
			animationfinish(e) {
				let index = e.target.current;
				if (prevIndex == 0 && index == 2) {
					this.flag = 'last';
				}
				if (prevIndex == 2 && index == 0) {
					this.flag = 'next'
				}
				prevIndex = index;
				console.log('animationfinish' + index);
			},
			changeTab(e) {
				let index = e.target.current;
				console.log(index);
				if (prevIndex == 0 && index == 2) {
					//当前周往前三个周的数据
					//date=当前周的第一天 
					this.flag = '';
					return
					// 						let arr = {};
					// 						let indexs = [-2, -1, 0];
					// 						for (let i = 0; i < indexs.length; i++) {
					// 							let result = indexs[i] - 1;
					// 							if (result < 0) {
					// 								result = Math.abs(result); //返回绝对值
					// 								let currentFirstDay = this.weekData['week0'][0]['ftext']
					// 								arr['week' + i] = this.setDate(this.addDate(new Date(currentFirstDay), -(7 * result)));
					// 							}
					// 						}
					// 						this.weekData = arr;
				}
				if (prevIndex == 2 && index == 0) {
					//当前周往后三个周的数据
					//date=当前周的最后一天
					this.flag = '';
					return
					// 					let arr = {};
					// 					let indexs = [2, 3, 4];
					// 					for (let i = 0; i < indexs.length; i++) {
					// 						let result = indexs[i] - 1;
					// 						if (result > 0) {
					// 							let currentLastDay = this.weekData['week2'][5]['ftext']
					// 							arr['week' + i] = this.setDate(this.addDate(new Date(currentLastDay), 7 * result));
					// 						}
					// 					}
					// 					this.weekData = arr;
				}
				prevIndex = index;
			},
			formatDate(date) {
				let year = date.getFullYear() + '';
				let month = (date.getMonth() + 1) + '';
				let day = date.getDate() + '';
				let week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
				return {
					key: year + month + day,
					text: year + month + day + '  ' + week,
					ftext: `${year}-${month}-${day}`,
					day,
					dayofweek: week,
					belongToMonth: date.getMonth() + 1,
					schedule: []
				}
				
				

			},
		
			addDate(date, n) {
				date.setDate(date.getDate() + n);
				return date;
			},
			setDate(date) {
				let week = date.getDay() - 1;
				date = this.addDate(date, week * -1);
				currentFirstDate = new Date(date);
				let weekArr = [];
				for (let i = 0; i < 7; i++) {
					weekArr.push(this.formatDate(i == 0 ? date : this.addDate(date, 1))); //星期一开始
					//cells[i].innerHTML = formatDate(i==0 ? addDate(date,-1) : addDate(date,1));   //星期天开始
				}
				return weekArr;
			},
			getLastNextWeek(date) {
				let arr = {};
				for (let i = 0; i < 3; i++) {
					let result = i - 1;
					if (result > 0) {
						if (date.getDay() == 0) {
							date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
							arr['week' + i] = this.setDate(this.addDate(date, 7 * result));
						} else {
							debugger
							arr['week' + i] = this.setDate(this.addDate(date, 7 * result));
						}
					} else if (result < 0) {
						result = Math.abs(result); //返回绝对值
						arr['week' + i] = this.setDate(this.addDate(date, -(7 * result)));
					} else if (result == 0) {
						arr['week' + i] = this.setDate(this.addDate(date, 0));
						this.currentIndex = i;
						prevIndex = i;
					}
				}
				debugger
				return arr;
			},
			/**
			 * 获取时间段集合 00:00....
			 */
			getTimequantum(start, end) {
				let arr = [];
				for (let i = start; i < end + 1; i++) {
					arr.push(util.addPreForTime(i) + ':00')
				}
				return arr
			}

		}
	}
</script>

<style>
	[v-cloak] {
		display: none
	}

	.topitem {
		display: flex;
		justify-content: center;
		width: 100%;
		border-bottom: #BEBEBE;
		border-bottom-width: 1upx;
		border-bottom-style: solid;
	}

	.topitemcell {
		flex: 1;
		line-height: 1;
		padding-bottom: 6upx;
	}

	.loadingView {
		flex: 1;
		padding: 10upx;
	}

	.topitemcell-chil {
		text-align: center;
		line-height: 1;
	}

	.item1 {
		height: 200px;
		width: 100%;
		background: #00B26A;
	}

	.nav-day {
		padding-top: 3upx;
		font-size: 13px;
	}

	.nav-weekday {
		font-size: 13px;
		/* line-height: 1; */
	}

	.cell {
		display: flex;
		/*设置为flex布局*/
		justify-content: space-around;
		/*		height: 96upx;
 		border-bottom: #FFFFFF;
		border-bottom-width: 2upx;
		border-bottom-style: solid; */
	}

	.cell-tq,
	.topitem-month {
		width: 70upx;
		font-size: 14px;
		display: flex;
		justify-content: center;

	}

	.topitem-month {
		color: #7A7E83;
		align-items: center;
	}

	.cell-content {
		background-color: #EEEEEE;
		flex: 1;

	}

	.cell-content-item {
		background-color: #f6f5fa;
		/* height: 98upx; */
		border-left: 2upx solid #FFFFFF;
		border-right: 2upx solid #FFFFFF;
	}

	.item-am {
		border-top: 4upx solid #FFFFFF;
		background-color: #f6f5fa;
		height: 49upx;
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
</style>
