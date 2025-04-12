import CopilotLanguageServer from './CopilotLanguageServer'
import GhostCompleter from './GhostCompleter'
import InlineCompleter from './InlineCompleter'
import Notification from './Notification'
import commonSyntaxes from './syntaxes'

let languageServer: CopilotLanguageServer | null = null
let inlineCompleter: InlineCompleter | null = null

export function activate() {
  nova.commands.register('besya.copilot.signIn', signIn)
  nova.commands.register('besya.copilot.signOut', signOut)
  nova.commands.register('besya.copilot.inlineCompletion', inlineCompletion)
  nova.commands.register('besya.copilot.restart', createOrRestartLSP)
  nova.commands.register('besya.copilot.stop', stopLSP)

  stopLSP()
  createOrRestartLSP()
}

export function deactivate() {
  stopLSP()
}

function showNotRunningNotification() {
  new Notification('Copilot Language Server is not running').show()
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

function createOrRestartLSP() {
  stopLSP()
  languageServer = new CopilotLanguageServer(commonSyntaxes)
  inlineCompleter = new InlineCompleter(languageServer)
}

function stopLSP() {
  if (inlineCompleter) {
    inlineCompleter.stop()
    inlineCompleter = null
  }

  if (languageServer) {
    languageServer.stop()
    languageServer = null
  }
}
