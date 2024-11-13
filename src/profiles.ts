import { Injectable } from '@angular/core'
import { BaseTabComponent, NewTabParameters, PartialProfile, Profile, ProfileProvider } from 'tabby-core'
import { Container, K8sService } from './services/k8s.service'
import { K8sTabComponent } from 'components/k8sTab.component'

export interface K8sProfileOptions {
    namespace: string
    podName: string
    containerName: string
    command?: string
}

export interface K8sProfile extends Profile {
    type: 'k8s'
    options: K8sProfileOptions
}

@Injectable()
export class K8sProfileProvider extends ProfileProvider<K8sProfile> {
    id = 'k8s'
    name = 'Kubernetes'
    weight = 10
    // settingsComponent = K8sProfileSettingsComponent
    // configDefaults = {
    //     options: {
    //         containerID: null,
    //         containerName: null,
    //         imageID: null,
    //         command: null,
    //     }
    // }

    constructor (private k8s: K8sService) {
        super()
    }

    async getBuiltinProfiles (): Promise<PartialProfile<K8sProfile>[]> {
        let containers: Container[]
        try {
            containers = await this.k8s.listContainers()
        } catch (e) {
            console.error('Could not load Kubernetes containers:', e)
            return []
        }
        return [
            ...containers.map(container => ({
                id: `k8s:container-${container.namespace}-${container.podName}-${container.containerName}`,
                type: 'k8s',
                name: container.namespace + '/' + container.podName + '/' + container.containerName,
                isBuiltin: true,
                icon: 'fab fa-anchor',
                options: {
                    namespace: container.namespace,
                    podName: container.podName,
                    containerName: container.containerName,
                },
            })),
            {
                id: `k8s:template`,
                type: 'k8s',
                name: 'Kubernetes container shell',
                isBuiltin: true,
                isTemplate: true,
                icon: 'fab fa-anchor',
                options: { },
            }
        ]
    }

    async getNewTabParameters (profile: K8sProfile): Promise<NewTabParameters<BaseTabComponent>> {
        return {
            type: K8sTabComponent,
            inputs: {
                profile,
            },
        }
    }

    getDescription (_profile: PartialProfile<K8sProfile>): string {
        return ''
    }

}