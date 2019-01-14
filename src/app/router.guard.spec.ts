import { TestBed, async, inject } from '@angular/core/testing';

import { RouterGuard } from './router.guard';

describe('RouterGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RouterGuard]
    });
  });

  it('should ...', inject([RouterGuard], (guard: RouterGuard) => {
    expect(guard).toBeTruthy();
  }));
});
