class callout {

    add (title = null, message = null, type = 'success', closable = true, el) {
        let callout = `<div class="callout ${type}">`;

        if (title) {
            callout += `
            <div class="callout-title">
                <svg><use xlink:href="${window.staticURL}/images/sprite.svg#${type}" /></use></svg>
                ${title}
            </div>`;
        }

        if (message) {
            if (typeof message === 'object') {
                message.forEach(line => {
                    callout += `<div class="callout-message">${line}</div>`;
                });
            } else {
                callout += `<div class="callout-message">${message}</div>`;
            }
        }

        callout += `
                <button class="close-button" aria-label="Dismiss alert" type="button" data-close>
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;

        const $callout = $(callout);
        $callout.find('.close-button').click(e => {
            $callout.remove();
        });

        $(el).prepend($callout);
    }

    primary (title, message, el, closable = true) {
        this.add(title, message, 'primary', closable = true, el);
    }

    success (title, message, el, closable = true) {
        this.add(title, message, 'success', closable = true, el);
    }

    error (title, message, el, closable = true) {
        this.add(title, message, 'alert', closable = true, el);
    }

    warning (title, message, el, closable = true) {
        this.add(title, message, 'warning', closable = true, el);
    }
}

const Callout = new callout();
export default Callout;