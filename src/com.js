import Player from './object/player.js';

var EventEmitter = require('events').EventEmitter;

class Com extends EventEmitter {
    constructor() {
        super();
        this.peer = new Peer({key: '59ba085c-f078-4edd-8fdc-d8efe298aa8d'});
        this.peer.on('open', (id) => {
            this.id = id;
            this.emit('open', id);
            this.my.id = id;
            this.my.setName(id);
        });
        this.peer.on('connection', (conn) => {
            this.spread(conn.peer);
            this.onOpen(conn);
        });
        this.peer.on('call', (call) => {
            call.answer(this.my.stream);
            this.onStream(call);
        });

        this.connections = {};

        this.my = new Player();
        this.my.x = 300;
    }

    connect(peer_id) {
        var conn = this.peer.connect(peer_id);
        this.onOpen(conn, () => {
            var call = this.peer.call(peer_id, this.my.stream);
            this.onStream(call);
        });
    }

    onOpen(conn, callback) {
        conn.on('open', () => {
            this.connections[conn.peer] = new Player(conn);

            conn.on('data', (data) => {
                this.receive(data);
            });
            conn.on('close', () => {
                var player = this.connections[conn.peer];
                delete this.connections[conn.peer];
                this.emit('closed', player);
            });

            this.sendInit(conn);

            if (callback) {
                callback();
            }
        });
    }

    onStream(call) {
        call.on('stream', (stream) => {
            this.connections[call.peer].addVideo(stream);
            this.connections[call.peer].call = call;
        });
        call.on('err', (err) => {
            console.log(err);
            window.setTimeout(() => {
                console.log('retry stream connection');
                var call = this.peer.call(call.peer, this.my.stream);
                this.onStream(call);
            }, 5000);
        });
    }

    sendInit(conn) {
        conn.send({
            type: 'init',
            params: {
                id: this.id,
                pos: {
                    x: this.my.x,
                    y: this.my.y
                },
                name: this.my.$name.innerHTML,
                death: this.my.death
            }
        });
    }

    receive(data) {
        switch(data.type) {
        case 'init':
            var player = this.connections[data.params.id];
            var pos = data.params.pos;
            player.x = pos.x;
            player.y = pos.y;
            player.setName(data.params.name);
            player.death = data.params.death;
            this.emit('connected', player);
            break;
        case 'spread':
            this.connect(data.params);
            break;
        default:
            this.emit(data.type, this.connections[data.params.id], data.params.data);
            break;
        }
    }

    spread(peer_id) {
        Object.keys(this.connections).forEach((key) => {
            this.connections[key].conn.send({
                type: 'spread',
                params: peer_id
            });
        });
    }

    send(type, data) {
        Object.keys(this.connections).forEach((key) => {
            this.connections[key].conn.send({
                type: type,
                params: {
                    id: this.id,
                    data: data
                }
            });
        });
    }

    getList(callback) {
        this.peer.listAllPeers(function(list){
            callback(list);
        });
    }
}

var com = new Com();
export default com;
