// Seleciona os elementos do DOM
const trapForm = document.getElementById('trapForm');
const farmSelect = document.getElementById('farmSelect');
const trapCodesContainer = document.getElementById('trapCodesContainer');
const addTrapCodeButton = document.getElementById('addTrapCode');
const messageDiv = document.getElementById('message'); // Adiciona a referência para a div de mensagem

// Função para mostrar mensagens
function showMessage(text, isSuccess) {
    messageDiv.textContent = text;
    messageDiv.className = isSuccess ? 'success' : 'error';
    messageDiv.style.display = 'block';
}

// Carregar lista de fazendas
function loadFarms() {
    fetch('/fazendas')
        .then(response => response.json())
        .then(farms => {
            farms.forEach(farm => {
                const option = document.createElement('option');
                option.value = farm.farmName;
                option.textContent = farm.farmName;
                farmSelect.appendChild(option);
            });
        })
        .catch(error => showMessage('Erro ao carregar fazendas: ' + error.message, false)); // Atualiza para usar showMessage
}

// Função para adicionar um novo código da armadilha
addTrapCodeButton.addEventListener('click', function () {
    const trapCodeBlock = document.createElement('div');
    trapCodeBlock.className = 'trap-code-block';
    trapCodeBlock.innerHTML = `
        <input type="text" name="trapCode" placeholder="Código da Armadilha" required>
        <button type="button" class="remove-trap-code" onclick="removeTrapCode(this)">×</button>
    `;
    trapCodesContainer.appendChild(trapCodeBlock);
});

// Função para remover um código da armadilha
function removeTrapCode(button) {
    button.parentElement.remove();
}

// Função para limpar o formulário e os códigos da armadilha
function clearForm() {
    trapForm.reset();
    const trapCodeBlocks = document.querySelectorAll('.trap-code-block');
    trapCodeBlocks.forEach(block => block.remove());
    messageDiv.style.display = 'none'; // Oculta a mensagem ao limpar o formulário
}

// Evento de envio do formulário
trapForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const trapCodes = [];
    const trapCodeInputs = document.querySelectorAll('#trapCodesContainer input');
    trapCodeInputs.forEach(input => {
        if (input.value) {
            trapCodes.push(input.value);
        }
    });

    const requestBody = JSON.stringify({
        farmName: farmSelect.value,
        trapCodes: trapCodes
    });

    fetch('/savetraps', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: requestBody
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta do servidor: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                 // Usa showMessage
                clearForm();
                showMessage('Cadastro de armadilhas realizado com sucesso!', true);
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao enviar dados:', error);
            showMessage('Erro ao enviar dados: ' + error.message, false); // Usa showMessage
        });
});

// Evento para o botão de voltar
document.getElementById('backButton').addEventListener('click', function () {
    window.history.back();
});

// Carregar fazendas quando a página é carregada
loadFarms();
