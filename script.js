const sourceFolder = document.getElementById("imageUpload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// إعدادات ثابتة للكانفاس والخلفية
let canvasSize = { width: 1080, height: 1920 };
let backgroundImgSrc = 'reels_background.jpg'; // الخلفية الثابتة
let whiteTextY = 660; // موقع النص الأبيض الثابت

const max_width = 870;
const max_height = 649;
const border_radius = 20;
const padding_x = 59;
const additional_top_padding = 200;
const text_box_width = 870;
const text_box_height = 250;

let croppedImage;
let watermarkOpacity = 1;

const backgroundImg = new Image();
backgroundImg.src = backgroundImgSrc; // تحميل الخلفية الثابتة

// إضافة معالج أحداث لتحميل الخلفية
backgroundImg.onload = function() {
    console.log("تم تحميل الخلفية بنجاح");
};

backgroundImg.onerror = function() {
    console.error("فشل تحميل الخلفية");
};

async function loadFont() {
    try {
        const font = new FontFace('Tajawal', 'url(Tajawal-medium.ttf)');
        await font.load();
        document.fonts.add(font);
        console.log("تم تحميل الخط بنجاح");
    } catch (error) {
        console.error("فشل تحميل الخط:", error);
        throw error;
    }
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    let words = text.split(' ');
    let line = '';
    let lines = [];
    const maxLines = 4; // الحد الأقصى للأسطر

    // تقسيم النص إلى أسطر
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            // إذا وصلنا للحد الأقصى من الأسطر، نتوقف
            if (lines.length >= maxLines - 1) {
                // إضافة علامات الحذف (...) للسطر الأخير إذا كان هناك المزيد من النص
                let lastLine = line.trim();
                while (context.measureText(lastLine + '...').width > maxWidth) {
                    lastLine = lastLine.slice(0, -1);
                }
                lines.push(lastLine + '...');
                break;
            }
            lines.push(line.trim());
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }

    // إضافة السطر الأخير إذا لم نصل للحد الأقصى
    if (lines.length < maxLines && line.trim().length > 0) {
        lines.push(line.trim());
    }

    // رسم الأسطر
    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
        let lineText = lines[i];
        let isArabic = /[\u0600-\u06FF]/.test(lineText);

        if (isArabic) {
            context.direction = 'rtl';
            context.textAlign = 'right';
            x = canvas.width - padding_x;
        } else {
            context.direction = 'ltr';
            context.textAlign = 'left';
        }
        context.fillText(lineText, x, y + (i * lineHeight));
    }

    // إرجاع عدد الأسطر الفعلي المرسوم
    return Math.min(lines.length, maxLines);
}

// تحديث المتغيرات العامة للإعدادات الافتراضية
const defaultSettings = {
    textPosition: {
        defaultY: 400,
        minY: 300,
        maxY: 700
    },
    imagePosition: {
        defaultY: 435, // تم تعديل القيمة الافتراضية لموقع الصورة
        minY: 600,
        maxY: 1100
    }
};

// إضافة دالة throttle للحد من عدد مرات تنفيذ الدالة
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            requestAnimationFrame(() => {
                inThrottle = false;
            });
        }
    }
}

// تحديث معالجات الأحداث للمؤشرات
document.getElementById('textPositionSlider').addEventListener('input', throttle(function() {
    isTextPositionEnabled = true;
    document.getElementById('toggleTextPosition').checked = true;
    textPositionY = parseInt(this.value);
    if (croppedImage) {
        requestAnimationFrame(() => {
            processImage(croppedImage);
        });
    }
}, 16)); // حوالي 60 إطار في الثانية

document.getElementById('imagePositionSlider').addEventListener('input', throttle(function() {
    isImagePositionEnabled = true;
    document.getElementById('toggleImagePosition').checked = true;
    imagePositionY = parseInt(this.value);
    if (croppedImage) {
        requestAnimationFrame(() => {
            processImage(croppedImage);
        });
    }
}, 16));

// إضافة مستمعي الأحداث للـcheckboxes
document.getElementById('toggleTextPosition').addEventListener('change', function() {
    isTextPositionEnabled = this.checked;
    const textSlider = document.getElementById('textPositionSlider');
    textSlider.disabled = !this.checked;
    
    if (this.checked) {
        // عند التفعيل، نضع قيمة الشريط على الموقع الحالي للنص
        const currentTextY = textPositionY;
        textSlider.value = currentTextY;
    }
    
    if (croppedImage) processImage(croppedImage);
});

