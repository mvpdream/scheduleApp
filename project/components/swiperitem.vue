<template>
	<view class="uni-swiper-wrapper">
		<view class="topitem">
			<view class="topitem-month">{{week.belongToMonth}}月</view>
			<view class="topitemcell" v-for="(weekofdays,index11) in week.data" :key="weekofdays.date">
				<view class="topitemcell-chil">
					<view class="nav-day">{{weekofdays.day}}</view>
					<span class="nav-weekday">{{formatDay(index11)}}</span>
				</view>
			</view>
		</view>
		<scroll-view class="list" scroll-y>
			<view v-for="(time,index2) in timequantum" :key="index2" class="cell">
				<view class="cell-tq">{{time}}</view>
				<view class="cell-content" v-for="(weekofdays,index111) in week.data" :key="index111+weekofdays.date">
					<view class="cell-content-item">
						<uppart :item_data="weekofdays" :time="time.substring(0,2)+':30'" :index="index111" :oldTime="time" @wzhclick="wzhclick"/>
						<downpart :item_data="weekofdays" :time="addHour(time)" :index="index111" :oldTime="time.substring(0,2)+':30'" @wzhclick="wzhclick"/>
					</view>
				</view>
			</view>
		</scroll-view></view>
</template>

<script>
	import uppart from '@/components/uppart.vue';
	import downpart from '@/components/downpart.vue';
	var util = require('../common/util.js');
	export default {
		name: "swiperitem",
		props: {
			week:{
				type:Object
			},
			timequantum:{
				type:Array
			}
		},
		components: {
			uppart,
			downpart
		},
		data() {
			return {}
		},
		methods:{
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
			addHour(time) {
				let hour = Number(time.substring(0, 2)) + 1;
				let m = time.substring(3, 5);
				return util.addPreForTime(hour) + ':' + m;
			},
			wzhclick(e){
				this.$emit('goDetail', e);
			}
		}
	}
</script>

<style>
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
