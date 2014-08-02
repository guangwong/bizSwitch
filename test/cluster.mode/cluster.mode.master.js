var bizSwitch = require("../../index");
var bizSwitchServer = bizSwitch.server;
var EventEmitter = require('events').EventEmitter;
var cluster = require("cluster");
var Q = require("q");

var channel = new EventEmitter;

cluster.setupMaster({
    exec : __dirname + "/cluster.mode.worker.js"
});

process.on("message", function(message){
    channel.emit(message.cmd, message);
    if(message.cmd === "online"){
        done();
    }
});

channel.on("bizSwitchServerInitReq", function(message){
    bizSwitchServer.init(message.options).then(function(){
        process.send({ cmd : "bizSwitchServerInit" });
    });
});


channel.on("workerForkReq", function(message){

    var workers = [];

    for(var i = 0, len = message.num; i < len; i++){
        workers.push(cluster.fork());
    }
    
    Q.all(workers.map(workerInit)).then(function(ids){
        process.send({ cmd : "workerFork", ids:ids });
    });
    

});


channel.on("bizSwitchServerAttachReq", function(message){
    var workers = [];
    for(var i = 0, len = message.beforeFork; i < len; i++){
        workers.push(cluster.fork());
    }
    bizSwitchServer.attachToCluster(cluster);
    
    Q.all(workers.map(workerInit)).then(function(ids){
        process.send({ cmd : "bizSwitchServerAttach", ids:ids });
    });
    

});

channel.on("workerSnapshotsReq", function(message){

    var reqs = [];
    for(var key in cluster.workers){
        reqs.push(snapshotReq(cluster.workers[key]));
    }

    Q.all(reqs).then(function(snapshots){
        process.send({ cmd : "workerSnapshots" , snapshots : snapshots});
    });

});

channel.on("bizSwitchServerAttachSetSwitch", function(message){
    bizSwitchServer.setSwitch(message.key, message.val);
});


function workerInit(worker){
    
    return Q.Promise(function(resolve, reject){

        function handler(message){
            if(message.cmd === "bizSwitchServerInit"){
                worker.removeListener("message", handler);
                resolve(message.id);
            }
        }
        worker.on("message", handler);
    
        
    });
}

function snapshotReq(worker){


    return Q.Promise(function(resolve, reject){

        function handler(message){
            if(message.cmd === "snapshot"){
                worker.removeListener("message", handler);
                resolve(message.snapshot);
            }
        }
        worker.on("message", handler);
        worker.send({ cmd : "snapshotReq" });
    
        
    });
};


process.send({ cmd : "online" });
