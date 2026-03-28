// === АВТОРИЗАЦИЯ ЧЕРЕЗ FIREBASE ===

// Проверка состояния авторизации
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('✅ Пользователь авторизован:', user.email);
        updateUserInterface(user);
    } else {
        console.log('❌ Пользователь не авторизован');
        updateUserInterface(null);
    }
});

// Обновление интерфейса
function updateUserInterface(user) {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    
    if (user) {
        // Пользователь вошёл
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'block';
            userInfo.innerHTML = `
                <div class="user-avatar">
                    <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=3182ce&color=fff'}" alt="Avatar">
                </div>
                <div class="user-details">
                    <p class="user-name">${user.displayName || 'Пользователь'}</p>
                    <p class="user-email">${user.email}</p>
                    <button onclick="signOut()" class="btn-logout">Выйти</button>
                </div>
            `;
        }
    } else {
        // Пользователь вышел
        if (authButtons) authButtons.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Вход через Google
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then(result => {
            console.log('✅ Успешный вход через Google:', result.user);
            showNotification('Вы успешно вошли!', 'success');
        })
        .catch(error => {
            console.error('❌ Ошибка входа через Google:', error);
            showNotification('Ошибка входа: ' + error.message, 'error');
        });
}

// Вход через Email/Password
function signInWithEmail() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    
    if (!email || !password) {
        showNotification('Введите email и пароль', 'error');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then(result => {
            console.log('✅ Успешный вход через Email:', result.user);
            showNotification('Вы успешно вошли!', 'success');
            document.getElementById('email-auth-section').style.display = 'none';
        })
        .catch(error => {
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
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const name = document.getElementById('name-input').value;
    
    if (!email || !password || !name) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    // Проверка пароля (минимум 6 символов)
    if (password.length < 6) {
        showNotification('Пароль должен быть не менее 6 символов', 'error');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(result => {
            console.log('✅ Успешная регистрация:', result.user);
            // Обновляем профиль с именем
            return result.user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            showNotification('Регистрация успешна!', 'success');
            document.getElementById('email-auth-section').style.display = 'none';
        })
        .catch(error => {
            console.error('❌ Ошибка регистрации:', error);
            showNotification('Ошибка: ' + error.message, 'error');
        });
}

// Вход через телефон
function signInWithPhone() {
    const phoneNumber = document.getElementById('phone-number').value;
    
    if (!phoneNumber) {
        showNotification('Введите номер телефона', 'error');
        return;
    }
    
    // Проверка формата номера
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        showNotification('Введите корректный номер телефона', 'error');
        return;
    }
    
    // Отправка SMS кода
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': response => {
            // reCAPTCHA решена
        }
    });
    
    auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
        .then(confirmationResult => {
            window.confirmationResult = confirmationResult;
            document.getElementById('phone-verify-section').style.display = 'block';
            showNotification('Код отправлен по SMS', 'success');
        })
        .catch(error => {
            console.error('❌ Ошибка отправки SMS:', error);
            showNotification('Ошибка: ' + error.message, 'error');
        });
}

// Подтверждение SMS кода
function verifyPhoneCode() {
    const code = document.getElementById('verification-code').value;
    
    if (!code) {
        showNotification('Введите код из SMS', 'error');
        return;
    }
    
    window.confirmationResult.confirm(code)
        .then(result => {
            console.log('✅ Успешный вход через телефон:', result.user);
            showNotification('Вы успешно вошли!', 'success');
            document.getElementById('phone-verify-section').style.display = 'none';
        })
        .catch(error => {
            console.error('❌ Ошибка подтверждения кода:', error);
            showNotification('Неверный код', 'error');
        });
}

// Выход
function signOut() {
    auth.signOut()
        .then(() => {
            console.log('✅ Успешный выход');
            showNotification('Вы вышли из аккаунта', 'success');
        })
        .catch(error => {
            console.error('❌ Ошибка выхода:', error);
        });
}

// Отправка обращения (заявления)
function submitAppeal() {
    const name = document.getElementById('appeal-name').value;
    const email = document.getElementById('appeal-email').value;
    const phone = document.getElementById('appeal-phone').value;
    const message = document.getElementById('appeal-message').value;
    const category = document.getElementById('appeal-category').value;
    
    // Проверка заполнения
    if (!name || !email || !message) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }
    
    // Проверка авторизации
    if (!auth.currentUser) {
        showNotification('Пожалуйста, войдите в аккаунт для отправки обращения', 'error');
        showPage('home');
        return;
    }
    
    // Сохранение в Firebase
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
    .then(docRef => {
        console.log('✅ Обращение отправлено:', docRef.id);
        showNotification('Ваше обращение успешно отправлено!', 'success');
        
        // Очистка формы
        document.getElementById('appeal-form').reset();
    })
    .catch(error => {
        console.error('❌ Ошибка отправки:', error);
        showNotification('Ошибка отправки: ' + error.message, 'error');
    });
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Глобальные функции
window.signInWithGoogle = signInWithGoogle;
window.signInWithEmail = signInWithEmail;
window.signUpWithEmail = signUpWithEmail;
window.signInWithPhone = signInWithPhone;
window.verifyPhoneCode = verifyPhoneCode;
window.signOut = signOut;
window.submitAppeal = submitAppeal;
