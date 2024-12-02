document.addEventListener('DOMContentLoaded', () => {
    // Função para carregar as fazendas
    async function loadFarms() {
        try {
            const response = await fetch('/fazendas');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const farms = await response.json();

            const farmSelect = document.getElementById('farmSelect');
            farmSelect.innerHTML = '<option value="" disabled selected>Selecione uma Fazenda</option>';

            farms.forEach(farm => {
                const option = document.createElement('option');
                option.value = farm.farmName;
                option.textContent = farm.farmName;
                farmSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Houve um problema com a requisição Fetch:', error);
        }
    }

    // Função para carregar as armadilhas com base na fazenda selecionada
    async function loadTraps(farmName) {
        try {
            const response = await fetch(`/trapcodes/${farmName}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const traps = await response.json();

            const trapSelect = document.getElementById('trapSelect');
            trapSelect.innerHTML = '<option value="" disabled selected>Selecione uma Armadilha</option>';

            traps.forEach(trap => {
                const option = document.createElement('option');
                option.value = trap.trapCode;
                option.textContent = trap.trapCode;
                trapSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Houve um problema com a requisição Fetch:', error);
        }
    }

    // Carrega as fazendas quando o DOM estiver carregado
    loadFarms();

    // Adiciona um listener para o evento de mudança no dropdown de fazendas
    document.getElementById('farmSelect').addEventListener('change', (event) => {
        const selectedFarm = event.target.value;
        loadTraps(selectedFarm); // Chama a função para carregar as traps
    });
});

