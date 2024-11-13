import { Injectable } from '@angular/core'
import { TabRecoveryProvider, NewTabParameters, RecoveryToken } from 'tabby-core'
import { K8sTabComponent } from './components/k8sTab.component'

/** @hidden */
@Injectable()
export class RecoveryProvider extends TabRecoveryProvider<K8sTabComponent> {
    async applicableTo (recoveryToken: RecoveryToken): Promise<boolean> {
        return recoveryToken.type === 'app:k8s-tab'
    }

    async recover (recoveryToken: RecoveryToken): Promise<NewTabParameters<K8sTabComponent>> {
        return {
            type: K8sTabComponent,
            inputs: {
                profile: recoveryToken.profile,
                savedState: recoveryToken.savedState,
            },
        }
    }
}