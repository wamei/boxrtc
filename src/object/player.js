import Base from './base.js';

export default class Player extends Base {
    constructor(conn, stream) {
        super(100, 100);

        this.id = conn ? conn.peer : null;
        this.conn = conn;
        this.call = null;

        this.death = 0;
        this.jumpNum = 0;

        this.$el.style.border = 'solid 1px #000';
        this.$el.style.backgroundColor = '#fff';
        this.$el.className += ' player';

        this.$video = document.createElement('video');
        this.$name = document.createElement('p');
        this.$el.appendChild(this.$video);
        this.$el.appendChild(this.$name);

        this.$death = document.createElement('div');
        this.$death.className = 'death';
        this.$el.appendChild(this.$death);

        if (stream) {
            this.addVideo(stream);
        } else if (!conn && !stream) {
            navigator.webkitGetUserMedia({video: {
                mandatory: {
                    maxWidth: 100,
                    maxHeight: 80,
                    maxFrameRate: 24
                }
            }, audio: true}, (stream) => {
                this.addVideo(stream, true);
                this.$jump = document.createElement('div');
                this.$jump.className = 'jump';
                this.$el.appendChild(this.$jump);
            }, (err) => {
                console.log(err);
            });
        }

        this.setName(this.id);
        this.name = 'player';
    }

    setName(name) {
        this.$name.innerHTML = name;
    }

    addVideo(stream, my) {
        this.$video.src = window.URL.createObjectURL(stream);
        this.$video.play();
        this.stream = stream;

        if (my) {
            this.$video.setAttribute('muted', '');
        }
    }

    update() {
        this.$death.innerHTML = this.death;
        // if (this.$jump) {
        //     this.$jump.innerHTML = 2 - this.jumpNum;
        // }
    }
}
