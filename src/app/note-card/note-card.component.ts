import { Component, OnInit, ViewChild, ElementRef, Renderer2, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-note-card',
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.scss']
})
export class NoteCardComponent implements AfterViewInit{

  @Input() title?: string;
  @Input() body?: string;
  @Input() link;

  @Output('delete') deleteEvent : EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('truncator',{static: true}) truncator: ElementRef<HTMLElement>;
  @ViewChild('bodyText',{static: true}) bodyText: ElementRef<HTMLElement>;

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    //work out if there is a text overflow if not, then hide the truncator

    let style = window.getComputedStyle(this.bodyText.nativeElement, null);
    let viewableHeight = parseInt(style.getPropertyValue('height'), 10)

    if (this.bodyText.nativeElement.scrollHeight > viewableHeight) {
      //if there is a text overflow, show the fade out truncator
      this.renderer.setStyle(this.truncator.nativeElement, 'display', 'block')
    } else {
      // else (there is a text overflow), hidee the fade out truncator
      this.renderer.setStyle(this.truncator.nativeElement, 'display', 'none')
    }
  }

  onXButtonClick() {
    this.deleteEvent.emit();
  }
}
