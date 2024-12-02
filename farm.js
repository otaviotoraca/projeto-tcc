document.addEventListener('DOMContentLoaded', () => {
    const farmForm = document.getElementById('farmForm');
    const messageDiv = document.getElementById('message');

    function showMessage(text, isSuccess) {
        messageDiv.textContent = text;
        messageDiv.className = isSuccess ? 'success' : 'error';
        messageDiv.style.display = 'block';
    }

    function clearForm() {
        farmForm.reset();
    }

    function hideMessage() {
        messageDiv.style.display = 'none';
    }

    farmForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const farmName = document.getElementById('farmName').value;
        const ownerName = document.getElementById('ownerName').value;

        try {
            const response = await fetch('/savefarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ farmName, ownerName })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            showMessage(result.message, result.status === 'success');

            if (result.status === 'success') {
                clearForm();
                // Esconde a mensagem e limpa o formulário após 3 segundos
                setTimeout(() => {
                    hideMessage();
                }, 3000);
            }
        } catch (error) {
            console.error('Erro:', error);
            showMessage('Erro ao enviar dados.', false);
        }
    });
});
