(function(){
    if (typeof ChatApp == "undefined"){
        window.ChatApp = {};
    }


    var Chat = ChatApp.Chat = function(socket){
        this.socket = socket;
    };

    Chat.rooms = ["lobby", "ruby", "python","c", "java"];

    Chat.prototype.processCommand = function(text){
        if (text.slice(0,6) == "/nick "){
            this.socket.emit("nicknameChangeRequest",{
                nickname: text.slice(6,text.length)
            });
        } else if(text.slice(0,6) == "/room "){

            var room = text.slice(6,text.length-1);

            if (Chat.rooms.indexOf(room) >-1){
                this.socket.emit("roomChangeRequest", {room: room});
            } else {
                 $("#display").append("<pre>[Not valid room name!]</pre>");
            }

        } else {
            $("#display").append("<pre>[Not valid command]</pre>");
        }
    };

    Chat.prototype.sendMessage = function(text){

        this.socket.emit("message", {message: text});

    }
})();