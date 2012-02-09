
var sockio = require("socket.io");

var io = sockio.listen(8889);

console.log("Here!");

// Users

var users = {};

// Perhaps could store messages into mongodb
// Perhaps mongodb should be used from beginning

// Register user
function register(socket, msg, cont) {
    if (!msg.id) {
        cont({error:"Need to give identifier to register"});
        return;
    }
    if (users[msg.id]) {
        cont({error:"Already registered", nick: users[msg.id].nick});
        return;
    }
    var user = {};
    user.nick = msg.nick || "WTF?";
    user.id = msg.id;
    user.sockets = [];
    user.queued_messages = [];
    user.friends = [];
    users[msg.id] = user;
    cont({msg:"success", nick:user.nick});
    // cont("success");
}

// Connect socket to user
function connect(socket, msg, cont) {
    if (!msg.id || !users[msg.id]) {
        cont({error:"Not registered"});
        return;
    }
    if (socket.user_id) {
        cont({error:"Already connected"});
        return;
    }
    var user = users[msg.id];
    user.sockets.push(socket);
    socket.user_id = msg.id;
    cont({msg:"success"});
}

// Call request, already has peerconnection open. The message should include a control message.
function call(socket, msg, cont) {
    // Send to all sockets of user
    if (!socket.user_id) {
        cont({error:"Unconnected socket"});
        return;
    }
    if (!msg.id || !users[msg.id]) {
        cont({error:"Not registered"});
        return;
    }
    var calling_user = users[socket.user_id];
    msg.caller = {id:calling_user.id, nick: calling_user.nick};
    // msg.caller_nick = calling_user.nick;
    msg.caller_socket = socket.uniq_id;
    var user = users[msg.id];
    user.sockets.forEach(function (s) {
        // To accept the call, just peer connection needs to be established, no more server interaction is needed
        // Can the continuation be used several times?
        if (s.uniq_id != socket.uniq_id) s.emit("call", msg, function (reply) {
            reply.socket = s.uniq_id;
            reply.user = {id: user.id, nick: user.nick};
            cont(reply);
        });
    });
}

// Send control message
function control(socket, msg, cont) {
    if (!msg.to || !sockets[msg.to]) {
        if (cont) cont({error:"Unknown destination"});
        return;
    }
    msg.from = socket.uniq_id;
    sockets[msg.to].emit("control_call", msg);
}

function hangup(socket, msg, cont) {
    if (!msg.to || !sockets[msg.to]) {
        console.log(cont);
        if (cont) cont({error:"Unknown destination"});
        return;
    }
    msg.from = socket.uniq_id;
    sockets[msg.to].emit("hangup_call", msg);
}

// Request users
function list(socket, msg, cont) {
    var res = [];
    try {
        var regex = new RegExp(msg.search_string);
        for (var i in users) {
            var u = users[i];
            if (u.nick.match(regex)) res.push({id:u.id, nick:u.nick});
        }
    }
    // Bad regex
    catch (e) {}
    cont(res);
}

var sockets = ["foo"];

io.sockets.on("connection", function (socket) {
    // socket.on("register", function (msg, cont) { cont("foo"); });
    // New socket connection, add to list
    socket.uniq_id = sockets.length;
    sockets.push(socket);
    // Register handlers
    socket.on("register", function (msg, cont) {
        register(socket, msg, cont);
    });
    socket.on("connect_user", function (msg, cont) {
        connect(socket, msg, cont);
    });
    socket.on("list", function (msg, cont) { list(socket, msg, cont); });
    socket.on("call", function (msg, cont) { call(socket, msg, cont); });
    socket.on("control_call", function (msg, cont) { control(socket, msg, cont); });
    socket.on("hangup_call", function (msg, cont) { hangup(socket, msg, cont); });
});

