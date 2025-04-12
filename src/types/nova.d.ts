interface Crypto {
  randomUUID(): string
}

interface Environment {
  readonly crypto: Crypto
}

interface Workspace {
  onDidAddTextEditor(
    callback: (editor: TextEditor) => void,
    thisValue?: object,
  ): Disposable
}

interface TextEditor {
  startShadowTyping(ranges: [Range], charset?: Charset): void
  onDidStopChanging(
    callback: (textEditor: TextEditor) => void,
    thisValue?: object,
  ): Disposable
}

interface TextEditorEdit {
  replace(range: Range, text: string, format?: InsertTextFormat)
  onDidStopChanging(
    callback: (editor: TextEditor) => void,
    thisValue?: object,
  ): Disposable
}

interface Configuration {
  onDidChange<T>(
    key: string,
    callback: (newValue: T, oldValue: T) => void,
    thisValue?: object,
  ): Disposable
}

interface LanguageClient extends Disposable {}

interface ServerOptions {
  type?: 'stdio' | 'socket' | 'pipe'
  path: string
  args?: string[]
  env?: { [key: string]: string }
}
