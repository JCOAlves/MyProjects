import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_PROFILE } from '../../core/demo-data';
import { ToastService } from '../../core/toast.service';
import { WorkspaceService } from '../../core/workspace.service';
import { ProfilePage } from './profile.page';

describe('ProfilePage unsaved data and image errors', () => {
  let page: ProfilePage;
  let updateProfile: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    updateProfile = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WorkspaceService,
          useValue: { user: signal({ ...DEMO_PROFILE }), updateProfile },
        },
        { provide: ToastService, useValue: { show: vi.fn() } },
      ],
    });
    page = TestBed.runInInjectionContext(() => new ProfilePage());
  });

  it('asks before leaving a dirty profile and discards only after approval', async () => {
    page.name = 'Nome editado';
    const firstNavigation = page.canDeactivate();
    expect(page.discardOpen()).toBe(true);
    page.keepEditing();
    expect(await firstNavigation).toBe(false);
    expect(page.name).toBe('Nome editado');
    const secondNavigation = page.canDeactivate();
    page.discardChanges();
    expect(await secondNavigation).toBe(true);
    expect(page.name).toBe(DEMO_PROFILE.name);
    expect(page.dirty).toBe(false);
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('keeps the selected avatar when another file has an unsupported type', async () => {
    page.avatar = 'data:image/png;base64,aGVsbG8=';
    const input = {
      files: [new File(['<svg/>'], 'avatar.svg', { type: 'image/svg+xml' })],
      value: 'avatar.svg',
    };
    await page.selectPhoto({ target: input } as unknown as Event);
    expect(page.avatar).toBe('data:image/png;base64,aGVsbG8=');
    expect(page.photoError()).toContain('PNG, JPEG ou WebP');
    expect(page.photoBusy()).toBe(false);
    expect(input.value).toBe('');
  });

  it('preserves profile changes when a save fails', () => {
    updateProfile.mockImplementation(() => {
      throw new Error('Sessão local indisponível.');
    });
    page.name = 'Nome editado';
    page.save();
    expect(page.name).toBe('Nome editado');
    expect(page.dirty).toBe(true);
    expect(page.saveError()).toBe('Sessão local indisponível.');
    expect(page.saving()).toBe(false);
  });
});
