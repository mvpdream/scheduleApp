<template>
	<view class="uni-tab-bar animated slideInRight" style="animation-duration: 0.5s">
		<!-- <swiper :current="currentIndex" id="sw" class="<swiper-box></swiper-box>" duration="200" circular @change="changeTab" @touchstart="touchstart" @touchend="touchend" @animationfinish="animationfinish">
			<swiper-item v-for="(week,key,index1) in weekData" :key="key">
				<view class="topitem">
					<view class="topitem-month">{{week[0].belongToMonth}}月</view>
					<view class="loadingView" v-if="loaded">
						<loading />
					</view>
					<view v-if="!loaded" class="topitemcell" v-for="(weekofdays,index11) in week" :key="weekofdays.key">
						<view class="topitemcell-chil" :class="{ today: today==weekofdays.key}">
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
								<uppart :item_data="weekofday" :date=weekofday.key :time="time.substring(0,2)+':30'" :index="index111" :oldTime="time"
								 @wzhclick="wzhclick" />
								<downpart :item_data="weekofday" :date=weekofday.key :time="addHour(time)" :index="index111" :oldTime="time.substring(0,2)+':30'"
								 @wzhclick="wzhclick" />
							</view>
						</view>
					</view>
					<view style="height: 45px;"></view>
				</scroll-view>
			</swiper-item>
		</swiper> -->
		<view class="swiper-container">
			<view class="swiper-wrapper">
				<view class="swiper-slide" v-for="(week,key,index1) in weekData" :key="key" v-bind:style="{height: swHeight + 'px' }">
					<view class="topitem">
						<view class="topitem-month">{{week[0].belongToMonth}}月</view>
						<view class="loadingView" v-if="loaded">
							<loading />
						</view>
						<view class="topitemcell" v-for="(weekofdays,index11) in week" :key="weekofdays.key" v-if="!loaded">
							<view class="topitemcell-chil" :class="{ today: today==weekofdays.key}">
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
									<uppart :item_data="weekofday" :date=weekofday.key :time="time.substring(0,2)+':30'" :index="index111"
									 :oldTime="time" @wzhclick="wzhclick" />
									<downpart :item_data="weekofday" :date=weekofday.key :time="addHour(time)" :index="index111" :oldTime="time.substring(0,2)+':30'"
									 @wzhclick="wzhclick" />
								</view>
							</view>
						</view>
						<view style="height: 100px;"></view>
					</scroll-view>

					<scroll-view class="loadList" scroll-y ref="loadList">
						<view v-for="(time,index2) in timequantum" :key="index2+time" class="cell">
							<view class="cell-tq">{{time}}</view>
							<view class="cell-content" v-for="(weekofday,index111) in week" :key="index111+weekofday.key">
								<view class="cell-content-item">
									<uppart />
									<downpart />
								</view>
							</view>
						</view>
						<view style="height: 90px;"></view>
					</scroll-view>


				</view>
			</view>
		</view>
	</view>
