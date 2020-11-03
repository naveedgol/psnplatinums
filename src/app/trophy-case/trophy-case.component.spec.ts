import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrophyCaseComponent } from './trophy-case.component';

describe('TrophyCaseComponent', () => {
  let component: TrophyCaseComponent;
  let fixture: ComponentFixture<TrophyCaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrophyCaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrophyCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
