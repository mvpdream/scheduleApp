<template>
	<view class="page animated slideInRight" style="animation-duration: 0.5s">
<!-- 		<uni-nav-bar color="#ffffff"  background-color="rgba(0, 0, 0, .2)" fixed="true" left-icon="back" @click-left="back" right-icon="plusempty"
		 @click-right="add">
			<view class="input-view" :style="{background:'#ffffff'}">
				<uni-icon type="search" size="22" color="#666666"></uni-icon>
				<input confirm-type="search" :style="{color:'#333'}" @confirm="confirm" @input="change" @blur="blur" class="input"  type="text" placeholder="输入搜索关键词" />
			</view>
		</uni-nav-bar> -->
		<view class="student-header">
			<view class="student-header-search">
				<uni-icon type="search" size="22" color="#666666"></uni-icon>
				<input confirm-type="search" :style="{color:'#333',flex:1}" @confirm="confirm" @input="change" @blur="blur" class="input"  type="text" placeholder="输入搜索关键词" />
			</view>
			<uni-icon type="plus-filled" size="23" color="#fff" @tap="add"></uni-icon>
		</view>
		<!-- 居中 -->
		<uni-popup :show="showPopupMiddle" :type="popType" v-on:hidePopup="hidePopup" padding="0">
			<view class="uni-center uni-modal modal-content">
				<input class="uni-input" v-model="inputValue" focus placeholder="输入学员姓名" placeholder-class="inputPlaceholder"/>
			</view>
			<view class="modal-btn">
				<button type="default" size="mini" @tap="cancel">取 消</button>
				<button type="default" size="mini" @tap="btnconfirm">确 认</button>
			</view>
		</uni-popup>
		<scroll-view class="scrollList" scroll-y>
			<view class="uni-list">
				<block v-for="(list,key) in lists" :key="key">
					<view class="uni-list-cell" hover-class="uni-list-cell-hover" :hover-start-time="0" :hover-stay-time="150">
						<view class="uni-list-cell-navigate" @tap="celltap(list,key)" @longtap="cellInfo(list,key)">
							{{list.name}}
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	var airportDate = require("../../common/airport.js");
	import uniNavBar from '@/components/uni-nav-bar.vue'
	import uniIcon from '@/components/uni-icon.vue'
	import uniPopup from '@/components/uni-popup.vue';
	var db = require('../../common/db.js');
	var Config=require('../../common/config.js');
	var onfire = require("onfire.js");
	//modal弹出禁止允许滚动
	function setScroll(isScroll) {
		if (isScroll) {
			document.body.style.position = 'relative';
			document.body.style.overflow = 'auto';
		} else {
			document.body.style.position = 'fixed';
			document.body.style.overflow = 'hidden';
		}
	}
	//禁止鼠标长按效果
	window.addEventListener('contextmenu', function(e){
		e.preventDefault();
	});

	export default {
		components: {
			uniIcon,
			uniPopup,
			uniNavBar
		},
		data() {
			return {
				lists: [], //用于视图渲染
				listData:[],
				popType: 'middle',
				title: 'popup',
				showPopupMiddle: false,
				showPopupTop: false,
				showPopupBottom: false,
				msg: '',
				inputValue: '',
				isAdd: true,
				currentItem: 0,
				isSearch:false
			}
		},
		onLoad() {
			db.loadAllData(Config.tabNames[1]).then(data=>{
				if (data) {
					this.lists=data;
				}
			})
		},
		watch: {
			'lists': function(newVal,oldVal) {
				if(!this.isSearch){
					this.listData=newVal
				}
			}
		},
		onPullDownRefresh() {
			db.loadAllData(Config.tabNames[1]).then(data=>{
				if (data) {
					this.lists=data;
					setTimeout(()=>{
						uni.stopPullDownRefresh();
					},500)
				}
			})
		},
		methods: {
			add(e) {
				this.isAdd = true;
				this.showMiddlePopup()
				setScroll(false);
			},
			back() {
				uni.navigateBack();
			},
			search(e) {
				let value = e.detail.value;
				let result = [];
				let listData = Object.assign([], this.listData);
				for (let i = 0; i < listData.length; i++) {
					if (listData[i]['name'].indexOf(value) > -1) {
						result.push(listData[i])
					}
				}
				this.lists = value == '' ? listData : result
			},
			change(e) {
				if(!this.isSearch){
					this.isSearch=true;
				}
				this.search(e)
			},
			blur(){
				if(this.isSearch){
					this.isSearch=false;
				}
			},
			confirm(e) {
				this.search(e)
			},
			cancel() {
				this.hidePopup();
			},

			btnconfirm() {
				this.hidePopup();
				if (!db) {
					return;
				}
				var name = this.inputValue;
				var phone = '1234567890';
				if (this.isAdd) {
					db.insert(Config.tabNames[1],{
						name,
						phone
					}).then(data=>{
						if (data) {
							this.inputValue = '';
							this.lists.push({
								id: this.lists.length,
								name: data.name,
								phone: data.phone
							})
						}
					})
				} else {
					db.update(Config.tabNames[1],this.currentItem.list.id,{
						id:this.currentItem.list.id,
						name,
						phone
					}).then(data=>{
						if (data) {
							this.inputValue = '';
							this.$set(this.lists, this.currentItem.key, data) //这样就能被vue监控到，更新视图 
						}
					})
				}
			},
			cellInfo(list, key) {
				console.log('长按');
				uni.showActionSheet({
					itemList: ['编辑', '删除'],
					success: (res) => {
						this.currentItem = {
							list,
							key
						};
						console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
						if (res.tapIndex == 0) {
							this.isAdd = false;
							this.inputValue = list.name;
							//编辑
							this.showMiddlePopup()
						} else {
							uni.showModal({
								title: '提示',
								content: '确认删除该学员？',
								success: (res) => {
									if (res.confirm) {
										debugger
										db.remove(Config.tabNames[1],list.id).then(()=>{
											debugger
											this.lists.splice(key, 1)
										})
									} else if (res.cancel) {
										console.log('用户点击取消');
									}
								}
							});

						}
					},
					fail: function(res) {
						console.log(res.errMsg);
					}
				});
			},
			celltap(list, key) {
				console.log('点击的list:' + list);
				let pages = getCurrentPages();
				let page = pages[pages.length - 2]; //获取上一层页面
				if(page['route']=='pages/index/detail'){
					onfire.fire('setStudent',list);
					uni.navigateBack();
				}
			},
			//统一的关闭popup方法
			hidePopup: function() {
				setScroll(true);
				this.showPopupMiddle = false;
				this.showPopupTop = false;
				this.showPopupBottom = false;
				document.getElementsByClassName('input-placeholder')[1].style.lineHeight = '40px'
				document.getElementsByClassName('input-placeholder')[1].style.height = 'inherit'
				
			},
			//展示居中 popup
			showMiddlePopup: function() {
				this.hidePopup();
				this.popType = 'middle';
				this.showPopupMiddle = true;
				document.getElementsByClassName('uni-mask')[0].style.top = '0'
			}
		}
	}