</template>
<script>
	var currentFirstDate;
	var prevIndex = 0; //上一个swiper index
	var infoArr = [];
	var mySwiper;
	var moment = require('moment');
	var util = require('../../common/util.js');
	var Config = require('../../common/config.js');
	var onfire = require("onfire.js");
	import {
		goStudent
	} from '../../common/test.js'
	import uppart from '@/components/uppart.vue';
	import downpart from '@/components/downpart.vue';
	import loading from "@/components/loading.vue";
	var db = require('../../common/db.js');
	import Swiper from 'swiper';
	import 'swiper/dist/css/swiper.min.css';
	import {
		mapState,
		mapMutations
	} from 'vuex'
	// 	var goStudent=function(){
	// 		uni.navigateTo({
	// 			url: '/pages/index/students'
	// 		})
	// 	}




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
				flag: '',
				loaded: false,
				today: '',
				istouchend: false,
				swHeight: uni.getSystemInfoSync().screenHeight
			}
		},
		computed: {
			...mapState(['timequantum']),
		},
		onNavigationBarButtonTap: function(data) {
			uni.navigateTo({
				url: '/pages/index/students'
			})
		},
		onLoad: async function() {
			var that = this;
			that.today = util.getToday();
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
				this.weekData = await this.getLastNextWeek(day);
			} else {
				this.weekData = await this.getLastNextWeek(new Date());
			}
			this.getTimequantums(6, 22);

			this.$nextTick(() => {
				this.swiperInit(this.currentIndex);
				mySwiper.on('slideChangeTransitionEnd', function() {
					console.log('activeIndex:' + this.activeIndex)
					console.log('snapIndex:' + this.snapIndex);
					console.log('realIndex:' + this.realIndex);
// 					if(this.realIndex==2){
// 						document.getElementsByClassName('list')[this.activeIndex+1].style.display='none'
// 						document.getElementsByClassName('loadList')[this.activeIndex+1].style.display='block'
// 					}
// 					if(this.realIndex==0){
// 						document.getElementsByClassName('list')[this.activeIndex-1].style.display='none'
// 						document.getElementsByClassName('loadList')[this.activeIndex-1].style.display='block'
// 					}
					that.animationfinish(this.realIndex);
				})
				mySwiper.on('touchEnd', function() {
					that.istouchend = true
				})
				mySwiper.on('touchStart', function() {
					that.istouchend = false
				})
				mySwiper.on('touchMove', function(e) {
// 					let halfWid=uni.getSystemInfoSync().screenWidth/2;
// 					let moveX=e.changedTouches[0]['screenX'];
// 					if(moveX==halfWid||moveX<halfWid){
// 						if(this.realIndex==2){
// 							document.getElementsByClassName('list')[this.activeIndex+1].style.display='none'
// 							document.getElementsByClassName('loadList')[this.activeIndex+1].style.display='block'
// 						}
// 						if(this.realIndex==0){
// 							document.getElementsByClassName('list')[this.activeIndex-1].style.display='none'
// 							document.getElementsByClassName('loadList')[this.activeIndex-1].style.display='block'
// 						}
// 						// document.getElementById('loaded').style.display='inherit';
// 					}
					//console.log(e.changedTouches[0]['screenX']);
				})
				//dom已更新
				setTimeout(() => {
					javascript: android.getClient(); //调用客户端
				}, 1500)
			})
		},
		watch: {
			'flag': async function(newVal) {
				console.log('changed', newVal);

				if (newVal == 'last') {
					let arr = {};
					let indexs = [-2, -1, 0];
					for (let i = 0; i < indexs.length; i++) {
						let result = indexs[i] - 1;
						let wdata = [];
						if (result < 0) {
							result = Math.abs(result); //返回绝对值
							let currentFirstDay = this.weekData['week0'][0]['ftext']
							wdata = await this.setDate(await this.addDate(new Date(currentFirstDay), -(7 * result)));
						}
						let data = await db.loadDataByIndex(Config.tabNames[0], 'dateIndex', wdata[0]['key']);
						if (data) {
							arr['week' + i] = data['info'];
						} else {
							let results = await this.insertData(wdata[0]['key'], wdata)
							arr['week' + i] = wdata;
						}
					}
					this.weekData = arr;
					// this.swiperInit(2)
				}
				if (newVal == 'next') {
					let arr = {};
					let indexs = [2, 3, 4];
					for (let i = 0; i < indexs.length; i++) {
						let result = indexs[i] - 1;
						let wdata = [];
						if (result > 0) {
							let currentLastDay = this.weekData['week2'][5]['ftext']
							wdata = await this.setDate(await this.addDate(new Date(currentLastDay), 7 * result));
						}
						let data = await db.loadDataByIndex(Config.tabNames[0], 'dateIndex', wdata[0]['key']);
						if (data) {
							arr['week' + i] = data['info'];
						} else {
							let results = await this.insertData(wdata[0]['key'], wdata)
							arr['week' + i] = wdata;
						}
					}
					console.log(arr);
					this.weekData = arr;
				}
				setTimeout(() => {
					this.loaded = false;
				}, 0)
			},
		},
		methods: {
			...mapMutations(['gettimequantum']),
			getTimequantums(start, end) {
				this.gettimequantum({
					start,
					end
				})
			},
			swiperInit(index) {
				mySwiper = new Swiper('.swiper-container', {
					speed:250,
					initialSlide: index,
					direction: 'horizontal',
					loop: true,
					autoHeight: true, //高度随内容变化
					width: uni.getSystemInfoSync().screenWidth,
					freeMode: false,
					touchRatio: 1.5,
					observer: true, //修改swiper自己或子元素时，自动初始化swiper  
					observeParents: true, //修改swiper的父元素时，自动初始化swiper
					followFinger : true
				})
				  
			},
			updatePage(info) {
				var that = this;
				infoArr.push(info);
				let a = {}
				let keyNames = info['name'].join('');
				let keyTimes = info['times'].join('');
				a[keyNames] = info['name'].join('');
				a[keyTimes] = info['times'].join('');
				let arr = Object.assign([], that.weekData['week' + prevIndex]);
				let value = uni.getStorageSync('activeDom');
				if (value) {
					//加半小时
					let valueTime = util.addHalfHour(value['time']);
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
						if (info['status'] == 1) {
							curdate.splice(curIndex, 1)
						} else {
							curdate[curIndex] = info
						}
					} else {
						curdate.push(info)
					}
					let obj = Object.assign({}, that.weekData['week' + prevIndex][value['e']], a);
					//删除多余的属性
					let lastObj = infoArr[infoArr.length - 2];
					delete obj[info['name'].join('')];
					delete obj[info['times'].join('')]
					that.$set(that.weekData['week' + prevIndex], value['e'], obj)
					//that.$set(that.weekData['week'+prevIndex][value['e']],info['times'].join(''),info['times'].join(''))
					//that.weekData['weekData'+oldIndex]=arr
					//this.gc[0] ={name:'lisi',age:22} //这样直接修改不能被vue监听到
					//that.$set(that.weekData,'week'+prevIndex,arr) //这样就能被vue监控到，更新视图 
					//存数据库
					// 					let key = value['aData']['key'];
					// 					db.insert(Config.tabNames[0],{
					// 						date: key,
					// 						info
					// 					}).then(res=>{
					// 						console.log('增加成功');
					// 					})
					db.loadDataByIndex(Config.tabNames[0], 'dateIndex', arr[0]['key']).then(res => {
						if (res) {
							db.update(Config.tabNames[0], res.id, {
								date: res.date,
								info: arr,
								id: res.id
							}).then(data => {
								console.log('更新成功.');
							})
						}
					})
				}
			},
			wzhclick(data) {
				//获取当前元素所属时间段，传递到创建页面 
				let cdata = this.weekData['week' + prevIndex];
				let curdate = cdata[data.e];
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
							url: '/pages/index/detail?selectedTime=' + selectedTime + '&selectedDate=' + selectedDate + '&name=' + data
								.name
						})
					}
				});

			},
			addHour(time) {
				return util.addHour(time)
			},
			animationfinish(index) {
				console.log('animationfinish');
				if (this.istouchend) {
					this.flag = '';
					if (prevIndex == 0 && index == 2) {
						mySwiper.slideToLoop(2, 0, false);
						this.flag = 'last';
						this.loaded = true;
					}
					if (prevIndex == 2 && index == 0) {
						mySwiper.slideToLoop(0, 0, false);
						this.flag = 'next';
						this.loaded = true;
					}
					prevIndex = index;
					console.log('animationfinish' + index);
				}
			},
			changeTab(e) {
				if (this.istouchend) {
					let index = e.target.current;
					console.log(index);
					if (prevIndex == 0 && index == 2) {
						//当前周往前三个周的数据
						//date=当前周的第一天 
						this.flag = '';
						return
					}
					if (prevIndex == 2 && index == 0) {
						//当前周往后三个周的数据
						//date=当前周的最后一天
						this.flag = '';
						return
					}
					prevIndex = index;
				}
			},
			async formatDate(date) {
				let year = date.getFullYear() + '';
				let month = (date.getMonth() + 1) + '';
				let day = date.getDate() + '';
				let week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
				console.log(year + month + day);
				let obj = {
					key: year + month + day,
					text: year + month + day + '  ' + week,
					ftext: `${year}-${month}-${day}`,
					day,
					dayofweek: week,
					belongToMonth: date.getMonth() + 1,
					schedule: [],
					id: 0
				};
				// 				let data = await db.loadDataByIndex(Config.tabNames[0], 'dateIndex', year + month + day);
				// 				if (data) {
				// 					let arr = [];
				// 					arr.push(data.info)
				// 					obj['schedule'] = arr;
				// 					obj['id'] = data.id;
				// 				}
				return obj;
			},
			async addDate(date, n) {
				date.setDate(date.getDate() + n);
				return date;
			},
			async setDate(date) {
				let week = date.getDay() - 1;
				date = await this.addDate(date, week * -1);
				currentFirstDate = new Date(date);
				let weekArr = [];
				for (let i = 0; i < 7; i++) {
					let data = await this.formatDate(i == 0 ? date : await this.addDate(date, 1));
					weekArr.push(data); //星期一开始
					//cells[i].innerHTML = formatDate(i==0 ? addDate(date,-1) : addDate(date,1));   //星期天开始
				}
				return weekArr;
			},
			async insertData(key, info) {
				let data = await db.loadDataByIndex(Config.tabNames[0], 'dateIndex', key);
				if (data) {

				} else {
					let result = await db.insert(Config.tabNames[0], {
						date: key,
						info
					})
				}
			},
			async getLastNextWeek(date) {
				let arr = {};
				for (let i = 0; i < 3; i++) {
					let result = i - 1;
					let wdata = [];
					if (result > 0) {
						if (date.getDay() == 0) {
							date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
						}
						wdata = await this.setDate(await this.addDate(date, 7 * result));
					} else if (result < 0) {
						result = Math.abs(result); //返回绝对值
						wdata = await this.setDate(await this.addDate(date, -(7 * result)));
					} else if (result == 0) {
						wdata = await this.setDate(await this.addDate(date, 0));
						this.currentIndex = i;
						prevIndex = i;
					}
					let data = await db.loadDataByIndex(Config.tabNames[0], 'dateIndex', wdata[0]['key']);
					if (data) {
						arr['week' + i] = data['info'];
					} else {
						let results = await this.insertData(wdata[0]['key'], wdata)
						arr['week' + i] = wdata;
					}

				}
				return arr;
			}
		}
	}
