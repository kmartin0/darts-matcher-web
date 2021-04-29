import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Input,
  OnInit,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import {Subject} from 'rxjs';
import {LoadingComponent} from './loading.component';

@Directive({
  selector: '[appLoading]'
})
export class LoadingDirective implements OnInit {

  @Input() loading$: Subject<boolean>;
  loadingRef: ComponentRef<LoadingComponent>;

  constructor(private vcr: ViewContainerRef,
              private resolver: ComponentFactoryResolver,
              private renderer: Renderer2) {
  }

  ngOnInit() {
    this.addLoading();
  }

  private addLoading() {
    if (!this.loadingRef) {
      const factory = this.resolver.resolveComponentFactory(LoadingComponent);
      this.loadingRef = this.vcr.createComponent(factory);

      this.renderer.appendChild(
        this.vcr.element.nativeElement,
        this.loadingRef.injector.get(LoadingComponent).elementRef.nativeElement
      );

    }
    this.loadingRef.instance.loading$ = this.loading$;
  }

}
