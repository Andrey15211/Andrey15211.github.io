// === Получаем элементы ===
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const ctx = canvas.getContext('2d');
const pctx = preview.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const shapePicker = document.getElementById('shapePicker');
const sizePicker = document.getElementById('sizePicker');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const themeToggle = document.getElementById('themeToggle');

let drawing = false;
let startX = 0, startY = 0;
let lastX = 0, lastY = 0;

// === Параметры ===
let color = colorPicker.value;
let shape = shapePicker.value;
let lineWidth = sizePicker.value;

// === Обновление параметров ===
colorPicker.addEventListener('input', e => color = e.target.value);
shapePicker.addEventListener('change', e => shape = e.target.value);
sizePicker.addEventListener('input', e => lineWidth = e.target.value);

// === Получение координат ===
function getCoords(e, target = preview) {
    const rect = target.getBoundingClientRect();
    const scaleX = target.width / rect.width;
    const scaleY = target.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

// === Начало рисования ===
preview.addEventListener('mousedown', e => {
    drawing = true;
    const { x, y } = getCoords(e);
    startX = lastX = x;
    startY = lastY = y;
    if (shape === 'free') {
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
});

// === Рисование и предпросмотр ===
preview.addEventListener('mousemove', e => {
    if (!drawing) return;
    const { x, y } = getCoords(e);

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    pctx.strokeStyle = color;
    pctx.lineWidth = lineWidth;
    pctx.lineCap = 'round';

    if (shape === 'free') {
        ctx.lineTo(x, y);
        ctx.stroke();
        [lastX, lastY] = [x, y];
    } else {
        pctx.clearRect(0, 0, preview.width, preview.height);
        pctx.beginPath();

        switch (shape) {
            case 'rect':
                pctx.strokeRect(startX, startY, x - startX, y - startY);
                break;
            case 'circle':
                const radius = Math.hypot(x - startX, y - startY);
                pctx.arc(startX, startY, radius, 0, Math.PI * 2);
                pctx.stroke();
                break;
            case 'line':
                pctx.moveTo(startX, startY);
                pctx.lineTo(x, y);
                pctx.stroke();
                break;
        }
    }
});

// === Завершение рисования ===
preview.addEventListener('mouseup', e => {
    if (!drawing) return;
    drawing = false;
    const { x, y } = getCoords(e);
    pctx.clearRect(0, 0, preview.width, preview.height);

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();

    if (shape !== 'free') {
        switch (shape) {
            case 'rect':
                ctx.strokeRect(startX, startY, x - startX, y - startY);
                break;
            case 'circle':
                const radius = Math.hypot(x - startX, y - startY);
                ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'line':
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
        }
    }
});

preview.addEventListener('mouseleave', () => {
    drawing = false;
    pctx.clearRect(0, 0, preview.width, preview.height);
});

// === Очистка холста ===
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pctx.clearRect(0, 0, preview.width, preview.height);
});

// === Сохранение изображения ===
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my_drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// === Переключение темы ===
let darkMode = localStorage.getItem('darkMode') === 'true';
if (darkMode) document.body.classList.add('dark-mode');
themeToggle.textContent = darkMode ? '☀️ Светлая тема' : '🌙 Тёмная тема';

themeToggle.addEventListener
