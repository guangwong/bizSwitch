var support = require("../lib/support");
var should = require('should');

describe("support", function(){

    describe("#parseSwitchParamsByURL", function(){

        it("空串输入", function(){
            var ret = support.parseSwitchParamsByURL("");
            ret.should.instanceof(Error);
            ret.message.should.startWith("unknown action");
        });

        it("单正确 Action 输入", function(){
            var ret = support.parseSwitchParamsByURL("/switch");
            ret.should.not.instanceof(Error);
        });

        it("不正确 Action 输入", function(){
            var ret = support.parseSwitchParamsByURL("/dfdsfdsf");
            ret.should.instanceof(Error);
            ret.message.should.startWith("unknown action");
        });

        it("隐式自动填充 method getAll", function(){
            var ret = support.parseSwitchParamsByURL("/switch");
            ret.method.should.eql("getAll");
        });

        it("显式 getAll", function(){
            var ret = support.parseSwitchParamsByURL("/switch/getAll");
            ret.method.should.eql("getAll");
        });


        it("显式 get", function(){
            var ret = support.parseSwitchParamsByURL("/switch/get/ab");
            ret.method.should.eql("get");
            ret.key.should.eql("ab");
        });

        it("显式 get，无key", function(){
            var ret = support.parseSwitchParamsByURL("/switch/get");
            ret.should.instanceof(Error);
            ret.message.should.startWith("key miss");
        });

        it("显式 set", function(){
            var ret = support.parseSwitchParamsByURL("/switch/set/ab/cd");
            ret.method.should.eql("set");
            ret.key.should.eql("ab");
            ret.val.should.eql("cd");
        });


        it("显式 set，无val", function(){
            var ret = support.parseSwitchParamsByURL("/switch/set/ab");
            ret.should.instanceof(Error);
            ret.message.should.startWith("value miss");
        });

        it("显式 set，无key", function(){
            var ret = support.parseSwitchParamsByURL("/switch/set");
            ret.should.instanceof(Error);
            ret.message.should.startWith("key miss");
        });


        it("不加第一个 / ", function(){
            var ret = support.parseSwitchParamsByURL("switch/set/ab/cd");
            ret.method.should.eql("set");
            ret.key.should.eql("ab");
            ret.val.should.eql("cd");
        });

        it("结尾多一个 / ", function(){
            var ret = support.parseSwitchParamsByURL("/switch/");
            ret.method.should.eql("getAll");
        });


    });
});
