import CopilotLanguageServer from "./CopilotLanguageServer"
import GhostCompleter from "./GhostCompleter"
import Notification from "./Notification"
import InlineCompleter from "./InlineCompleter"

let languageServer: CopilotLanguageServer | null = null
let inlineCompleter: InlineCompleter | null = null

export function activate() {
    languageServer = new CopilotLanguageServer()
    inlineCompleter = new InlineCompleter(languageServer)

    nova.commands.register("besya.copilot.signIn", signIn)
    nova.commands.register("besya.copilot.signOut", signOut)
    nova.commands.register("besya.copilot.inlineCompletion", inlineCompletion)
}

export function deactivate() {
    if (inlineCompleter) {
        inlineCompleter.stop()
        inlineCompleter = null
    }

    if (languageServer) {
        languageServer.stop()
        languageServer = null
    }
}

function showNotRunningNotification() {
    new Notification("Copilot Language Server is not running").show()
}

function signIn() {
    if (languageServer) {
        languageServer.signIn()
    } else {
        showNotRunningNotification()
    }
}

function signOut() {
    if (languageServer) {
        languageServer.signOut()
    } else {
        showNotRunningNotification()
    }
}

async function inlineCompletion() {
    const editor = nova.workspace.activeTextEditor
    if (!editor || !languageServer) {
        showNotRunningNotification()
        return
    }

    const completion = await languageServer.getInlineCompletion(editor)
    if (!completion) return

    await new GhostCompleter(editor).apply(completion)
}
