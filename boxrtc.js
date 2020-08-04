(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _com = require('./com.js');

var _com2 = _interopRequireDefault(_com);

var _chatInput = require('./chat-input.js');

var _chatInput2 = _interopRequireDefault(_chatInput);

var _loop = require('./loop.js');

var _loop2 = _interopRequireDefault(_loop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {
    var myid = document.querySelector('#myid');
    var game = document.querySelector('#game');

    var join = document.querySelector('#join');
    var joinInput = join.querySelector('input');
    var joinButton = join.querySelector('.join');
    var list = document.querySelector('#list');
    var listButton = join.querySelector('.list');

    joinButton.addEventListener('click', function () {
        _com2.default.connect(joinInput.value);
        joinInput.value = '';
        list.style.display = 'none';
    }, false);

    listButton.addEventListener('click', function () {
        _com2.default.getList(function (idlist) {
            list.innerHTML = '';
            idlist.forEach(function (id) {
                if (id == _com2.default.id) {
                    return;
                }
                var div = document.createElement('div');
                div.innerHTML = id;
                div.style.cursor = 'pointer';
                div.addEventListener('click', function () {
                    joinInput.value = div.innerHTML;
                    list.style.display = 'none';
                }, false);
                list.appendChild(div);
            });
            list.style.display = 'block';
        });
    }, false);

    var objects = [];

    var b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2BodyDef = Box2D.Dynamics.b2BodyDef,
        b2Body = Box2D.Dynamics.b2Body,
        b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
        b2Fixture = Box2D.Dynamics.b2Fixture,
        b2World = Box2D.Dynamics.b2World,
        b2MassData = Box2D.Collision.Shapes.b2MassData,
        b2Shape = Box2D.Collision.Shapes.b2Shape,
        b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
        b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
        b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
        b2Listener = Box2D.Dynamics.b2ContactListener;

    var SCALE = 1 / 100;
    var world = new b2World(new b2Vec2(0, 9.8), true);

    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef();

    //create ground
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = 250 * SCALE;
    bodyDef.position.y = 500 * SCALE;
    bodyDef.userData = {
        name: 'ground'
    };
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(200 * SCALE, 40 * SCALE);
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    bodyDef.position.x = 900 * SCALE;
    bodyDef.position.y = 500 * SCALE;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(200 * SCALE, 40 * SCALE);
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    //setup debug draw
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDraw.SetDrawScale(1 / SCALE);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);

    var listener = new b2Listener();
    function jumpNum(contact) {
        var a = contact.GetFixtureA().GetBody().GetUserData();
        var b = contact.GetFixtureB().GetBody().GetUserData();

        function resetJumpNum(player) {
            var v = player.body.GetLinearVelocity();
            if (v.y < 2 && v.y > -2) {
                player.jumpNum = 0;
            }
        }

        if (a.name == 'player' && b.name == 'ground') {
            resetJumpNum(a.object);
        }
        if (b.name == 'player' && a.name == 'ground') {
            resetJumpNum(b.object);
        }
        if (a.name == 'player' && b.name == 'player') {
            resetJumpNum(a.object);
            resetJumpNum(b.object);
        }
    }
    listener.BeginContact = jumpNum;
    world.SetContactListener(listener);

    function add(object) {
        game.appendChild(object.$el);
        objects.push(object);

        var fixDef = new b2FixtureDef();
        fixDef.density = 1.0;
        fixDef.friction = 0.1;
        fixDef.restitution = 0.2;

        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsBox(object.width / 2 * SCALE, object.height / 2 * SCALE);
        bodyDef.position.x = object.x * SCALE;
        bodyDef.position.y = object.y * SCALE;
        bodyDef.userData = {
            name: object.name,
            object: object
        };
        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixDef);
        object.setbody(body);

        object.on('remove', function () {
            game.removeChild(object.$el);
            objects.splice(objects.indexOf(object), 1);
            world.DestroyBody(body);
        });
    }

    _com2.default.on('open', function (id) {
        myid.innerHTML = 'My peer ID is: ' + id;
    });

    _com2.default.on('connected', function (player) {
        join.style.display = 'none';
        list.style.display = 'none';
        add(player);
    });

    _com2.default.on('closed', function (player) {
        player.remove();
        if (Object.keys(_com2.default.connections).length == 0) {
            join.style.display = 'block';
        }
    });

    _com2.default.on('message', function (player, data) {
        player.setName(data.text);
    });

    _com2.default.on('force', function (player, data) {
        player.forceUpdate(data.x, data.y, data.angle, data.v, data.av);
    });

    _com2.default.on('death', function (player, data) {
        player.death++;
    });

    add(_com2.default.my);

    var loops = 0;
    var loop = new _loop2.default();
    loop.start();
    loop.on('update', function () {
        world.Step(1 / 60 //frame-rate
        , 10 //velocity iterations
        , 10 //position iterations
        );
        world.DrawDebugData();
        world.ClearForces();
        for (var b = world.m_bodyList; b; b = b.m_next) {
            var object = b.m_userData ? b.m_userData.object ? b.m_userData.object : null : null;
            if (!object) {
                continue;
            }
            var xf = b.m_xf;
            object.x = xf.position.x / SCALE;
            object.y = xf.position.y / SCALE;
            object.angle = b.GetAngle();
        }
        loops++;
        if (loops > 0) {
            loops = 0;
            var v = _com2.default.my.body.GetLinearVelocity();
            _com2.default.send('force', {
                x: _com2.default.my.x,
                y: _com2.default.my.y,
                angle: _com2.default.my.angle,
                v: {
                    x: v.x,
                    y: v.y
                },
                av: _com2.default.my.body.GetAngularVelocity()
            });
        }
        objects.forEach(function (obj) {
            obj.update();
        });

        if (_com2.default.my.y > 10000) {
            var x = Math.random() * 900 + 100;
            _com2.default.send('death', {});
            _com2.default.my.forceUpdate(x, 0, 0, { x: 0, y: 0 }, 0);
            _com2.default.my.jumpNum = 0;
            _com2.default.my.death++;
        }
    });
    loop.on('draw', function () {
        objects.forEach(function (obj) {
            obj.$el.style.left = obj.x - obj.width / 2 + 'px';
            obj.$el.style.top = obj.y - obj.height / 2 + 'px';
            obj.$el.style.transform = 'rotate(' + obj.angle * 180 / Math.PI + 'deg)';
        });
    });

    var chat = document.querySelector('#chat');
    _chatInput2.default.hide();
    chat.appendChild(_chatInput2.default.$el);

    var lastKey = null;

    window.addEventListener('keydown', function (event) {
        var key = event.keyCode;
        //console.log(key);

        if (event.target == _chatInput2.default.$input || event.target == joinInput) {
            return;
        }

        var body = _com2.default.my.body;
        body.SetAwake(true);
        if (key === 13) {
            _chatInput2.default.show();
        } else if (key == 39) {
            var v = body.GetLinearVelocity();
            var x = v.x + 4 > 3 ? 3 : v.x + 4;
            body.SetLinearVelocity(new b2Vec2(x, v.y));
            event.preventDefault();
        } else if (key == 37) {
            var v = body.GetLinearVelocity();
            var x = v.x - 4 < -3 ? -3 : v.x - 4;
            body.SetLinearVelocity(new b2Vec2(x, v.y));
            event.preventDefault();
        } else if (key == 40) {
            body.SetAngularVelocity(10);
            event.preventDefault();
        } else if (key == 38) {
            body.SetAngularVelocity(-10);
            event.preventDefault();
        } else if (key == 66) {
            var v = body.GetLinearVelocity();
            var nvx = v.x;
            if (lastKey == 39) {
                nvx = v.x + 12;
            } else if (lastKey == 37) {
                nvx = v.x - 12;
            }
            var vx = nvx > 12 ? 12 : nvx < -12 ? -12 : nvx;
            body.SetLinearVelocity(new b2Vec2(vx, v.y));
            event.preventDefault();
        } else if (key == 32) {
            var v = body.GetLinearVelocity();
            if (_com2.default.my.jumpNum < 2 && v.y > -3) {
                body.SetLinearVelocity(new b2Vec2(v.x, -6));
                _com2.default.my.jumpNum++;
            }
            event.preventDefault();
        }
        lastKey = key;
    }, false);

    _chatInput2.default.callback = function (message) {
        _com2.default.send('message', {
            text: message
        });
        _com2.default.my.setName(message);
    };
}, false);
},{"./chat-input.js":2,"./com.js":3,"./loop.js":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChatInput = function () {
    function ChatInput() {
        var _this = this;

        _classCallCheck(this, ChatInput);

        this.$el = document.createElement('div');
        this.$input = document.createElement('input');
        this.$input.className = 'input';
        this.$el.appendChild(this.$input);

        this.$input.addEventListener('keydown', function (event) {
            var code = event.which || event.keyCode;
            if (code === 13) {
                _this.send();
            }
        }, false);
    }

    _createClass(ChatInput, [{
        key: 'send',
        value: function send() {
            var text = this.$input.value;

            if (!text) {
                this.hide();
                return;
            }

            this.$input.value = '';

            if (this.callback) {
                this.callback(text);
            }
            this.hide();
        }
    }, {
        key: 'isShown',
        value: function isShown() {
            return this.$el.style.display != 'none';
        }
    }, {
        key: 'show',
        value: function show() {
            this.$el.style.display = 'block';
            this.$input.focus();
        }
    }, {
        key: 'hide',
        value: function hide() {
            this.$el.style.display = 'none';
            this.$input.blur();
        }
    }]);

    return ChatInput;
}();

var chatInput = new ChatInput();
exports.default = chatInput;
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _player = require('./object/player.js');

var _player2 = _interopRequireDefault(_player);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;

var Com = function (_EventEmitter) {
    _inherits(Com, _EventEmitter);

    function Com() {
        _classCallCheck(this, Com);

        var _this = _possibleConstructorReturn(this, (Com.__proto__ || Object.getPrototypeOf(Com)).call(this));

        _this.peer = new Peer({ key: '7a864c39-8149-49da-9cf2-88706e3172d1' });
        _this.peer.on('open', function (id) {
            _this.id = id;
            _this.emit('open', id);
            _this.my.id = id;
            _this.my.setName(id);
        });
        _this.peer.on('connection', function (conn) {
            _this.spread(conn.peer);
            _this.onOpen(conn);
        });
        _this.peer.on('call', function (call) {
            call.answer(_this.my.stream);
            _this.onStream(call);
        });

        _this.connections = {};

        _this.my = new _player2.default();
        _this.my.x = 300;
        return _this;
    }

    _createClass(Com, [{
        key: 'connect',
        value: function connect(peer_id) {
            var _this2 = this;

            var conn = this.peer.connect(peer_id);
            this.onOpen(conn, function () {
                var call = _this2.peer.call(peer_id, _this2.my.stream);
                _this2.onStream(call);
            });
        }
    }, {
        key: 'onOpen',
        value: function onOpen(conn, callback) {
            var _this3 = this;

            conn.on('open', function () {
                _this3.connections[conn.peer] = new _player2.default(conn);

                conn.on('data', function (data) {
                    _this3.receive(data);
                });
                conn.on('close', function () {
                    var player = _this3.connections[conn.peer];
                    delete _this3.connections[conn.peer];
                    _this3.emit('closed', player);
                });

                _this3.sendInit(conn);

                if (callback) {
                    callback();
                }
            });
        }
    }, {
        key: 'onStream',
        value: function onStream(call) {
            var _this4 = this;

            call.on('stream', function (stream) {
                _this4.connections[call.peer].addVideo(stream);
                _this4.connections[call.peer].call = call;
            });
            call.on('err', function (err) {
                console.log(err);
                window.setTimeout(function () {
                    console.log('retry stream connection');
                    var call = _this4.peer.call(call.peer, _this4.my.stream);
                    _this4.onStream(call);
                }, 5000);
            });
        }
    }, {
        key: 'sendInit',
        value: function sendInit(conn) {
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
    }, {
        key: 'receive',
        value: function receive(data) {
            switch (data.type) {
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
    }, {
        key: 'spread',
        value: function spread(peer_id) {
            var _this5 = this;

            Object.keys(this.connections).forEach(function (key) {
                _this5.connections[key].conn.send({
                    type: 'spread',
                    params: peer_id
                });
            });
        }
    }, {
        key: 'send',
        value: function send(type, data) {
            var _this6 = this;

            Object.keys(this.connections).forEach(function (key) {
                _this6.connections[key].conn.send({
                    type: type,
                    params: {
                        id: _this6.id,
                        data: data
                    }
                });
            });
        }
    }, {
        key: 'getList',
        value: function getList(callback) {
            this.peer.listAllPeers(function (list) {
                callback(list);
            });
        }
    }]);

    return Com;
}(EventEmitter);

var com = new Com();
exports.default = com;
},{"./object/player.js":6,"events":7}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;

var Loop = function (_EventEmitter) {
    _inherits(Loop, _EventEmitter);

    function Loop() {
        _classCallCheck(this, Loop);

        var _this = _possibleConstructorReturn(this, (Loop.__proto__ || Object.getPrototypeOf(Loop)).call(this));

        _this.skipTicks = 1000 / 60;
        _this.maxFrameSkip = 10;
        _this.nextGameTick = Date.now();
        return _this;
    }

    _createClass(Loop, [{
        key: 'start',
        value: function start() {
            var _this2 = this;

            this.timerId = window.requestAnimationFrame(function () {
                _this2.main();
            });
        }
    }, {
        key: 'main',
        value: function main() {
            var _this3 = this;

            var loops = 0;

            while (Date.now() > this.nextGameTick && loops < this.maxFrameSkip) {
                this.emit('update');
                this.nextGameTick += this.skipTicks;
                loops++;
            }

            this.emit('draw');

            this.timerId = window.requestAnimationFrame(function () {
                _this3.main();
            });
        }
    }]);

    return Loop;
}(EventEmitter);

exports.default = Loop;
},{"events":7}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;
var SCALE = 1 / 100;

var Base = function (_EventEmitter) {
    _inherits(Base, _EventEmitter);

    function Base(width, height, x, y) {
        _classCallCheck(this, Base);

        var _this = _possibleConstructorReturn(this, (Base.__proto__ || Object.getPrototypeOf(Base)).call(this));

        _this.x = x || 0;
        _this.y = y || 0;
        _this.width = width || 0;
        _this.height = height || 0;
        _this.$el = document.createElement('div');
        _this.$el.style.width = _this.width + 'px';
        _this.$el.style.height = _this.height + 'px';
        _this.$el.style.position = 'absolute';
        _this.angle = 0;

        _this.name = 'object';
        return _this;
    }

    _createClass(Base, [{
        key: 'forceUpdate',
        value: function forceUpdate(x, y, angle, v, av) {
            this.x = x;
            this.y = y;
            this.angle = angle || 0;
            this.body.SetPosition(new Box2D.Common.Math.b2Vec2(x * SCALE, y * SCALE));
            this.body.SetAngle(this.angle);
            this.body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(v.x, v.y));
            this.body.SetAngularVelocity(av);
            this.body.SetAwake(true);
        }
    }, {
        key: 'setbody',
        value: function setbody(body) {
            this.body = body;
        }
    }, {
        key: 'remove',
        value: function remove() {
            this.emit('remove');
        }
    }, {
        key: 'update',
        value: function update() {}
    }]);

    return Base;
}(EventEmitter);

exports.default = Base;
},{"events":7}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Player = function (_Base) {
  _inherits(Player, _Base);

  function Player(conn, stream) {
    _classCallCheck(this, Player);

    var _this = _possibleConstructorReturn(this, (Player.__proto__ || Object.getPrototypeOf(Player)).call(this, 100, 100));

    _this.id = conn ? conn.peer : null;
    _this.conn = conn;
    _this.call = null;

    _this.death = 0;
    _this.jumpNum = 0;

    _this.$el.style.border = 'solid 1px #000';
    _this.$el.style.backgroundColor = '#fff';
    _this.$el.className += ' player';

    _this.$video = document.createElement('video');
    _this.$name = document.createElement('p');
    _this.$el.appendChild(_this.$video);
    _this.$el.appendChild(_this.$name);

    _this.$death = document.createElement('div');
    _this.$death.className = 'death';
    _this.$el.appendChild(_this.$death);

    if (stream) {
      _this.addVideo(stream);
    } else if (!conn && !stream) {
      navigator.webkitGetUserMedia({
        video: {
          mandatory: {
            maxWidth: 100,
            maxHeight: 80,
            maxFrameRate: 24
          }
        }, audio: true
      }, function (stream) {
        _this.addVideo(stream, true);
        _this.$jump = document.createElement('div');
        _this.$jump.className = 'jump';
        _this.$el.appendChild(_this.$jump);
      }, function (err) {
        console.log(err);
      });
    }

    _this.setName(_this.id);
    _this.name = 'player';
    return _this;
  }

  _createClass(Player, [{
    key: 'setName',
    value: function setName(name) {
      this.$name.innerHTML = name;
    }
  }, {
    key: 'addVideo',
    value: function addVideo(stream, my) {
      this.$video.srcObject = stream;
      this.$video.play();
      this.stream = stream;

      if (my) {
        this.$video.muted = true;
      }
    }
  }, {
    key: 'update',
    value: function update() {
      this.$death.innerHTML = this.death;
      // if (this.$jump) {
      //     this.$jump.innerHTML = 2 - this.jumpNum;
      // }
    }
  }]);

  return Player;
}(_base2.default);

exports.default = Player;
},{"./base.js":5}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[1]);
