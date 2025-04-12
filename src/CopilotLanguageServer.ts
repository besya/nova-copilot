import type { InlineCompletionList } from 'vscode-languageserver-types'
import Notification from './Notification'
import { rangeToLspRange } from './helpers'

class CopilotLanguageServer {
  languageClient: LanguageClient | null = null
  lastStatus = ''
  lspPath = ''
  commonSyntaxes: string[]
  extraSyntaxes: string[]

  constructor(commonSyntaxes: string[]) {
    this.commonSyntaxes = commonSyntaxes
    this.extraSyntaxes = []

    // Observe the configuration setting for the server's location, and restart the server on change
    nova.config.observe(
      'besya.copilot.language-server-path',
      (path: string) => {
        if (path === '') {
          new Notification('copilot-language-server has not been found').show()
          return
        }
        this.lspPath = path
        this.start()
      },
    )

    // Observe configuration changes
    nova.config.onDidChange(
      'besya.copilot',
      this.onDidChangeConfiguration,
      this,
    )
  }

  start() {
    if (nova.inDevMode()) console.log('Activating Copilot...')

    if (!this.lspPath) {
      console.log('Language server path is not set.')
      return
    }

    if (this.languageClient) {
      this.languageClient.stop()
      nova.subscriptions.remove(this.languageClient)
    }

    // Create the client
    const serverOptions: ServerOptions = {
      path: this.lspPath,
      args: ['--stdio'],
      type: 'stdio',
    }

    const clientOptions = {
      // debug: nova.inDevMode(),
      syntaxes: [...this.commonSyntaxes, ...this.extraSyntaxes],
      initializationOptions: {
        editorInfo: {
          name: 'Nova',
          version: nova.versionString,
        },
        editorPluginInfo: {
          name: nova.extension.name,
          version: nova.extension.version,
        },
      },
    }

    const client = new LanguageClient(
      'copilot-langserver',
      'Copilot Language Server',
      serverOptions,
      clientOptions,
    )

    client.onDidStop(this.onDidStop, this)
    client.onNotification('didChangeStatus', this.onDidChangeStatus)

    try {
      if (nova.inDevMode()) console.log('Starting Copilot Client...')

      // Start the client
      client.start()
      // Add the client to the subscriptions to be cleaned up
      nova.subscriptions.add(client)
      this.languageClient = client
    } catch (err) {
      // If the .start() method throws, it's likely because the path to the language server is invalid

      if (nova.inDevMode()) {
        console.error(err)
      }
    }
  }

  isLanguageClientInitialized() {
    return this.languageClient !== null
  }

  stop() {
    if (nova.inDevMode()) console.log('Deactivating Copilot...')

    if (this.languageClient) {
      this.languageClient.stop()
      nova.subscriptions.remove(this.languageClient)
      this.languageClient = null
    }
  }

  async auth(response: SignInResponse) {
    if (!this.languageClient) return

    try {
      const commandResponse = (await this.languageClient.sendRequest(
        'workspace/executeCommand',
        response.command,
      )) as AuthResponse
      new Notification(`Authorized as ${commandResponse.user}`).show()
    } catch (error) {
      new Notification(error as string).show()
    }
  }

  async signIn() {
    if (!this.languageClient) return

    try {
      const response = (await this.languageClient.sendRequest(
        'signIn',
        {},
      )) as SignInResponse
      const notification = new Notification(response.userCode)
      notification.action('Cancel', () => { })
      notification.action(
        'Sign in with Github',
        async () => await this.auth(response),
      )
      notification.show()
    } catch (error) {
      new Notification(error as string).show()
    }
  }

  async signOut() {
    if (!this.languageClient) return
    try {
      await this.languageClient.sendRequest('signOut', {})
      new Notification('Signed Out').show()
    } catch (error) {
      new Notification(`Signed Out: \n${error}`).show()
    }
  }

  async onDidChangeConfiguration() {
    if (!this.languageClient) return
    this.languageClient.sendNotification('workspace/didChangeConfiguration', {
      settings: nova.config.get('besya.copilot'),
    })
  }

  onDidStop() {
    this.languageClient = null
  }

  onDidChangeStatus(status: StatusNotification) {
    switch (status.kind) {
      case 'Error':
      case 'Warning':
      case 'Inactive':
        new Notification(status.message).show()
        break
      case 'Normal':
        break
    }
  }

  async getAllInlineCompletions(editor: TextEditor, range?: Range) {
    const completions = await this.getInlineCompletions(editor, range)
    return completions?.items || []
  }

  async getInlineCompletion(editor: TextEditor, range?: Range) {
    const completions = await this.getAllInlineCompletions(editor, range)
    return completions[0] || null
  }

  async getInlineCompletions(editor: TextEditor, range?: Range) {
    if (!this.languageClient) return

    const position = rangeToLspRange(
      editor.document,
      range || editor.selectedRange,
    )
    if (!position) return

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
    }

    try {
      return (await this.languageClient.sendRequest(
        'textDocument/inlineCompletion',
        params,
      )) as InlineCompletionList
    } catch (error) {
      console.log('textDocument/inlineCompletion: ', error)
    }
  }
}

export default CopilotLanguageServer
