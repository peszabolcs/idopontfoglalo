import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appStatusColor]',
  standalone: true,
})
export class StatusColorDirective implements OnChanges {
  @Input() appStatusColor:
    | 'pending'
    | 'confirmed'
    | 'cancelled'
    | 'completed'
    | string = '';

  // Define status colors
  private readonly statusColors = {
    pending: '#f9a825', // amber
    confirmed: '#4caf50', // green
    cancelled: '#f44336', // red
    completed: '#2196f3', // blue
    default: '#757575', // grey
  };

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appStatusColor']) {
      this.updateColor();
    }
  }

  private updateColor(): void {
    // Get color for status or use default if not found
    const status = this.appStatusColor.toLowerCase();
    const color = this.statusColors[status] || this.statusColors.default;

    // Apply the color to the element
    this.renderer.setStyle(this.el.nativeElement, 'color', color);

    // Add a subtle border with the same color
    this.renderer.setStyle(
      this.el.nativeElement,
      'border-left',
      `4px solid ${color}`
    );
    this.renderer.setStyle(this.el.nativeElement, 'padding-left', '8px');
  }
}
