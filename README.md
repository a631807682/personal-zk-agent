zk-agent
=====

## 描述
用于监控服务运行状态

## 说明

1. 配置文件
	```
	 {
	     "zookeeper":
	     {
	         "host": "127.0.0.1",
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
	```
2. zookeeper节点值
	```
	{
	    "ip": "10.66.241.12",
	    "origin": "myservice",
	    "isOnline": true
	}
	```