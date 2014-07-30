'use strict';
var bizSwitch = require("../index");
var bizSwitchClient = bizSwitch.client;
var cluster = require("cluster");
var workerId = cluster.worker.id;

console.log("worker " + workerId + " starting");

bizSwitchClient.init().then(function () {
    console.log("worker " + workerId + " bizSwitchClient 启动成功", bizSwitchClient.snapshot);
});

bizSwitchClient.on("update", function () {
    console.log("worker " + workerId + " bizSwitchClient update", bizSwitchClient.snapshot);
});