import {transition, trigger} from '@angular/animations';

export const blockInitialTransition = transition(':enter', []);

export const blockInitialTrigger = trigger('blockInitialRenderAnimation', [blockInitialTransition]);
