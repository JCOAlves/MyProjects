import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDemoProjects, DEMO_PROFILE } from '../../core/demo-data';
import { ToastService } from '../../core/toast.service';
import { WorkspaceService } from '../../core/workspace.service';
import { ProjectPage } from './project.page';

describe('ProjectPage recovery and confirmation', () => {
  let page: ProjectPage;
  let workspace: {
    projects: ReturnType<typeof signal<ReturnType<typeof createDemoProjects>>>;
    user: ReturnType<typeof signal<typeof DEMO_PROFILE>>;
    addTask: ReturnType<typeof vi.fn>;
    updateTask: ReturnType<typeof vi.fn>;
    addMember: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    workspace = {
      projects: signal(createDemoProjects()),
      user: signal({ ...DEMO_PROFILE }),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      addMember: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: WorkspaceService, useValue: workspace },
        { provide: ToastService, useValue: { show: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: new BehaviorSubject(convertToParamMap({ id: 'trabalho-de-redes' })),
            queryParamMap: new BehaviorSubject(convertToParamMap({})),
          },
        },
      ],
    });
    page = TestBed.runInInjectionContext(() => new ProjectPage());
  });

  it('retains a task draft and exposes the failure when persistence is unavailable', () => {
    workspace.addTask.mockImplementation(() => {
      throw new Error('Armazenamento indisponível.');
    });
    page.openTask();
    page.taskDraft.title = 'Finalizar revisão';
    page.saveEditor();
    expect(page.editor).toBe('task');
    expect(page.taskDraft.title).toBe('Finalizar revisão');
    expect(page.formError).toBe('Armazenamento indisponível.');
    expect(page.saving).toBe(false);
  });

  it('does not grant a collaborator role before explicit confirmation', () => {
    page.openMember();
    page.memberDraft = { name: 'Pessoa de teste', email: 'teste@example.com', role: 'editor' };
    page.saveEditor();
    expect(workspace.addMember).not.toHaveBeenCalled();
    expect(page.confirmation?.label).toBe('Adicionar colaborador');
    page.confirmAction();
    expect(workspace.addMember).toHaveBeenCalledExactlyOnceWith('trabalho-de-redes', {
      name: 'Pessoa de teste',
      email: 'teste@example.com',
      role: 'editor',
    });
    expect(page.editor).toBeNull();
    expect(page.confirmation).toBeNull();
  });

  it('restores the checkbox if saving task completion fails', () => {
    workspace.updateTask.mockImplementation(() => {
      throw new Error('Sem espaço no navegador.');
    });
    const task = workspace.projects()[0].tasks.find((item) => !item.done)!;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    page.toggleTask(task, { target: checkbox } as unknown as Event);
    expect(checkbox.checked).toBe(false);
    expect(page.formError).toBe('Sem espaço no navegador.');
  });
});
