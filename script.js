window.addEventListener('DOMContentLoaded', (event) => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const mainOptions = ['lowercase', 'uppercase', 'numbers', 'symbols', 'excludeDuplicate', 'includeSpaces'];
    
    checkboxes.forEach((checkbox) => {
        if (checkbox.id !== 'includeSpaces' && checkbox.id !== 'excludeDuplicate') {
            checkbox.checked = true;
        }
        
        checkbox.addEventListener('change', () => {
            if (mainOptions.includes(checkbox.id) && document.getElementById('autoGenerate').checked) {
                generatePassword();
            }
            
            if (mainOptions.includes(checkbox.id)) {
                handleMainOptionsChange();
            }
            if (checkbox.id === 'excludeDuplicate') {
                animateRangeUpdate();
            }
        });
    });

    function handleMainOptionsChange() {
        const checkedCount = mainOptions.filter(id => 
            document.getElementById(id).checked
        ).length;

        if (checkedCount === 1) {
            mainOptions.forEach(id => {
                const checkbox = document.getElementById(id);
                checkbox.disabled = checkbox.checked;
            });
        } else {
            mainOptions.forEach(id => {
                document.getElementById(id).disabled = false;
            });
        }
    }

    function animateRangeUpdate() {
        const maxLength = calculateMaxLength();
        const lengthRange = document.getElementById('length');
        const lengthNumber = document.getElementById('lengthNumber');
        const currentValue = parseInt(lengthRange.value);
        
        lengthRange.max = maxLength;
        lengthNumber.max = maxLength;

        if (currentValue > maxLength) {
            const startValue = currentValue;
            const endValue = maxLength;
            const duration = 300;
            const startTime = performance.now();

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentVal = Math.round(startValue + (endValue - startValue) * easeOutCubic(progress));
                
                lengthRange.value = currentVal;
                lengthNumber.value = currentVal;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }

            requestAnimationFrame(animate);
        }
    }

    const lengthRange = document.getElementById('length');
    const lengthNumber = document.getElementById('lengthNumber');

    lengthNumber.value = lengthRange.value;

    lengthRange.oninput = function() {
        lengthNumber.value = this.value;
        if (document.getElementById('autoGenerate').checked) {
            generatePassword();
        }
    }

    lengthNumber.oninput = function() {
        let value = parseInt(this.value) || 3;
        const maxLength = calculateMaxLength();
        
        if (value < 3) value = 3;
        if (value > maxLength) value = maxLength;
        
        this.value = value;
        lengthRange.value = value;
        if (document.getElementById('autoGenerate').checked) {
            generatePassword();
        }
    }

    handleMainOptionsChange();
    animateRangeUpdate();
    generatePassword();
});

function calculateMaxLength() {
    let maxLength = 0;
    const excludeDuplicate = document.getElementById('excludeDuplicate').checked;

    if (excludeDuplicate) {
        if (document.getElementById('lowercase').checked) maxLength += 26;
        if (document.getElementById('uppercase').checked) maxLength += 26;
        if (document.getElementById('numbers').checked) maxLength += 10;
        if (document.getElementById('symbols').checked) maxLength += 5;
        if (document.getElementById('includeSpaces').checked) maxLength += 1;
    } else {
        maxLength = 128;
    }

    return maxLength;
}

function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

