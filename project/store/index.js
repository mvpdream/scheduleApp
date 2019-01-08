import Vue from 'vue'
import Vuex from 'vuex'
var util = require('../common/util.js');

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
		timequantum: [], //时间段集合
    },
    mutations: {
		/**
		 * 获取时间段集合 00:00....
		 */
		gettimequantum(state,time) {
			let arr = [];
			for (let i = time.start; i < time.end + 1; i++) {
				arr.push(util.addPreForTime(i) + ':00')
			}
			state.timequantum=arr;
		},
    }
})

export default store
