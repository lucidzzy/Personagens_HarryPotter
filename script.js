document.addEventListener("DOMContentLoaded", () => {
    const charactersContainer = document.getElementById('characters');
    const filterInput = document.getElementById('filterInput');
    const characterDetailsContainer = document.getElementById('characterDetails');
    let charactersData = []; // Todos os personagens da API
    let displayedCharacters = []; // Personagens já exibidos
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let currentOffset = 0; // Controle do deslocamento para o carregamento de personagens
    const limit = 16; // Quantos personagens carregar por vez

    // Função para buscar personagens com base no offset e no limite
    const fetchCharacters = (offset, limit) => {
        fetch('https://hp-api.onrender.com/api/characters')
            .then(response => response.json())
            .then(data => {
                charactersData = data; // Armazena todos os personagens da API
                const newCharacters = data.slice(offset, offset + limit); // Carregar novos personagens
                displayedCharacters = [...displayedCharacters, ...newCharacters]; // Adiciona os novos personagens aos já exibidos
                displayCharacters(displayedCharacters); // Renderiza a lista de personagens
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    // Função para salvar favoritos no localStorage
    const saveFavorites = () => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    };

    // Função para exibir detalhes do personagem com o botão "X" para fechar
    const displayCharacterDetails = (character) => {
        characterDetailsContainer.innerHTML = `
            <button id="closeDetails" style="float: right; font-size: 1.5em;">X</button>
            <h2>${character.name}</h2>
            <img src="${character.image}" alt="${character.name}" width="200">
            <p><strong>House:</strong> ${character.house || 'Unknown'}</p>
            <p><strong>Actor:</strong> ${character.actor || 'Unknown'}</p>
            <p><strong>Patronus:</strong> ${character.patronus || 'Unknown'}</p>
            <p><strong>Wand:</strong> ${character.wand.wood || 'Unknown'} (${character.wand.core || 'Unknown'} core)</p>
        `;
        characterDetailsContainer.style.display = 'block'; // Exibe o contêiner de detalhes

        // Adicionar evento de clique no botão "X" para fechar os detalhes
        document.getElementById('closeDetails').addEventListener('click', () => {
            characterDetailsContainer.style.display = 'none'; // Oculta o contêiner de detalhes
        });
    };

    // Função para exibir os personagens filtrados
    const displayCharacters = (characters) => {
        charactersContainer.innerHTML = ''; // Limpa os personagens anteriores
        characters.forEach(character => {
            const isFavorite = favorites.includes(character.name);
            const characterElement = document.createElement('div');
            characterElement.classList.add('character');

            characterElement.innerHTML = `
                <h3>${character.name} 
                    <button class="favorite-btn">${isFavorite ? '❤️' : '🤍'}</button>
                </h3>
                <img src="${character.image}" alt="${character.name}" width="150">
                <p>House: ${character.house || 'Unknown'}</p>
                <p>Actor: ${character.actor || 'Unknown'}</p>
            `;

            // Adicionar evento de clique no botão de favorito
            characterElement.querySelector('.favorite-btn').addEventListener('click', () => {
                if (isFavorite) {
                    // Remove dos favoritos
                    favorites = favorites.filter(fav => fav !== character.name);
                } else {
                    // Adiciona aos favoritos
                    favorites.push(character.name);
                }
                saveFavorites();
                displayCharacters(displayedCharacters); // Re-renderiza para atualizar o status dos favoritos
            });

            // Adicionar evento de clique no item para exibir mais detalhes
            characterElement.addEventListener('click', () => {
                displayCharacterDetails(character);
            });

            charactersContainer.appendChild(characterElement);
        });
    };

    // Função para carregar mais personagens no scroll infinito
    const handleScroll = () => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.body.offsetHeight - 100; // 100px antes do final da página

        if (scrollPosition >= threshold) {
            currentOffset += limit; // Atualiza o offset para buscar o próximo lote de personagens
            if (currentOffset < charactersData.length) {
                fetchCharacters(currentOffset, limit); // Busca mais personagens
            }
        }
    };

    // Adicionar evento de input para filtrar os personagens
    filterInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        // Filtrar os personagens com base no nome ou casa
        const filteredCharacters = charactersData.filter(character =>
            character.name.toLowerCase().includes(searchTerm) ||
            (character.house && character.house.toLowerCase().includes(searchTerm))
        );

        displayCharacters(filteredCharacters); // Exibir personagens filtrados
    });

    // Adicionar evento de scroll para carregar mais personagens ao descer a página
    window.addEventListener('scroll', handleScroll);

    // Buscar os primeiros personagens
    fetchCharacters(currentOffset, limit);
});
