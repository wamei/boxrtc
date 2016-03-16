import Com from './com.js';
import ChatInput from './chat-input.js';
import Loop from './loop.js';

document.addEventListener('DOMContentLoaded', () => {
    var myid = document.querySelector('#myid');
    var game = document.querySelector('#game');

    var join = document.querySelector('#join');
    var joinInput = join.querySelector('input');
    var joinButton = join.querySelector('.join');
    var list = document.querySelector('#list');
    var listButton = join.querySelector('.list');

    joinButton.addEventListener('click', () => {
        Com.connect(joinInput.value);
        joinInput.value = '';
        list.style.display = 'none';
    }, false);

    listButton.addEventListener('click', () => {
        Com.getList((idlist) => {
            list.innerHTML = '';
            idlist.forEach((id) => {
                if (id == Com.id) {
                    return;
                }
                var div = document.createElement('div');
                div.innerHTML = id;
                div.style.cursor = 'pointer';
                div.addEventListener('click', () => {
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
    var world = new b2World(
        new b2Vec2(0, 9.8),
        true
    );

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef;

    //create ground
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = 250 * SCALE;
    bodyDef.position.y = 500 * SCALE;
    bodyDef.userData = {
        name: 'ground'
    };
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(200 * SCALE, 40 * SCALE);
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    bodyDef.position.x = 900 * SCALE;
    bodyDef.position.y = 500 * SCALE;
    fixDef.shape = new b2PolygonShape;
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

        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.1;
        fixDef.restitution = 0.2;

        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        fixDef.shape = new b2PolygonShape;
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

        object.on('remove', () => {
            game.removeChild(object.$el);
            objects.splice(objects.indexOf(object), 1);
            world.DestroyBody(body);
        });
    }

    Com.on('open', function(id) {
        myid.innerHTML = 'My peer ID is: ' + id;
    });

    Com.on('connected', (player) => {
        join.style.display = 'none';
        list.style.display = 'none';
        add(player);
    });

    Com.on('closed', (player) => {
        player.remove();
        if (Object.keys(Com.connections).length == 0) {
            join.style.display = 'block';
        }
    });

    Com.on('message', (player,data) => {
        player.setName(data.text);
    });

    Com.on('force', (player, data) => {
        player.forceUpdate(data.x, data.y, data.angle, data.v, data.av);
    });

    Com.on('death', (player, data) => {
        player.death++;
    });

    add(Com.my);

    var loops = 0;
    var loop = new Loop();
    loop.start();
    loop.on('update', () => {
        world.Step(
            1 / 60   //frame-rate
            ,  10       //velocity iterations
            ,  10       //position iterations
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
            var v = Com.my.body.GetLinearVelocity();
            Com.send('force', {
                x: Com.my.x,
                y: Com.my.y,
                angle: Com.my.angle,
                v: {
                    x: v.x,
                    y: v.y
                },
                av: Com.my.body.GetAngularVelocity()
            });
        }
        objects.forEach((obj) => {
            obj.update();
        });

        if (Com.my.y > 10000) {
            var x = Math.random() * 900 + 100;
            Com.send('death', {});
            Com.my.forceUpdate(x, 0, 0, {x: 0, y: 0}, 0);
            Com.my.jumpNum = 0;
            Com.my.death++;
        }
    });
    loop.on('draw', () => {
        objects.forEach((obj) => {
            obj.$el.style.left = obj.x - obj.width / 2 + 'px';
            obj.$el.style.top = obj.y - obj.height / 2 + 'px';
            obj.$el.style.transform = 'rotate(' + obj.angle * 180 / Math.PI + 'deg)';
        });
    });

    var chat = document.querySelector('#chat');
    ChatInput.hide();
    chat.appendChild(ChatInput.$el);

    var lastKey = null;

    window.addEventListener('keydown', (event) => {
        var key = event.keyCode;
        //console.log(key);

        if (event.target == ChatInput.$input || event.target == joinInput) {
            return;
        }

        var body = Com.my.body;
        body.SetAwake(true);
        if (key === 13) {
            ChatInput.show();
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
            if (Com.my.jumpNum < 2&& v.y > -3) {
                body.SetLinearVelocity(new b2Vec2(v.x, -6));
                Com.my.jumpNum++;
            }
            event.preventDefault();
        }
        lastKey = key;
    }, false);

    ChatInput.callback = (message) => {
        Com.send('message', {
            text: message
        });
        Com.my.setName(message);
    };
}, false);
