/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component, Injector } from '@angular/core'
import { K8sProfile } from 'profiles'
import { first } from 'rxjs'
import { K8sSession } from 'session'
import { BaseTerminalTabComponent } from 'tabby-terminal'

/** @hidden */
@Component({
    selector: 'k8s-tab',
    template: BaseTerminalTabComponent.template,
    styles: BaseTerminalTabComponent.styles,
    animations: BaseTerminalTabComponent.animations,
})
export class K8sTabComponent extends BaseTerminalTabComponent {
    profile?: K8sProfile
    session: K8sSession|null = null

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor (
        injector: Injector,
    ) {
        super(injector)
    }

    ngOnInit () {
        this.logger = this.log.create('k8sTab')

        this.subscribeUntilDestroyed(this.hotkeys.hotkey$, hotkey => {
            if (!this.hasFocus) {
                return
            }
            switch (hotkey) {
                case 'home':
                    this.sendInput('\x1b[H')
                    break
                case 'end':
                    this.sendInput('\x1b[F')
                    break
            }
        })

        this.frontendReady$.pipe(first()).subscribe(() => {
            this.initializeSession()
        })

        super.ngOnInit()

        setImmediate(() => {
            this.setTitle(this.profile!.name)
        })
    }

    async initializeSession () {
        if (!this.profile) {
            this.logger.error('No profile info supplied')
            return
        }

        const session = new K8sSession(this.injector, this.profile)
        this.setSession(session, true)

        this.startSpinner('Connecting')

        try {
            await this.session!.start()
            this.stopSpinner()
        } catch (e) {
            this.stopSpinner()
            this.write(e.message + '\r\n')
            return
        }
        this.session!.resize(this.size.columns, this.size.rows)
    }

    async getRecoveryToken (): Promise<any> {
        return {
            type: 'app:k8s-tab',
            profile: this.profile,
            savedState: this.frontend?.saveState(),
        }
    }
}