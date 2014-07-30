'use strict';

var meta = require("./meta");
var bizSwitch = require("../index");
var bizSwitchServer = bizSwitch.server;
var bizSwitchClient = bizSwitch.client;

var defaultSwitchs = {
    a : "enable",
    b : "disable"
}

bizSwitchServer.init({
    defaultSwitchs : meta.defaultSwitchs,
    port : 1233
});

bizSwitchClient.init().then(function(){
    console.log("bizSwitchServer 启动成功", bizSwitchClient.snapshot);
});

bizSwitchServer.attachToSelf();