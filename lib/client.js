'use strict';

var Support = require("./support");
var EventEmitter = require('events').EventEmitter;
var Q = require("q");

module.exports = new BizSwitchClient;

function BizSwitchClient(){

    var self = new EventEmitter;

    /**
     * Property snapshot
     * 获得 snapshot
     */
    self.snapshot = null;
    function updateSnapshot(snapshot){
        self.snapshot = snapshot;
    }

    /**
     * Method
     */
    self.init = function(options){
        return Q.Promise(function(resolve, reject){
            function handlerMessage(message, snapshot){
                if(message === Support.CMD_UPDATE_WORKER){
                    process.removeListener("message", handlerMessage);
                    updateSnapshot(snapshot);
                    resolve();
                }
            }
            process.on("message", handlerMessage);
        });
    }

}
