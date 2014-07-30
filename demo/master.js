'use strict';

var meta = require("./meta");
var cluster = require("cluster");
var bizSwitch = require("../index");
var bizSwitchServer = bizSwitch.server;

cluster.setupMaster({
    exec : __dirname + "/worker.js"
});

cluster.fork();
cluster.fork();
bizSwitchServer.init({
    defaultSwitchs : meta.defaultSwitchs,
    port : 1233
}).then(function(){
        console.log("bizSwitchServer 启动成功");
        bizSwitchServer.attachToCluster(cluster);
        cluster.fork();
        cluster.fork();
        setTimeout(function(){
            cluster.fork();
            cluster.fork();
        }, 1000);
});

