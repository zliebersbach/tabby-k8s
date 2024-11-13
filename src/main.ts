import { KubeConfig, Exec, CoreV1Api } from '@kubernetes/client-node';
import * as readlinePromises from 'node:readline/promises';

interface KubeContainer {
    namespace: string;
    podName: string;
    containerName: string;
}

class KubeAPI {
    private kc: KubeConfig;

    constructor() {
        this.kc = new KubeConfig();
        this.kc.loadFromDefault();
    }

    async getAllPods() {
        const k8sApi = this.kc.makeApiClient(CoreV1Api);
        return await k8sApi.listPodForAllNamespaces();
    }

    async execCommand(namespace: string, podName: string, containerName: string, command: string[]) {
        process.stdin.resume(); // Resume stdin if it was stopped by readline
        process.stdin.setRawMode(true);

        const exec = new Exec(this.kc);
        const socket = await exec.exec(
            namespace,
            podName,
            containerName,
            command,
            process.stdin,
            process.stdout,
            process.stdin,
            process.stdin.isTTY,
        );

        return new Promise<void>((resolve, reject) => {
            socket.on('close', (code, signal) => {
                socket.close();
                if (code === 1000) {
                    resolve();
                } else {
                    reject(new Error(`Command failed with code ${code}`));
                }
            });
        });
    }
}


const k8s = new KubeAPI();
const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: process.stdin.isTTY,
});

// Show the list of pods
rl.write('Fetching list of pods...\n');
const pods = await k8s.getAllPods();
const containers: KubeContainer[] = [];
pods.body.items.forEach(pod => {
    pod.spec!.containers.forEach(container => {
        containers.push({
            namespace: pod.metadata!.namespace!,
            podName: pod.metadata!.name!,
            containerName: container.name,
        });
    });
});
containers.forEach((container, index) => {
    rl.write(`[${index}] ${container.namespace}/${container.podName}/${container.containerName}\n`);
});
const containerIndex = await rl.question('Enter the number of the container to connect to: ');
const container = containers[parseInt(containerIndex)];

// User inputs command to execute in the pod
const command = await rl.question('Enter the command to execute in the pod (default /bin/sh): ') || '/bin/sh';
rl.close();

// Execute a command in the pod
try {
    await k8s.execCommand(container.namespace, container.podName, container.containerName, command.split(' '));
    process.exit(0);
} catch (error) {
    process.stderr.write(error);
    process.exit(1);
}