function generatePassword() {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const customSymbols = document.getElementById('customSymbols').value;
    const symbolChars = customSymbols || '!-$^+';
    
    let allChars = '';
    let password = '';
    const excludeDuplicate = document.getElementById('excludeDuplicate').checked;

    if (document.getElementById('lowercase').checked) allChars += lowercaseChars;
    if (document.getElementById('uppercase').checked) allChars += uppercaseChars;
    if (document.getElementById('numbers').checked) allChars += numberChars;
    if (document.getElementById('symbols').checked) allChars += symbolChars;
    if (document.getElementById('includeSpaces').checked) allChars += ' ';

    const passwordLength = parseInt(document.getElementById('length').value);

    if (excludeDuplicate) {
        const charArray = allChars.split('');
        for (let i = 0; i < passwordLength && charArray.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * charArray.length);
            password += charArray[randomIndex];
            charArray.splice(randomIndex, 1);
        }
    } else {
        for (let i = 0; i < passwordLength; i++) {
            const randomIndex = Math.floor(Math.random() * allChars.length);
            password += allChars.charAt(randomIndex);
        }
    }

    document.getElementById('password').value = password;
    updatePasswordStrength(password);
}

async function copyToClipboard() {
    const passwordInput = document.getElementById('password');
    await navigator.clipboard.writeText(passwordInput.value);

    const copyButton = document.querySelector('.pg-password__copy');
    const mainIcon = copyButton.querySelector('svg:not(.pg-password__copy-check svg)');
    const checkIcon = copyButton.querySelector('.pg-password__copy-check');

    // إخفاء الأيقونة الرئيسية وإظهار أيقونة التأكيد
    mainIcon.style.display = 'none';
    checkIcon.style.display = 'block';
    
    // إعادة الأيقونات إلى حالتها الأصلية بعد 1.5 ثانية
    setTimeout(() => {
        mainIcon.style.display = 'block';
        checkIcon.style.display = 'none';
    }, 1500);
}

// تحديث دالة تهيئة الوضع
function initTheme() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const darkModeToggle = document.getElementById('darkMode');
    
    if (settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
        darkModeToggle.checked = settings.theme === 'dark';
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        darkModeToggle.checked = prefersDark;
        
        // حفظ الإعداد الأولي
        settings.theme = theme;
        localStorage.setItem('settings', JSON.stringify(settings));
    }
}

// تحديث دالة تبديل الوضع
function toggleTheme() {
    const darkModeToggle = document.getElementById('darkMode');
    const newTheme = darkModeToggle.checked ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // تحديث الإعدادات في localStorage
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.theme = newTheme;
    localStorage.setItem('settings', JSON.stringify(settings));
}

// تهيئة الوضع عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initTheme);

// إضاف دالة تقييم قوة كلمة السر
function updatePasswordStrength(password) {
    const strengthContainer = document.querySelector('.pg-strength');
    const strengthBar = document.querySelector('.pg-strength__bar');
    const strengthText = document.querySelector('.pg-strength__text');
    
    // إزالة الأصناف السابقة
    strengthBar.classList.remove('weak', 'medium', 'strong');
    
    // حساب قوة كلمة السر
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    let strengthLevel = '';
    let strengthMessage = '';
    
    if (strength <= 2) {
        strengthLevel = 'weak';
        strengthMessage = 'Weak password';
    } else if (strength <= 4) {
        strengthLevel = 'medium';
        strengthMessage = 'Medium password';
    } else {
        strengthLevel = 'strong';
        strengthMessage = 'Strong password';
    }
    
    strengthBar.classList.add(strengthLevel);
    strengthText.textContent = strengthMessage;
}

// إضافة مستمع الأحداث للضغط على الشريط
document.querySelector('.pg-strength').addEventListener('click', function() {
    this.classList.toggle('active');
});

// تحديث HTML للشريط
document.querySelector('.pg-strength__bar').innerHTML = `
    <div class="pg-strength__section"></div>
    <div class="pg-strength__section"></div>
    <div class="pg-strength__section"></div>
`;

// دوال الإعدادات
function toggleSettings() {
    const sidebar = document.getElementById('settingsSidebar');
    sidebar.classList.toggle('active');
}

