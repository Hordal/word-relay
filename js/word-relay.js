// 게임 상태를 관리하는 객체
const game = {
  participants: [], // 참가자 정보 배열 { id: number, name: string, active: boolean }
  participantCount: 0, // 총 참가자 수
  activePlayerCount: 0, // 현재 게임에 참여중인 참가자 수
  currentPlayerIndex: 0, // 현재 턴인 참가자의 인덱스
  currentWord: '', // 현재 제시어
  usedWords: new Set(), // 사용된 단어 집합
  wordHistory: [], // 최근 단어 기록
  isOver: false, // 게임 종료 여부
};

// 다음 턴으로 넘기는 함수
function nextTurn() {
  if (game.isOver) return;

  let nextIndex = game.currentPlayerIndex;
  do {
    nextIndex = (nextIndex + 1) % game.participantCount;
  } while (!game.participants[nextIndex].active); // 다음 활성 플레이어를 찾음

  game.currentPlayerIndex = nextIndex;
  updateUI(game);
}

// 새 라운드 시작 함수
function startNewRound() {
  game.currentWord = '';
  game.usedWords.clear();
  game.wordHistory = [];
  // 탈락한 플레이어의 다음 활성 플레이어부터 시작
  nextTurn();
  updateUI(game, '새 라운드 시작! 첫 단어를 입력하세요.');
}

// 플레이어 탈락 처리 함수
function handleElimination(reason) {
  const eliminatedPlayer = game.participants[game.currentPlayerIndex];
  eliminatedPlayer.active = false;
  game.activePlayerCount--;

  alert(`${eliminatedPlayer.name}님 탈락! (사유: ${reason})`);

  if (game.activePlayerCount <= 1) {
    game.isOver = true;
    updateUI(game);
  } else if (confirm('남은 참가자들로 새 라운드를 시작하시겠습니까?')) {
    // 새 라운드 시작
    startNewRound();
  } else {
    // 현재 게임 계속 진행
    nextTurn(); 
  }
}

// 입력 버튼 클릭 이벤트 핸들러
const onButtonClick = () => {
  if (game.isOver) {
    initGame(); // 게임이 끝났으면 다시 시작
    return;
  }

  const newWord = ui.input.value.trim();

  // 1. 유효성 검사: 빈 값
  if (!newWord) {
    alert('단어를 입력하세요.');
    ui.input.focus();
    return;
  }

  // 2. 유효성 검사: 2글자 미만 단어 (경고 후 재입력)
  if (newWord.length < 2) {
    alert('2글자 이상의 단어를 입력해주세요.');
    ui.input.value = '';
    ui.input.focus();
    return;
  }

  // 3. 유효성 검사: 중복 단어 (탈락 조건)
  if (game.usedWords.has(newWord)) {
    handleElimination('이미 사용된 단어 입력');
    return;
  }

  // 4. 첫 단어 설정 또는 끝말잇기 규칙 검사
  if (!game.currentWord) {
    // 첫 단어인 경우
    game.currentWord = newWord;
    game.wordHistory.push(newWord); // 기록에 추가
    game.usedWords.add(newWord);
    nextTurn();
  } else {
    // 끝말잇기 규칙 검사
    if (game.currentWord.at(-1) === newWord[0]) {
      // 성공
      game.wordHistory.push(newWord); // 기록에 추가
      if (game.wordHistory.length > 5) game.wordHistory.shift(); // 5개 초과 시 가장 오래된 단어 제거
      game.currentWord = newWord;
      game.usedWords.add(newWord);
      nextTurn();
    } else {
      // 실패 (탈락 조건)
      handleElimination('잘못된 단어 입력');
    }
  }
  ui.input.value = '';
  ui.input.focus();
};

// 게임 초기화 및 시작 함수
function initGame() {
  // 1. 참가자 수 입력 받기
  const countInput = prompt('몇 명이 참가하나요? (2명 이상)');
  const count = parseInt(countInput, 10);

  if (isNaN(count) || count < 2) {
    alert('2명 이상의 숫자를 입력해주세요.');
    location.reload(); // 잘못된 입력 시 새로고침
    return;
  }

  // 2. 참가자 이름 입력 받기
  const participants = [];
  for (let i = 0; i < count; i++) {
    let name = prompt(`${i + 1}번 참가자의 이름을 입력하세요.`);
    if (!name || !name.trim()) {
      alert('이름을 반드시 입력해야 합니다. 게임을 다시 시작합니다.');
      location.reload();
      return;
    }
    participants.push({ id: i + 1, name: name.trim(), active: true });
  }

  // 3. 순서 정하기
  if (confirm('참가자 순서를 무작위로 섞으시겠습니까?')) {
    // Fisher-Yates Shuffle 알고리즘으로 배열 섞기
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }
  }

  // 순서가 정해진 후, id를 재할당하여 1, 2, 3... 순서로 만듭니다.
  participants.forEach((p, index) => {
    p.id = index + 1;
  });

  const playerOrder = participants.map(p => p.name).join(' → ');
  alert(`게임 순서: ${playerOrder}`);

  // 게임 상태 초기화
  game.participantCount = count;
  game.activePlayerCount = count;
  game.participants = participants;
  game.currentPlayerIndex = 0;
  game.currentWord = '';
  game.usedWords.clear();
  game.wordHistory = [];
  game.isOver = false;

  // 4. UI 초기화 및 게임 시작
  resetUI();
  updateUI(game, '첫 단어를 입력해주세요.');
}

// 이벤트 리스너 등록
ui.button.addEventListener('click', onButtonClick);
ui.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    onButtonClick();
  }
});

// 게임 시작
initGame();
