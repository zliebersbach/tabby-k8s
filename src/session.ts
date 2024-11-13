import * as shellQuote from 'shell-quote'
import { Injector } from '@angular/core'
import { LogService } from 'tabby-core'
import { BaseSession } from 'tabby-terminal'
import { K8sProfile } from './profiles'
import { K8sProcess, K8sService } from './services/k8s.service'

export class K8sSession extends BaseSession {
    private k8s: K8sService
    private process: K8sProcess|undefined

    constructor (injector: Injector, private profile: K8sProfile) {
        super(injector.get(LogService).create(`k8s-${profile.options.namespace}-${profile.options.podName}-${profile.options.containerName}`))
        this.k8s = injector.get(K8sService)
    }

    async start (): Promise<void> {
        let args: string|string[] = this.profile.options.command || '/bin/sh'
        if (args && args[0].length > 0) {
            args = shellQuote.parse(args)
        }

        const containers = await this.k8s.listContainers()
        if (!containers.find(container => 
            container.namespace === this.profile.options.namespace &&
            container.podName === this.profile.options.podName &&
            container.containerName === this.profile.options.containerName
        )) {
            throw new Error(`Container ${this.profile.name} not found`)
        }

        this.emitOutput(Buffer.from(`Attaching to ${this.profile.name}\r\n`))
        this.process = await this.k8s.exec(
            this.profile.options.namespace,
            this.profile.options.podName,
            this.profile.options.containerName,
            args
        )
        this.process.output$.subscribe(data => {
            this.emitOutput(data)
        })
        this.process.closed$.subscribe(() => this.destroy())
        await this.process.start()
        this.logger.info('Attached')
        this.open = true
    }

    resize (columns: number, rows: number): void {
        this.process?.resize(columns, rows)
    }

    write (data: Buffer): void {
        this.process?.write(data)
    }

    kill (): void {
        this.process?.stop()
    }

    async gracefullyKillProcess (): Promise<void> {
        this.process?.stop()
    }

    supportsWorkingDirectory (): boolean {
        return false
    }

    async getWorkingDirectory (): Promise<null> {
        return null
    }
}