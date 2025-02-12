import GhostCompleter from "./GhostCompleter"
import CopilotLanguageServer from "./CopilotLanguageServer"

class OnChangeCompleter {
    editor: TextEditor
    languageServer: CopilotLanguageServer
    onChangeRegister: Disposable | null = null

    constructor(editor: TextEditor, languageServer: CopilotLanguageServer) {
        this.editor = editor
        this.languageServer = languageServer
        this.start()
    }

    start() {
        if (this.onChangeRegister) {
            this.onChangeRegister.dispose()
            this.onChangeRegister = null
        }
        this.onChangeRegister = this.editor.onDidStopChanging(this.onDidStopChanging, this)
    }

    stop() {
        if (!this.onChangeRegister) return
        this.onChangeRegister.dispose()
        this.onChangeRegister = null
    }

    async onDidStopChanging(editor: TextEditor) {
        const completion = await this.languageServer.getInlineCompletion(editor)
        if (!completion) return
        const completer = new GhostCompleter(editor)
        await completer.apply(completion)
    }
}

export default OnChangeCompleter
