'use strict';

var Support = require("./support");
var EventEmitter = require('events').EventEmitter;
var Q = require("q");

module.exports = new BizSwitchClient;

function BizSwitchClient() {

    var self = new EventEmitter;

    /**
     * Property snapshot
     * 获得 snapshot
     */
    self.snapshot = null;
    function updateSnapshot(snapshot) {
        self.snapshot = snapshot;
    }

    self.init = function (options) {
        var ret;
        self.on("update", updateSnapshot);
        ret = Q.Promise(self.once.bind(self, "update"));
        process.on("message", function (message) {
            if (message.cmd === Support.CMD_UPDATE_WORKER) {
                self.emit("update", message.snapshot);
            }
        });
        return ret;
    }

    return self;

}
