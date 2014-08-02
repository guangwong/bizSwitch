//多进程模式的测试用例
var cluster = require("cluster");
var should = require('should');
var fork = require('child_process').fork;

var defaultSwitchs = {
    a : "enable",
    b : "disable"
}
var port = 7654;

describe("cluster", function(){

    var masterProcess = null;

    it("Master 可以启动", function(done){
        masterProcess = fork( __dirname + "/cluster.mode.master");
        masterProcess.send({});
        masterProcess.on("message", function(message){
            if(message.cmd === "online"){
                done();
            }
        });
    });

});
