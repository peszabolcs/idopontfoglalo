import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  @Input() appHighlight: string = '#f5f5f5'; // Default highlight color
  @Input() defaultColor: string = ''; // Default background color

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Store the original background color
    this.defaultColor =
      this.defaultColor ||
      window.getComputedStyle(this.el.nativeElement).backgroundColor ||
      'transparent';

    // Set the default background if provided
    if (this.defaultColor) {
      this.setBackgroundColor(this.defaultColor);
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.setBackgroundColor(this.appHighlight);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.setBackgroundColor(this.defaultColor);
  }

  private setBackgroundColor(color: string) {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'background-color 0.3s'
    );
  }
}
