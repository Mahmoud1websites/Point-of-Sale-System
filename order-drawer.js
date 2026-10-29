(() => {
  const CLOSE_AFTER = 5000;
  const order = document.querySelector('.order');
  const bar = document.getElementById('order-timer-bar');
  const fab = document.getElementById('cart-fab');
  const fabCount = document.getElementById('fab-count');
  const itemCount = document.getElementById('item-count');
  const overlay = document.getElementById('receipt-overlay');
  let timer = null;
  let last = 0;

  const startBar = () => {
    bar.classList.remove('run', 'paused');
    void bar.offsetWidth; // restart animation
    bar.classList.add('run');
  };

  const close = () => {
    clearTimeout(timer);
    order.classList.remove('open');
  };

  const schedule = () => {
    clearTimeout(timer);
    startBar();
    timer = setTimeout(() => {
      // don't close while the receipt is showing
      if (!overlay.classList.contains('hidden')) return schedule();
      close();
    }, CLOSE_AFTER);
  };

  const open = () => {
    order.classList.add('open');
    schedule();
  };

  // pause while the cashier is interacting with the panel
  order.addEventListener('mouseenter', () => { clearTimeout(timer); bar.classList.add('paused'); });
  order.addEventListener('mouseleave', () => { if (order.classList.contains('open')) schedule(); });
  order.addEventListener('focusin', () => { clearTimeout(timer); bar.classList.add('paused'); });
  order.addEventListener('focusout', () => { if (order.classList.contains('open')) schedule(); });

  // open automatically when item count goes up
  const sync = () => {
    const n = parseInt(itemCount.textContent, 10) || 0;
    fabCount.textContent = n;
    if (n > last) {
      open();
      fab.classList.remove('bump');
      void fab.offsetWidth;
      fab.classList.add('bump');
    } else if (n < last && order.classList.contains('open')) {
      schedule(); // keep it open a bit after removing items
    }
    last = n;
  };
  new MutationObserver(sync).observe(itemCount, { childList: true, characterData: true, subtree: true });

  fab.addEventListener('click', () => (order.classList.contains('open') ? close() : open()));
  document.getElementById('pay-btn').addEventListener('click', close);
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
})();