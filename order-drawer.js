(() => {
  const order = document.querySelector('.order');
  const bar = document.getElementById('order-timer-bar');
  const fab = document.getElementById('cart-fab');
  const fabCount = document.getElementById('fab-count');
  const itemCount = document.getElementById('item-count');
  let last = 0;

  const open = () => order.classList.add('open');
  const close = () => order.classList.remove('open');

  // hide the timer bar since it's no longer used
  if (bar) bar.style.display = 'none';

  // open automatically when item count goes up
  const sync = () => {
    const n = parseInt(itemCount.textContent, 10) || 0;
    fabCount.textContent = n;
    if (n > last) {
      open();
      fab.classList.remove('bump');
      void fab.offsetWidth; // restart animation
      fab.classList.add('bump');
    }
    last = n;
  };
  new MutationObserver(sync).observe(itemCount, { childList: true, characterData: true, subtree: true });

  fab.addEventListener('click', () => (order.classList.contains('open') ? close() : open()));
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
})();