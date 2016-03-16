var EventEmitter = require('events').EventEmitter;

export default class Loop extends EventEmitter {
    constructor() {
        super();
        this.skipTicks = 1000 / 60;
        this.maxFrameSkip = 10;
        this.nextGameTick = Date.now();
    }

    start() {
        this.timerId = window.requestAnimationFrame(() => {
            this.main();
        });
    }

    main() {
        var loops = 0;

        while (Date.now() > this.nextGameTick && loops < this.maxFrameSkip) {
            this.emit('update');
            this.nextGameTick += this.skipTicks;
            loops++;
        }

        this.emit('draw');

        this.timerId = window.requestAnimationFrame(() => {
            this.main();
        });
    }
}
