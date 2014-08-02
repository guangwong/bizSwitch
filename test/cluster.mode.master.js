var bizSwitch = require("../index");
var bizSwitchServer = bizSwitch.server;

process.send({
    cmd : "online"
});
