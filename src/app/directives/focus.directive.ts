import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appFocus]',
  standalone: true,
})
export class FocusDirective implements AfterViewInit {
  @Input() appFocus: boolean = true;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    if (this.appFocus) {
      // Need to use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 0);
    }
  }
}
