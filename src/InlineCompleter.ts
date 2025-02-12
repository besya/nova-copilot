import OnChangeCompleter from "./OnChangeCompleter"
import CopilotLanguageServer from "./CopilotLanguageServer"
import Notification from "./Notification"

class InlineCompleter {
    enabled = false
    languageServer: CopilotLanguageServer | null = null
    register: Disposable | null = null
    completers: Array<OnChangeCompleter> = []

    constructor(languageServer: CopilotLanguageServer) {
        this.languageServer = languageServer

        nova.config.observe(
            "besya.copilot.inline-completions-on-change",
            (enabled: boolean) => {
                if (this.enabled == enabled) return
                this.enabled = enabled
                enabled ? this.start() : this.stop()
                new Notification("Inline Completions has been " + (enabled ? "enabled" : "disabled")).show()
            },
            this,
        )
    }

    start() {
        this.stop()

        this.register = nova.workspace.onDidAddTextEditor(
            (editor: TextEditor) =>
                this.completers.push(new OnChangeCompleter(editor, this.languageServer as CopilotLanguageServer)),
            this,
        )
    }
    stop() {
        if (!this.register) return
        this.completers.forEach((completer) => completer.stop())
        this.completers = []
        this.register.dispose()
        this.register = null
    }
}

export default InlineCompleter
