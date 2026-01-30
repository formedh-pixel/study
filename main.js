import { hanjaData } from './data.js';

let currentLevelData = [];
let currentHanja = null;
let writer = null;
let isHanjaVisible = true;
let isHunVisible = true;
let isEumVisible = true;
let quizScore = 0;

// Page Elements
const landingPage = document.getElementById('landing-page');
const menuPage = document.getElementById('menu-page');
const levelSelectionPage = document.getElementById('level-selection-page');
const hanjaGridPage = document.getElementById('hanja-grid-page');
const quizPage = document.getElementById('quiz-page');
const hanjaWordPage = document.getElementById('hanja-word-page');
const findHanjaPage = document.getElementById('find-hanja-page');

// Button Elements
const enterBtn = document.getElementById('enter-btn');
const homeBtn = document.getElementById('home-btn');
const levelSelectionBtn = document.getElementById('level-selection-btn');
const quizBtn = document.getElementById('quiz-btn');
const hanjaWordBtn = document.getElementById('hanja-word-btn');
const findHanjaBtn = document.getElementById('find-hanja-btn');
const backToMenuFromLevelsBtn = document.getElementById('back-to-menu-from-levels-btn');
const backToMenuFromQuizBtn = document.getElementById('back-to-menu-from-quiz-btn');
const backToMenuFromHanjaWordBtn = document.getElementById('back-to-menu-from-hanja-word-btn');
const backToMenuFromFindHanjaBtn = document.getElementById('back-to-menu-from-find-hanja-btn');
const levelButtonsContainer = document.querySelector('.level-buttons');
const backToLevelsBtn = document.getElementById('back-to-levels-btn');
const toggleHanjaBtn = document.getElementById('toggle-hanja-btn');
const toggleHunBtn = document.getElementById('toggle-hun-btn');
const toggleEumBtn = document.getElementById('toggle-eum-btn');

// Grid Page Elements
const gridTitle = document.getElementById('grid-title');
const hanjaCount = document.getElementById('hanja-count');
const hanjaGrid = document.getElementById('hanja-grid');

// Modal Elements
const hanjaModal = document.getElementById('hanja-modal');
const modalHanja = document.getElementById('modal-hanja');
const modalDetails = document.getElementById('modal-details');
const closeBtn = document.querySelector('.close-btn');
const resetCanvasBtn = document.getElementById('reset-canvas-btn');
const toggleStrokeOrderBtn = document.getElementById('toggle-stroke-order-btn');

// Canvas & Animation Elements
const canvas = document.getElementById('writing-canvas');
const strokeOrderAnimationContainer = document.getElementById('stroke-order-animation');
const ctx = canvas.getContext('2d');
let isDrawing = false;

// Quiz Elements
const quizLevelSelect = document.getElementById('quiz-level-select');
const quizScoreEl = document.getElementById('quiz-score');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const quizResult = document.getElementById('quiz-result');

// Search Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');


function setupCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
}

