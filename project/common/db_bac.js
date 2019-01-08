class Db {
	static getInstance() { //单例模式 解决多次实例化实例共享的问题  重复创建。。
		if (!Db.instance) {
			Db.instance = new Db()
		}
		return Db.instance
	}
	//构造函数
	constructor() {
		this.dbName = '';
		this.dbVersion = '';
		this.db = {};
		// 创建indexedDB对象，兼容各种浏览器
		var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
		if (!indexedDB) {
			console.log("你的浏览器不支持IndexedDB");
		}
	}
	// 打开数据库
	openIndexedDB(dbName, dbVersion, personStore, callback) {
		let that = this;
		that.dbName = dbName;
		that.dbVersion = dbVersion;
		// 打开一个数据库
		var request = indexedDB.open(dbName, dbVersion);

		// 打开失败
		request.onerror = function(e) {
			console.log(e.currentTarget.error.message);
		};

		// 打开成功！
		request.onsuccess = function(e) {
			that.db = e.target.result;
			console.log('成功打开DB');
			callback();
		};

		// 打开成功后，如果版本有变化自动执行以下事件
		request.onupgradeneeded = function(e) {
			var db = e.target.result;
			if (!db.objectStoreNames.contains(personStore)) {
				console.log("我需要创建一个新的存储对象");
				if(personStore=='student'){
					//如果表格不存在，创建一个新的表格（keyPath，主键 ； autoIncrement,是否自增），会返回一个对象（objectStore）
					var objectStore = db.createObjectStore(personStore, {
						keyPath: "id",
						autoIncrement: true
					});
	
					//指定可以被索引的字段，unique字段是否唯一, 指定索引可以加快搜索效率。
					objectStore.createIndex("name", "name", {
						unique: false
					});
					objectStore.createIndex("phone", "phone", {
						unique: false
					});
				}
				if(personStore=='schedules'){
					//如果表格不存在，创建一个新的表格（keyPath，主键 ； autoIncrement,是否自增），会返回一个对象（objectStore）
					var objectStore = db.createObjectStore(personStore, {
						keyPath: "key",
						autoIncrement: false
					});
	
					//指定可以被索引的字段，unique字段是否唯一, 指定索引可以加快搜索效率。
					objectStore.createIndex("dateIndex", "date", {
						unique: true
					});
					objectStore.createIndex("infoIndex", "info", {
						unique: false
					});
				}
				
			}
			console.log('数据库版本更改为： ' + dbVersion);
		};
	}
	// 游标遍历表中数据
	loadAllData(personStore, callback) {
		var trans = this.db.transaction(personStore, 'readwrite');
		var store = trans.objectStore(personStore);
		var cursorRequest = store.openCursor();
		cursorRequest.onsuccess = function(e) {
			var cursor = e.target.result;
			if (cursor) {
				//that.lists.push(cursor.value)
				callback(cursor.value)
				cursor.continue(); // 游标继续往下 搜索，重复触发 onsuccess方法，如果到到返回null
			}
		}
	}
	loadDataByIndex(personStore, indexName, indexValue, callback) {
		var trans = this.db.transaction(personStore, 'readwrite');
		var store = trans.objectStore(personStore);
		var cursorRequest = store.index(indexName).openCursor(IDBKeyRange.only(indexValue));
		cursorRequest.onsuccess = function(e) {
			var cursor = e.target.result;
			if (cursor) {
				debugger
				//that.lists.push(cursor.value)
				callback(cursor.value)
				cursor.continue(); // 游标继续往下 搜索，重复触发 onsuccess方法，如果到到返回null
			}else{
				callback()
			}
		}
	}
	loadDataBykey(personStore, key) {
		
		//第二个参数可以省略
		var transaction = this.db.transaction(personStore, "readwrite");
		var store = transaction.objectStore(personStore);
		if (key)
			var request = store.get(key);
		else
			var request = store.getAll();

		request.onsuccess = function() {
			console.log(request.result);
		}
	}
	insert(personStore, json, callback) {
		// 创建一个事务
		var transaction = this.db.transaction(personStore, 'readwrite');

		// 通过事务来获取store
		var store = transaction.objectStore(personStore);

		var addPersonRequest = store.add(json);
		addPersonRequest.onsuccess = function(e) {
			console.log(e.target);
			callback(json)
		}
		addPersonRequest.onerror = function(e) {
			console.log(e.target.error);
		}
	}
	update(personStore, id, json, callback) {
		// 创建一个事务，类型：IDBTransaction，文档地址： https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction
		var transaction = this.db.transaction(personStore, 'readwrite');

		// 通过事务来获取IDBObjectStore
		var store = transaction.objectStore(personStore);
		var person = json;

		// 修改或者添加数据。 第一参数是要修改的数据，第二个参数是主键（可省略)
		var updatePersonRequest = store.get(id);

		// 监听添加成功事件
		updatePersonRequest.onsuccess = function(e) {
			// var p = e.target.result;  // 要修改的原对象
			store.put(person);
			callback(json);
		};

		// 监听失败事件
		updatePersonRequest.onerror = function(e) {
			console.log(e.target.error);
		};
	}
	remove(personStore, id, callback) {
		if (!this.db || !id) {
			return;
		}
		// 创建一个事务
		var transaction = this.db.transaction(personStore, 'readwrite');

		// 通过事务来获取store
		var store = transaction.objectStore(personStore);

		// 删除请求
		var delPersonRequest = store.delete(id);
		delPersonRequest.onsuccess = function(e) {
			//loadTableData(); // 删除成功后，重新加载数据
			callback()
		}
		delPersonRequest.onerror = function(e) {
			console.log(e.target.error);
		}
	}
	closeDB() {
		this.db.close();
	}

	deleteDB(name) {
		indexedDB.deleteDatabase(name);
	}

}



module.exports = Db.getInstance();
