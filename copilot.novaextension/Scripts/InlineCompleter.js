"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = __importDefault(require("./Notification"));
const OnChangeCompleter_1 = __importDefault(require("./OnChangeCompleter"));
class InlineCompleter {
    constructor(languageServer) {
        this.enabled = false;
        this.languageServer = null;
        this.register = null;
        this.completers = [];
        this.languageServer = languageServer;
        nova.config.observe('besya.copilot.inline-completions-on-change', (enabled) => {
            if (this.enabled === enabled)
                return;
            this.enabled = enabled;
            enabled ? this.start() : this.stop();
            new Notification_1.default(`Inline Completions has been ${enabled ? 'enabled' : 'disabled'}`).show();
        }, this);
    }
    start() {
        this.stop();
        this.register = nova.workspace.onDidAddTextEditor((editor) => this.completers.push(new OnChangeCompleter_1.default(editor, this.languageServer)), this);
    }
    stop() {
        if (!this.register)
            return;
        for (const completer of this.completers) {
            completer.stop();
        }
        this.completers = [];
        this.register.dispose();
        this.register = null;
    }
}
exports.default = InlineCompleter;
