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
            // Fallback to any available camera if back camera fails
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
            alert('Não foi possível acessar a câmera: ' + fallbackErr.message);
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
    // Limpar o canvas ao capturar novamente
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
});

// Enviar a imagem para o servidor
sendButton.addEventListener('click', async () => {
    const selectedFarm = document.getElementById('farmSelect').value;
    const selectedTrap = document.getElementById('trapSelect').value;

    if (!selectedFarm || !selectedTrap) {
        alert('Por favor, selecione uma Fazenda e uma Armadilha antes de enviar a imagem.');
        return;
    }

    const dataUrl = canvas.toDataURL('image/jpeg');

    // Mostrar o indicador de carregamento
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'flex'; // Mostra a animação

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

        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor: ' + response.statusText);
        }

        const data = await response.json();

        // Verifique o status retornado pelo servidor
        if (data.status === 'success') {
            console.log('Dados enviados com sucesso:', data.message);
            alert('Cadastro de armadilhas realizado com sucesso!');
        } else if (data.status === 'errorCadastro') {
            document.getElementById('alertModal').style.display = 'block';
        } else {
            throw new Error(data.message || 'Erro desconhecido ao cadastrar armadilha.');
        }
        
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Erro ao enviar dados: ' + error.message);
    } finally {
        // Esconder o indicador de carregamento após o envio
        loadingIndicator.style.display = 'none';
    }
});

// Lógica para os botões do modal
document.getElementById('confirmYes').addEventListener('click', async () => {
    console.log('Usuário optou por cadastrar mesmo assim.');
    
    // Mostrar o indicador de carregamento
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'flex'; // Mostra a animação

    document.getElementById('alertModal').style.display = 'none'; 

    try {
        const response = await fetch('/userConfirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ confirmation: 'yes' }) // Informação sobre a confirmação
        });
        const data = await response.json();

        // Verifique o status retornado pelo servidor
        if (data.status === 'success') {
            console.log('Dados enviados com sucesso:', data.message);
            alert('Cadastro de armadilhas realizado com sucesso!');
        } else if (data.status === 'errorCadastro') {
            document.getElementById('alertModal').style.display = 'block';
        } else {
            throw new Error(data.message || 'Erro desconhecido ao cadastrar armadilha.');
        }
        
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Erro ao enviar dados: ' + error.message);
    } finally {
        // Esconder o indicador de carregamento após o envio
        loadingIndicator.style.display = 'none';
    }
});

// Evento para o botão "Não"
document.getElementById('confirmNo').addEventListener('click', () => {
    console.log('Usuário optou por não cadastrar.');
    document.getElementById('alertModal').style.display = 'none'; // Fecha o modal
});
