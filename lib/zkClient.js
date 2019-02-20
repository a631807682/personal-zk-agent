const zookeeper = require('node-zookeeper-client');
const { CreateMode, State } = zookeeper;

class ZKClient extends zookeeper.Client {

    constructor({ host, port, prefix }) {
        super(`${host}:${port}`);
        this.prefix = prefix;
    }

    async connectAsync() {
        return new Promise((reslove, reject) => {
            let prefix = this.prefix;
            let state = this.getState();
            if (state === State.DISCONNECTED) {
                this.once('connected', () => {
                    //创建父节点
                    this.mkdirpAsync(prefix.substr(0, prefix.length - 1)).then(reslove);
                });

                this.connect();
            } else {
                reslove()
            }
        })
    }

    getRealKey(key) {
        return this.prefix + key;
    }

    /**
     * 获取json数据
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    async getJsonDataAsync(...args) {
        return this.getDataAsync(...args).then(data => {
            let __data = data.toString('utf8');
            return JSON.parse(__data);
        })
    }

    /**
     * 写json
     * @param {[type]} path    [description]
     * @param {[type]} data    [description]
     * @param {[type]} version [description]
     */
    async setJsonDataAsync(path, data) {
        let __data = JSON.stringify(data);
        return this.setDataAsync(path, Buffer.from(__data, 'utf8'))
    }


    /**
     * watch值变动并返回变动值
     * @param  {[type]} realKey [description]
     * @return {[type]}         [description]
     */
    async watchDataChange(realKey) {
        return new Promise((reslove, reject) => {
            this.getDataAsync(realKey, (event) => { //一次性触发器
                if (event.getName() === 'NODE_DATA_CHANGED') { //值变动
                    this.getJsonDataAsync(realKey).then(reslove);
                } else {
                    reject(`ZKClient.watchDataChange watch error: realKey:${realKey} event:${event.name} `);
                }
            })
        })
    }

    closeIfConnected() {
        let state = this.getState();
        if (state === State.CONNECTED) {
            this.close();
        }
    }

}

module.exports = {
    ZKClient,
    CreateMode
};