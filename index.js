const path = require('path');
const childProcess = require('child_process');
const util = require('util');

const ip = require('ip');

const Logger = require('./lib/logger');
const { ZKClient, CreateMode } = require('./lib/zkClient');

const exec = util.promisify(childProcess.exec);

/* config结构
 {
     "zookeeper":
     {
         "host": "192.168.20.203",
         "port": 2181,
         "prefix": "/staging/service/",
         "srvName": "myservice"
     },
     "shell":
     {
         "path": "./example/test.sh"
     },
     "log":
     {
         "dirpath": "./example/zk-agent/"
     }
 }
 */
async function live(config) {
    let isFirst = true;

    let { host, port, prefix, srvName } = config.zookeeper;

    //日志
    let loggerPath = path.join(config.log.dirpath, srvName);
    let logger = Logger(srvName, loggerPath);

    //zk实例
    let srvPrefix = prefix + srvName + '/';
    let zkClient = new ZKClient({ host, port, prefix: srvPrefix });

    //链接zookeeper
    await zkClient.connectAsync();
    logger.info('connected to zookeeper server');
    //创建临时节点
    let nodepath = zkClient.getRealKey(srvName + '-');

    let currentHostIp = ip.address();
    let data = {
        ip: currentHostIp,
        origin: srvName,
        isOnline: false
    };
    let bufData = Buffer.from(JSON.stringify(data));
    let tempNodePath = await zkClient.createAsync(nodepath, bufData, CreateMode.EPHEMERAL_SEQUENTIAL); //临时有序节点
    logger.info('created node', tempNodePath);

    //shell执行脚本
    let shellPath = path.join(__dirname, config.shell.path);

    logger.info('watch service status...');
    while (true) {
        logger.info('check status...');

        let onlineStatNow;
        try {
            await exec(`sh ${shellPath}`);
            onlineStatNow = true;
        } catch (error) {
            onlineStatNow = false;
        }

        if (onlineStatNow != data.isOnline) {
            logger.info('service status change [isOnline]:', onlineStatNow);

            data.isOnline = onlineStatNow;
            await zkClient.setJsonDataAsync(tempNodePath, data);
        }
        await sleep(10);
    }
}

/**
 * 休眠
 * @param  {[type]} seconds [description]
 * @return {[type]}         [description]
 */
function sleep(seconds) {
    return new Promise((reslove) => {
        setTimeout(reslove, seconds * 1000)
    })
};


module.exports = live;