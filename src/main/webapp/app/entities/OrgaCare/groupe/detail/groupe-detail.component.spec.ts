import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GroupeDetailComponent } from './groupe-detail.component';

describe('Groupe Management Detail Component', () => {
  let comp: GroupeDetailComponent;
  let fixture: ComponentFixture<GroupeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupeDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ groupe: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(GroupeDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(GroupeDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load groupe on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.groupe).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
