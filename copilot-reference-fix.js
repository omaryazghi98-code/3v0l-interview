(() => {
  const D = window.INTERVIEW_DATA || {};
  const view = () => document.getElementById('view');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function findRef(id) {
    const pools = [
      ['answer', D.answers || []],
      ['story', D.stories || []],
      ['scenario', D.scenarios || []],
      ['phone', D.phoneCalls || []],
      ['phrase', D.french || []],
      ['curveball', D.curveballs || []],
      ['english', D.english || []]
    ];
    for (const [type, items] of pools) {
      const x = items.find(item => item.id === id);
      if (x) return { type, x };
    }
    return null;
  }

  const routeFor = type => ({
    answer: 'french',
    story: 'stories',
    scenario: 'gaming',
    phone: 'calls',
    phrase: 'french-phrases',
    curveball: 'questions',
    english: 'english'
  }[type] || 'search');

  function clickMatchingCard(found) {
    const root = view();
    if (!root) return false;
    const wanted = String(found.x.title || found.x.id).toLowerCase();
    const selectors = [
      `[data-open-id="${CSS.escape(found.x.id)}"]`,
      `[data-id="${CSS.escape(found.x.id)}"]`,
      `[data-open="${CSS.escape(found.type + ':' + found.x.id)}"]`,
      `[data-open="${CSS.escape(found.x.id)}"]`
    ];
    for (const selector of selectors) {
      const el = root.querySelector(selector);
      if (el) { el.scrollIntoView({behavior:'smooth', block:'center'}); el.click(); return true; }
    }
    const candidates = [...root.querySelectorAll('button, a, article, .card, .result, [role="button"]')];
    const textMatch = candidates.find(el => String(el.textContent || '').toLowerCase().includes(wanted));
    if (textMatch) { textMatch.scrollIntoView({behavior:'smooth', block:'center'}); textMatch.click(); return true; }
    return false;
  }

  function openReferenceFixed() {
    const b = document.getElementById('cpReference');
    const id = b?.dataset.ref;
    if (!id) return;
    const found = findRef(id);
    if (!found) return;

    const route = routeFor(found.type);
    if (typeof window.__3v0lGo === 'function') window.__3v0lGo(route);
    else document.querySelector(`[data-route="${CSS.escape(route)}"]`)?.click();

    let attempts = 0;
    const locate = () => {
      if (clickMatchingCard(found)) return;
      if (++attempts < 30) setTimeout(locate, 60);
    };
    setTimeout(locate, 80);
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('#cpReference') : null;
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openReferenceFixed();
  }, true);

  const label = () => {
    const el = document.getElementById('cpModel');
    const s = window.__3v0lLastState;
    if (el && s?.provider) {
      el.textContent = s.provider === 'cerebras' ? 'CEREBRAS' : s.provider === 'requesty' ? 'REQUESTY' : s.provider === 'local' ? 'LOCAL' : 'NO AI';
    }
  };
  new MutationObserver(label).observe(document.body, {childList:true, subtree:true});
  window.__3v0lReferenceFix = {openReferenceFixed};
})();