</script>

<style>
	.uni-mask {
		top: 0 !important;
		z-index: 999999;
	}

	.page {
		display: flex;
		flex-direction: column;
		flex:1;
		min-height: 100%;
	}

	.scrollList {
		/* margin-top: 44px; */
		margin-top: 40px;
	}

	.uni-list:before {
		height: 0;
	}

	.uni-list-cell:before {
		height: 0;
	}

	.uni-list-cell:after {
		left: 0;
	}

	.title {
		font-size: 15px;
		line-height: 20px;
		color: #333333;
		padding: 15px;
	}

	.city {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin-left: 8px;
	}

	.input-view {
		width: 92%;
		display: flex;
		height: 30px;
		border-radius: 15px;
		padding: 0 4%;
		flex-wrap: nowrap;
		margin: 7px 0;
		line-height: 30px;
	}

	.input-view .uni-icon {
		line-height: 30px !important;
	}

	.input-view .input {
		height: 30px;
		line-height: 30px;
		width: 94%;
		padding: 0 3%;
	}

	.modal-content {
		display: flex;
		flex: 1;
		align-items: center
	}

	.modal-content input {
		height: 40px;
		line-height: 40px;
	}

	.modal-btn {
		display: flex;
		width: 550upx;
		flex-direction: row;
		justify-content: space-between;
		border-top: 1px solid #d5d5d6;
	}

	.modal-btn button {
		width: 300upx;
		line-height: 3.5;
		background-color: #FFFFFF;
		font-weight: bold;
		font-size: 14px;
	}

	.modal-btn button:first-child {
		border-right: 1px solid #d5d5d6;
		border-bottom-right-radius: 0;
		border-top-right-radius: 0;
		color: #666666
	}

	uni-button:after {
		border: none;
	}

	.popModal {
		padding: 0;
	}
	
	.inputPlaceholder{
		height: inherit !important;
	}
	.student-header{
		display: flex;
		width: 95%;
		flex-direction: row;
		align-items: center;
		position: fixed;
		padding: 1px 10px 5px 10px;
		background: #409eff;
	}
	.student-header-search{
		flex:1;
		display: flex;
		background-color: #FFFFFF;
		height: 30px;
		border-radius: 15px;
		padding: 0 4%;
		margin-right: 10px;
		flex-wrap: nowrap;
		line-height: 30px;
		align-items: center;
	}
</style>
