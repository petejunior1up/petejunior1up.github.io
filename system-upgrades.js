/* PJ SYSTEM UPGRADES — isolated enhancement layer */
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  ready(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Short boot sequence — once per tab/session, with skip control. */
    let shouldBoot = true;
    try { shouldBoot = sessionStorage.getItem('pjBootSeen') !== '1'; } catch (_) {}

    if (shouldBoot) {
      const boot = document.createElement('div');
      boot.className = 'pj-boot';
      boot.setAttribute('role', 'status');
      boot.setAttribute('aria-live', 'polite');
      boot.innerHTML = `
        <div class="pj-boot-shell">
          <div class="pj-boot-top"><span>PJ CORE // BOOT</span><span>V4.0</span></div>
          <div class="pj-boot-screen">
            <div class="pj-boot-mark">PJ.</div>
            <div class="pj-boot-lines">
              <div class="pj-boot-line" style="animation-delay:.08s"><b>[ OK ]</b> Interface modules detected.</div>
              <div class="pj-boot-line" style="animation-delay:.25s"><b>[ OK ]</b> Project systems linked.</div>
              <div class="pj-boot-line" style="animation-delay:.42s"><b>[ OK ]</b> Archive + command layers online.</div>
              <div class="pj-boot-line" style="animation-delay:.59s"><b>[ OK ]</b> Entering digital space...</div>
            </div>
            <div class="pj-boot-progress" aria-hidden="true"><i></i></div>
            <button class="pj-boot-skip" type="button">SKIP BOOT →</button>
          </div>
        </div>
      `;
      document.body.appendChild(boot);

      const finish = () => {
        if (boot.classList.contains('is-done')) return;
        boot.classList.add('is-done');
        try { sessionStorage.setItem('pjBootSeen', '1'); } catch (_) {}
        window.setTimeout(() => boot.remove(), reduced ? 20 : 320);
      };

      boot.querySelector('.pj-boot-skip')?.addEventListener('click', finish);
      window.setTimeout(finish, reduced ? 80 : 1450);
    }

    /* Reveal new sections using the same visual language, independently. */
    const extras = document.querySelectorAll('.system-section.reveal-system');
    if (reduced || !('IntersectionObserver' in window)) {
      extras.forEach(el => el.classList.add('v3-visible'));
    } else {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('v3-visible');
          io.unobserve(entry.target);
        });
      }, { threshold: .1 });
      extras.forEach(el => io.observe(el));
    }
  });
})();
