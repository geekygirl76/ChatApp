function createChat(server){
    var io = require("socket.io")(server);
    var guestnumber = 0;
    var nicknames = {};
    var nicknameArray;
    var currentRooms = {};

    function joinRoom(roomName, socket){
        if (!currentRooms[roomName]){
            currentRooms[roomName] = [socket];
        } else {
            currentRooms[roomName].push(socket);
        }
        socket.join(roomName);
    };

    io.on('connection', function(socket){
        joinRoom("lobby", socket);
        nicknameArray = [];
        guestnumber += 1;
        nicknames[socket.id] = "guest_" + guestnumber.toString();

        Object.keys(nicknames).forEach(function(key){
            nicknameArray.push(nicknames[key]);
        });

        io.sockets.emit("nicknames", {nicknames: nicknameArray.toString()});

        io.sockets.emit("newguest", {newguest: nicknames[socket.id]+" just entered the room."});

        socket.on("message", function(data){

            io.sockets.emit("message", {"message": data.message,
            nickname: nicknames[socket.id]});


        });

        socket.on("disconnect",function(){

            io.sockets.emit("leftmessage", {message: "(" + nicknames[socket.id]+ " just left the room."+")"});
            delete nicknames[socket.id];
            nicknameArray = [];
            Object.keys(nicknames).forEach(function(key){
                nicknameArray.push(nicknames[key]);
            });

            io.sockets.emit("nicknames", {nicknames: nicknameArray.toString()});
        });

        socket.on("nicknameChangeRequest", function(data){
            var newname = data.nickname;
            var valid = true;
            Object.keys(nicknames).forEach(function(key){
                if (nicknames[key] == newname){
                    valid = false;
                }
            });
            if (valid){
                delete nicknames[socket.id];
                nicknames[socket.id] = newname.slice(0,newname.length-1);
                nicknameArray = [];
                Object.keys(nicknames).forEach(function(key){
                    nicknameArray.push(nicknames[key]);
                });
                io.sockets.emit("nicknames", {nicknames: nicknameArray.toString()});
            }
            socket.emit("nicknameChangeResult",{
                success: valid,
                message: "Name already taken!"
            });
        });
    });
}

exports.createChat = createChat;


