//多进程模式的测试用例
var cluster = require("cluster");
var should = require('should');
var EventEmitter = require('events').EventEmitter;
var fork = require('child_process').fork;
var http = require("http");

var defaultSwitchs = {
    a : "enable",
    b : "disable"
}
var port = 7654;

describe("cluster", function(){

    var beforeFork = 2;
    var num = beforeFork;

    var masterProcess = null;
    var channel = new EventEmitter;
    
    // 跑完需要关闭进程
    after(function(){
        masterProcess.kill();
    });


    it("Master 可以启动", function(done){
        masterProcess = fork( __dirname + "/cluster.mode.master");
        channel.on("online",function(){
            done();
        });
        masterProcess.on("message", function(message){
            channel.emit(message.cmd, message);
        });
    });

    it("bizSwitchServer 可以启动", function(done){
        channel.once("bizSwitchServerInit", function(){
            done();
        });
        masterProcess.send({
            cmd : "bizSwitchServerInitReq",
            options : { port : port, defaultSwitchs : defaultSwitchs }
        });
    });


    it("可以附着给一个 Cluster，并可以更新给之前 Fork 的", function(done){

        channel.once("bizSwitchServerAttach", function(){
            channel.once("workerSnapshots", function(message){
                message.snapshots.length.should.eql(beforeFork);
                message.snapshots.forEach(function(snapshot){
                    snapshot.should.eql(defaultSwitchs);
                });
                done();
            });
            masterProcess.send({
                cmd : "workerSnapshotsReq"
            });
        });

        masterProcess.send({
            cmd         : "bizSwitchServerAttachReq",
            beforeFork  : beforeFork
        });

    });

    it("可以更新给之后 Fork 的", function(done){
        
        var myNum = 5;
        num += myNum;

        channel.once("workerFork", function(){
            channel.once("workerSnapshots", function(message){
                message.snapshots.length.should.eql(num);
                message.snapshots.forEach(function(snapshot){
                    snapshot.should.eql(defaultSwitchs);
                });
                done();
            });
            masterProcess.send({
                cmd : "workerSnapshotsReq"
            });
        });

        masterProcess.send({
            cmd         : "workerForkReq",
            num         : myNum
        });
        
    });

    it("可以用使用 switch 方法切换", function(done){

        masterProcess.send({
            cmd         : "bizSwitchServerAttachSetSwitch",
            key         : "a",
            val         : "disable"
        });

        setTimeout(function(){

            channel.once("workerSnapshots", function(message){
                message.snapshots.length.should.eql(num);
                message.snapshots.forEach(function(snapshot){
                    snapshot.a.should.eql("disable");
                });
                done();
            });
            masterProcess.send({
                cmd : "workerSnapshotsReq"
            });
        
        }, 50);
    });


    it("可以用使用 http 方法切换", function(done){

        var req =http.request({
            host : "127.0.0.1",
            port : port,
            path : "/switch/set/b/enable"
        }, function(res){

            setTimeout(function(){

                channel.once("workerSnapshots", function(message){
                    message.snapshots.length.should.eql(num);
                    message.snapshots.forEach(function(snapshot){
                        snapshot.b.should.eql("enable");
                    });
                    done();
                });
                masterProcess.send({
                    cmd : "workerSnapshotsReq"
                });
            
            }, 50);

        });

        req.end();

    });


});
