interface Command {
  command: string
  arguments: string[]
  title: string
}

interface SignInResponse {
  userCode: string
  command: Command
}

interface StatusNotification {
  message: string
  kind: 'Normal' | 'Error' | 'Warning' | 'Inactive'
}

interface AuthResponse {
  user: string
}
