function createChat(server){
    var io = require("socket.io")(server);
    var guestnumber = 0;
    var nicknames = {};
    var nicknameArray;
    var currentRooms = {};
    var nicknameRooms = {};

    function joinRoom(roomName, socket){

        if (!currentRooms[roomName]){
            currentRooms[roomName] = [socket];
            nicknameRooms[roomName] = [nicknames[socket.id]];
        } else {
            currentRooms[roomName].push(socket);
            nicknameRooms[roomName].push([nicknames[socket.id]]) ;
        }
        socket.join(roomName);
        nicknameArray = nicknameRooms[roomName];
        io.sockets.to(roomName).emit("nicknames", {nicknames: nicknameArray.toString(), room: roomName});

        io.sockets.to(roomName).emit("newguest", {newguest: nicknames[socket.id]+" just entered the room."});
    };

    function leaveRoom(roomName, socket){
        socket.leave(roomName);
        io.to(roomName).emit("leftmessage", {message: "(" + nicknames[socket.id]+ " just left the room."+")"});
        delete nicknames[socket.id];
        nicknameArray = nicknameRooms[roomName];
        var i = nicknameArray.indexOf(nicknames[socket.id]);
        nicknameArray.remove(i);
        io.sockets.to(roomName).emit("nicknames", {nicknames: nicknameArray.toString()});
    }

    io.on('connection', function(socket){


        guestnumber += 1;
        nicknames[socket.id] = "guest_" + guestnumber.toString();


        joinRoom("lobby", socket);

        socket.on("message", function(data){

            io.sockets.emit("message", {"message": data.message,
            nickname: nicknames[socket.id]});


        });

        socket.on("disconnect",function(){
            leaveRoom("lobby", socket);

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


