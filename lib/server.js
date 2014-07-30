'use strict';

var Support = require("./support");
var EventEmitter = require('events').EventEmitter;
var HTTP = require("http");

module.exports = new BizSwitchServer;
function BizSwitchServer() {

    var self = new EventEmitter;
    var switchs = null;
    var options = null;

    // 初始化入口，入参为默认的开关
    self.init = function (myOptions) {
        options = myOptions;
        switchs = options.defaultSwitchs;
        self.createHttpServer();
    }

    // 提供对外 HTTP 服务
    self.createHttpServer = function(){
        var server = HTTP.createServer(function(req, res){

            var key = null;
            var val = null;

            if(!switchs.hasOwnProperty(key)){
                res.end("未定义开关"+key);
                return;
            }

            res.end( self.switch(key, val) );

        });
        server.listen(options.port);
    }

    // 更新一个 Worker 的 Snapshot
    function updateWorker(worker) {
        worker.send({
            cmd: Support.CMD_UPDATE_WORKER,
            snapshot: switchs
        });
    }

    // 更新全部 Workder 的 Snapshot
    self.updateAll = function () {
        self.emit("updateAll");
    }

    // 附着到一个 Cluster 上
    self.attachToCluster = function (Cluster) {

        function handlerUpdateAll() {
            Cluster.workers.forEach(updateWorker);
        }

        // 先处理已经存在 Workers
        handlerUpdateAll();

        // 全局更新时
        self.on("updateAll", handlerUpdateAll);

        // 绑定未来将产生的
        Cluster.on("online", function (worker) {
            updateWorker(worker);
        });

    }

    // 单进程调试时直接附着给一个 Client
    self.attachToSelf = function(client){

        process.emit("message", {
            cmd: Support.CMD_UPDATE_WORKER,
            snapshot: switchs
        });

        self.on("updateAll", function(){
            process.emit("message", {
                cmd: Support.CMD_UPDATE_WORKER,
                snapshot: switchs
            });
        });

    }

    // 切换一个开关
    self.switch = function (key, val) {

        if (val) { // Set
            return switchs[key] = val;
        } else if (key) { // Get
            return switchs[key];
        } else { // Get All
            return switchs;
        }

    }

    return self;
}

