'use strict';

var Support = require("./support");
var EventEmitter = require('events').EventEmitter;
var HTTP = require("http");

module.exports = new BizSwitchServer;
function BizSwitchServer() {

    var self = new EventEmitter;
    var switchs = null;
    var options = null;

    // ��ʼ����ڣ����ΪĬ�ϵĿ���
    self.init = function (myOptions) {
        options = myOptions;
        switchs = options.defaultSwitchs;
        self.createHttpServer();
    }

    // �ṩ���� HTTP ����
    self.createHttpServer = function(){
        var server = HTTP.createServer(function(req, res){

            var key = null;
            var val = null;

            if(!switchs.hasOwnProperty(key)){
                res.end("δ���忪��"+key);
                return;
            }

            res.end( self.switch(key, val) );

        });
        server.listen(options.port);
    }

    // ����һ�� Worker �� Snapshot
    function updateWorker(worker) {
        worker.send({
            cmd: Support.CMD_UPDATE_WORKER,
            snapshot: switchs
        });
    }

    // ����ȫ�� Workder �� Snapshot
    self.updateAll = function () {
        self.emit("updateAll");
    }

    // ���ŵ�һ�� Cluster ��
    self.attachToCluster = function (Cluster) {

        function handlerUpdateAll() {
            Cluster.workers.forEach(updateWorker);
        }

        // �ȴ����Ѿ����� Workers
        handlerUpdateAll();

        // ȫ�ָ���ʱ
        self.on("updateAll", handlerUpdateAll);

        // ��δ����������
        Cluster.on("online", function (worker) {
            updateWorker(worker);
        });

    }

    // �����̵���ʱֱ�Ӹ��Ÿ�һ�� Client
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

    // �л�һ������
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

