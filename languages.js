const translations = {
    en: {
        title: "Password Generator",
        length: "Length",
        settings: "Settings",
        options: {
            lowercase: "Lowercase (a-z)",
            uppercase: "Uppercase (A-Z)",
            numbers: "Numbers (0-9)",
            symbols: "Symbols (!-$^+)",
            excludeDuplicate: "Exclude Duplicate",
            includeSpaces: "Include Spaces"
        },
        generateBtn: "Generate Password",
        settingsMenu: {
            title: "Settings",
            language: "Language",
            darkMode: "Dark Mode",
            autoGenerate: "Auto Generate",
            showStrengthBar: "Show Strength Bar",
            resetBtn: "Reset Settings",
            defaultLength: "Default Length",
            customSymbols: "Custom Symbols"
        },
        strength: {
            weak: "Weak password",
            medium: "Medium password",
            strong: "Strong password"
        }
    },
    ar: {
        title: "مولد كلمات المرور",
        length: "الطول",
        settings: "الإعدادات",
        options: {
            lowercase: "أحرف صغيرة (a-z)",
            uppercase: "أحرف كبيرة (A-Z)",
            numbers: "أرقام (0-9)",
            symbols: "رموز (!-$^+)",
            excludeDuplicate: "استبعاد التكرار",
            includeSpaces: "تضمين المسافات"
        },
        generateBtn: "توليد كلمة المرور",
        settingsMenu: {
            title: "الإعدادات",
            language: "اللغة",
            darkMode: "الوضع المظلم",
            autoGenerate: "توليد تلقائي",
            showStrengthBar: "إظهار شريط القوة",
            resetBtn: "إعادة ضبط الإعدادات",
            defaultLength: "الطول الافتراضي",
            customSymbols: "رموز مخصصة"
        },
        strength: {
            weak: "كلمة مرور ضعيفة",
            medium: "كلمة مرور متوسطة",
            strong: "كلمة مرور قوية"
        }
    },
    fr: {
        title: "Générateur de Mot de Passe",
        length: "Longueur",
        settings: "Paramètres",
        options: {
            lowercase: "Minuscules (a-z)",
            uppercase: "Majuscules (A-Z)",
            numbers: "Chiffres (0-9)",
            symbols: "Symboles (!-$^+)",
            excludeDuplicate: "Exclure les Doublons",
            includeSpaces: "Inclure les Espaces"
        },
        generateBtn: "Générer le Mot de Passe",
        settingsMenu: {
            title: "Paramètres",
            language: "Langue",
            darkMode: "Mode Sombre",
            autoGenerate: "Génération Automatique",
            showStrengthBar: "Afficher la Barre de Force",
            resetBtn: "Réinitialiser",
            defaultLength: "Longueur par Défaut",
            customSymbols: "Symboles Personnalisés"
        },
        strength: {
            weak: "Mot de passe faible",
            medium: "Mot de passe moyen",
            strong: "Mot de passe fort"
        }
    },
    es: {
        title: "Generador de Contraseñas",
        length: "Longitud",
        settings: "Ajustes",
        options: {
            lowercase: "Minúsculas (a-z)",
            uppercase: "Mayúsculas (A-Z)",
            numbers: "Números (0-9)",
            symbols: "Símbolos (!-$^+)",
            excludeDuplicate: "Excluir Duplicados",
            includeSpaces: "Incluir Espacios"
        },
        generateBtn: "Generar Contraseña",
        settingsMenu: {
            title: "Ajustes",
            language: "Idioma",
            darkMode: "Modo Oscuro",
            autoGenerate: "Generación Automática",
            showStrengthBar: "Mostrar Barra de Fuerza",
            resetBtn: "Restablecer",
            defaultLength: "Longitud Predeterminada",
            customSymbols: "Símbolos Personalizados"
        },
        strength: {
            weak: "Contraseña débil",
            medium: "Contraseña media",
            strong: "Contraseña fuerte"
        }
    },
    de: {
        title: "Passwort-Generator",
        length: "Länge",
        settings: "Einstellungen",
        options: {
            lowercase: "Kleinbuchstaben (a-z)",
            uppercase: "Großbuchstaben (A-Z)",
            numbers: "Zahlen (0-9)",
            symbols: "Symbole (!-$^+)",
            excludeDuplicate: "Duplikate Ausschließen",
            includeSpaces: "Leerzeichen Einschließen"
        },
        generateBtn: "Passwort Generieren",
        settingsMenu: {
            title: "Einstellungen",
            language: "Sprache",
            darkMode: "Dunkelmodus",
            autoGenerate: "Automatische Generierung",
            showStrengthBar: "Stärkeleiste Anzeigen",
            resetBtn: "Zurücksetzen",
            defaultLength: "Standardlänge",
            customSymbols: "Benutzerdefinierte Symbole"
        },
        strength: {
            weak: "Schwaches Passwort",
            medium: "Mittleres Passwort",
            strong: "Starkes Passwort"
        }
    },
    tr: {
        title: "Şifre Oluşturucu",
        length: "Uzunluk",
        settings: "Ayarlar",
        options: {
            lowercase: "Küçük Harfler (a-z)",
            uppercase: "Büyük Harfler (A-Z)",
            numbers: "Sayılar (0-9)",
            symbols: "Semboller (!-$^+)",
            excludeDuplicate: "Tekrarları Hariç Tut",
            includeSpaces: "Boşlukları Dahil Et"
        },
        generateBtn: "Şifre Oluştur",
        settingsMenu: {
            title: "Ayarlar",
            language: "Dil",
            darkMode: "Karanlık Mod",
            autoGenerate: "Otomatik Oluştur",
            showStrengthBar: "Güç Çubuğunu Göster",
            resetBtn: "Sıfırla",
            defaultLength: "Varsayılan Uzunluk",
            customSymbols: "Özel Semboller"
        },
        strength: {
            weak: "Zayıf şifre",
            medium: "Orta şifre",
            strong: "Güçlü şifre"
        }
    }
};

