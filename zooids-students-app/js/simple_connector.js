/**
 * Created by charles Perin on 13/02/2017.
 */

var DEBUG_LEVEL_0 = 0,
    DEBUG_LEVEL_1 = 1,
    DEBUG_LEVEL_2 = 1,
    DEBUG_LEVEL_3 = 1,
    DEBUG_LEVEL_4 = 1,
    DEBUG_LEVEL_TMP = 1;

var LISTEN_TO_TYPE = "simple";

function SimpleZooidsConnector(param){

    var _self = this;

    _self.messagesBuffer = [];
    _self.ws = null;

    _self.p_socket = {
        server_url: param.server_url,
        app_url: param.app_url || "",
        port: param.port || 8080,
        security: param.security || "ws"
    };

    this.initConnection = function(callback){

        //check that websockets are supported
        if ('WebSocket' in window){
            debug.printMess(DEBUG_LEVEL_2,["WebSocket is supported"]);
        } else {
            debug.printErr(DEBUG_LEVEL_4,["WebSockets are not supported. Use Chrome"]);
        }

        var initDone = false;

        //init the connection with server
        _self.ws = new WebSocket(_self.p_socket.security+"://"+_self.p_socket.server_url+":"+_self.p_socket.port+"/"+_self.p_socket.app_url);

        _self.ws.onopen = function(e){

            /*Send a message to the console once the connection is established */
            debug.printMess(DEBUG_LEVEL_2,["Connection open!"]);

            _self.p_server = {
                width: null,
                height: null,
                nb: null,
                assignment: null
            };
        };

        _self.ws.onclose = function(){
            debug.printMess(DEBUG_LEVEL_2,["Connection is closed"]);
            callback.call("close");
        };

        _self.ws.onerror = function(error){
            debug.printErr(DEBUG_LEVEL_4,["Error detected",error]);
            callback.call("error");
        };

        //when receiving messages from server
        _self.ws.onmessage = function(e){
            debug.printMess(DEBUG_LEVEL_0,e.data);

            var server_message;
            try {
                server_message = JSON.parse(e.data);
            } catch(err) {
                console.error(err,e.data);//skip if invalid JSON
                _self.closeConnection();
            }

            _self.messageReceived(server_message);

            if(!initDone){
                initDone = true;
                callback.call("initDone");
            }
        };
    };

    this.closeConnection = function(){
        _self.ws.close();
    };

    this.isConnected = function(){
        if(_self.ws == null || _self.ws.readyState == 3) return false;
        return true;
    };

    this.sendMessageToServer = function(mess){
        debug.printMess(DEBUG_LEVEL_2,["Send message to server: ",mess]);
        _self.ws.send(JSON.stringify(mess));
    };


}
