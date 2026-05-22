import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { OrganigrammeDetailComponent } from './organigramme-detail.component';

describe('Organigramme Management Detail Component', () => {
  let comp: OrganigrammeDetailComponent;
  let fixture: ComponentFixture<OrganigrammeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganigrammeDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ organigramme: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(OrganigrammeDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(OrganigrammeDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load organigramme on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.organigramme).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