function drawWatermark() {
    if (!currentHanja) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.fillStyle = '#f0f0f0';
    ctx.font = `bold ${canvas.height * 0.8}px 'Noto Sans KR'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentHanja.hanja, centerX, centerY);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWatermark();
}

function openModal(hanjaItem) {
    currentHanja = hanjaItem;
    modalHanja.textContent = currentHanja.hanja;
    modalDetails.textContent = `${currentHanja.hun} ${currentHanja.eum}`;

    if (writer) {
        strokeOrderAnimationContainer.innerHTML = '';
        writer = null;
    }
    strokeOrderAnimationContainer.style.display = 'none';
    toggleStrokeOrderBtn.textContent = '획순보기';

    requestAnimationFrame(() => {
        setupCanvas();
        clearCanvas();
    });

    hanjaModal.style.display = 'flex';
}

function closeModal() {
    if (writer) {
        strokeOrderAnimationContainer.innerHTML = '';
        writer = null;
    }
    strokeOrderAnimationContainer.style.display = 'none';
    toggleStrokeOrderBtn.textContent = '획순보기';

    hanjaModal.style.display = 'none';
    currentHanja = null;
}

function toggleStrokeOrderAnimation() {
    if (writer) {
        strokeOrderAnimationContainer.innerHTML = '';
        writer = null;
        strokeOrderAnimationContainer.style.display = 'none';
        toggleStrokeOrderBtn.textContent = '획순보기';
    } else {
        strokeOrderAnimationContainer.style.display = 'block';
        toggleStrokeOrderBtn.textContent = '획순닫기';

        writer = HanziWriter.create(strokeOrderAnimationContainer, currentHanja.hanja, {
            width: strokeOrderAnimationContainer.clientWidth,
            height: strokeOrderAnimationContainer.clientHeight,
            padding: 5,
            showOutline: true,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 200,
        });
        writer.animateCharacter();
    }
}

function resetVisibility() {
    isHanjaVisible = true;
    isHunVisible = true;
    isEumVisible = true;

    [toggleHanjaBtn, toggleHunBtn, toggleEumBtn].forEach(btn => {
        btn.querySelector('.icon-eye-open').classList.remove('hidden');
        btn.querySelector('.icon-eye-closed').classList.add('hidden');
    });
}

function displayHanjaGrid(level) {
    gridTitle.textContent = level;
    hanjaGrid.innerHTML = '';
    currentLevelData = hanjaData[level] || [];

    resetVisibility();

    if (currentLevelData.length === 0) {
        hanjaCount.textContent = '';
        hanjaGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">준비중입니다.</p>';
        return;
    }

    hanjaCount.textContent = `(총 ${currentLevelData.length}자)`

    currentLevelData.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'grid-row';
        row.innerHTML = `
            <div class="grid-item">${index + 1}</div>
            <div class="grid-item hanja-cell">${item.hanja}</div>
            <div class="grid-item hun-cell">${item.hun}</div>
            <div class="grid-item eum-cell">${item.eum}</div>
            <div class="grid-item">${item.strokes}</div>
        `;
        hanjaGrid.appendChild(row);
    });
}

function getEventPosition(event) {
    const rect = canvas.getBoundingClientRect();
    if (event.touches && event.touches.length > 0) {
        return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
    }
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getEventPosition(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getEventPosition(e);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function handleVisibilityToggle(type) {
    let isVisible, btn, cellClass, hiddenClass;

    if (type === 'hanja') {
        isHanjaVisible = !isHanjaVisible;
        isVisible = isHanjaVisible;
        btn = toggleHanjaBtn;
        cellClass = '.hanja-cell';
        hiddenClass = 'hanja-hidden';
    } else if (type === 'hun') {
        isHunVisible = !isHunVisible;
        isVisible = isHunVisible;
        btn = toggleHunBtn;
        cellClass = '.hun-cell';
        hiddenClass = 'hun-hidden';
    } else { // eum
        isEumVisible = !isEumVisible;
        isVisible = isEumVisible;
        btn = toggleEumBtn;
        cellClass = '.eum-cell';
        hiddenClass = 'eum-hidden';
    }
    
    const eyeOpen = btn.querySelector('.icon-eye-open');
    const eyeClosed = btn.querySelector('.icon-eye-closed');
    eyeOpen.classList.toggle('hidden', !isVisible);
    eyeClosed.classList.toggle('hidden', isVisible);

    const cells = document.querySelectorAll(cellClass);
    cells.forEach(cell => {
        cell.classList.toggle(hiddenClass, !isVisible);
    });
}

function populateQuizLevelSelect() {
    quizLevelSelect.innerHTML = '<option value="전체">전체</option>';
    for (const level in hanjaData) {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        quizLevelSelect.appendChild(option);
    }
}

function generateQuiz() {
    const selectedLevel = quizLevelSelect.value;
    let quizData = [];

    if (selectedLevel === '전체') {
        for (const level in hanjaData) {
            quizData = quizData.concat(hanjaData[level]);
        }
    } else {
        quizData = hanjaData[selectedLevel];
    }

    if (quizData.length < 4) {
        quizQuestion.textContent = '데이터가 부족합니다.';
        quizOptions.innerHTML = '';
        return;
    }

    // Select a random hanja for the question
    const questionIndex = Math.floor(Math.random() * quizData.length);
    const questionHanja = quizData[questionIndex];
    quizQuestion.textContent = questionHanja.hanja;

    // Create options
    let options = [questionHanja];
    while (options.length < 4) {
        const randomIndex = Math.floor(Math.random() * quizData.length);
        const randomHanja = quizData[randomIndex];
        if (!options.some(opt => opt.hanja === randomHanja.hanja)) {
            options.push(randomHanja);
        }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    // Display options
    const optionButtons = quizOptions.querySelectorAll('.quiz-option-btn');
    optionButtons.forEach((button, index) => {
        button.textContent = `${options[index].hun} ${options[index].eum}`;
        button.dataset.hanja = options[index].hanja;
        button.disabled = false;
        button.classList.remove('correct', 'incorrect');
    });

    quizResult.textContent = '';
}

function checkQuizAnswer(selectedHanja) {
    const questionHanja = quizQuestion.textContent;
    const optionButtons = quizOptions.querySelectorAll('.quiz-option-btn');

    optionButtons.forEach(button => {
        button.disabled = true;
    });

    if (selectedHanja === questionHanja) {
        quizScore++;
        quizResult.textContent = '맞음';
        quizResult.style.color = 'green';
        const correctButton = Array.from(optionButtons).find(btn => btn.dataset.hanja === selectedHanja);
        correctButton.classList.add('correct');
    } else {
        quizResult.textContent = '틀림';
        quizResult.style.color = 'red';
        const correctButton = Array.from(optionButtons).find(btn => btn.dataset.hanja === questionHanja);
        correctButton.classList.add('correct');
        const incorrectButton = Array.from(optionButtons).find(btn => btn.dataset.hanja === selectedHanja);
        incorrectButton.classList.add('incorrect');
    }

    quizScoreEl.textContent = `점수: ${quizScore}`;

    setTimeout(generateQuiz, 2000);
}

function searchHanja() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm === '') {
        searchResults.innerHTML = '';
        return;
    }

    let results = [];
    for (const level in hanjaData) {
        const levelData = hanjaData[level];
        const filteredData = levelData.filter(item => 
            item.hanja.includes(searchTerm) || 
            item.hun.includes(searchTerm) || 
            item.eum.includes(searchTerm)
        );
        results = results.concat(filteredData.map(item => ({...item, level})));
    }

    displaySearchResults(results);
}

function displaySearchResults(results) {
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.innerHTML = '<p>검색 결과가 없습니다.</p>';
        return;
    }

    const resultGrid = document.createElement('div');
    resultGrid.className = 'search-result-grid';

    const header = document.createElement('div');
    header.className = 'search-result-header';
    header.innerHTML = `
        <div>급수</div>
        <div>한자</div>
        <div>훈</div>
        <div>음</div>
        <div>총획</div>
    `;
    resultGrid.appendChild(header);

    results.forEach(item => {
        const row = document.createElement('div');
        row.className = 'search-result-row';
        row.innerHTML = `
            <div>${item.level}</div>
            <div>${item.hanja}</div>
            <div>${item.hun}</div>
            <div>${item.eum}</div>
            <div>${item.strokes}</div>
        `;
        resultGrid.appendChild(row);
    });

    searchResults.appendChild(resultGrid);
}

// --- Event Listeners ---

enterBtn.addEventListener('click', () => {
    landingPage.style.display = 'none';
    menuPage.style.display = 'flex';
});

homeBtn.addEventListener('click', () => {
    [menuPage, levelSelectionPage, hanjaGridPage, quizPage, hanjaWordPage, findHanjaPage].forEach(p => p.style.display = 'none');
    landingPage.style.display = 'flex';
});

levelSelectionBtn.addEventListener('click', () => {
    menuPage.style.display = 'none';
    levelSelectionPage.style.display = 'flex';
});

quizBtn.addEventListener('click', () => {
    menuPage.style.display = 'none';
    quizPage.style.display = 'flex';
    populateQuizLevelSelect();
    generateQuiz();
    quizScore = 0;
    quizScoreEl.textContent = `점수: ${quizScore}`;
});

hanjaWordBtn.addEventListener('click', () => {
    menuPage.style.display = 'none';
    hanjaWordPage.style.display = 'flex';
});

findHanjaBtn.addEventListener('click', () => {
    menuPage.style.display = 'none';
    findHanjaPage.style.display = 'flex';
});

backToMenuFromLevelsBtn.addEventListener('click', () => {
    levelSelectionPage.style.display = 'none';
    menuPage.style.display = 'flex';
});

backToMenuFromQuizBtn.addEventListener('click', () => {
    quizPage.style.display = 'none';
    menuPage.style.display = 'flex';
});

backToMenuFromHanjaWordBtn.addEventListener('click', () => {
    hanjaWordPage.style.display = 'none';
    menuPage.style.display = 'flex';
});

backToMenuFromFindHanjaBtn.addEventListener('click', () => {
    findHanjaPage.style.display = 'none';
    menuPage.style.display = 'flex';
});

document.querySelectorAll('.level-btn').forEach(button => {
    button.addEventListener('click', () => {
        const level = button.textContent;
        levelSelectionPage.style.display = 'none';
        hanjaGridPage.style.display = 'flex';
        displayHanjaGrid(level);
    });
});

backToLevelsBtn.addEventListener('click', () => {
    hanjaGridPage.style.display = 'none';
    levelSelectionPage.style.display = 'flex';
    levelButtonsContainer.scrollTop = 0;
});

toggleHanjaBtn.addEventListener('click', () => handleVisibilityToggle('hanja'));
toggleHunBtn.addEventListener('click', () => handleVisibilityToggle('hun'));
toggleEumBtn.addEventListener('click', () => handleVisibilityToggle('eum'));


// Modal & Canvas Event Listeners
closeBtn.addEventListener('click', closeModal);
resetCanvasBtn.addEventListener('click', clearCanvas);
toggleStrokeOrderBtn.addEventListener('click', toggleStrokeOrderAnimation);

window.addEventListener('click', (event) => {
    if (event.target === hanjaModal) closeModal();
});

hanjaGrid.addEventListener('click', (event) => {
    const gridRow = event.target.closest('.grid-row');
    if (gridRow) {
        const clickedCell = event.target.closest('.grid-item');
        if (!clickedCell) return;

        const hanjaCell = gridRow.querySelector('.hanja-cell');
        if (hanjaCell) {
            const hanjaChar = hanjaCell.textContent;
            const hanjaItem = currentLevelData.find(item => item.hanja === hanjaChar);
            if (hanjaItem) openModal(hanjaItem);
        }
    }
});


// Drawing Event Listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

// Quiz Event Listeners
quizLevelSelect.addEventListener('change', generateQuiz);
quizOptions.addEventListener('click', (event) => {
    if (event.target.classList.contains('quiz-option-btn')) {
        checkQuizAnswer(event.target.dataset.hanja);
    }
});

// Search Event Listeners
searchBtn.addEventListener('click', searchHanja);
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        searchHanja();
    }
});

searchResults.addEventListener('click', (event) => {
    const resultRow = event.target.closest('.search-result-row');
    if (resultRow) {
        const hanjaChar = resultRow.children[1].textContent;
        let hanjaItem = null;

        for (const level in hanjaData) {
            const found = hanjaData[level].find(item => item.hanja === hanjaChar);
            if (found) {
                hanjaItem = found;
                break;
            }
        }

        if (hanjaItem) {
            openModal(hanjaItem);
        }
    }
});