<template>
	<view class="uni-tab-bar">

		<swiper :current="currentIndex" class="swiper-box" circular duration="200"  @change="changeTab" v-show="isShow">
			<swiper-item v-for="(week,index1) in weeks" :key="index1">

				<view class="topitem">
					<view class="topitem-month">{{week.belongToMonth}}月</view>
					<view class="topitemcell" v-for="(weekofdays,index11) in week.data" :key="index11">
						<view class="topitemcell-chil">
							<view class="nav-day">{{weekofdays.day}}</view>
							<span class="nav-weekday">{{formatDay(index11)}}</span>
						</view>
					</view>
				</view>
				<scroll-view class="list" scroll-y>
					<view v-for="(time,index2) in timequantum" :key="index2" class="cell">
						<view class="cell-tq">{{time}}</view>
						<view class="cell-content" v-for="(weekofdays,index111) in week.data" :key="index111">
							<view class="cell-content-item">
								<uppart :item_data="weekofdays" :time="time.substring(0,2)+':30'" :index="index111" :oldTime="time" @wzhclick="wzhclick"/>
								<downpart :item_data="weekofdays" :time="addHour(time)" :index="index111" :oldTime="time.substring(0,2)+':30'" @wzhclick="wzhclick"/>
								<!-- <item :item_data="weekofdays" :time="addHour(time)" :index="index111" :oldTime="time.substring(0,2)+':30'"/> -->
								<!-- <view class="item-am" v-if="!check(time+':30',index111)" @tap="goDetail(index111,time)">{{time+':30'}}</view>
								<view class="item-am amselected" v-if="check(time+':30',index111)" @tap="goDetail(index111,time)">{{'1'+time+':30'}}</view>
								
								<view class="item-am" v-show="!check(addHour(time),index111)" @tap="goDetail(index111,time.substring(0,2)+':30')">{{}}</view>
								<view class="item-pm pmselected" v-show="check(addHour(time),index111)" @tap="goDetail(index111,time.substring(0,2)+':30')">{{'2'+addHour(time)}}</view> -->
							</view>
							
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>
<script>
	import uppart from '@/components/uppart.vue';
	import downpart from '@/components/downpart.vue';
	var util = require('../../common/util.js');
	var onfire = require("onfire.js");
	/*
	 * 用于记录日期，显示的时候，根据dateObj中的日期的年月显示
	 */
	var dateObj = (function() {
		var _date = new Date(); // 默认为当前系统时间
		return {
			getDate: function() {
				return _date;
			},
			setDate: function(date) {
				_date = date;
			}
		};
	})();
	var oldIndex=0;
	try {
			uni.setStorageSync('oldIndex', oldIndex);
	} catch (e) {
			// error
			console.log(e);
	}


	export default {
		components: {
			uppart,
			downpart
		},
		data() {
			return {
				timequantum: [], //时间段集合
				weeks: [],
				currentIndex: 0,
				currentDate: 1,
				currentMonth: 1, //当前月份
				currentYear: 2018, //当前年份
				currentMonthText: 1, //显示月份
				isActive: false,
				activeDom: {},
				isShow:true
			}
		},
		computed: {
			reversedMessage() {
			  return function(time){
				  return time.substring(0,2)+':30';
			  }
			}
		},
		onLoad: function() {
			var that = this;
			//添加日程
			onfire.on('setSchedule', function(info) {
				let scurdate = that.activeDom['aData']['schedule'];
				//如果当前选择的时间段于当前存在的日程重合,用最新的覆盖.
				let arr = Object.assign([], that.weeks[oldIndex]);
				let curdate = arr['data'][that.activeDom['e']]['schedule'];
				let curIndex = 0;
				for (let i = 0; i < curdate.length; i++) {
					if (curdate[i]['times'].indexOf(that.activeDom['time']) > -1) {
						curIndex = i;
						break;
					} else {
						curIndex = 0;
					}
				}
				if (curIndex > 0) {
					curdate[curIndex] = info
				} else {
					curdate.push(info)
				}
				let newValue = Object.assign({}, arr)
				that.weeks.splice(oldIndex, 1, newValue)
				that.weeks = that.weeks;
				console.log('currentIndex:' + oldIndex);
				console.log('weeks:', JSON.stringify(that.weeks));
			})

			uni.setNavigationBarTitle({
				title: "默认导航栏"
			})
			//获取当前时间 所属年份 所属月份 所属日期 所属时间段 第几周
			this.currentDate = dateObj.getDate().getDate();
			this.currentMonth = dateObj.getDate().getMonth() + 1;
			this.currentYear = dateObj.getDate().getFullYear();
			this.weeks = this.showCalendarData(this.currentMonth);
			this.timequantum = this.getTimequantum(6, 22);
			
			console.log(this.weeks)
			for (let i = 0; i < this.weeks.length; i++) {
				//得到每一组的数据
				for (let j = 0; j < this.weeks[i].data.length; j++) {
					let aa = this.weeks[i].data[j];
					if (this.currentMonth == aa.month && this.currentYear == aa.year && this.currentDate == aa.day) {
						console.log(i) //获取当前时间所属组
						this.currentIndex = i
						oldIndex=i;
						try {
								uni.setStorageSync('oldIndex', oldIndex);
						} catch (e) {
								// error
								console.log(e);
						}
					}
				}
			}



		},
		updated: function() {
			console.log('----update-----');
		},
		methods: {
			addHour(time) {
				let hour = Number(time.substring(0, 2)) + 1;
				let m = time.substring(3, 5);
				return util.addPreForTime(hour) + ':' + m;
			},
			wzhclick(data){
				//获取当前元素所属时间段，传递到创建页面 
				let curdate=this.weeks[oldIndex]['data'][data.e]['schedule'];
				let selectedTime = data.time;
				let selectedDate = this.weeks[oldIndex]['data'][data.e]['date'];
				this.activeDom = {
						aData: this.weeks[oldIndex]['data'][data.e],
						time:data.time,
						e:data.e
					},
				uni.navigateTo({
					url: '/pages/index/detail?selectedTime=' + selectedTime + '&selectedDate=' + selectedDate
				})
			},
			formatDay(num) {
				switch (num) {
					case 0:
						return '周一'
						break;
					case 1:
						return '周二'
						break;
					case 2:
						return '周三'
						break;
					case 3:
						return '周四'
						break;
					case 4:
						return '周五'
						break;
					case 5:
						return '周六'
						break;
					case 6:
						return '周日'
						break;
					default:
						break;
				}
			},
			async changeTab(e) {
				let index = e.target.current;
				console.log('index:'+index)
				console.log('oldIndex:'+oldIndex)
				let month = this.currentMonth
				if (oldIndex == 0 && index == 5) {
					//上月第五周
					this.isShow=false;
					this.$nextTick(function (){
						uni.showLoading({
								title: '加载中',
								mask:true,
								complete:()=>{
									if (month == 1) {
										this.currentMonth = 12;
										this.currentYear--;
									} else {
										this.currentMonth--
									}
									this.weeks = this.showCalendarData(this.currentMonth);
								}
						});
					})
					
					this.$nextTick(function () {
						console.log('dom渲染完成');
						this.isShow=true
						setTimeout(function(){
							uni.hideLoading()
						},1500)
					})

				}
				if (oldIndex == 5 && index == 0) {
					//下月第一周
					uni.showLoading({
							title: '加载中',
							mask:true,
							complete:()=>{
								if (month == 12) {
									this.currentMonth = 1;
									this.currentYear++;
								} else {
									this.currentMonth++
								}
								this.weeks = this.showCalendarData(this.currentMonth);
							}
					});
					this.$nextTick(function () {
						console.log('dom渲染完成');
						setTimeout(function(){
							uni.hideLoading()
						},1500)
					})
				}
				oldIndex=index;
				try {
						uni.setStorageSync('oldIndex', oldIndex);
				} catch (e) {
						// error
						console.log(e);
				}
// 				this.currentIndex = index;
// 				setTimeout(function() {
// 
// 				}, 100)

			},
			groupArray(data, cols) {
				let obj = {};
				const list = [];
				let current = [];
				// for (t of data) {
				data.forEach((t, k) => {
					current.push(t);
					if (current.length === cols) {
						obj = {
							k,
							belongToMonth: current[0]['month'],
							data: current
						}
						list.push(obj);
						current = [];
					}
				});
				// }    // for (t of data)
				if (current.length > 0) {
					obj = {
						belongToMonth: current[0]['month'],
						data: current
					}
				}
				if (current.length) {
					list.push(obj);
				}
				return list;
			},

			showCalendarData(month) {
				var _year = this.currentYear;
				var _month = month;
				var _dateStr = util.getDateStr(dateObj.getDate());

				// 设置顶部标题栏中的 年、月信息
				var calendarTitle = '';
				var titleStr = _dateStr.substr(0, 4) + "年" + _dateStr.substr(4, 2) + "月";
				calendarTitle = titleStr;

				// 设置表格中的日期数据
				var _tds = [];
				var _firstDay = new Date(_year, _month - 1, 1); // 当前月第一天
				//6行7列
				for (var i = 0; i < 42; i++) {
					let obj = {};
					var _thisDay = new Date(_year, _month - 1, i + 1 - _firstDay.getDay() + 1);
					var _thisDayStr = util.getDateStr(_thisDay);
					obj['year'] = _year;
					obj['day'] = util.addPreForTime(_thisDay.getDate());
					obj['month'] = _thisDay.getMonth() + 1;
					obj['date'] = _thisDayStr; //ex：20181125
					obj['info'] = {
						amSelected: false,
						pmSelected: false,
						status: 0
					};
					obj['schedule'] = [

					];
					if (_thisDayStr == util.getDateStr(new Date())) { // 当前天
						obj['status'] = 'currentDay';
					} else if (_thisDayStr.substr(0, 6) == util.getDateStr(_firstDay).substr(0, 6)) {
						obj['status'] = 'currentMonth'; // 当前月
					} else { // 其他月
						obj['status'] = 'otherMonth';
					}
					_tds.push(obj)
				}
// 				let arr = []
// 				console.log([].push(this.groupArray(_tds, 7)[0]))
// 				arr.push(this.groupArray(_tds, 7)[0]);
				return this.groupArray(_tds, 7)
			},
			/**
			 * 获取时间段集合 00:00....
			 */
			getTimequantum(start, end) {
				let arr = [];
				for (let i = start; i < end + 1; i++) {
					arr.push(util.addPreForTime(i)+':00')
				}
				return arr
			}
		}
	}
</script>

<style>
	[v-cloak]{ display:none}
	.topitem {
		display: flex;
		justify-content: center;
		width: 100%;
		/* border-bottom: #BEBEBE;
		border-bottom-width: 1upx;
		border-bottom-style: solid; */
	}

	.topitemcell {
		flex: 1;
		padding: 5upx;
	}

	.topitemcell-chil {
		text-align: center;
	}

	.item1 {
		height: 200px;
		width: 100%;
		background: #00B26A;
	}

	.nav-day {
		padding-top: 3upx;
		font-size: 14px;
	}

	.nav-weekday {
		font-size: 14px;
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
