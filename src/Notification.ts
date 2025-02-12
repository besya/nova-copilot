class Notification {
    id: string
    request: NotificationRequest
    actionTitles: string[] = []
    actions: ((reply: NotificationResponse) => void)[] = []

    constructor(body: string, title: string | null = null, id: string | null = null) {
        this.id = id || nova.crypto.randomUUID()
        this.request = new NotificationRequest(this.id)
        this.request.title = title || nova.extension.name
        this.request.body = body
    }

    input(
        defaultText: string,
        placeholder: string = "",
        type: "input" | "secure-input" | undefined = "input",
    ): Notification {
        this.request.type = type
        this.request.textInputValue = defaultText
        this.request.textInputPlaceholder = placeholder
        return this
    }

    action(title: string, callback: (reply: NotificationResponse) => void): Notification {
        this.actionTitles.push(title)
        this.actions.push(callback)
        return this
    }

    show(): Notification {
        this.request.actions = this.actionTitles

        nova.notifications.add(this.request).then((reply: NotificationResponse) => {
            if (reply.actionIdx !== null) {
                this.actions[reply.actionIdx](reply)
            }
        })

        return this
    }

    dismiss(): void {
        nova.notifications.cancel(this.id)
    }

    static error(msg: string): void {
        nova.workspace.showErrorMessage(msg)
    }
}

export default Notification
