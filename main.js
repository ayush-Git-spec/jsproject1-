const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

// --- History (stack of ImageData snapshots) ---
let history = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

function saveState() {
  history = history.slice(0, historyIndex + 1);
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (history.length > MAX_HISTORY) history.shift();
  historyIndex = history.length - 1;
  updateButtons();
}

function restoreState(index) {
  if (index < 0 || index >= history.length) return;
  ctx.putImageData(history[index], 0, 0);
  historyIndex = index;
  updateButtons();
}

function undo() { restoreState(historyIndex - 1); }
function redo() { restoreState(historyIndex + 1); }

function reset() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveState();
}

function updateButtons() {
  document.getElementById('undoBtn').disabled = historyIndex <= 0;
  document.getElementById('redoBtn').disabled = historyIndex >= history.length - 1;
}

// --- Drawing (click = random colour dot) ---
const DOT_RADIUS = 8;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function placeDot(e) {
  const pos = getPos(e);
  ctx.fillStyle = randomColor();
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, DOT_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  saveState();
}

canvas.addEventListener('click', placeDot);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); placeDot(e); });

// --- Buttons ---
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);
document.getElementById('resetBtn').addEventListener('click', reset);

// --- Keyboard shortcuts ---
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undo();
  } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    redo();
  } else if (e.ctrlKey && e.key.toLowerCase() === 'r') {
    e.preventDefault();
    reset();
  }
});

window.addEventListener('resize', () => {
  resizeCanvas();
  reset();
});

// Init
reset();