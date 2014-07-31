//单进程模式的测试用例
var should = require('should');
var bizSwitch = require("../index");
var bizSwitchServer = bizSwitch.server;
var bizSwitchClient = bizSwitch.client;

var defaultSwitchs = {
    a : "enable",
    b : "disable"
}
var port = 7654;

describe("self", function(){

    it("可以启动，并且返回正确", function(done){
        bizSwitchClient.init().then(function(){
            done();
        });
        bizSwitchServer.init({
            defaultSwitchs : defaultSwitchs,
            port : port
        });
        bizSwitchServer.attachToSelf();
    });

    it("Snapshot初始正确", function(){
        bizSwitchClient.snapshot.should.eql(defaultSwitchs);
    });

    it("开关切换正确", function(done){
        bizSwitchClient.once("update", function(){
            bizSwitchClient.snapshot.should.eql({
                a : "disable",
                b : "disable"
            });
            done();
        });
        bizSwitchServer.setSwitch("a", "disable");
    });

});
