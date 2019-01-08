var Config = require('./config');
class Db {
	static getInstance() { //单例模式 解决多次实例化实例共享的问题  重复创建。。
		if (!Db.instance) {
			Db.instance = new Db()
		}
		return Db.instance
	}
	//构造函数
	constructor() {
		this.dbName = Config.dbName;
		this.dbVersion = Config.dbVersion;
		this.db = {};
		// 创建indexedDB对象，兼容各种浏览器
		var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
		if (!indexedDB) {
			console.log("你的浏览器不支持IndexedDB");
		}
	}
	// 打开数据库
	openIndexedDB() {
		let that = this;
		return new Promise((resolve, reject) => {
			// 打开一个数据库
			var request = indexedDB.open(that.dbName, that.dbVersion);

			// 打开失败
			request.onerror = function(e) {
				console.log(e.currentTarget.error.message);
			};

			// 打开成功！
			request.onsuccess = function(e) {
				that.db = e.target.result;
				console.log('成功打开DB');
				resolve(that.db);
			};
			// 打开成功后，如果版本有变化自动执行以下事件
			request.onupgradeneeded = function(e) {
				var db = e.target.result;
				Config.tabNames.forEach(item => {
					if (!db.objectStoreNames.contains(item)) {
						console.log("我需要创建一个新的存储对象");
						if (item == 'students') {
							//如果表格不存在，创建一个新的表格（keyPath，主键 ； autoIncrement,是否自增），会返回一个对象（objectStore）
							var objectStore = db.createObjectStore(item, {
								keyPath: "id",
								autoIncrement: true
							});
							//指定可以被索引的字段，unique字段是否唯一, 指定索引可以加快搜索效率。
							objectStore.createIndex("nameIndex", "name", {
								unique: false
							});
							objectStore.createIndex("phoneIndex", "phone", {
								unique: false
							});
						}
						if (item == 'schedules') {
							//如果表格不存在，创建一个新的表格（keyPath，主键 ； autoIncrement,是否自增），会返回一个对象（objectStore）
							var objectStore = db.createObjectStore(item, {
								keyPath: "id",
								autoIncrement: true
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
				})
			};

		})
	}
	/**
	 * 读取表中所有的数据
	 */
	loadAllData(table) {
		return new Promise((resolve, reject) => {
			this.openIndexedDB().then((db) => {
				var trans = this.db.transaction(table, 'readwrite');
				var store = trans.objectStore(table);
				var cursorRequest = store.openCursor();
				var result=[];
				cursorRequest.onsuccess = function(e) {
					var cursor = e.target.result;
					if (cursor) {
						result.push(cursor.value)
						cursor.continue(); // 游标继续往下 搜索，重复触发 onsuccess方法，如果到到返回null
					} else {
						resolve(result)
					}
				}
			})
		})
	}
	/**
	 * 根据索引获取数据
	 */
	loadDataByIndex(table, indexName, indexValue) {
		return new Promise((resolve, reject) => {
			this.openIndexedDB().then((db) => {
				var trans = this.db.transaction(table, 'readwrite');
				var store = trans.objectStore(table);
				var cursorRequest = store.index(indexName).openCursor(IDBKeyRange.only(indexValue));
				cursorRequest.onsuccess = function(e) {
					var cursor = e.target.result;
					if (cursor) {
						resolve(cursor.value)
						cursor.continue(); // 游标继续往下 搜索，重复触发 onsuccess方法，如果到到返回null
					} else {
						resolve()
					}
				}
			})
		})
	}
	/**
	* 根据key获取数据
	*/
	loadDataBykey(table, key) {
		return new Promise((resolve, reject) => {
			this.openIndexedDB().then((db) => {
				//第二个参数可以省略
				var transaction = this.db.transaction(table, "readwrite");
				var store = transaction.objectStore(table);
				if (key)
					var request = store.get(key);
				else
					var request = store.getAll();

				request.onsuccess = function() {
					resolve(request.result);
				}
			})
		})

	}
	/**
	* 增加数据
	*/
	insert(table, json) {
		return new Promise((resolve, reject) => {
			this.openIndexedDB().then((db) => {
				// 创建一个事务
				var transaction = this.db.transaction(table, 'readwrite');

				// 通过事务来获取store
				var store = transaction.objectStore(table);

				var addPersonRequest = store.add(json);
				addPersonRequest.onsuccess = function(e) {
					resolve(json)
				}
				addPersonRequest.onerror = function(e) {
					reject(e.target.error);
				}
			})
		})
	}
	/**
	* 更新数据
	*/
	update(table, id, json) {
		return new Promise((resolve, reject) => {
			this.openIndexedDB().then((db) => {
				// 创建一个事务，类型：IDBTransaction，文档地址： https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction
				var transaction = this.db.transaction(table, 'readwrite');

				// 通过事务来获取IDBObjectStore
				var store = transaction.objectStore(table);
				var person = json;

				// 修改或者添加数据。 第一参数是要修改的数据，第二个参数是主键（可省略)
				var updatePersonRequest = store.get(id);
				
				// 监听添加成功事件
				updatePersonRequest.onsuccess = function(e) {
					// var p = e.target.result;  // 要修改的原对象
					store.put(person);
					resolve(json);
				};

				// 监听失败事件
				updatePersonRequest.onerror = function(e) {
					reject(e.target.error);
				};
			})
		})

	}
	/**
	* 根据id(key)删除数据
	*/
	remove(table, id) {
		return new Promise((resolve, reject) => {
			this.openIndexedDB().then((db) => {
				// 创建一个事务
				var transaction = this.db.transaction(table, 'readwrite');

				// 通过事务来获取store
				var store = transaction.objectStore(table);

				// 删除请求
				var delPersonRequest = store.delete(id);
				delPersonRequest.onsuccess = function(e) {
					resolve()
				}
				delPersonRequest.onerror = function(e) {
					reject(e.target.error);
				}
			})
		})

	}
	/**
	* 关闭数据库
	*/
	closeDB() {
		this.db.close();
	}
	/**
	* 删除数据库
	*/
	deleteDB(name) {
		indexedDB.deleteDatabase(name);
	}

}

module.exports = Db.getInstance();
