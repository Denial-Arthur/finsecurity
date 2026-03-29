// === КОНФИГУРАЦИЯ ===
const CONFIG = {
    infographics: {
        phishing: 'images/phishing.jpg.jpg',
        online: 'images/online_scams.jpg.jpg',
        phone: 'images/phone_scams.jpg.jpg',
        viruses: 'images/viruses.jpg.jpg',
        cards: 'images/card_theft.jpg.jpg'
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
    var dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Инициализация навигации
    initNavigation();

    // Загрузка инфографики
    loadInfographics();

    // Загрузка видео (если есть контейнер)
    loadVideos();

    // Обновление статистики
    updateStats();

    console.log('✅ script.js загружен');
});

// === НАВИГАЦИЯ ===
function initNavigation() {
    // Обработка кликов по основной навигации
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var pageId = this.dataset.page;
            showPage(pageId);
        });
    });

    // Обработка кликов по боковой навигации
    document.querySelectorAll('.sidebar-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var pageId = this.dataset.page;
            showPage(pageId);
        });
    });

    // Обработка кликов по карточкам
    document.querySelectorAll('.card').forEach(function(card) {
        card.addEventListener('click', function() {
            var pageId = this.dataset.page;
            showPage(pageId);
        });
    });

    // Обработка hash в URL при загрузке
    var hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showPage(hash);
    }

    // Обработка кнопок назад/вперёд в браузере
    window.addEventListener('popstate', function() {
        var hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showPage(hash);
        } else {
            showPage('home');
        }
    });
}

function showPage(pageId) {
    // Скрыть все секции
    document.querySelectorAll('.article-section').forEach(function(section) {
        section.classList.remove('active');
    });

    // Показать нужную
    var targetSection = document.getElementById(pageId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Обновить активные ссылки
    document.querySelectorAll('.nav-link, .sidebar-link').forEach(function(link) {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });

    // Прокрутка вверх
    window.scrollTo(0, 0);

    // Обновить URL
    history.pushState(null, null, '#' + pageId);

    console.log('📄 Переход на страницу:', pageId);
}

// === ЗАГРУЗКА ИНФОГРАФИКИ ===
function loadInfographics() {
    console.log('🖼️ Загрузка инфографики...');
    
    for (const [key, path] of Object.entries(CONFIG.infographics)) {
        var img = document.getElementById(key + '-image');
        var placeholder = document.getElementById(key + '-placeholder');
        
        if (img && placeholder) {
            // Получаем URL из Firebase Storage
            if (typeof storage !== 'undefined') {
                storage.ref(path).getDownloadURL()
                    .then(function(url) {
                        img.src = url;
                        img.onload = function() {
                            img.classList.add('loaded');
                            placeholder.style.display = 'none';
                        };
                    })
                    .catch(function(error) {
                        console.error('Ошибка загрузки ' + key + ':', error);
                        placeholder.innerHTML = 
                            '<i class="fas fa-exclamation-circle"></i>' +
                            '<p>Изображение недоступно</p>';
                    });
            }
        }
    }
}

// === ЗАГРУЗКА ВИДЕО ===
function loadVideos() {
    var homeVideosContainer = document.getElementById('home-videos');
    var allVideosContainer = document.getElementById('all-videos');
    
    if (!homeVideosContainer && !allVideosContainer) {
        console.log('📹 Контейнеры для видео не найдены (видео отключены)');
        return;
    }

    // Показываем индикатор загрузки
    if (homeVideosContainer) {
        homeVideosContainer.innerHTML = '<div class="video-loading"><i class="fas fa-spinner"></i><p>Загрузка видео...</p></div>';
    }
    if (allVideosContainer) {
        allVideosContainer.innerHTML = '<div class="video-loading"><i class="fas fa-spinner"></i><p>Загрузка видео...</p></div>';
    }

    // Загружаем первые 3 видео для главной
    var homeVideos = CONFIG.videos.slice(0, 3);
    if (homeVideosContainer) {
        renderVideos(homeVideos, homeVideosContainer);
    }

    // Загружаем все видео для страницы видео
    if (allVideosContainer) {
        renderVideos(CONFIG.videos, allVideosContainer);
    }

    // Обновляем статистику
    var statVideos = document.getElementById('stat-videos');
    if (statVideos) {
        statVideos.textContent = CONFIG.videos.length;
    }
}

function renderVideos(videos, container) {
    container.innerHTML = '';

    videos.forEach(function(video) {
        var videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        
        // Получаем URL видео из Firebase Storage
        if (typeof storage !== 'undefined') {
            storage.ref(video.storagePath).getDownloadURL()
                .then(function(url) {
                    videoCard.innerHTML = 
                        '<div class="video-container">' +
                            '<video controls preload="metadata">' +
                                '<source src="' + url + '" type="video/mp4">' +
                                'Ваш браузер не поддерживает видео' +
                            '</video>' +
                        '</div>' +
                        '<div class="video-info">' +
                            '<span class="video-category">' + video.category + '</span>' +
                            '<h3 class="video-title">' + video.title + '</h3>' +
                            '<p class="video-description">' + video.description + '</p>' +
                        '</div>';
                })
                .catch(function(error) {
                    console.error('Ошибка загрузки видео ' + video.title + ':', error);
                    videoCard.innerHTML = 
                        '<div class="video-container" style="display: flex; align-items: center; justify-content: center; color: white; background: #000;">' +
                            '<i class="fas fa-video-slash" style="font-size: 3rem;"></i>' +
                        '</div>' +
                        '<div class="video-info">' +
                            '<span class="video-category">' + video.category + '</span>' +
                            '<h3 class="video-title">' + video.title + '</h3>' +
                            '<p class="video-description">Видео недоступно</p>' +
                        '</div>';
                });
        }
        
        container.appendChild(videoCard);
    });
}

// === СТАТИСТИКА ===
function updateStats() {
    var statSections = document.getElementById('stat-sections');
    var statVideos = document.getElementById('stat-videos');
    var statInfographics = document.getElementById('stat-infographics');
    
    if (statSections) statSections.textContent = '5';
    if (statVideos) statVideos.textContent = CONFIG.videos.length;
    if (statInfographics) statInfographics.textContent = Object.keys(CONFIG.infographics).length;
    
    console.log('📊 Статистика обновлена');
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

// Форматирование даты
function formatDate(date) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    
    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    
    return day + '.' + month + '.' + year;
}

// Форматирование времени
function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    
    return hours + ':' + minutes;
}

// Проверка устройства
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Плавная прокрутка к элементу
function scrollToElement(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// === ГЛОБАЛЬНЫЕ ФУНКЦИИ ===
window.showPage = showPage;
window.scrollToElement = scrollToElement;
window.isMobile = isMobile;
window.formatDate = formatDate;
window.formatTime = formatTime;

// === ЛОГИРОВАНИЕ ===
console.log('⚙️ CONFIG загружен:', CONFIG);
console.log('📊 Разделов:', CONFIG.infographics.length);
console.log('📹 Видео:', CONFIG.videos.length);
