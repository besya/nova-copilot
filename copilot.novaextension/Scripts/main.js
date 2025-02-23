"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const CopilotLanguageServer_1 = __importDefault(require("./CopilotLanguageServer"));
const GhostCompleter_1 = __importDefault(require("./GhostCompleter"));
const Notification_1 = __importDefault(require("./Notification"));
const InlineCompleter_1 = __importDefault(require("./InlineCompleter"));
const syntaxes_1 = __importDefault(require("./syntaxes"));
let languageServer = null;
let inlineCompleter = null;
function activate() {
    languageServer = new CopilotLanguageServer_1.default(syntaxes_1.default);
    inlineCompleter = new InlineCompleter_1.default(languageServer);
    nova.commands.register("besya.copilot.signIn", signIn);
    nova.commands.register("besya.copilot.signOut", signOut);
    nova.commands.register("besya.copilot.inlineCompletion", inlineCompletion);
}
function deactivate() {
    if (inlineCompleter) {
        inlineCompleter.stop();
        inlineCompleter = null;
    }
    if (languageServer) {
        languageServer.stop();
        languageServer = null;
    }
}
function showNotRunningNotification() {
    new Notification_1.default("Copilot Language Server is not running").show();
}
function signIn() {
    if (languageServer) {
        languageServer.signIn();
    }
    else {
        showNotRunningNotification();
    }
}
function signOut() {
    if (languageServer) {
        languageServer.signOut();
    }
    else {
        showNotRunningNotification();
    }
}
function inlineCompletion() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = nova.workspace.activeTextEditor;
        if (!editor || !languageServer) {
            showNotRunningNotification();
            return;
        }
        const completion = yield languageServer.getInlineCompletion(editor);
        if (!completion)
            return;
        yield new GhostCompleter_1.default(editor).apply(completion);
    });
}