document.getElementById('toggleImagePosition').addEventListener('change', function() {
    isImagePositionEnabled = this.checked;
    const imageSlider = document.getElementById('imagePositionSlider');
    imageSlider.disabled = !this.checked;
    
    if (this.checked) {
        // عند التفعيل، نضع قيمة الشريط على الموقع الحالي للصورة
        const currentImageY = imagePositionY;
        imageSlider.value = currentImageY;
    }
    
    if (croppedImage) processImage(croppedImage);
});

// تهيئة حالة المتحكمات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
    // تعطيل المؤشرات في البداية
    document.getElementById('textPositionSlider').disabled = true;
    document.getElementById('imagePositionSlider').disabled = true;
});

// تعديل دالة drawWatermark
function drawWatermark(offsetX, offsetY, newWidth, newHeight) {
    if (!document.getElementById('toggleWatermark').checked) {
        return; // لا تقم برسم العلامة المائية إذا كان الخيار غير مفعل
    }

    const watermark = new Image();
    watermark.onload = function () {
        const watermarkWidth = 102;
        const watermarkHeight = 50;
        let watermarkX = offsetX + (newWidth - watermarkWidth) / 2;
        let watermarkY = offsetY + newHeight - 50 - watermarkHeight;

        ctx.globalAlpha = watermarkOpacity;
        ctx.drawImage(watermark, watermarkX, watermarkY, watermarkWidth, watermarkHeight);
        ctx.globalAlpha = 1;
    }
    watermark.src = document.getElementById('watermarkSelect').value;
}

// إضافة متغيرات التحكم في الحالة
let isTextPositionEnabled = false;
let isImagePositionEnabled = false;
let defaultTextPosition = 400;
let defaultImagePosition = 1000;
let textPositionY = defaultTextPosition;
let imagePositionY = defaultImagePosition;
// تحديث دالة drawTexts لاستخدام الموقع المناسب
function drawTexts() {
    requestAnimationFrame(() => {
        const text = document.getElementById('textBox').value;
        if (!text) return;

        const rectY = isTextPositionEnabled ? textPositionY : defaultSettings.textPosition.defaultY;
        
        ctx.save();
        ctx.font = "50px 'Tajawal', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textBaseline = "middle";

        wrapText(ctx, text, padding_x, rectY, text_box_width - (padding_x * 2), 50);
        ctx.restore();
    });
}

function updateDownloadButton() {
    const downloadButton = document.getElementById("downloadImage");
    if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.style.opacity = 1;
        downloadButton.removeEventListener("click", downloadImage);
        downloadButton.addEventListener("click", downloadImage);
    }
}

function downloadImage() {
    if (canvas.width > 0 && canvas.height > 0) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = "processed_image.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        console.error("Canvas does not contain any image data.");
    }
}

async function handleFiles(files) {
    try {
        await loadFont();

        if (files.length > 0) {
            const file = files[0];

            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        croppedImage = img;
                        processImage(img);
                    };
                    img.onerror = function() {
                        console.error("فشل تحميل الصورة");
                    };
                    img.src = e.target.result;
                };

                reader.onerror = function() {
                    console.error("فشل قراءة الملف");
                };

                reader.readAsDataURL(file);
            } else {
                console.error("نوع الملف غير مدعوم");
            }
        }
    } catch (error) {
        console.error("حدث خطأ:", error);
    }
}

// وظيفة لاستخراج النص وعرضه
async function extractAndDisplayText(canvas) {
    const ctx = canvas.getContext('2d');

    // تحديد منطقة الاستخراج (من 750 بكسل إلى 1000 بكسل من الأعلى)
    const extractionHeight = 250; // ارتفاع منطقة الاستخراج
    const startY = 750; // بداية منطقة الاستخراج من الأعلى
    const endY = 1000; // نهاية منطقة الاستخراج

    // تعيين حجم الكانفاس لمنطقة الاستخراج
    const extractionCanvas = document.createElement('canvas');
    extractionCanvas.width = canvas.width;
    extractionCanvas.height = extractionHeight;

    const extractionCtx = extractionCanvas.getContext('2d');

    // رسم الجزء المحدد من الصورة على الكانفاس الجديد
    extractionCtx.drawImage(
        canvas,
        0, startY, // إحداثيات البداية
        canvas.width, endY - startY, // عرض ونسبة ارتفاع الصورة
        0, 0, // إحداثيات البداية للكانفاس الجديد
        canvas.width, extractionHeight // عرض وارتفاع الكانفاس الجديد
    );

    // حاول استخراج النص من منطقة الاستخراج
    try {
        const extractedText = await extractTextFromImage(extractionCanvas);
        if (extractedText) {
            document.getElementById("textBox").value = extractedText; // عرض النص المستخرج

            // إذا نجح استخراج النص، يتم تحديث الكانفاس الأصلي
            processImage(croppedImage); // استدعاء الدالة لتحديث الكانفاس
        } else {
            console.log("لم يتم استخراج أي نص من الصورة.");
        }
    } catch (error) {
        console.error("طأ في استخراج النص:", error);
    }
}

