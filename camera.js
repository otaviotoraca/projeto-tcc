const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const retakeButton = document.getElementById('retake');
const sendButton = document.getElementById('send');
const confirmation = document.getElementById('confirmation');
const capturedImage = document.getElementById('capturedImage');

// Função para acessar a câmera traseira
async function startCamera() {
    try {
        console.log('Iniciando a câmera traseira...');
        const constraints = {
            video: {
                width: { ideal: 1440 },
                height: { ideal: 1080 },
                aspectRatio: 3 / 4,
                facingMode: { exact: 'environment' } // Seleciona especificamente a câmera traseira
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        console.log('Câmera traseira iniciada com sucesso');
    } catch (err) {
        console.error('Erro ao acessar a câmera traseira: ', err);
        try {
            const fallbackConstraints = {
                video: {
                    width: { ideal: 1440 },
                    height: { ideal: 1080 },
                    aspectRatio: 3 / 4
                }
            };
            const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            video.srcObject = fallbackStream;
            console.log('Câmera iniciada com sucesso (usando câmera padrão)');
        } catch (fallbackErr) {
            console.error('Erro ao acessar qualquer câmera: ', fallbackErr);
            showCustomAlert('Não foi possível acessar a câmera: ' + fallbackErr.message);
        }
    }
}

// Executar ao carregar a página
window.onload = async () => {
    await startCamera();
};

// Capturar a imagem da câmera
captureButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    capturedImage.src = dataUrl;
    confirmation.style.display = 'block';
    video.style.display = 'none';
    captureButton.style.display = 'none';
});

// Capturar novamente
retakeButton.addEventListener('click', () => {
    confirmation.style.display = 'none';
    video.style.display = 'block';
    captureButton.style.display = 'block';
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
});

// Modal customizado
function showCustomAlert(message, objectCount = null) {
    const modal = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    const closeButton = modal.querySelector('.close');

    if (objectCount !== null) {
        alertMessage.innerHTML = `${message} <br><span class="highlight">${objectCount}</span>`;
    } else {
        alertMessage.textContent = message;
    }

    modal.style.display = 'block';

    closeButton.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}


// Enviar a imagem para o servidor
sendButton.addEventListener('click', async () => {
    const selectedFarm = document.getElementById('farmSelect').value;
    const selectedTrap = document.getElementById('trapSelect').value;

    if (!selectedFarm || !selectedTrap) {
        showCustomAlert('Por favor, selecione uma Fazenda e uma Armadilha antes de enviar a imagem.');
        return;
    }

    const dataUrl = canvas.toDataURL('image/jpeg');

    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'flex';

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                image: dataUrl,
                farm: selectedFarm,
                trap: selectedTrap
            })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor: ' + response.statusText);
        }

        const data = await response.json();

        if (data.status === 'success') {
            console.log('Dados enviados com sucesso:', data.message);
            showCustomAlert(`Brocas detectadas:`, data.object_count);
        } else if (data.status === 'errorCadastro') {
            document.getElementById('alertModal').style.display = 'block';
        } else {
            throw new Error(data.message || 'Erro desconhecido ao cadastrar armadilha.');
        }

    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        showCustomAlert('Erro ao enviar dados: ' + error.message);
    } finally {
        loadingIndicator.style.display = 'none';
    }
});

// Lógica para os botões do modal
document.getElementById('confirmYes').addEventListener('click', async () => {
    console.log('Usuário optou por cadastrar mesmo assim.');

    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'flex';

    document.getElementById('alertModal').style.display = 'none';

    try {
        const response = await fetch('/userConfirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ confirmation: 'yes' })
        });
        const data = await response.json();

        if (data.status === 'success') {
            console.log('Dados enviados com sucesso:', data.message);
            showCustomAlert(`Brocas detectadas:`, data.object_count);
        } else if (data.status === 'errorCadastro') {
            document.getElementById('alertModal').style.display = 'block';
        } else {
            throw new Error(data.message || 'Erro desconhecido ao cadastrar armadilha.');
        }

    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        showCustomAlert('Erro ao enviar dados: ' + error.message);
    } finally {
        loadingIndicator.style.display = 'none';
    }
});

document.getElementById('confirmNo').addEventListener('click', () => {
    console.log('Usuário optou por não cadastrar.');
    document.getElementById('alertModal').style.display = 'none';
});
