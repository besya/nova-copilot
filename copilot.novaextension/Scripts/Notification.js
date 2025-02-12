"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Notification {
    constructor(body, title = null, id = null) {
        this.actionTitles = [];
        this.actions = [];
        this.id = id || nova.crypto.randomUUID();
        this.request = new NotificationRequest(this.id);
        this.request.title = title || nova.extension.name;
        this.request.body = body;
    }
    input(defaultText, placeholder = "", type = "input") {
        this.request.type = type;
        this.request.textInputValue = defaultText;
        this.request.textInputPlaceholder = placeholder;
        return this;
    }
    action(title, callback) {
        this.actionTitles.push(title);
        this.actions.push(callback);
        return this;
    }
    show() {
        this.request.actions = this.actionTitles;
        nova.notifications.add(this.request).then((reply) => {
            if (reply.actionIdx !== null) {
                this.actions[reply.actionIdx](reply);
            }
        });
        return this;
    }
    dismiss() {
        nova.notifications.cancel(this.id);
    }
    static error(msg) {
        nova.workspace.showErrorMessage(msg);
    }
}
exports.default = Notification;
