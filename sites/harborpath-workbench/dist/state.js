export function toggleStep(progress, playbookId, stepIndex) {
  const next = { __proto__: null, ...progress };
  const checked = next[playbookId] ?? [];
  const updated = checked.includes(stepIndex)
    ? checked.filter(index => index !== stepIndex)
    : [...checked, stepIndex];
  if (updated.length) next[playbookId] = updated;
  else delete next[playbookId];
  return next;
}
