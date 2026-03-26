// === КОНФИГУРАЦИЯ ===
const CONFIG = {
    infographics: {
        phishing: 'infographics/phishing.png',
        online: 'infographics/online_scams.png',
        phone: 'infographics/phone_scams.png',
        viruses: 'infographics/viruses.png',
        cards: 'infographics/card_theft.png'
    },
    videos: [
        {
            id: 1,
            title: 'Инвестиционное мошенничество',
            category: 'Финансовые пирамиды',
            description: 'Предлагают доход от 70%? Проверьте лицензию на cbr.ru',
            storagePath: 'videos/investment_scam.mp4'
        },
        {
            id: 2,
            title: 'Нелегальные кредиторы',
            category: 'Кредитное мошенничество',
            description: 'Остерегайтесь нелегальных кредиторов! Проверяйте лицензию!',
            storagePath: 'videos/illegal_creditors.mp4'
        },
        {
            id: 3,
            title: 'Мошенничество против пенсионеров',
            category: 'Социальная защита',
            description: 'Помогайте пенсионерам принимать правильные финансовые решения',
            storagePath: 'videos/elderly_scam.mp4'
        },
        {
            id: 4,
            title: 'Безопасность ПИН-кода',
            category: 'Банковские карты',
            description: 'Не храните пин-код вместе с картой',
            storagePath: 'videos/pin_code.mp4'
        },
        {
            id: 5,
            title: 'Лёгкая прибыль',
            category: 'Финансовые пирамиды',
            description: 'Гарантия сверхдохода — признак мошенничества',
            storagePath: 'videos/easy_profit.mp4'
        }
    ]
};

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', function() {
    // Установка текущей даты
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Инициализация навигации
    initNavigation();

    // Загрузка инфографики
    loadInfographics();

    // Загрузка видео
    loadVideos();

    // Обновление статистики
    updateStats();
});

// === НАВИГАЦИЯ ===
function initNavigation() {
    // Обработка кликов по основной навигации
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.dataset.page;
            showPage(pageId);
        });
    });

    // Обработка кликов по боковой навигации
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.dataset.page;
            showPage(pageId);
        });
    });

    // Обработка кликов по карточкам
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
            const pageId = this.dataset.page;
            showPage(pageId);
        });
    });

    // Обработка hash в URL при загрузке
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showPage(hash);
    }

    // Обработка кнопок назад/вперёд в браузере
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showPage(hash);
        } else {
            showPage('home');
        }
    });
}

function showPage(pageId) {
    // Скрыть все секции
    document.querySelectorAll('.article-section').forEach(section => {
        section.classList.remove('active');
    });

    // Показать нужную
    const targetSection = document.getElementById(pageId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Обновить активные ссылки
    document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });

    // Прокрутка вверх
    window.scrollTo(0, 0);

    // Обновить URL
    history.pushState(null, null, '#' + pageId);
}

// === ЗАГРУЗКА ИНФОГРАФИКИ ===
function loadInfographics() {
    for (const [key, path] of Object.entries(CONFIG.infographics)) {
        const img = document.getElementById(`${key}-image`);
        const placeholder = document.getElementById(`${key}-placeholder`);
        
        if (img && placeholder) {
            // Получаем URL из Firebase Storage
            storage.ref(path).getDownloadURL()
                .then(url => {
                    img.src = url;
                    img.onload = () => {
                        img.classList.add('loaded');
                        placeholder.style.display = 'none';
                    };
                })
                .catch(error => {
                    console.error(`Ошибка загрузки ${key}:`, error);
                    placeholder.innerHTML = `
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Изображение недоступно</p>
                    `;
                });
        }
    }
}

// === ЗАГРУЗКА ВИДЕО ===
function loadVideos() {
    const homeVideosContainer = document.getElementById('home-videos');
    const allVideosContainer = document.getElementById('all-videos');
    
    if (!homeVideosContainer && !allVideosContainer) return;

    // Показываем индикатор загрузки
    if (homeVideosContainer) {
        homeVideosContainer.innerHTML = '<div class="video-loading"><i class="fas fa-spinner"></i><p>Загрузка видео...</p></div>';
    }
    if (allVideosContainer) {
        allVideosContainer.innerHTML = '<div class="video-loading"><i class="fas fa-spinner"></i><p>Загрузка видео...</p></div>';
    }

    // Загружаем первые 3 видео для главной
    const homeVideos = CONFIG.videos.slice(0, 3);
    if (homeVideosContainer) {
        renderVideos(homeVideos, homeVideosContainer);
    }

    // Загружаем все видео для страницы видео
    if (allVideosContainer) {
        renderVideos(CONFIG.videos, allVideosContainer);
    }

    // Обновляем статистику
    const statVideos = document.getElementById('stat-videos');
    if (statVideos) {
        statVideos.textContent = CONFIG.videos.length;
    }
}

function renderVideos(videos, container) {
    container.innerHTML = '';

    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        
        // Получаем URL видео из Firebase Storage
        storage.ref(video.storagePath).getDownloadURL()
            .then(url => {
                videoCard.innerHTML = `
                    <div class="video-container">
                        <video controls preload="metadata">
                            <source src="${url}" type="video/mp4">
                            Ваш браузер не поддерживает видео
                        </video>
                    </div>
                    <div class="video-info">
                        <span class="video-category">${video.category}</span>
                        <h3 class="video-title">${video.title}</h3>
                        <p class="video-description">${video.description}</p>
                    </div>
                `;
            })
            .catch(error => {
                console.error(`Ошибка загрузки видео ${video.title}:`, error);
                videoCard.innerHTML = `
                    <div class="video-container" style="display: flex; align-items: center; justify-content: center; color: white; background: #000;">
                        <i class="fas fa-video-slash" style="font-size: 3rem;"></i>
                    </div>
                    <div class="video-info">
                        <span class="video-category">${video.category}</span>
                        <h3 class="video-title">${video.title}</h3>
                        <p class="video-description">Видео недоступно</p>
                    </div>
                `;
            });
        
        container.appendChild(videoCard);
    });
}

// === СТАТИСТИКА ===
function updateStats() {
    const statSections = document.getElementById('stat-sections');
    const statVideos = document.getElementById('stat-videos');
    const statInfographics = document.getElementById('stat-infographics');
    
    if (statSections) statSections.textContent = '5';
    if (statVideos) statVideos.textContent = CONFIG.videos.length;
    if (statInfographics) statInfographics.textContent = Object.keys(CONFIG.infographics).length;
}

// === ГЛОБАЛЬНЫЕ ФУНКЦИИ ===
window.showPage = showPage;
