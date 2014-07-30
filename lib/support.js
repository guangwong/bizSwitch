'use strict';
var URL = require("url");
var Path = require("path");

exports.CMD_UPDATE_WORKER = "bizSwitchUpdate";
exports.Get = "Get";
exports.Set = "Set";
exports.GetAll = "GetAll";

// 解析开关设置的参数
exports.parseSwitchParamsByURL = function (url) {

    try {
        var path = URL.parse(url).path.replace(/^\//, "");
        var arrPath = path.split(Path.sep);

        var action = arrPath[0];
        var method = arrPath[1];

        if (action !== "switch") {
            throw new Error("unknown action " + action);
        }

        if (arrPath.length === 1) {
            method = "getAll";
        }

        switch (method) {
            case "getAll":
                return {
                    method: method
                };
                break;
            case "get":
                if (!arrPath.hasOwnProperty(2)) {
                    throw new Error("key miss");
                }
                return {
                    method: method,
                    key: arrPath[2]
                };
                break;
            case "set":
                if (!arrPath.hasOwnProperty(2)) {
                    throw new Error("key miss");
                }
                if (!arrPath.hasOwnProperty(3)) {
                    throw new Error("value miss");
                }
                return {
                    method: method,
                    key: arrPath[2],
                    val: arrPath[3]
                };
                break;
            default :
                throw new Error("unknown method " + method);
                break;
        }

    } catch (err) {
        return err;
    }
}
