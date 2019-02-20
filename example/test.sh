#!/bin/sh

function isOnline() {
	rt=`netstat -ano | grep 9998`
	echo "command result"$rt

	#字符串返回空表示失败 非空表示成功
	if [ -z "$rt" ]; then 
	    return 1
	fi

	if [ -n "$rt" ]; then 
	    return 0
	fi
}

if isOnline; then
  exit 0
else
  exit 1
fi


