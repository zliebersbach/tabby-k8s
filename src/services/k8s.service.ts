import { Injectable } from '@angular/core'
import { CoreV1Api, Exec, KubeConfig } from '@kubernetes/client-node'
import { ResizableStream } from '@kubernetes/client-node/dist/terminal-size-queue'
import { Observable, Subject } from 'rxjs'
import { Logger, LogService } from 'tabby-core'
import { PassThrough } from 'stream'

export interface Container {
    namespace: string
    podName: string
    containerName: string
}

class ResizablePassThrough extends PassThrough implements ResizableStream {

    public rows: number = 0
    public columns: number = 0

    public resize(w: number, h: number): void {
        this.rows = h
        this.columns = w
        this.emit('resize', w, h)
    }

}

export class K8sProcess {
    private stdout = new ResizablePassThrough()
    private stdin = new PassThrough()
    get output$(): Observable<Buffer> { return this.output }
    get closed$(): Observable<void> { return this.closed }
    private output = new Subject<Buffer>()
    private closed = new Subject<void>()
    private dead = false

    constructor(
        private exec: Exec,
        private namespace: string,
        private podName: string,
        private containerName: string,
        private command: string[],
    ) {
        this.stdout.on('data', data => this.output.next(data))
    }

    async start(): Promise<void> {
        const socket = await this.exec.exec(
            this.namespace,
            this.podName,
            this.containerName,
            this.command,
            this.stdout,
            this.stdout,
            this.stdin,
            true,
        )

        socket.on('close', () => {
            this.dead = true
            this.close()
        })
    }

    async resize(w: number, h: number): Promise<void> {
        this.stdout.resize(w, h)
    }

    write(data: Buffer) {
        if (!this.dead) {
            this.stdin.write(data)
        }
    }

    async stop(): Promise<void> {
        this.write(Buffer.from([31])) // Ctrl-_
        return new Promise(resolve => {
            this.closed$.subscribe(() => resolve())
        });
    }

    private close() {
        this.output.complete()
        this.closed.next()
        this.closed.complete()
    }
}

@Injectable({ providedIn: 'root' })
export class K8sService {
    logger: Logger
    kc: KubeConfig

    constructor(log: LogService) {
        this.logger = log.create('k8s')
        this.kc = new KubeConfig();
        this.kc.loadFromDefault();
    }

    async listContainers(): Promise<Container[]> {
        const k8sApi = this.kc.makeApiClient(CoreV1Api);
        const pods = await k8sApi.listPodForAllNamespaces();

        return pods.items.flatMap(pod => {
            return pod.spec.containers.map(container => ({
                namespace: pod.metadata.namespace,
                podName: pod.metadata.name,
                containerName: container.name,
            }))
        })
    }

    async exec(namespace: string, podName: string, containerName: string, command: string | string[]): Promise<K8sProcess> {
        if (!Array.isArray(command)) {
            command = [command]
        }

        this.logger.info('exec', command, 'in', namespace, podName, containerName)

        const exec = new Exec(this.kc)
        return new K8sProcess(exec, namespace, podName, containerName, command)
    }

}