// وظيفة لتحويل HEIC إلى JPEG
async function convertHEICToJPEG(file) {
    try {
        // تأكد من أن لديك مكتبة لتحويل HEIC إلى JPEG مثل "heic2any"
        const blob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 1
        });
        return blob;
    } catch (error) {
        console.error("حدث خطأ أثناء تحويل HEIC إلى JPEG:", error);
        return null;
    }
}



function processImageFromBlob(blob) {
    const reader = new FileReader();
    reader.onload = async (event) => {
        const img = new Image();
        img.onload = async function () {
            // تأكد من أن الكانفاس تم تحميله
            canvas.width = canvasSize.width;
            canvas.height = canvasSize.height;

            ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height); // رسم الخلفية

            // رسم الصورة على الكانفاس
            ctx.drawImage(img, 0, 0, img.width, img.height); // ضبط موضع الصورة
            croppedImage = img; // الاحتفاظ بالصورة المُعالجة
            
            processImage(croppedImage); // معالجة الصورة (ستقوم بتطبيق التأثيرات أو الرسوم)
        };
        img.onerror = function (error) {
            console.error("Error loading image:", error);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(blob); // قراءة الـ Blob كـ Data URL
}



// وظيفة لاستخدام هذه الوظيفة عند اختيار ملفات
document.getElementById("imageUpload").addEventListener("change", (event) => {
    handleFiles(event.target.files);
});


let textChangeTimer;
function handleTextChange() {
    clearTimeout(textChangeTimer);
    textChangeTimer = setTimeout(() => {
        if (croppedImage) {
            requestAnimationFrame(() => {
                processImage(croppedImage);
            });
        }
    }, 100); // تأخير أقل للاستجابة السريعة
}

// تابع لاستخراج النصوص من الصورة
async function extractTextFromImage(canvas) {
    try {
        const result = await Tesseract.recognize(canvas, 'eng+ara');
        return result.data.text;
    } catch (error) {
        console.error("Error extracting text from image:", error);
        return null;
    }
}

document.getElementById("textBox").addEventListener("input", handleTextChange);

document.getElementById("imageUpload").addEventListener("change", (event) => {
    handleFiles(event.target.files);
});

document.getElementById('watermarkSelect').addEventListener('change', function () {
    watermarkOpacity = parseFloat(this.value);
    if (croppedImage) processImage(croppedImage);
});

document.getElementById('opacitySlider').addEventListener('input', throttle(function() {
    watermarkOpacity = parseFloat(this.value);
    if (croppedImage) {
        requestAnimationFrame(() => {
            processImage(croppedImage);
        });
    }
}, 16));





document.getElementById('textPositionSlider').addEventListener('input', function() {
    textPositionY = parseInt(this.value);
    if (croppedImage) processImage(croppedImage);
});

document.getElementById('imagePositionSlider').addEventListener('input', function() {
    imagePositionY = parseInt(this.value);
    if (croppedImage) processImage(croppedImage);
});































const fileInput = document.getElementById('imageUpload');
const fileUpload = document.getElementById('file-upload');
const uploadHint = document.querySelector('.upload-hint');
const uploadProgress = document.querySelector('.upload-progress');

fileInput.addEventListener('change', function () {
    const file = this.files[0];
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop();
    const label = fileUpload.querySelector('label');

    uploadHint.classList.add('show');
    uploadProgress.style.left = '-80%';
    label.style.display = 'none';

    function truncateFileName(fileName) {
        // تحديد الطول الأقصى لاسم الملف
        const maxLength = 25;
    
        // التحقق من طول اسم الملف وقصه إذا لزم الأمر
        return fileName.length > maxLength 
            ? fileName.substring(0, maxLength) + '...' 
            : fileName;
    }
    
    const truncatedFileName = truncateFileName(fileName);
    
    setTimeout(() => {
        label.innerHTML = `
            <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" class="h-10 w-10 flex-shrink-0" width="36" height="36">
                    <rect width="36" height="36" rx="6" fill="#0c8ce9"></rect>
                    <path d="M19.6663 9.66663H12.9997C12.5576 9.66663 12.1337 9.84222 11.8212 10.1548C11.5086 10.4673 11.333 10.8913 11.333 11.3333V24.6666C11.333 25.1087 11.5086 25.5326 11.8212 25.8451C12.1337 26.1577 12.5576 26.3333 12.9997 26.3333H22.9997C23.4417 26.3333 23.8656 26.1577 24.1782 25.8451C24.4907 25.5326 24.6663 25.1087 24.6663 24.6666V14.6666L19.6663 9.66663Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M19.667 9.66663V14.6666H24.667" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M21.3337 18.8334H14.667" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M21.3337 22.1666H14.667" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M16.3337 15.5H15.5003H14.667" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </div>
            <div class="overflow-hidden">
                <div class="truncate font-semibold">${truncatedFileName}</div>
                <div class="truncate text-token-text-tertiary">${fileExtension.toUpperCase()}</div>
            </div>`;
        
        uploadHint.classList.remove('show');
        label.style.display = 'flex';
        label.classList.add('uploads');
        uploadProgress.style.left = '-100%';
    }, 1000);
});

const hideAndShowDiv = document.querySelector(".hideandshow");

imageUpload.addEventListener("change", function(event) {
    if (event.target.files.length > 0) {
        hideAndShowDiv.style.display = "block"; // إظهار العناصر عند رفع ملف
        handleFiles(event.target.files);
    }
});

document.getElementById('toggleWatermark').addEventListener('change', function() {
    const opacitySlider = document.getElementById('opacitySlider');

    if (this.checked) {
        opacitySlider.disabled = false;
        watermarkOpacity = opacitySlider.value;
    } else {
        opacitySlider.disabled = true;
        watermarkOpacity = 0;
    }

    if (croppedImage) processImage(croppedImage);
});

// تشغيل الكود في البداية للتأكد من الحالة الصحيحة
document.addEventListener("DOMContentLoaded", function() {
    const toggleWatermark = document.getElementById('toggleWatermark');
    const opacitySlider = document.getElementById('opacitySlider');
    
    if (!toggleWatermark.checked) {
        opacitySlider.disabled = true;
        watermarkOpacity = 0;
    } else {
        opacitySlider.disabled = false;
        watermarkOpacity = opacitySlider.value;
    }

    if (croppedImage) processImage(croppedImage);
});

// إضافة كانفاس مؤقت للـ double buffering
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d');

// تحديث دالة processImage لتتعامل مع ارتفاع النص المتغير
async function processImage(image) {
    try {
        if (!canvas || !image) {
            console.error("Canvas or image not found");
            return;
        }

        tempCanvas.width = canvasSize.width;
        tempCanvas.height = canvasSize.height;
        tempCtx.drawImage(backgroundImg, 0, 0, tempCanvas.width, tempCanvas.height);

        const MAX_SIZE = 870;
        let newWidth, newHeight;
        const aspectRatio = image.width / image.height;

        if (image.width > image.height) {
            newWidth = MAX_SIZE;
            newHeight = Math.round(MAX_SIZE / aspectRatio);
        } else {
            newHeight = MAX_SIZE;
            newWidth = Math.round(MAX_SIZE * aspectRatio);
        }

        // حساب ارتفاع النص
        const text = document.getElementById('textBox').value;
        const lineHeight = 53;
        let textHeight = 0;
        
        if (text) {
            tempCtx.save();
            tempCtx.font = "48px 'Tajawal', sans-serif";
            
            // حساب عدد الأسطر
            const words = text.split(' ');
            let line = '';
            let lines = [];
            
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                let metrics = tempCtx.measureText(testLine);
                let testWidth = metrics.width;
                
                if (testWidth > text_box_width - (padding_x * 2) && n > 0) {
                    lines.push(line.trim());
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line.trim());
            
            textHeight = lines.length * lineHeight;
            tempCtx.restore();
        }

        // حساب المواقع مع الأخذ في الاعتبار ارتفاع النص
        const canvasMiddleY = canvasSize.height / 2;
        const totalHeight = textHeight + 35 + newHeight; // ارتفاع النص + المسافة + ارتفاع الصورة
        const startY = canvasMiddleY - (totalHeight / 2);

        // تحديد موقع النص والصورة
        const textY = isTextPositionEnabled ? textPositionY : startY;
        const imageY = isImagePositionEnabled ? imagePositionY : startY + textHeight + 35;

        // تحديث قيم الشرائط لتعكس المواقع الحالية
        if (!isTextPositionEnabled) {
            textPositionY = textY;
            document.getElementById('textPositionSlider').value = textY;
        }
        if (!isImagePositionEnabled) {
            imagePositionY = imageY;
            document.getElementById('imagePositionSlider').value = imageY;
        }

        // رسم النص
        if (text) {
            tempCtx.save();
            tempCtx.font = "48px 'Tajawal', sans-serif";
            tempCtx.fillStyle = "#fff";
            tempCtx.textBaseline = "middle";
            wrapText(tempCtx, text, padding_x, textY, text_box_width - (padding_x * 2), lineHeight);
            tempCtx.restore();
        }

        // رسم الصورة
        const offsetX = (tempCanvas.width - newWidth) / 2;
        const offsetY = imageY;

        tempCtx.save();
        tempCtx.beginPath();
        tempCtx.moveTo(offsetX + border_radius, offsetY);
        tempCtx.arcTo(offsetX + newWidth, offsetY, offsetX + newWidth, offsetY + newHeight, border_radius);
        tempCtx.arcTo(offsetX + newWidth, offsetY + newHeight, offsetX, offsetY + newHeight, border_radius);
        tempCtx.arcTo(offsetX, offsetY + newHeight, offsetX, offsetY, border_radius);
        tempCtx.arcTo(offsetX, offsetY, offsetX + newWidth, offsetY, border_radius);
        tempCtx.closePath();
        tempCtx.clip();
        tempCtx.drawImage(image, offsetX, offsetY, newWidth, newHeight);
        tempCtx.restore();

        // رسم العلامة المائية
        if (document.getElementById('toggleWatermark').checked) {
            const watermark = new Image();
            await new Promise((resolve, reject) => {
                watermark.onload = () => {
                    const watermarkWidth = 102;
                    const watermarkHeight = 50;
                    let watermarkX = offsetX + (newWidth - watermarkWidth) / 2;
                    let watermarkY = offsetY + newHeight - 50 - watermarkHeight;

                    tempCtx.globalAlpha = watermarkOpacity;
                    tempCtx.drawImage(watermark, watermarkX, watermarkY, watermarkWidth, watermarkHeight);
                    tempCtx.globalAlpha = 1;
                    resolve();
                };
                watermark.onerror = reject;
                watermark.src = document.getElementById('watermarkSelect').value;
            });
        }

        requestAnimationFrame(() => {
            canvas.width = canvasSize.width;
            canvas.height = canvasSize.height;
            ctx.drawImage(tempCanvas, 0, 0);
            canvas.style.display = "block";
            updateDownloadButton();
        });

    } catch (error) {
        console.error("Error in processImage:", error);
    }
}

// تحديث معالجات الأحداث لتكون أكثر سلاسة
function createSmoothHandler(callback) {
    let rafId = null;
    return function(...args) {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
            callback.apply(this, args);
            rafId = null;
        });
    };
}

// تطبيق المعالج السلس على تغيير النص
document.getElementById('textBox').addEventListener('input', createSmoothHandler(() => {
    if (croppedImage) processImage(croppedImage);
}));

// تطبيق المعالج السلس على تغيير موضع النص
document.getElementById('textPositionSlider').addEventListener('input', createSmoothHandler(function() {
    isTextPositionEnabled = true;
    document.getElementById('toggleTextPosition').checked = true;
    textPositionY = parseInt(this.value);
    if (croppedImage) processImage(croppedImage);
}));

// تطبيق المعالج السلس على تغيير موضع الصورة
document.getElementById('imagePositionSlider').addEventListener('input', createSmoothHandler(function() {
    isImagePositionEnabled = true;
    document.getElementById('toggleImagePosition').checked = true;
    imagePositionY = parseInt(this.value);
    if (croppedImage) processImage(croppedImage);
}));

// تطبيق المعالج السلس على تغيير شفافية العلامة المائية
document.getElementById('opacitySlider').addEventListener('input', createSmoothHandler(function() {
    watermarkOpacity = parseFloat(this.value);
    if (croppedImage) processImage(croppedImage);
}));





