(function() {
  // ----- CONFIGURACIÓN -----
  const TOTAL_PAIRS = 8;                 // 8 pares -> 16 cartas
  const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']; // 8 emojis únicos

  // ----- ESTADO DEL JUEGO -----
  let cards = [];                 // array de objetos { id, emoji, matched }
  let flippedIndices = [];       // índices de cartas volteadas actualmente (máximo 2)
  let matchedPairs = 0;
  let moves = 0;
  let lockBoard = false;         // bloquea clics mientras se comparan cartas

  // ----- ELEMENTOS DEL DOM -----
  const boardEl = document.getElementById('board');
  const moveCountEl = document.getElementById('moveCount');
  const pairCountEl = document.getElementById('pairCount');
  const winMessageEl = document.getElementById('winMessage');
  const restartBtn = document.getElementById('restartButton');

  // ----- INICIALIZAR / REINICIAR JUEGO -----
  function initGame() {
    // Reiniciar estado
    flippedIndices = [];
    matchedPairs = 0;
    moves = 0;
    lockBoard = false;
    updateStats();
    winMessageEl.classList.add('hidden');

    // Crear mazo: duplicar emojis y barajar
    const deck = [...EMOJIS, ...EMOJIS]; // 16 cartas
    shuffleArray(deck);

    // Crear objetos de carta
    cards = deck.map((emoji, index) => ({
      id: index,
      emoji: emoji,
      matched: false,
    }));

    // Renderizar tablero
    renderBoard();
  }

  // Barajar (Fisher-Yates)
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Renderizar todas las cartas en el tablero
  function renderBoard() {
    boardEl.innerHTML = '';
    cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = `card ${card.matched ? 'matched' : ''}`;
      cardEl.dataset.index = index;

      // Estructura interna para el efecto 3D
      const innerEl = document.createElement('div');
      innerEl.className = 'card-inner';

      const backEl = document.createElement('div');
      backEl.className = 'card-back';

      const frontEl = document.createElement('div');
      frontEl.className = 'card-front';
      frontEl.textContent = card.emoji;

      innerEl.appendChild(backEl);
      innerEl.appendChild(frontEl);
      cardEl.appendChild(innerEl);

      // Si la carta ya está emparejada, la mostramos volteada (matched)
      if (card.matched) {
        cardEl.classList.add('flipped', 'matched');
      }

      // Evento click
      cardEl.addEventListener('click', () => onCardClick(index));

      boardEl.appendChild(cardEl);
    });
  }

  // ----- MANEJAR CLIC EN CARTA -----
  function onCardClick(index) {
    // Bloqueos: tablero bloqueado, carta ya emparejada o ya volteada
    if (lockBoard) return;
    if (cards[index].matched) return;
    if (flippedIndices.includes(index)) return;
    if (flippedIndices.length >= 2) return;

    // Voltear la carta visualmente
    const cardEl = boardEl.children[index];
    cardEl.classList.add('flipped');

    // Añadir a la lista de volteadas
    flippedIndices.push(index);

    // Si hay 2 cartas volteadas, comparar
    if (flippedIndices.length === 2) {
      // Incrementar movimientos
      moves++;
      updateStats();
      // Bloquear tablero mientras se procesa
      lockBoard = true;
      checkMatch();
    }
  }

  // Comprobar si las dos cartas volteadas coinciden
  function checkMatch() {
    const [idxA, idxB] = flippedIndices;
    const cardA = cards[idxA];
    const cardB = cards[idxB];

    if (cardA.emoji === cardB.emoji) {
      // Coincidencia: marcar como emparejadas
      cardA.matched = true;
      cardB.matched = true;
      matchedPairs++;

      // Actualizar clases CSS
      const elA = boardEl.children[idxA];
      const elB = boardEl.children[idxB];
      elA.classList.add('matched');
      elB.classList.add('matched');

      // Actualizar estadísticas
      updateStats();

      // Limpiar el estado de volteadas
      flippedIndices = [];
      lockBoard = false;

      // Verificar si el juego terminó
      if (matchedPairs === TOTAL_PAIRS) {
        winMessageEl.classList.remove('hidden');
      }
    } else {
      // No coinciden: esperar un momento y voltearlas de nuevo
      setTimeout(() => {
        const elA = boardEl.children[idxA];
        const elB = boardEl.children[idxB];
        // Asegurarse de que no se han emparejado mientras tanto
        if (!cards[idxA].matched) elA.classList.remove('flipped');
        if (!cards[idxB].matched) elB.classList.remove('flipped');

        // Limpiar estado
        flippedIndices = [];
        lockBoard = false;
      }, 700);
    }
  }

  // Actualizar contadores en pantalla
  function updateStats() {
    moveCountEl.textContent = moves;
    pairCountEl.textContent = matchedPairs;
  }

  // ----- REINICIAR -----
  restartBtn.addEventListener('click', () => {
    initGame();
  });

  // ----- INICIO -----
  initGame();

})();