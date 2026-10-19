import {afterRenderEffect, DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';

/**
 * Restores match-history scrolling during the current application session.
 *
 * Positions are associated with navigation IDs so separate visits to the same
 * URL retain their own positions. New navigation starts at the top.
 */
@Injectable({providedIn: 'root'})
export class MatchHistoryScrollService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly scrollPositions = new Map<number, number>();
  private readonly pendingScrollPosition = signal<number | null>(null);

  private getScrollContainer: (() => HTMLElement | undefined) | null = null;
  private activeNavigationId: number | null = null;
  private nextScrollTop = 0;

  constructor() {
    this.registerNavigationObserver();
  }

  /**
   * Connects the current history page for its lifetime.
   *
   * Call once from the page constructor so the render effect belongs to that
   * component. Saved positions remain available after it is destroyed.
   *
   * @param getScrollContainer - Returns the page's scroll container when available.
   * @param isReady - Signal-backed check that the requested results have loaded.
   * @param pageDestroyRef - Lifecycle of the connected page.
   */
  connect(getScrollContainer: () => HTMLElement | undefined, isReady: () => boolean, pageDestroyRef: DestroyRef): void {
    this.getScrollContainer = getScrollContainer;

    pageDestroyRef.onDestroy(() => {
      this.getScrollContainer = null;
      this.pendingScrollPosition.set(null);
    });

    afterRenderEffect({
      write: () => this.restoreScrollPosition(isReady)
    });
  }

  /**
   * Observes navigation events to save and restore the history scroll position.
   */
  private registerNavigationObserver(): void {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.handleNavigationStart(event);
        } else if (event instanceof NavigationEnd) {
          this.handleNavigationEnd(event);
        }
      });
  }

  /**
   * Saves the outgoing position and selects the target for the next navigation.
   *
   * @param event - Navigation start event, including any restored history entry.
   */
  private handleNavigationStart(event: NavigationStart): void {
    this.saveScrollPosition();

    const restoredNavigationId = event.navigationTrigger === 'popstate'
      ? event.restoredState?.navigationId
      : undefined;

    this.nextScrollTop = restoredNavigationId === undefined
      ? 0
      : this.scrollPositions.get(restoredNavigationId) ?? 0;
  }

  /**
   * Records the successful navigation and queues scrolling for the connected page.
   *
   * @param event - Successful navigation event.
   */
  private handleNavigationEnd(event: NavigationEnd): void {
    this.activeNavigationId = event.id;

    if (this.getScrollContainer !== null) {
      this.pendingScrollPosition.set(this.nextScrollTop);
    }
  }

  /**
   * Applies the pending scroll position once the requested history page has rendered.
   *
   * @param isReady - Signal-backed check that the requested results have loaded.
   */
  private restoreScrollPosition(isReady: () => boolean): void {
    const scrollTop = this.pendingScrollPosition();
    if (scrollTop === null || this.router.currentNavigation() !== null || !isReady()) {
      return;
    }

    const scrollContainer = this.getScrollContainer?.();
    if (scrollContainer === undefined) {
      return;
    }

    scrollContainer.scrollTo({top: scrollTop, behavior: 'instant'});

    // Subsequent data refreshes and deletions must not repeat the scroll.
    this.pendingScrollPosition.set(null);
  }

  /**
   * Saves the vertical offset in pixels for the navigation being left.
   *
   * If restoration is still pending, preserves its intended position instead
   * of reading the position of results left over from the previous page.
   */
  private saveScrollPosition(): void {
    if (this.activeNavigationId === null || this.getScrollContainer === null) {
      return;
    }

    const scrollTop = this.pendingScrollPosition() ??
      this.getScrollContainer()?.scrollTop;

    if (scrollTop !== undefined) {
      this.scrollPositions.set(this.activeNavigationId, Math.max(0, scrollTop));
    }
  }
}
