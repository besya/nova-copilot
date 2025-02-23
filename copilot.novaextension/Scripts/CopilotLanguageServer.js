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
const helpers_1 = require("./helpers");
const Notification_1 = __importDefault(require("./Notification"));
class CopilotLanguageServer {
    constructor(commonSyntaxes) {
        this.languageClient = null;
        this.lastStatus = "";
        this.lspPath = "";
        this.nodePath = "";
        this.commonSyntaxes = commonSyntaxes;
        this.extraSyntaxes = [];
        // Observe the configuration setting for the node's location, and restart the server on change
        nova.config.observe("besya.copilot.node-path", (path) => {
            if (path == "") {
                new Notification_1.default("node has not been found").show();
                return;
            }
            this.nodePath = path;
            this.start();
        });
        // Observe the configuration setting for the server's location, and restart the server on change
        nova.config.observe("besya.copilot.language-server-path", (path) => {
            if (path == "") {
                new Notification_1.default("copilot-language-server has not been found").show();
                return;
            }
            this.lspPath = path;
            this.start();
        });
        // Observe configuration changes
        nova.config.onDidChange("besya.copilot", this.onDidChangeConfiguration, this);
    }
    start() {
        if (nova.inDevMode())
            console.log("Activating Copilot...");
        if (!this.nodePath || !this.lspPath) {
            console.log("Node path or language server path is not set.");
            return;
        }
        if (this.languageClient) {
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
        }
        // Create the client
        const serverOptions = {
            path: this.nodePath,
            args: [this.lspPath, "--stdio"],
            type: "stdio",
        };
        var clientOptions = {
            // debug: nova.inDevMode(),
            syntaxes: [...this.commonSyntaxes, ...this.extraSyntaxes],
            initializationOptions: {
                editorInfo: {
                    name: "Nova",
                    version: nova.versionString,
                },
                editorPluginInfo: {
                    name: nova.extension.name,
                    version: nova.extension.version,
                },
            },
        };
        var client = new LanguageClient("copilot-langserver", "Copilot Language Server", serverOptions, clientOptions);
        client.onDidStop(this.onDidStop, this);
        client.onNotification("didChangeStatus", this.onDidChangeStatus);
        try {
            if (nova.inDevMode())
                console.log("Starting Copilot Client...");
            // Start the client
            client.start();
            // Add the client to the subscriptions to be cleaned up
            nova.subscriptions.add(client);
            this.languageClient = client;
        }
        catch (err) {
            // If the .start() method throws, it's likely because the path to the language server is invalid
            if (nova.inDevMode()) {
                console.error(err);
            }
        }
    }
    isLanguageClientInitialized() {
        return this.languageClient !== null;
    }
    stop() {
        if (nova.inDevMode())
            console.log("Deactivating Copilot...");
        if (this.languageClient) {
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
            this.languageClient = null;
        }
    }
    auth(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.languageClient)
                return;
            try {
                const commandResponse = (yield this.languageClient.sendRequest("workspace/executeCommand", response.command));
                new Notification_1.default(`Authorized as ${commandResponse.user}`).show();
            }
            catch (error) {
                new Notification_1.default(error).show();
            }
        });
    }
    signIn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.languageClient)
                return;
            try {
                let response = (yield this.languageClient.sendRequest("signIn", {}));
                let notification = new Notification_1.default(response.userCode);
                notification.action("Cancel", () => { });
                notification.action("Sign in with Github", () => __awaiter(this, void 0, void 0, function* () { return yield this.auth(response); }));
                notification.show();
            }
            catch (error) {
                new Notification_1.default(error).show();
            }
        });
    }
    signOut() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.languageClient)
                return;
            try {
                yield this.languageClient.sendRequest("signOut", {});
                new Notification_1.default("Signed Out").show();
            }
            catch (error) {
                new Notification_1.default("Signed Out: \n" + error).show();
            }
        });
    }
    onDidChangeConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.languageClient)
                return;
            this.languageClient.sendNotification("workspace/didChangeConfiguration", {
                settings: nova.config.get("besya.copilot"),
            });
        });
    }
    onDidStop() {
        this.languageClient = null;
    }
    onDidChangeStatus(status) {
        switch (status.kind) {
            case "Error":
            case "Warning":
            case "Inactive":
                new Notification_1.default(status.message).show();
                break;
            case "Normal":
                break;
        }
    }
    getAllInlineCompletions(editor, range) {
        return __awaiter(this, void 0, void 0, function* () {
            const completions = yield this.getInlineCompletions(editor, range);
            return (completions === null || completions === void 0 ? void 0 : completions.items) || [];
        });
    }
    getInlineCompletion(editor, range) {
        return __awaiter(this, void 0, void 0, function* () {
            const completions = yield this.getAllInlineCompletions(editor, range);
            return completions[0] || null;
        });
    }
    getInlineCompletions(editor, range) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.languageClient)
                return;
            const position = (0, helpers_1.rangeToLspRange)(editor.document, range || editor.selectedRange);
            if (!position)
                return;
            const params = {
                textDocument: {
                    uri: editor.document.uri,
                    version: undefined,
                },
                position: {
                    line: position.end.line,
                    character: position.end.character,
                },
                context: { triggerKind: 2 },
                formattingOptions: {
                    tabSize: editor.tabLength,
                    insertSpaces: editor.softTabs,
                },
            };
            try {
                return (yield this.languageClient.sendRequest("textDocument/inlineCompletion", params));
            }
            catch (error) {
                console.log("textDocument/inlineCompletion: ", error);
            }
        });
    }
}
exports.default = CopilotLanguageServer;
