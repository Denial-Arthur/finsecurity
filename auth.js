// === ПРОВЕРКА ЗАГРУЗКИ FIREBASE ===
console.log('🔍 Проверка Firebase...');

// === АВТОРИЗАЦИЯ ЧЕРЕЗ FIREBASE ===

// Проверка состояния авторизации
if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log('✅ Пользователь авторизован:', user.email);
            updateUserInterface(user);
        } else {
            console.log('❌ Пользователь не авторизован');
            updateUserInterface(null);
        }
    });
} else {
    console.error('❌ auth не определён! Проверьте firebase-config.js');
}

// Обновление интерфейса
function updateUserInterface(user) {
    var authButtons = document.getElementById('auth-buttons');
    var userInfo = document.getElementById('user-info');
    
    if (user) {
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'block';
            var avatarUrl = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User') + '&background=3182ce&color=fff';
            userInfo.innerHTML = 
                '<div class="user-avatar">' +
                    '<img src="' + avatarUrl + '" alt="Avatar">' +
                '</div>' +
                '<div class="user-details">' +
                    '<p class="user-name">' + (user.displayName || 'Пользователь') + '</p>' +
                    '<p class="user-email">' + user.email + '</p>' +
                    '<button onclick="signOut()" class="btn-logout">Выйти</button>' +
                '</div>';
        }
    } else {
        if (authButtons) authButtons.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Вход через Google
function signInWithGoogle() {
    console.log('🔵 Клик: Вход через Google');
    
    if (typeof auth === 'undefined') {
        alert('Ошибка: Firebase не загружен. Обновите страницу.');
        return;
    }
    
    var provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then(function(result) {
            console.log('✅ Успешный вход через Google:', result.user);
            showNotification('Вы успешно вошли!', 'success');
        })
        .catch(function(error) {
            console.error('❌ Ошибка входа через Google:', error);
            showNotification('Ошибка входа: ' + error.message, 'error');
        });
}

// Вход через Email/Password
function signInWithEmail() {
    console.log('🔵 Клик: Вход через Email');
    
    if (typeof auth === 'undefined') {
        alert('Ошибка: Firebase не загружен. Обновите страницу.');
        return;
    }
    
    var email = document.getElementById('email-input').value;
    var password = document.getElementById('password-input').value;
    
    if (!email || !password) {
        showNotification('Введите email и пароль', 'error');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then(function(result) {
            console.log('✅ Успешный вход через Email:', result.user);
            showNotification('Вы успешно вошли!', 'success');
            document.getElementById('email-auth-section').style.display = 'none';
        })
        .catch(function(error) {
            console.error('❌ Ошибка входа:', error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                showNotification('Неверный email или пароль', 'error');
            } else {
                showNotification('Ошибка: ' + error.message, 'error');
            }
        });
}

// Регистрация через Email/Password
function signUpWithEmail() {
    console.log('🔵 Клик: Регистрация через Email');
    
    if (typeof auth === 'undefined') {
        alert('Ошибка: Firebase не загружен. Обновите страницу.');
        return;
    }
    
    var email = document.getElementById('email-input').value;
    var password = document.getElementById('password-input').value;
    var name = document.getElementById('name-input').value;
    
    if (!email || !password || !name) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Пароль должен быть не менее 6 символов', 'error');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(function(result) {
            console.log('✅ Успешная регистрация:', result.user);
            return result.user.updateProfile({
                displayName: name
            });
        })
        .then(function() {
            showNotification('Регистрация успешна!', 'success');
            document.getElementById('email-auth-section').style.display = 'none';
        })
        .catch(function(error) {
            console.error('❌ Ошибка регистрации:', error);
            showNotification('Ошибка: ' + error.message, 'error');
        });
}

// Вход через телефон
function signInWithPhone() {
    console.log('🔵 Клик: Вход через телефон');
    
    if (typeof auth === 'undefined') {
        alert('Ошибка: Firebase не загружен. Обновите страницу.');
        return;
    }
    
    var phoneNumber = document.getElementById('phone-number').value;
    
    if (!phoneNumber) {
        showNotification('Введите номер телефона', 'error');
        return;
    }
    
    var phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        showNotification('Введите корректный номер телефона', 'error');
        return;
    }
    
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': function(response) {
            console.log('✅ reCAPTCHA решена');
        }
    });
    
    auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
        .then(function(confirmationResult) {
            window.confirmationResult = confirmationResult;
            document.getElementById('phone-verify-section').style.display = 'block';
            showNotification('Код отправлен по SMS', 'success');
        })
        .catch(function(error) {
            console.error('❌ Ошибка отправки SMS:', error);
            showNotification('Ошибка: ' + error.message, 'error');
        });
}

// Подтверждение SMS кода
function verifyPhoneCode() {
    console.log('🔵 Клик: Подтверждение SMS кода');
    
    var code = document.getElementById('verification-code').value;
    
    if (!code) {
        showNotification('Введите код из SMS', 'error');
        return;
    }
    
    window.confirmationResult.confirm(code)
        .then(function(result) {
            console.log('✅ Успешный вход через телефон:', result.user);
            showNotification('Вы успешно вошли!', 'success');
            document.getElementById('phone-verify-section').style.display = 'none';
        })
        .catch(function(error) {
            console.error('❌ Ошибка подтверждения кода:', error);
            showNotification('Неверный код', 'error');
        });
}

// Выход
function signOut() {
    console.log('🔵 Клик: Выход');
    
    auth.signOut()
        .then(function() {
            console.log('✅ Успешный выход');
            showNotification('Вы вышли из аккаунта', 'success');
        })
        .catch(function(error) {
            console.error('❌ Ошибка выхода:', error);
        });
}

// Отправка обращения
function submitAppeal() {
    console.log('🔵 Клик: Отправка обращения');
    
    var name = document.getElementById('appeal-name').value;
    var email = document.getElementById('appeal-email').value;
    var phone = document.getElementById('appeal-phone').value;
    var message = document.getElementById('appeal-message').value;
    var category = document.getElementById('appeal-category').value;
    
    if (!name || !email || !message) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }
    
    if (!auth.currentUser) {
        showNotification('Пожалуйста, войдите в аккаунт для отправки обращения', 'error');
        showPage('home');
        return;
    }
    
    db.collection('appeals').add({
        name: name,
        email: email,
        phone: phone,
        message: message,
        category: category,
        userId: auth.currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'new'
    })
    .then(function(docRef) {
        console.log('✅ Обращение отправлено:', docRef.id);
        showNotification('Ваше обращение успешно отправлено!', 'success');
        document.getElementById('appeal-form').reset();
    })
    .catch(function(error) {
        console.error('❌ Ошибка отправки:', error);
        showNotification('Ошибка отправки: ' + error.message, 'error');
    });
}

// Уведомления
function showNotification(message, type) {
    if (type === undefined) type = 'info';
    
    var notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    
    var iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'error') iconClass = 'fa-exclamation-circle';
    
    notification.innerHTML = 
        '<i class="fas ' + iconClass + '"></i>' +
        '<span>' + message + '</span>';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(function() {
        notification.classList.remove('show');
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 3000);
}

// === ГЛОБАЛЬНЫЕ ФУНКЦИИ ===
window.signInWithGoogle = signInWithGoogle;
window.signInWithEmail = signInWithEmail;
window.signUpWithEmail = signUpWithEmail;
window.signInWithPhone = signInWithPhone;
window.verifyPhoneCode = verifyPhoneCode;
window.signOut = signOut;
window.submitAppeal = submitAppeal;

console.log('✅ auth.js загружен');
