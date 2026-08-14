(() => {
  'use strict';

  const STORAGE_KEY = 'taskflow-tasks-v1';
  const FILTER_KEY = 'taskflow-filter-v1';

  const state = {
    tasks: loadTasks(),
    filter: localStorage.getItem(FILTER_KEY) || 'all',
    editingId: null
  };

  const elements = {
    form: document.getElementById('taskForm'),
    input: document.getElementById('taskInput'),
    submitButton: document.getElementById('submitButton'),
    formError: document.getElementById('formError'),
    list: document.getElementById('taskList'),
    emptyState: document.getElementById('emptyState'),
    emptyTitle: document.getElementById('emptyTitle'),
    emptyText: document.getElementById('emptyText'),
    status: document.getElementById('statusMessage'),
    total: document.getElementById('totalCount'),
    active: document.getElementById('activeCount'),
    completed: document.getElementById('completedCount'),
    countLabel: document.getElementById('taskCountLabel'),
    clearCompleted: document.getElementById('clearCompleted')
  };

  function loadTasks() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(stored)) return [];
      return stored.filter(task => task && typeof task.id === 'string' && typeof task.title === 'string')
        .map(task => ({
          id: task.id,
          title: task.title.trim().slice(0, 120),
          completed: Boolean(task.completed),
          createdAt: Number(task.createdAt) || Date.now()
        }));
    } catch (error) {
      return [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
  }

  function filteredTasks() {
    if (state.filter === 'active') return state.tasks.filter(task => !task.completed);
    if (state.filter === 'completed') return state.tasks.filter(task => task.completed);
    return state.tasks;
  }

  function render() {
    const visible = filteredTasks();
    elements.list.innerHTML = visible.map(task => renderTask(task)).join('');
    elements.emptyState.hidden = visible.length !== 0;

    if (visible.length === 0) {
      if (state.tasks.length === 0) {
        elements.emptyTitle.textContent = 'No tasks yet';
        elements.emptyText.textContent = 'Add your first task above to get started.';
      } else {
        elements.emptyTitle.textContent = 'No matching tasks';
        elements.emptyText.textContent = 'Try another filter or add a new task.';
      }
    }

    const total = state.tasks.length;
    const completed = state.tasks.filter(task => task.completed).length;
    const active = total - completed;
    elements.total.textContent = total;
    elements.active.textContent = active;
    elements.completed.textContent = completed;
    elements.countLabel.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;

    document.querySelectorAll('.filter-button').forEach(button => {
      const selected = button.dataset.filter === state.filter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    elements.clearCompleted.disabled = completed === 0;
  }

  function renderTask(task) {
    const title = escapeHtml(task.title);
    if (state.editingId === task.id) {
      return `<li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <button class="task-check" type="button" data-action="toggle" aria-label="${task.completed ? 'Mark active' : 'Mark completed'}" aria-pressed="${task.completed}"></button>
        <input class="edit-input" data-role="edit-input" value="${title}" maxlength="120" aria-label="Edit task title">
        <div class="task-actions">
          <button class="icon-button" type="button" data-action="save" aria-label="Save task">✓</button>
          <button class="icon-button" type="button" data-action="cancel" aria-label="Cancel editing">×</button>
        </div>
      </li>`;
    }

    return `<li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <button class="task-check" type="button" data-action="toggle" aria-label="${task.completed ? 'Mark active' : 'Mark completed'}" aria-pressed="${task.completed}"></button>
      <span class="task-text">${title}</span>
      <div class="task-actions">
        <button class="icon-button" type="button" data-action="edit" aria-label="Edit task">✎</button>
        <button class="icon-button delete" type="button" data-action="delete" aria-label="Delete task">×</button>
      </div>
    </li>`;
  }

  function showStatus(message) {
    elements.status.textContent = message;
    window.clearTimeout(showStatus.timer);
    showStatus.timer = window.setTimeout(() => { elements.status.textContent = ''; }, 1800);
  }

  function showFormError(message) {
    elements.formError.textContent = message;
  }

  elements.form.addEventListener('submit', event => {
    event.preventDefault();
    const title = elements.input.value.trim();
    if (!title) {
      showFormError('Please enter a task.');
      elements.input.focus();
      return;
    }
    if (title.length > 120) {
      showFormError('Task must be 120 characters or fewer.');
      return;
    }

    state.tasks.unshift({ id: createId(), title, completed: false, createdAt: Date.now() });
    saveTasks();
    elements.form.reset();
    showFormError('');
    render();
    showStatus('Task added successfully.');
    elements.input.focus();
  });

  elements.input.addEventListener('input', () => showFormError(''));

  document.querySelector('.filters').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    state.filter = button.dataset.filter;
    localStorage.setItem(FILTER_KEY, state.filter);
    state.editingId = null;
    render();
  });

  elements.clearCompleted.addEventListener('click', () => {
    const before = state.tasks.length;
    state.tasks = state.tasks.filter(task => !task.completed);
    if (state.tasks.length === before) return;
    saveTasks();
    state.editingId = null;
    render();
    showStatus('Completed tasks cleared.');
  });

  // Event delegation: one listener manages all dynamically-created task controls.
  elements.list.addEventListener('click', event => {
    const control = event.target.closest('[data-action]');
    if (!control) return;
    const item = control.closest('.task-item');
    if (!item) return;
    const task = state.tasks.find(entry => entry.id === item.dataset.id);
    if (!task) return;

    switch (control.dataset.action) {
      case 'toggle':
        task.completed = !task.completed;
        state.editingId = null;
        saveTasks();
        render();
        showStatus(task.completed ? 'Task completed.' : 'Task marked active.');
        break;
      case 'edit':
        state.editingId = task.id;
        render();
        requestAnimationFrame(() => {
          const input = elements.list.querySelector('[data-role="edit-input"]');
          if (input) { input.focus(); input.select(); }
        });
        break;
      case 'save':
        saveEditedTask(item, task);
        break;
      case 'cancel':
        state.editingId = null;
        render();
        break;
      case 'delete':
        state.tasks = state.tasks.filter(entry => entry.id !== task.id);
        state.editingId = null;
        saveTasks();
        render();
        showStatus('Task deleted.');
        break;
      default:
        break;
    }
  });

  elements.list.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== 'Escape') return;
    const input = event.target.closest('[data-role="edit-input"]');
    if (!input) return;
    const item = input.closest('.task-item');
    if (!item) return;
    const task = state.tasks.find(entry => entry.id === item.dataset.id);
    if (!task) return;
    if (event.key === 'Enter') saveEditedTask(item, task);
    if (event.key === 'Escape') { state.editingId = null; render(); }
  });

  function saveEditedTask(item, task) {
    const input = item.querySelector('[data-role="edit-input"]');
    const title = input ? input.value.trim() : '';
    if (!title) {
      input?.focus();
      showStatus('Task title cannot be empty.');
      return;
    }
    task.title = title.slice(0, 120);
    state.editingId = null;
    saveTasks();
    render();
    showStatus('Task updated successfully.');
  }

  render();
})();
