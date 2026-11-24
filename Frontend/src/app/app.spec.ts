import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });
  it('provides the application router and an accessible skip link', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('router-outlet')).toBeTruthy();
    expect(root.querySelector('.skip-link')?.getAttribute('href')).toBe('#main-content');
    expect(root.querySelector('[aria-live="polite"]')).toBeTruthy();
  });
});
