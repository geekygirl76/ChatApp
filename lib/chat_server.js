//join multiple rooms; private conversation; styling; chat across room!

function createChat(server){
    var io = require("socket.io")(server);
    var guestnumber = 0;
    var nicknames = {};
    var nicknameArray;
    var currentRooms = {};
    var nicknameRooms = {};
    var idHash ={};

    function joinRoom(roomName, socket){
        // socket.rooms.push(roomName);

        if (!currentRooms[roomName]){
            currentRooms[roomName] = [socket];
            nicknameRooms[roomName] = [nicknames[socket.id]];
        } else {
            currentRooms[roomName].push(socket);
            nicknameRooms[roomName].push(nicknames[socket.id]) ;
        }
        socket.join(roomName);

        nicknameArray = nicknameRooms[roomName];
        // console.log("nicknameArray: ",nicknameRooms[roomName]);
        io.sockets.to(roomName).emit("nicknames", {nicknames: nicknameArray.toString(), room: roomName});

        io.sockets.to(roomName).emit("newguest", {newguest: nicknames[socket.id]+" just entered the room."});
    };

    function leaveRoom(roomName, socket){
        // console.log("roomName before leave:", roomName);
        socket.leave(roomName);

        io.to(roomName).emit("leftmessage", {message: "(" + nicknames[socket.id]+ " just left the room."+")"});
        // console.log("nicknameRooms:", nicknameRooms);
 //        console.log("roomName:", roomName);
 //        console.log("nicknameArray: ",nicknameRooms[roomName]);
        nicknameArray = nicknameRooms[roomName];
        var i = nicknameArray.indexOf(nicknames[socket.id]);

        // console.log(nicknameArray);
 //        console.log(nicknames[socket.id]);
 //        console.log(i);

        nicknameArray.splice(i, 1);
        io.sockets.to(roomName).emit("nicknames", {nicknames: nicknameArray.toString(), room:roomName});
    };

    function handleRoomChangeRequests(room, socket){
        var oldroom = socket.rooms[1];
        // console.log("old room:", oldroom, "new room:", room);
        leaveRoom(oldroom, socket);
        joinRoom(room, socket);
    };



    io.on('connection', function(socket){


        guestnumber += 1;
        nicknames[socket.id] = "guest_" + guestnumber.toString();

        idHash[nicknames[socket.id]] = socket;
        joinRoom("lobby", socket);

        socket.emit("newname", {newname: nicknames[socket.id]});

        socket.on("roomChangeRequest", function(data){
            handleRoomChangeRequests(data.room, socket);
        });

        socket.on("message", function(data){
            if (!data.receiver){
                socket.rooms.slice(1).forEach(function(room){
                    io.sockets.to(room).emit("message", {"message": data.message,
                    nickname: nicknames[socket.id]});
                });
            } else {
                // console.log(idHash[data.receiver]);
                idHash[data.receiver].emit("message", {message: data.message,
                nickname: nicknames[socket.id]});
                socket.emit("message", {message: data.message,
                nickname: nicknames[socket.id]});
            }

        });

        socket.on("disconnect",function(){
            socket.rooms.slice(1).forEach(function(room){
                leaveRoom(room, socket);
            });


        });

        socket.on("nicknameChangeRequest", function(data){
            var oldname = nicknames[socket.id];
            var newname = data.nickname;

            var valid = true;
            Object.keys(nicknames).forEach(function(key){
                if (nicknames[key] == newname){
                    valid = false;
                }
            });
            if (valid){
                idHash[newname] = socket;
                socket.rooms.slice(1).forEach(function(room){
                    io.sockets.to(room).emit("message",
                    {message: oldname + " just changed name to " + newname+ "!"+ "\n"})
                });
                delete nicknames[socket.id];
                nicknames[socket.id] = newname.slice(0,newname.length);
                socket.emit("newname", {newname: nicknames[socket.id]});

                socket.rooms.slice(1).forEach(function(room){
                    nicknameArray = nicknameRooms[room];
                    //in nicknameArray, change the socket nickname to new one.
                    var i =nicknameArray.indexOf(oldname);
                    nicknameArray[i] = newname;
                    io.sockets.to(room).emit("nicknames", {nicknames: nicknameArray.toString(), room:room});
                });

            }

            socket.emit("nicknameChangeResult",{
                success: valid,
                message: "Name already taken!"

            });
        });
    });
}

exports.createChat = createChat;


