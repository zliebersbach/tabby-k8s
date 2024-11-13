import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import TabbyCoreModule, { ProfileProvider, TabRecoveryProvider } from 'tabby-core'
import TabbyTerminalModule from 'tabby-terminal'

import { K8sTabComponent } from './components/k8sTab.component'
import { K8sProfileProvider } from 'profiles'
import { RecoveryProvider } from 'recoveryProvider'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TabbyCoreModule,
        TabbyTerminalModule,
        NgbModule,
    ],
    providers: [
        { provide: ProfileProvider, useClass: K8sProfileProvider, multi: true },
        { provide: TabRecoveryProvider, useClass: RecoveryProvider, multi: true },
    ],
    entryComponents: [
        K8sTabComponent,
    ],
    declarations: [
        K8sTabComponent,
    ],
})
export default class K8sModule { }