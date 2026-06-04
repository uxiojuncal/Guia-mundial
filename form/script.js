function setDeepValue(target, rawKey, value) {
  const parts = rawKey.replace(/\]/g, '').split('[');
  let current = target;

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const isLast = index === parts.length - 1;
    const nextPart = parts[index + 1];

    if (isLast) {
      current[part] = value;
      return;
    }

    if (current[part] === undefined) {
      current[part] = /^\d+$/.test(nextPart) ? [] : {};
    }

    current = current[part];
  }
}

function normalizeValue(input) {
  if (input.type === 'number') {
    return input.value === '' ? '' : Number(input.value);
  }

  return input.value;
}

function formatGroup(value) {
  const letter = String(value || '').trim().charAt(0).toUpperCase();
  return letter ? `Grupo ${letter}` : '';
}

function slugifyName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function buildTeamContent(form) {
  const data = {};
  const formData = new FormData(form);
  const nameValue = String(form.elements.namedItem('name')?.value || '');
  const nameSlug = slugifyName(nameValue);

  for (const [key, value] of formData.entries()) {
    const field = form.elements.namedItem(key);
    const normalizedValue = field instanceof RadioNodeList ? value : normalizeValue(field);

    if (key === 'group') {
      setDeepValue(data, key, formatGroup(normalizedValue));
      continue;
    }

    setDeepValue(data, key, normalizedValue);
  }

  data['coach-image'] = nameSlug ? `../assets/img/${nameSlug}-coach.webp` : '';
  data.badge = nameSlug ? `../assets/img/${nameSlug}-badge.webp` : '';

  return data;
}

function updatePreview(form, preview) {
  const data = buildTeamContent(form);
  preview.textContent = `${JSON.stringify(data, null, 2)}\n`;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('team-content-form');
  const preview = document.getElementById('json-preview');

  if (!form || !preview) return;

  const refresh = () => updatePreview(form, preview);

  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);

  refresh();
});
