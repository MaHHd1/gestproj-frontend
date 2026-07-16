import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('adds and dismisses notifications', () => {
    service.show('Saved successfully', 'success', 60000);

    expect(service.messages()).toHaveLength(1);
    expect(service.messages()[0].type).toBe('success');

    service.dismiss(service.messages()[0].id);
    expect(service.messages()).toHaveLength(0);
  });
});
