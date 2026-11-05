import { TestBed } from '@angular/core/testing';
import { RequestHTTP } from './request-http';

describe('RequestHTTP', () => {
  let service: RequestHTTP;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestHTTP);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
