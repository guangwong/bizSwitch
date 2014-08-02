var bizSwitch = require("../../index");
var bizSwitchClient = bizSwitch.client;

var cluster = require("cluster");

process.on("message", function(message){
    if(message.cmd === "snapshotReq"){
        process.send({ 
            cmd : "snapshot" ,
            snapshot : bizSwitchClient.snapshot
        });
    }
});

bizSwitchClient.init().then(function () {
    process.send({ cmd : "bizSwitchServerInit", id : cluster.worker.id });
});

process.send({ cmd : "online" });
