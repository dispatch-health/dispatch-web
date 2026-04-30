document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form.contact-form').forEach((form) => {
    const status = form.querySelector('[data-form-status]');
    const button = form.querySelector('button[type="submit"]');
    const buttonLabel = button ? button.textContent : '';

    const setStatus = (state, message) => {
      if (!status) return;
      status.dataset.state = state;
      status.textContent = message;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending…';
      }
      setStatus('', '');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          form.reset();
          setStatus('success', 'Thanks! We’ll be in touch soon.');
        } else {
          const data = await response.json().catch(() => ({}));
          const message = Array.isArray(data.errors) && data.errors.length
            ? data.errors.map((e) => e.message).join(', ')
            : 'Something went wrong. Please try again.';
          setStatus('error', message);
        }
      } catch {
        setStatus('error', 'Network error. Please try again.');
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = buttonLabel;
        }
      }
    });
  });
});
