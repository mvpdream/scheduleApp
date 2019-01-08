function formatTime(time) {
	if (typeof time !== 'number' || time < 0) {
		return time
	}

	var hour = parseInt(time / 3600)
	time = time % 3600
	var minute = parseInt(time / 60)
	time = time % 60
	var second = time

	return ([hour, minute, second]).map(function(n) {
		n = n.toString()
		return n[1] ? n : '0' + n
	}).join(':')
}

function formatLocation(longitude, latitude) {
	if (typeof longitude === 'string' && typeof latitude === 'string') {
		longitude = parseFloat(longitude)
		latitude = parseFloat(latitude)
	}

	longitude = longitude.toFixed(2)
	latitude = latitude.toFixed(2)

	return {
		longitude: longitude.toString().split('.'),
		latitude: latitude.toString().split('.')
	}
}
var dateUtils = {
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function(milliseconds) {
		var humanize = '';
		for (var key in this.UNITS) {
			if (milliseconds >= this.UNITS[key]) {
				humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
				break;
			}
		}
		return humanize || '刚刚';
	},
	format: function(dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if (diff < this.UNITS['天']) {
			return this.humanize(diff);
		}
		var _format = function(number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDay()) + '-' +
			_format(date.getHours()) + ':' + _format(date.getMinutes());
	},
	parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};

function getDateStr(date) {
	var _year = date.getFullYear();
	var _month = date.getMonth() + 1; // 月从0开始计数
	var _d = date.getDate();

	_month = (_month > 9) ? ("" + _month) : ("0" + _month);
	_d = (_d > 9) ? ("" + _d) : ("0" + _d);
	return _year + _month + _d;
};

function addPreForTime(time) {
	let hour = time + '';
	return hour.length == 1 ? '0' + time : time
};

function addHalfHour(time) {
	let hour = Number(time.substring(0, 2));
	let m = time.substring(3, 5);
	if (m == '30') {
		hour += 1;
		m = '00';
	} else if (m == '00') {
		m = '30';
	}
	return this.addPreForTime(hour) + ':' + m;
};

function minusHalfHour(time) {
	let hour = Number(time.substring(0, 2));
	let m = time.substring(3, 5);
	if (m == '30') {
		m = '00';
	} else if (m == '00') {
		m = '30';
		hour -= 1;
	}
	return this.addPreForTime(hour) + ':' + m;
};

function addHour(time) {
	let hour = Number(time.substring(0, 2)) + 1;
	let m = time.substring(3, 5);
	return this.addPreForTime(hour) + ':' + m;
};

function getToday() {
	let date = new Date();
	let year = date.getFullYear() + '';
	let month = (date.getMonth() + 1) + '';
	let day = date.getDate() + '';
	return year + month + day
};

module.exports = {
	formatTime: formatTime,
	formatLocation: formatLocation,
	dateUtils: dateUtils,
	getDateStr: getDateStr,
	addPreForTime: addPreForTime,
	addHalfHour: addHalfHour,
	minusHalfHour: minusHalfHour,
	addHour: addHour,
	getToday
}
