const projects = [
  {
    name: "Совместный проект с участием Трембача Романа и Бадалина Андрея",
    path: "Совместный проект с участием Трембача Романа и Бадалина Андрея/",
    image: "Совместный проект с участием Трембача Романа и Бадалина Андрея/assets/icon.svg",
    description: "Карта нашего мира с режимом прогулки: просматривайте 360° панорамы, приближайте колесом мыши и переходите между точками как в Street View (упрощённый аналог GeoGuessr).",
  },
  {
    name: "Угадай число",
    path: "1.10.25/",
    description: "Мини-игра на JavaScript для угадывания числа.",
  },
  {
    name: "Тест массивов",
    path: "Test massive/",
    description: "Тестирование как работает массив на паре.",
  },
  {
    name: "Анекдоты",
    path: "Анекдоты/",
    description: "Тестировал возможности встроенного ИИ visual code, вот что пришло в голову.",
  },
  {
    name: "Рисуем",
    path: "Рисуем/",
    description: "Работа на паре.",
  },
  {
    name: "Рисовалка на Canvas",
    path: "Paint/",
    description: "Более подробное изучение canvas.",
  },
  {
    name: "Проект от ИИ: Курсы валют",
    path: "Проект от ИИ/",
    image: "Проект от ИИ/icon.svg",
    description: "Курсы валют ЦБ РФ с динамическим графиком роста/падения.",
  },
  {
    name: "Сайт в интернете",
    path: "Сайт в интернете/public/",
    image: "Сайт в интернете/public/icon.svg",
    description: "Самостоятельный сайт: Python-сервер + SQLite; ваш ПК — хост.",
  }
];
// Добавлен проект викторины по персонажам Игры престолов
projects.push({
  name: "Угадай персонажа (Игра престолов)",
  path: "JS_guess_from_the_picture-main/guess_pictures.html",
  image: "JS_guess_from_the_picture-main/backgrounds/got01.jpg",
  description: "Викторина по персонажам Игры престолов: фильтр по полу, звуки, фоновая музыка, озвучивание результата, адаптивный Bootstrap-дизайн.",
});

// Вывод карточек проектов
window.onload = function() {
  const container = document.getElementById('projects-container');
  projects.forEach((project, idx) => {
    const card = document.createElement('div');
    card.className = 'project-link';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', project.name);

    // Название
    const title = document.createElement('h2');
    title.textContent = project.name;
    card.appendChild(title);

    // Описание
    const desc = document.createElement('p');
    desc.textContent = project.description;
    card.appendChild(desc);

    // Открытие модального окна
    card.addEventListener('click', () => openModal(project));
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') openModal(project);
    });

    container.appendChild(card);
  });

  // Тема
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);
  updateThemeIcon();

  // Модальное окно
  document.getElementById('modal-close').onclick = closeModal;
  document.getElementById('modal').onclick = function(e) {
    if (e.target === this) closeModal();
  };
};

function openModal(project) {
  document.getElementById('modal-img').src = project.image;
  document.getElementById('modal-img').alt = project.name;
  document.getElementById('modal-title').textContent = project.name;
  document.getElementById('modal-desc').textContent = project.description;
  document.getElementById('modal-link').href = project.path;
  document.getElementById('modal-link').textContent = "Открыть проект";
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Тёмная/светлая тема
function toggleTheme() {
  document.body.classList.toggle('dark');
  updateThemeIcon();
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

function updateThemeIcon() {
  const themeToggle = document.getElementById('theme-toggle');
  if (document.body.classList.contains('dark')) {
    themeToggle.textContent = '☀️';
  } else {
    themeToggle.textContent = '🌙';
  }
}

// Сохраняем тему между сессиями
(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
})();
