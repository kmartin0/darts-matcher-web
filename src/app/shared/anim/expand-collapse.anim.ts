import {animate, style, transition, trigger} from '@angular/animations';

export const expandTransition = transition(':enter', [
  style({height: 0, opacity: 0}),
  animate('.4s ease-out', style({height: '*', opacity: 1}))
]);

export const collapseTransition = transition(':leave', [
  style({height: '*', opacity: 1}),
  animate('.4s ease-in', style({height: 0, opacity: 0}))
]);

export const expandCollapseTrigger = trigger('expandCollapseAnimation', [expandTransition, collapseTransition]);
