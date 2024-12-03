9999999999999999999999999999999999999999999999999999999999999999999999999999999const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isPainting = false;
let lineWidth = 5;
let eraserLineWidth = 10;
let startX;
let startY;
let isEraser = false;
let isPencil = false;
let isBrush = false;
let isSpray = false;
let strokes = [];
const gridSize = 20;

function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;

    for (let x = gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

drawGrid();

toolbar.addEventListener('click', (e) => {
    if (e.target.id === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokes = [];
    } else if (e.target.id === 'undo') {
        undo();
    } else if (e.target.id === 'eraser') {
        toggleEraser();
    } else if (e.target.id === 'pencil') {
        togglePencil();
    } else if (e.target.id === 'brush') {
        toggleBrush();
    } else if (e.target.id === 'spray') {
        toggleSpray();
    } else if (e.target.id === 'save') {
        saveDrawing();
    }
});

toolbar.addEventListener('change', (e) => {
    if (e.target.id === 'stroke') {
        ctx.strokeStyle = isEraser ? 'white' : e.target.value;
    }

    if (e.target.id === 'linewidth') {
        lineWidth = e.target.value;
        if (!isEraser && !isBrush && !isSpray) {
            ctx.lineWidth = lineWidth;
        }
    }
});

// Add input event listener for real-time updates while sliding
toolbar.addEventListener('input', (e) => {
    if (e.target.id === 'eraserLinewidth') {
        eraserLineWidth = e.target.value;
        if (isEraser) {
            ctx.lineWidth = eraserLineWidth;
        }
    }
});

const draw = (e) => {
    if (!isPainting) {
        return;
    }

    ctx.lineCap = 'round';

    const currentX = Math.round((e.clientX - canvasOffsetX) / gridSize) * gridSize;
    const currentY = Math.round((e.clientY - canvasOffsetY) / gridSize) * gridSize;

    if (isSpray) {
        spray(currentX, currentY);
    } else {
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);

        if (!isEraser) {
            strokes.push({ x: currentX, y: currentY });
        }
    }
};

canvas.addEventListener('mousedown', (e) => {
    isPainting = true;
    startX = Math.round((e.clientX - canvasOffsetX) / gridSize) * gridSize;
    startY = Math.round((e.clientY - canvasOffsetY) / gridSize) * gridSize;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    strokes.push({ x: startX, y: startY });
});

canvas.addEventListener('mousemove', draw);

canvas.addEventListener('mouseup', () => {
    isPainting = false;
    ctx.stroke();
    ctx.beginPath();
});

canvas.addEventListener('mouseout', () => {
    isPainting = false;
    ctx.stroke();
    ctx.beginPath();
});

function saveDrawing() {
    const drawingData = JSON.stringify({
        strokes: strokes,
        strokeStyle: isEraser ? 'white' : ctx.strokeStyle,
        lineWidth: isEraser ? eraserLineWidth : lineWidth
    });

    const blob = new Blob([drawingData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

function undo() {
    strokes.pop();
    redraw();
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    strokes.forEach((point, index, array) => {
        ctx.lineCap = 'round';

        if (index === 0) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        }
    });
}

function toggleEraser() {
    isEraser = true;
    isPencil = false;
    isBrush = false;
    isSpray = false;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = eraserLineWidth;
}

function togglePencil() {
    isEraser = false;
    isPencil = true;
    isBrush = false;
    isSpray = false;

    ctx.strokeStyle = document.getElementById('stroke').value;
    ctx.lineWidth = lineWidth;
}

function toggleBrush() {
    isEraser = false;
    isPencil = false;
    isBrush = true;
    isSpray = false;

    ctx.strokeStyle = document.getElementById('stroke').value;
    ctx.lineWidth = lineWidth * 2;
}

function toggleSpray() {
    isEraser = false;
    isPencil = false;
    isBrush = false;
    isSpray = true;

    ctx.strokeStyle = document.getElementById('stroke').value;
    ctx.lineWidth = lineWidth;
}

function spray(x, y) {
    const density = 30; // Adjust the density of spray
    for (let i = 0; i < density; i++) {
        const offsetX = (Math.random() - 0.5) * lineWidth * 2;
        const offsetY = (Math.random() - 0.5) * lineWidth * 2;
        ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
    }
}