function changeLanguage(lang) {
    const languages = {
        'en': { name: 'English', flag: 'gb' },
        'ar': { name: 'العربية', flag: 'sa' },
        'fr': { name: 'Français', flag: 'fr' },
        'es': { name: 'Español', flag: 'es' },
        'de': { name: 'Deutsch', flag: 'de' },
        'tr': { name: 'Türkçe', flag: 'tr' }
    };

    // تحديث العرض
    document.querySelector('.pg-current-language').textContent = languages[lang].name;
    document.getElementById('currentFlag').src = `https://flagcdn.com/w20/${languages[lang].flag}.png`;
    
    // تحديث علامة التحديد
    document.querySelectorAll('.pg-language-option').forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('onclick').includes(lang)) {
            option.classList.add('active');
        }
    });

    // تحديث اتجاه الصفحة
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // تحديث النصوص
    updateLanguage(lang);

    // حفظ اللغة في localStorage
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.language = lang;
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // إخفاء قائمة اللغات
    hideLanguages();
}

// تحديث دالة إعادة الضبط
function resetSettings() {
    // إعادة ضبط التوليد التلقائي وشريط القوة
    document.getElementById('autoGenerate').checked = true;
    document.getElementById('showStrengthBar').checked = true;
    
    // إعادة ضبط الطول الافتراضي إلى 12
    document.getElementById('defaultLength').value = 12;
    document.getElementById('length').value = 12;
    document.getElementById('lengthNumber').value = 12;

    // إعادة ضبط الرموز المخصصة (تفريغ الحقل)
    document.getElementById('customSymbols').value = '';
    
    // تطبيق التغييرات
    if (document.getElementById('autoGenerate').checked) {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', generatePassword);
        });
    }

    // حديث إظهار شريط القوة
    const strengthBar = document.querySelector('.pg-strength');
    strengthBar.style.display = 'block';
    
    // حفظ الإعدادات مع الحفاظ على الوضع المظلم واللغة
    const currentSettings = JSON.parse(localStorage.getItem('settings') || '{}');
    const newSettings = {
        ...currentSettings,
        autoGenerate: true,
        showStrengthBar: true,
        defaultLength: 12, // حفظ الطول الافتراضي الجديد
        customSymbols: '', // حفظ الرموز المخصصة الفارغة
        language: currentSettings.language,
        theme: currentSettings.theme
    };
    
    localStorage.setItem('settings', JSON.stringify(newSettings));

    // توليد كلمة مرور جديدة
    generatePassword();
}

// حفظ الإعدادات
function saveSettings() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.autoGenerate = document.getElementById('autoGenerate').checked;
    settings.showStrengthBar = document.getElementById('showStrengthBar').checked;
    settings.theme = document.documentElement.getAttribute('data-theme');
    settings.defaultLength = document.getElementById('defaultLength').value;
    settings.customSymbols = document.getElementById('customSymbols').value;
    localStorage.setItem('settings', JSON.stringify(settings));
}

// تحميل الإعدادات
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    
    // تحميل اللغة وتطبيقها
    const savedLanguage = settings.language || 'en';
    document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
    updateLanguage(savedLanguage);

    // تحميل حالة التوليد التلقائي
    const autoGenerate = document.getElementById('autoGenerate');
    autoGenerate.checked = settings.autoGenerate !== undefined ? settings.autoGenerate : true;

    // تحميل حالة شريط القوة
    const showStrengthBar = document.getElementById('showStrengthBar');
    showStrengthBar.checked = settings.showStrengthBar !== undefined ? settings.showStrengthBar : true;

    // تحميل حالة الوضع المظلم
    const darkMode = document.getElementById('darkMode');
    darkMode.checked = settings.theme === 'dark';

    // تطبيق التأثيرات المرئية مباشرة
    if (!showStrengthBar.checked) {
        document.querySelector('.pg-strength').style.display = 'none';
    }

    // تحديث حالة الـ switch-slider
    document.querySelectorAll('.pg-switch input[type="checkbox"]').forEach(checkbox => {
        const storedValue = settings[checkbox.id];
        if (storedValue !== undefined) {
            checkbox.checked = storedValue;
        }
    });

    // حفظ الإعدادات الأولية إذا لم تكن موجودة
    if (!localStorage.getItem('settings')) {
        saveSettings();
    }

    // تحميل الطول الافتراضي
    const defaultLength = document.getElementById('defaultLength');
    if (settings.defaultLength) {
        defaultLength.value = settings.defaultLength;
        document.getElementById('length').value = settings.defaultLength;
        document.getElementById('lengthNumber').value = settings.defaultLength;
    }

    // تحميل الرموز المخصصة
    const customSymbols = document.getElementById('customSymbols');
    if (settings.customSymbols) {
        customSymbols.value = settings.customSymbols;
    }
}

