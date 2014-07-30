'use strict';

var bizSwitch = require("../index");
var bizSwitchServer = bizSwitch.server;

var defaultSwitchs = {
    a : "enable",
    b : "disable"
}

bizSwitchServer.init({
    defaultSwitchs : defaultSwitchs,
    port : 1233
});

