import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ThemeFormationService } from '../service/theme-formation.service';

import { ThemeFormationComponent } from './theme-formation.component';

describe('ThemeFormation Management Component', () => {
  let comp: ThemeFormationComponent;
  let fixture: ComponentFixture<ThemeFormationComponent>;
  let service: ThemeFormationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ThemeFormationComponent],
    })
      .overrideTemplate(ThemeFormationComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ThemeFormationComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(ThemeFormationService);

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
    expect(comp.themeFormations?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });
});
