document.addEventListener('DOMContentLoaded', () => {
    const farmSelect = document.getElementById('farmSelect');
    const trapSelect = document.getElementById('trapSelect');
    const fetchImageBtn = document.getElementById('fetchImage');
    const imageContainer = document.getElementById('imageContainer');
    const capturedImage = document.getElementById('capturedImage');

    // Elemento para exibir a contagem de objetos
    let objectCountDisplay = document.createElement('p');
    imageContainer.appendChild(objectCountDisplay);

    // Load farms when the page loads
    loadFarms();

    // Event listener for farm selection
    farmSelect.addEventListener('change', () => {
        const selectedFarm = farmSelect.value;
        if (selectedFarm) {
            loadTraps(selectedFarm);
        }
    });

    // Event listener for the fetch image button
    fetchImageBtn.addEventListener('click', () => {
        const selectedFarm = farmSelect.value;
        const selectedTrap = trapSelect.value;
        if (selectedFarm && selectedTrap) {
            fetchImage(selectedFarm, selectedTrap);
        } else {
            alert('Por favor, selecione uma Fazenda e uma Trap.');
        }
    });

    // Function to load farms
    async function loadFarms() {
        try {
            const response = await fetch('/farms2');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const farms = await response.json();
            farms.forEach(farm => {
                const option = document.createElement('option');
                option.value = farm.farmName;
                option.textContent = farm.farmName;
                farmSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading farms:', error);
        }
    }

    // Function to load traps based on selected farm
    async function loadTraps(farmName) {
        try {
            const response = await fetch(`/trapcodes2/${farmName}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const traps = await response.json();
            trapSelect.innerHTML = '<option value="" disabled selected>Selecione uma Trap</option>';
            traps.forEach(trap => {
                const option = document.createElement('option');
                option.value = trap.trapCode;
                option.textContent = trap.trapCode;
                trapSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading traps:', error);
        }
    }

    // Function to fetch and display the image
    async function fetchImage(farmName, trapCode) {
        try {
            const response = await fetch(`/getImage?farm=${farmName}&trap=${trapCode}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Atualizando a imagem
            capturedImage.src = `data:image/jpeg;base64,${data.image}`;
            imageContainer.style.display = 'block';

            // Limpar contagem antiga e atualizar com a nova
            objectCountDisplay.textContent = `Contagem de Objetos: ${data.objectCount !== null ? data.objectCount : 'N/A'}`;

        } catch (error) {
            console.error('Error fetching image:', error);
            alert('Erro ao buscar a imagem. Por favor, tente novamente.');
        }
    }

});