// تحديث التوليد التلقائي
document.getElementById('autoGenerate').addEventListener('change', function() {
    if (!this.checked) {
        console.log('Auto generate disabled');
    } else {
        generatePassword();
        console.log('Auto generate enabled');
    }
    saveSettings();
});

// تحديث إظهار شريط القوة
document.getElementById('showStrengthBar').addEventListener('change', function() {
    const strengthBar = document.querySelector('.pg-strength');
    strengthBar.style.display = this.checked ? 'block' : 'none';
    saveSettings();
});

// تحميل الإعدادات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initTheme();
    
    // تحميل اللغة المحفوظة
    const savedLanguage = localStorage.getItem('language') || 'en';
    changeLanguage(savedLanguage);
});

// دوال تغيير اللغة
function showLanguages() {
    document.getElementById('languagesList').classList.add('active');
    document.querySelector('.pg-settings-content').classList.add('language-view');
}

function hideLanguages() {
    document.getElementById('languagesList').classList.remove('active');
    document.querySelector('.pg-settings-content').classList.remove('language-view');
}

// إضافة مستمع لحدث تغيير الطول الافتراضي
document.getElementById('defaultLength').addEventListener('input', function() {
    let value = parseInt(this.value) || 3;
    
    // التحقق من الحدود
    if (value < 3) value = 3;
    if (value > 128) value = 128;
    
    this.value = value;
    
    // تحديث الطول الحالي
    document.getElementById('length').value = value;
    document.getElementById('lengthNumber').value = value;
    
    // حفظ الإعداد
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.defaultLength = value;
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // توليد كلمة مرور جديدة إذا كان التوليد التلقائي مفعل
    if (document.getElementById('autoGenerate').checked) {
        generatePassword();
    }
});

// إضافة مستمع لحدث تغيير الرموز المخصصة
document.getElementById('customSymbols').addEventListener('input', function() {
    // حفظ الرموز المخصصة
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.customSymbols = this.value;
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // توليد كلمة مرور جديدة إذا كان التوليد التلقائي مفعل
    if (document.getElementById('autoGenerate').checked) {
        generatePassword();
    }
});

// تحديث مستمعي الأحداث للإعدادات
document.getElementById('darkMode').addEventListener('change', function() {
    toggleTheme();
    saveSettings();
}); // لا يولد كلمة مرور

document.getElementById('showStrengthBar').addEventListener('change', function() {
    const strengthBar = document.querySelector('.pg-strength');
    strengthBar.style.display = this.checked ? 'block' : 'none';
    saveSettings();
}); // لا يولد كلمة مرور

document.getElementById('defaultLength').addEventListener('input', function() {
    let value = parseInt(this.value) || 3;
    if (value < 3) value = 3;
    if (value > 128) value = 128;
    this.value = value;
    
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.defaultLength = value;
    localStorage.setItem('settings', JSON.stringify(settings));
}); // لا يولد كلمة مرور

document.getElementById('customSymbols').addEventListener('input', function() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.customSymbols = this.value;
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // توليد كلمة مرور فقط إذا كان خيار الرموز مفعلاً
    if (document.getElementById('symbols').checked && document.getElementById('autoGenerate').checked) {
        generatePassword();
    }
});
