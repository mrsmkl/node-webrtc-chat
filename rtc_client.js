
// Make a socket io connection

function Client(url) {
    this.socket = io.connect(url);
    this.id = localStorage.getItem("rtc_id");
    this.localStream = null;
    var self = this;
    this.socket.on("control_call", function (msg) {
        console.log("Received message " + JSON.stringify(msg));
        var pc = self.connections[msg.from];
        if (pc.waiting) {
            var npc = createPeerConnection(self, pc.caller_socket);
            npc.caller = pc.caller;
            npc.caller_socket = pc.caller_socket;
            npc.processSignalingMessage(msg.data);
            npc.addStream(self.localStream);
            self.connections[msg.from] = npc;
        }
        else if (pc) pc.processSignalingMessage(msg.data);
    });
    this.socket.on("call", function (msg, cont) {
        if (self.localStream && self.oncall) self.oncall(msg, function () { self.acceptCall(msg, cont); });
    });
    this.socket.on("hangup_call", function (msg, cont) {
        if (self.onhangup) self.onhangup(msg, cont);
    });
    this.connections = {};
}

exports.Client = Client;

function createPeerConnection(client, id) {
    try {
        var pc = new webkitPeerConnection("STUN stun.l.google.com:19302", function (e) { client.signal(id, e); });
        pc.onaddstream = function (e) { client.addStream(id, e); };
        pc.onremovestream = function (e) { client.removeStream(id, e); };
        pc.onconnecting = function (e) { console.log("Connecting " + id); };
        pc.onopen = function (e) { console.log("Opening " + id); };
        pc.onstatechange = function (e) { console.log("State change: " + id); };
        return pc;
    }
    catch (e) {
        console.log(e);
    }
}

Client.prototype.call = function (id, cont) {
    // Cannot create peerconnection before knows the name of target socket
    var self = this;
    this.socket.emit("call", {id:id}, function (obj) {
        console.log("Making call");
        console.log(obj);
        if (!obj.error) {
            var pc = {waiting: true, caller: obj.user, caller_socket: obj.socket};
            self.connections[obj.socket] = pc;
            /*
            createPeerConnection(self, obj.socket);
            pc.addStream(self.localStream);
            self.connections[obj.socket] = pc;
            pc.caller = id;
            pc.caller_socket = obj.socket;
            */
        }
        cont(obj);
    });
};

Client.prototype.acceptCall = function (msg, cont) {
    var pc = createPeerConnection(this, msg.caller_socket);
    // pc.processSignalingMessage(msg.data);
    this.connections[msg.caller_socket] = pc;
    pc.caller = msg.caller;
    pc.caller_socket = msg.caller_socket;
    pc.addStream(this.localStream);
    cont({msg:"Accepted"});
};

Client.prototype.iterConnections = function (f) {
    for (var i in this.connections) f(i, this.connections[i]);
};

Client.prototype.signal = function (id, e) {
    console.log("Signalling data");
    this.socket.emit("control_call", {to:id, data:e});
};

Client.prototype.addStream = function (id, e) {
    if (this.onaddstream) this.onaddstream(id, webkitURL.createObjectURL(e.stream));
};

Client.prototype.removeStream = function (id, e) {
    if (this.onremovestream) this.onremovestream(id, e);
};

// Store user id into localStorage
Client.prototype.register = function (id, nick, cont) {
    this.id = id;
    this.socket.emit("register", {id:id, nick:nick}, function (obj) {
        if (!obj.error) localStorage.setItem("rtc_id", id);
        cont(obj);
    });
};

Client.prototype.connect = function (cont) {
    if (!this.id) cont({error:"No identity"});
    else this.socket.emit("connect_user", {id:this.id}, cont);
};

Client.prototype.disconnect = function () {
    this.socket.disconnect();
};

Client.prototype.search = function (str, cont) {
    this.socket.emit("list", {search_string:str}, cont);
};

Client.prototype.hangup = function (id, cont) {
    var pc = this.connections[id];
    if (!pc) {
        cont({error:"Unknown call"});
        return;
    }
    pc.close();
    this.socket.emit("hangup_call", {to:id}, cont);
};

/*

var cl = new last.Client("http://192.168.0.7:8889");
cl.oncall = function (msg, accept) { accept(); };
cl.register("mrsmkl@gmail.com", "Sami_ZzZ", function (x) { console.log(x); });
cl.register("sanna.tuohimaa@gmail.com", "Sanna_ZzZ", function (x) { console.log(x); });
cl.connect(function (x) { console.log(x); });
cl.search(".*", function (x) { console.log(x); });

cl.call("sanna.tuohimaa@gmail.com", function (x) { console.log(x); });

*/



