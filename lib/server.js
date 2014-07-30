'use strict';

var Support = require("./support");
var EventEmitter = require('events').EventEmitter;
var HTTP = require("http");
var _ = require("underscore");

module.exports = new BizSwitchServer;
function BizSwitchServer() {

    var self = new EventEmitter;
    var switchs = null;
    var options = null;

    // 初始化入口，入参为默认的开关
    self.init = function (myOptions) {
        options = myOptions;
        switchs = options.defaultSwitchs;
        createHttpServer();
    }

    // 获得全部开关
    self.getAllSwitchs = function(){
        return cloneSwitchs();
    }

    // 获得单个开关
    self.getSwitch = function(key){
        return switchs[key];
    }

    // 设置单个开关
    self.setSwitch = function(key, val){
        return switchs[key] = val;
    }

    // 更新一个 Worker 的 Snapshot
    function updateWorker(worker) {
        worker.send({
            cmd: Support.CMD_UPDATE_WORKER,
            snapshot: cloneSwitchs()
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
    self.attachToSelf = function (client) {

        process.emit("message", {
            cmd: Support.CMD_UPDATE_WORKER,
            snapshot: cloneSwitchs()
        });

        self.on("updateAll", function () {
            process.emit("message", {
                cmd: Support.CMD_UPDATE_WORKER,
                snapshot: cloneSwitchs()
            });
        });

    }

    // 提供对外 HTTP 服务
    function createHttpServer() {
        var server = HTTP.createServer(function (req, res) {

            var params = Support.parseSwitchParamsByURL(req.url);

            if(params instanceof Error){
                res.end(params.message);
                return;
            }

            switch(params.method){

                case "getAll":
                    res.end(JSON.stringify(self.getAllSwitchs()));
                    break;

                case "get":
                case "set":
                    if(!switchs.hasOwnProperty(params.key)){
                        res.end("unknown switch " + params.key);
                        return;
                    }
                    if(params.method === "get"){
                        res.end(JSON.stringify(self.getSwitch(params.key)));
                        return;
                    }
                    if(params.method === "set"){
                        res.end(JSON.stringify(self.setSwitch(params.key, params.val)));
                        return;
                    }
                    break;

                default :
                    res.end("unknown method " + params.method);
                    break;
            }


        });
        server.listen(options.port);
    }

    // Clone Switchs
    function cloneSwitchs() {
        return _.clone(switchs);
    }

    return self;
}

