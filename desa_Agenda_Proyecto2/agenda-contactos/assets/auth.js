(() => {
    'use strict';

    document.querySelectorAll('[data-auth]').forEach((root) => {
        const loginForm = root.querySelector('[data-login-form]');
        const registerForm = root.querySelector('[data-register-form]');
        const message = root.querySelector('[data-message]');

        function showForm(formToShow, formToHide) {
            formToHide.hidden = true;
            formToShow.hidden = false;
            message.hidden = true;
        }

        root.querySelector('[data-show-register]').onclick = () => showForm(registerForm, loginForm);
        root.querySelector('[data-show-login]').onclick = () => showForm(loginForm, registerForm);

        async function submitAuthForm(form, endpoint) {
            const submitButton = form.querySelector('[type="submit"]');
            if (submitButton.disabled) {
                return;
            }
            submitButton.disabled = true;
            message.hidden = true;
            try {
                const fields = Object.fromEntries(new FormData(form));
                const response = await fetch(endpoint, {
                    method: 'POST',
                    credentials: 'same-origin',
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Agenda-Nonce': root.dataset.nonce,
                    },
                    body: JSON.stringify(fields),
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'No se pudo completar la operación.');
                }
                location.reload();
            } catch (error) {
                message.textContent = error.message || 'No se pudo conectar al servidor.';
                message.dataset.error = 'true';
                message.hidden = false;
            } finally {
                submitButton.disabled = false;
            }
        }

        const forms = [
            [loginForm, root.dataset.login],
            [registerForm, root.dataset.registro],
        ];
        for (const [form, endpoint] of forms) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await submitAuthForm(form, endpoint);
            });
        }
    });

    document.querySelectorAll('[data-agenda-logout]').forEach((button) => {
        button.addEventListener('click', async () => {
            button.disabled = true;
            try {
                const response = await fetch(button.dataset.url, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'X-WP-Nonce': button.dataset.nonce },
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'No se pudo cerrar la sesión.');
                }
                location.reload();
            } catch (error) {
                alert(error.message);
                button.disabled = false;
            }
        });
    });
})();
