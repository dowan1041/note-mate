import { transition, trigger, style, animate, query, stagger } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Note } from 'src/app/shared/note.model';
import { NotesService } from 'src/app/shared/notes.service';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations: [
    trigger('itemAnim',[
      //Entry Animation
      transition('void => *', [
        // Initial State
        style({
          height:0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,

          //we have to 'expand out the padding properties
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
        }),
        // we first want to animate the spacing
        animate('50ms', style({
          height: '*',
          'margin-bottom': '*',
          paddingTop:'*',
          paddingBottom:'*',
          paddingLeft:'*',
          paddingRight:'*',

        })),
        animate(68)
      ]),
      transition('* => void', [
        //first sacle upo
        animate(58, style({
          transform: 'scale(1.05)'
        })),
        //then scale down back to normal size while beginning to fade out
        animate(50, style({
          transform: 'scale(1)',
          opacity:0.7
        })),
        //scale down and fade out
        animate('120ms ease-out', style({
          transform: 'scale(0.68)',
          opacity:0,
        })),
        //then animate the spacing (which height and margin and padding)
        animate('150ms ease-out', style({
          // opacity:0,
          height:0,
          paddingTop:0,
          paddingBottom:0,
          paddingRight:0,
          paddingLeft:0,
          'margin-bottom':'0',
        }))
      ])
    ]),

    trigger('listAnim', [
      transition('* => *', [
        query(':enter',[
          style({
            opacity:0,
            height:0,

          }),
          stagger(100, [
            animate('0.2s ease')
          ])
        ], {
          optional: true
        })
      ])
    ])
  ]
})
export class NotesListComponent implements OnInit {

  notes: Note[] = new Array<Note>();
  filteredNotes:Note[] = new Array<Note>();
  @ViewChild('filterInput') filterInputElRef : ElementRef<HTMLInputElement>;

  constructor(private noteService: NotesService) { }

  ngOnInit(): void {
    // we want to retrieve all notes from NoteService
    this.notes = this.noteService.getAll();
    // this.filteredNotes = this.noteService.getAll();
    this.filter('');
  }

  deleteNote(note: Note) {
    let noteId = this.noteService.getId(note)
    this.noteService.delete(noteId);
    this.filter(this.filterInputElRef.nativeElement.value);
  }

  generateNoteURL(note: Note) {
    let noteId = this.noteService.getId(note);
    return noteId
  }

  filter(query: string) {
    query = query.toLowerCase().trim();
    let allResults: Note[] = new Array<Note>();
    //split up the search query into individual words
    let terms: string[] = query.split(' ');
    //remove duplicate search terms
    terms = this.removeDuplicates(terms);
    // complie all releavant results into the all Results array
    terms.forEach(term => {
      let results : Note[] = this.relevantNotes(term);
      allResults = [...allResults, ...results]
    });
    // allResults will include duplicate notes
    // because a particular note can be the result of many search terms
    //but we dont want to show the same note multiple times on the UI
    //So we first must remove the duplicates

    let uniqureResults = this.removeDuplicates(allResults)
    this.filteredNotes = uniqureResults;

    //now sort by relevancy
    this.sortByRelevancy(allResults);
  }

  removeDuplicates(arr: Array<any>) : Array<any> {
    let uniqureResults: Set<any> = new Set<any>();
    // loop through the input array and add the items to the set
    arr.forEach(e => uniqureResults.add(e));

    return Array.from(uniqureResults)
  }

  relevantNotes(query: any): Array<Note> {
    query = query.toLowerCase().trim();
    let relevantNotes = this.notes.filter(el => {
      if(el.title && el.title.toLowerCase().includes(query)) {
        return true;
      }
      if(el.body && el.body.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    })
    return relevantNotes;
  }

  sortByRelevancy(searchResults: Note[]) {
    //This method will calculate the relevancy of a note based on the number of 
    // times it appears in the search results

    let noteCountObj: Object = {} //format : key:value => NOteId: number
    searchResults.forEach(note => {
      let noteId = this.noteService.getId(note);
      if(noteCountObj[noteId]) {
        noteCountObj[noteId] +=1;

      } else {
        noteCountObj[noteId] =1;
      }
    })
    this.filteredNotes= this.filteredNotes.sort((a: Note, b: Note) => {
      let aId =  this.noteService.getId(a);
      let bId =  this.noteService.getId(b);
      let aCount = noteCountObj[aId];
      let bCount = noteCountObj[bId];

      return bCount - aCount;
    })
  }
}
