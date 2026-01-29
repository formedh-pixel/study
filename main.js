import { hanjaData } from './data.js';

let currentLevelData = [];
let currentHanja = null;
let writer = null;
let isHanjaVisible = true;
let isHunVisible = true;
let isEumVisible = true;

// Page Elements
const landingPage = document.getElementById('landing-page');
const levelSelectionPage = document.getElementById('level-selection-page');
const hanjaGridPage = document.getElementById('hanja-grid-page');

// Button Elements
const enterBtn = document.getElementById('enter-btn');
const homeBtn = document.getElementById('home-btn');
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


// --- Event Listeners ---

enterBtn.addEventListener('click', () => {
    landingPage.style.display = 'none';
    levelSelectionPage.style.display = 'flex';
    levelButtonsContainer.scrollTop = 0;
});

homeBtn.addEventListener('click', () => {
    [levelSelectionPage, hanjaGridPage].forEach(p => p.style.display = 'none');
    landingPage.style.display = 'flex';
});

// Re-fetch level buttons after adding 준3급 dynamically if needed, or ensure it's hardcoded
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
        // Check if the click is on a cell, but not on a hidden one for opening the modal
        const clickedCell = event.target.closest('.grid-item');
        if (!clickedCell) return;

        // Modal should still open even if some parts are hidden. The hanja-cell is the key.
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