</script>

<style>
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
		font-weight: 500;
	}

	.nav-weekday {
		font-size: 12px;
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

	.cell-tq {
		font-size: 12px;
		padding: 0 1px 0 1px;
		color: #666666
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
		/* border-left: 2upx solid #FFFFFF; */
		border-right: 2upx solid #FFFFFF;
	}

	.item-am {
		/* border-top: 4upx solid #FFFFFF; */
		background-color: #f6f5fa;
		height: 49upx;
	}

	.amselected {
		background-color: #aedcfd;
	}

	.amselectedFinish {
		background-color: #b2d665;
		color: #FFFFFF
	}

	.selectBorder {
		border-top: 4upx solid #aedcfd;
	}

	.selectBorderFinish {
		border-top: 4upx solid #b2d665;
	}

	.selectBBorder {
		border-top: 3upx solid #FFFFFF;
	}

	.item-pm {
		background-color: #f6f5fa;
		height: 49upx;
	}

	.pmselected {
		background-color: #aedcfd;
	}

	.pmselectedFinish {
		background-color: #b2d665;
		color: #FFFFFF
	}

	.uni-scroll-view {
		padding-bottom: 50px !important;
		touch-action: none;
	}

	.today {
		color: #8fc32b
	}

	.swiper-slide {
		height: 100%
	}

	.loadList {
		display: none;
	}
</style>
