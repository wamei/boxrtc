var EventEmitter = require('events').EventEmitter;
var SCALE = 1 / 100;

export default class Base extends EventEmitter{
    constructor(width, height, x, y) {
        super();
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
        this.$el = document.createElement('div');
        this.$el.style.width = this.width + 'px';
        this.$el.style.height = this.height + 'px';
        this.$el.style.position = 'absolute';
        this.angle = 0;

        this.name = 'object';
    }

    forceUpdate(x, y, angle, v, av) {
        this.x = x;
        this.y = y;
        this.angle = angle || 0;
        this.body.SetPosition(new Box2D.Common.Math.b2Vec2(x * SCALE, y * SCALE));
        this.body.SetAngle(this.angle);
        this.body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(v.x, v.y));
        this.body.SetAngularVelocity(av);
        this.body.SetAwake(true);
    }

    setbody(body) {
        this.body = body;
    }

    remove() {
        this.emit('remove');
    }

    update() {
    }
}
