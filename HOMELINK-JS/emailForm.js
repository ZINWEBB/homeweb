const contactForm = document.getElementById('contactForm');
const emailFormOverlay = document.getElementById('emailFormOverlay');
const emailFormLoader = emailFormOverlay?.querySelector('.email-form-loader');
const emailFormMessage = emailFormOverlay?.querySelector('.email-form-message');
const emailFormCheckmark = emailFormOverlay?.querySelector('.checkmark');
const emailFormClose = emailFormOverlay?.querySelector('.email-form-close');

function attachEmailFormStyles() {
  if (document.getElementById('emailFormStyles')) return;
  const style = document.createElement('style');
  style.id = 'emailFormStyles';
  style.textContent = `
    .email-form-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.65);
      z-index: 9999;
      padding: 1.5rem;
      box-sizing: border-box;
    }

    .email-form-modal {
      width: min(420px, 100%);
      background: #fff;
      border-radius: 24px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
      position: relative;
    }

    .email-form-loader {
      width: 72px;
      height: 72px;
      margin: 0 auto 1.5rem;
      border: 8px solid #f3f4f6;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: email-form-spin 1s linear infinite;
    }

    .email-form-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      flex-direction: column;
    }

    .checkmark {
      display: none;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: #dcfce7;
      color: #16a34a;
      font-size: 2.5rem;
      line-height: 70px;
      font-weight: 700;
      border: 2px solid #86efac;
    }

    .email-form-message {
      color: #111827;
      font-size: 1rem;
      margin: 0;
      line-height: 1.5;
    }

    .email-form-close {
      margin-top: 1.5rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 9999px;
      padding: 0.85rem 1.5rem;
      font-size: 0.95rem;
      cursor: pointer;
      display: none;
    }

    @keyframes email-form-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

function showOverlay({ loading = false, success = false, message = '' }) {
  if (!emailFormOverlay || !emailFormLoader || !emailFormMessage || !emailFormCheckmark || !emailFormClose) return;
  emailFormOverlay.style.display = 'flex';
  emailFormLoader.style.display = loading ? 'block' : 'none';
  emailFormCheckmark.style.display = success ? 'block' : 'none';
  emailFormMessage.textContent = message;
  emailFormClose.style.display = loading ? 'none' : 'inline-flex';

  if (loading) {
    emailFormMessage.textContent = 'Sending your message…';
  }
}

function hideOverlay() {
  if (!emailFormOverlay) return;
  emailFormOverlay.style.display = 'none';
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (!contactForm) return;

  const submitButton = contactForm.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  showOverlay({ loading: true });

  const formData = new FormData(contactForm);

  fetch(contactForm.action, {
    method: 'POST',
    body: formData,
  })
    .then(async (response) => {
      const data = await response.json().catch(() => null);
      if (response.ok && (!data || data.success !== false)) {
        showOverlay({ success: true, message: 'EMAIL sent successfully!' });
        contactForm.reset();
      } else {
        const errorMessage = data?.message || 'Could not send message. Please try again.';
        showOverlay({ success: false, message: errorMessage });
      }
    })
    .catch(() => {
      showOverlay({ success: false, message: 'Network error. Please try again.' });
    })
    .finally(() => {
      if (submitButton) submitButton.disabled = false;
    });
}

if (contactForm) {
  attachEmailFormStyles();
  contactForm.addEventListener('submit', handleFormSubmit);
}

if (emailFormClose) {
  emailFormClose.addEventListener('click', hideOverlay);
}

if (emailFormOverlay) {
  emailFormOverlay.addEventListener('click', (event) => {
    if (event.target === emailFormOverlay) {
      hideOverlay();
    }
  });
}
