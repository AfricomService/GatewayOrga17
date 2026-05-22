import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { StatusHistoryDetailComponent } from './status-history-detail.component';

describe('StatusHistory Management Detail Component', () => {
  let comp: StatusHistoryDetailComponent;
  let fixture: ComponentFixture<StatusHistoryDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatusHistoryDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ statusHistory: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(StatusHistoryDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(StatusHistoryDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load statusHistory on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.statusHistory).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
