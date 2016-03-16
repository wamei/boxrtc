class ChatInput {
    constructor() {
        this.$el = document.createElement('div');
        this.$input = document.createElement('input');
        this.$input.className = 'input';
        this.$el.appendChild(this.$input);

        this.$input.addEventListener('keydown', (event) => {
            var code = event.which || event.keyCode;
            if (code === 13) {
                this.send();
            }
        }, false);
    }

    send() {
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

    isShown() {
        return this.$el.style.display != 'none';
    }

    show() {
        this.$el.style.display = 'block';
        this.$input.focus();
    }

    hide() {
        this.$el.style.display = 'none';
        this.$input.blur();
    }
}
var chatInput = new ChatInput();
export default chatInput;
