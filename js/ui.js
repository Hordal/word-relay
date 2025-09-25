// DOM 요소 참조
const ui = {
  input: document.querySelector('.input-area input'),
  button: document.querySelector('.input-area button'),
  wordEl: document.querySelector('#word'),
  orderEl: document.querySelector('#order'),
  historyEl: document.querySelector('#history-log'),
  turnDisplay: document.querySelector('#turn-display'),
  playerList: document.querySelector('#player-list'),
};

// UI 업데이트 함수
function updateUI(gameState, message = '') {
  if (gameState.isOver) {
    const winner = gameState.participants.find(p => p.active);
    ui.wordEl.textContent = `게임 종료! 승자: ${winner.name}님`;
    ui.turnDisplay.style.display = 'none';
    ui.button.textContent = '다시 시작';
    ui.input.style.display = 'none';
  } else {
    const currentPlayer = gameState.participants[gameState.currentPlayerIndex];
    ui.orderEl.textContent = `${currentPlayer.id}번 ${currentPlayer.name}`;
    ui.wordEl.textContent = gameState.currentWord;
    ui.input.value = '';
    ui.input.focus();
    ui.input.placeholder = message || `${gameState.currentWord ? gameState.currentWord.at(-1) + '로 시작하는 단어' : '첫 단어를 입력하세요'}`;
  }

  // 단어 기록 UI 업데이트
  const historyText = gameState.wordHistory.length > 0 ? gameState.wordHistory.join('<br>↓<br>') : '기록 없음';
  ui.historyEl.innerHTML = historyText;

  // 참가자 목록 UI 업데이트
  ui.playerList.innerHTML = ''; // 목록 초기화
  gameState.participants.forEach((player, index) => {
    const playerEl = document.createElement('div');
    playerEl.classList.add('player-item');
    playerEl.textContent = player.name;

    if (!player.active) {
      // 탈락한 플레이어
      playerEl.classList.add('eliminated-player');
    } else if (index === gameState.currentPlayerIndex && !gameState.isOver) {
      // 현재 턴인 활성 플레이어
      playerEl.classList.add('active-player');
    }

    ui.playerList.appendChild(playerEl);
  });
}

function resetUI() {
  ui.turnDisplay.style.display = 'block';
  ui.input.style.display = 'inline-block';
  ui.button.textContent = '입력';
}