function updateLanguage(lang) {
    // تحديث العنوان الرئيسي
    document.querySelector('.pg-title').textContent = translations[lang].title;

    // تحديث عنوان الطول
    document.querySelector('.pg-length__label').textContent = translations[lang].length + ':';

    // تحديث عنوان الإعدادات
    document.querySelector('.pg-options__title').textContent = translations[lang].settings + ':';

    // تحديث نصوص الخيارات
    const optionLabels = document.querySelectorAll('.pg-option__label');
    const optionKeys = ['lowercase', 'uppercase', 'numbers', 'symbols', 'excludeDuplicate', 'includeSpaces'];
    optionLabels.forEach((label, index) => {
        label.textContent = translations[lang].options[optionKeys[index]];
    });

    // تحديث زر التوليد
    document.querySelector('.pg-generate').textContent = translations[lang].generateBtn;

    // تحديث نصوص الإعدادات
    document.querySelector('.pg-settings-header h2').textContent = translations[lang].settingsMenu.title;
    
    // تحديث نصوص قائمة اللغات
    document.querySelector('.pg-languages-header span').textContent = translations[lang].settingsMenu.language;
    document.querySelector('.pg-language-label').textContent = translations[lang].settingsMenu.language;

    // تحديث نصوص المفاتيح في الإعدادات
    const settingsLabels = document.querySelectorAll('.pg-settings-item:not(.pg-language-selector) label:first-child');
    const settingsKeys = ['darkMode', 'autoGenerate', 'showStrengthBar', 'defaultLength', 'customSymbols'];
    settingsLabels.forEach((label, index) => {
        if (settingsKeys[index]) {
            label.textContent = translations[lang].settingsMenu[settingsKeys[index]];
        }
    });

    // تحديث زر إعادة الضبط
    document.querySelector('.pg-reset-btn').textContent = translations[lang].settingsMenu.resetBtn;

    // تحديث نص قوة كلمة المرور
    const strengthText = document.querySelector('.pg-strength__text');
    if (strengthText.textContent) {
        const strength = strengthText.textContent.toLowerCase().includes('weak') ? 'weak' :
                        strengthText.textContent.toLowerCase().includes('medium') ? 'medium' : 'strong';
        strengthText.textContent = translations[lang].strength[strength];
    }

    // تحديث placeholder للرموز المخصصة
    const customSymbolsInput = document.getElementById('customSymbols');
    if (lang === 'ar') {
        customSymbolsInput.setAttribute('placeholder', '!@#$%^&*');
    } else {
        customSymbolsInput.setAttribute('placeholder', '!@#$%^&*');
    }
}
