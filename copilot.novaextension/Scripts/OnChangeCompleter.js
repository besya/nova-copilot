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
const GhostCompleter_1 = __importDefault(require("./GhostCompleter"));
class OnChangeCompleter {
    constructor(editor, languageServer) {
        this.onChangeRegister = null;
        this.editor = editor;
        this.languageServer = languageServer;
        this.start();
    }
    start() {
        if (this.onChangeRegister) {
            this.onChangeRegister.dispose();
            this.onChangeRegister = null;
        }
        this.onChangeRegister = this.editor.onDidStopChanging(this.onDidStopChanging, this);
    }
    stop() {
        if (!this.onChangeRegister)
            return;
        this.onChangeRegister.dispose();
        this.onChangeRegister = null;
    }
    onDidStopChanging(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            const completion = yield this.languageServer.getInlineCompletion(editor);
            if (!completion)
                return;
            const completer = new GhostCompleter_1.default(editor);
            yield completer.apply(completion);
        });
    }
}
exports.default = OnChangeCompleter;
