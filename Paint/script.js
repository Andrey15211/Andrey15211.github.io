// === Получаем элементы ===
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const ctx = canvas.getContext('2d');
const pctx = preview.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const shapePicker = document.getElementById('shapePicker');
const sizePicker = document.getElementById('sizePicker'); // добавь в HTML range
const clearBtn = document.getElementById('clearBtn'); // кнопка очистки
const saveBtn = document.getElementById('saveBtn'); // кнопка сохранения (добавь в HTML)

let drawing = false;
let startX = 0, startY = 0;
let lastX = 0, lastY = 0;

// === Текущие параметры ===
let color = colorPicker.value;
let shape = shapePicker.value;
let lineWidth = sizePicker ? sizePicker.value : 3;

// === Обновление параметров ===
colorPicker.addEventListener('input', e => color = e.target.value);
shapePicker.addEventListener('change', e => shape = e.target.value);
if (sizePicker) sizePicker.addEventListener('input', e => lineWidth = e.target.value);

// === Получение координат относительно холста ===
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

// === Предпросмотр или свободное рисование ===
preview.addEventListener('mousemove', e => {
    if (!drawing) return;
    const { x, y } = getCoords(e);

    // Настройки стиля
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
        // Предпросмотр фигур
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

    // Перенос фигуры с preview на canvas
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    pctx.clearRect(0, 0, preview.width, preview.height);

    if (shape !== 'free') {
        ctx.beginPath();
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

// === Если мышь покинула зону холста ===
preview.addEventListener('mouseleave', () => {
    drawing = false;
    pctx.clearRect(0, 0, preview.width, preview.height);
});

// === Очистка холста ===
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pctx.clearRect(0, 0, preview.width, preview.height);
    });
}

// === Сохранение рисунка ===
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'my_drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// === Отключаем перетаскивание ===
canvas.addEventListener('dragstart', e => e.preventDefault());
preview.addEventListener('dragstart', e => e.preventDefault());
