import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { SalaireService } from '../service/salaire.service';

import { SalaireComponent } from './salaire.component';

describe('Salaire Management Component', () => {
  let comp: SalaireComponent;
  let fixture: ComponentFixture<SalaireComponent>;
  let service: SalaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [SalaireComponent],
    })
      .overrideTemplate(SalaireComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SalaireComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(SalaireService);

    const headers = new HttpHeaders();
    jest.spyOn(service, 'query').mockReturnValue(
      of(
        new HttpResponse({
          body: [{ id: 123 }],
          headers,
        })
      )
    );
  });

  it('Should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.salaires?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });
});
