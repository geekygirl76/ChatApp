(function(){
    if (typeof ChatApp == "undefined"){
        window.ChatApp = {};
    }


    var Chat = ChatApp.Chat = function(socket){
        this.socket = socket;
    };

    Chat.prototype.processCommand = function(text){
        if (text.slice(0,6) == "/nick "){
            this.socket.emit("nicknameChangeRequest",{
                nickname: text.slice(6,text.length)
            });
        }  else {
            $("#display").append("<pre>[Not valid command]</pre>");
        }
    };

    Chat.prototype.sendMessage = function(text){

        this.socket.emit("message", {message: text});

    }
})();