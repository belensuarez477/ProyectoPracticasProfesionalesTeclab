import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosClientes } from './turnos-clientes';

describe('TurnosClientes', () => {
  let component: TurnosClientes;
  let fixture: ComponentFixture<TurnosClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnosClientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnosClientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
