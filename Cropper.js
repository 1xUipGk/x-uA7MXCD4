const imageToCrop = document.getElementById("imageToCrop");
const cropperWrapper = document.querySelector(".cropper-wrapper");
const cropperfullscreenOverlay = document.querySelector("div#cropperfullscreenOverlay");
const cropImageButton = document.getElementById("cropImage");
let cropper;

// دالة لتحويل Data URL إلى Blob
function dataURLToBlob(dataURL) {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}

// إضافة مستمع أحداث لتحميل الصور الجديدة وتحديث الكروبر تلقائيًا
document.getElementById("imageUpload").addEventListener("change", async (event) => {
    const files = event.target.files;
    if (files.length === 0) {
        alert("يرجى تحميل ملف صورة واحد على الأقل.");
        return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
        const img = new Image();
        img.onload = async function () {
            // تحقق من أن الصورة أكبر من 1000px
            if (img.height > 1000) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // رسم الصورة على الكانفاس
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                // الحصول على بيانات البيكسل من الصورة
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let containsColor = false;

                // البحث عن الألوان المطلوبة في الصورة
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // تحقق من اللون #36c7ff أو #39befc
                    if ((r === 54 && g === 199 && b === 255) || (r === 57 && g === 190 && b === 252)) {
                        containsColor = true;
                        break;
                    }
                }

                if (containsColor) {
                    // هنا يمكنك قص الصورة إذا كانت تستوفي الشروط
                    const croppedCanvas = document.createElement('canvas');
                    const croppedCtx = croppedCanvas.getContext('2d');

                    // الأبعاد الجديدة بعد القص
                    const xOffset = 22; // 22 بكسل من اليسار
                    const yOffset = 180; // 180 بكسل من الأعلى
                    const croppedWidth = img.width - (2 * xOffset); // عرض الصورة بعد قص الجانبين
                    const croppedHeight = img.height - (yOffset + 362); // ارتفاع الصورة بعد القص من الأعلى والأسفل

                    croppedCanvas.width = croppedWidth;
                    croppedCanvas.height = croppedHeight;

                    // قص الصورة
                    croppedCtx.drawImage(img, xOffset, yOffset, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);

                    // استدعاء processImageFromBlob مع الصورة المقصوصة
                    const croppedDataUrl = croppedCanvas.toDataURL();
                    const blob = dataURLToBlob(croppedDataUrl);
                    processImageFromBlob(blob); // تمرير الصورة ككائن Blob
                } else {
                    // إذا كانت الصورة لا تحتوي على الألوان المطلوبة، افتح قائمة قطع الصورة
                    openCropper(img);
                }
            } else {
                // إذا لم تكن الصورة أكبر من 1000 بكسل، افتح قائمة قطع الصورة
                openCropper(img);
            }
        };

        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// دالة لحفظ الصورة في localStorage
function saveToLocalStorage(croppedImageDataUrl) {
    localStorage.setItem("croppedImage", croppedImageDataUrl);
    console.log("الصورة المقطوعة تم حفظها في localStorage.");

    // استرجاع الصورة المحفوظة من localStorage
    const savedCroppedImage = localStorage.getItem("croppedImage");
    if (savedCroppedImage) {
        const croppedImage = new Image();
        croppedImage.onload = async function() {
            await processImage(croppedImage); // معالجة الصورة المحفوظة إذا لزم الأمر
        };
        croppedImage.src = savedCroppedImage;
    }
}

// دالة لمعالجة الصورة من Blob
async function processImageFromBlob(blob) {
    const img = new Image();
    img.onload = async function () {
        // معالجة الصورة هنا (على سبيل المثال، إضافة نص أو علامة مائية)
        await processImage(img); // استدعاء دالة المعالجة
    };
    img.src = URL.createObjectURL(blob);
}

// دالة لفتح واجهة القطع
function openCropper(img) {
    cropperWrapper.style.display = "block";
    cropperfullscreenOverlay.style.display = "block";
    
    // تعيين مصدر الصورة في الكروبر
    imageToCrop.src = img.src; // تعيين src للصورة في واجهة القطع

    // إذا كان الكروبر موجودًا، تهيئته من جديد
    if (cropper) {
        cropper.destroy(); // تدمير الكروبر الحالي
    }
    cropper = new Cropper(imageToCrop, {
        // هنا يمكنك إزالة نسبة العرض إلى الارتفاع
        viewMode: 1,
        // خيارات أخرى حسب الحاجة
    });

    // تأكد من أن الزر يظهر
    cropImageButton.style.display = "block"; // إظهار الزر لقص الصورة
}

// إضافة مستمع أحداث للنقر على الزر لقص الصورة
cropImageButton.addEventListener("click", () => {
    const croppedCanvas = cropper.getCroppedCanvas();
    const croppedDataUrl = croppedCanvas.toDataURL(); // الحصول على Data URL
    const blob = dataURLToBlob(croppedDataUrl); // تحويل Data URL إلى Blob

    // استدعاء processImageFromBlob مع الصورة المقطوعة
    processImageFromBlob(blob); // تمرير الصورة ككائن Blob

    // حفظ الصورة المقطوعة في localStorage
    saveToLocalStorage(croppedDataUrl);

    cropperWrapper.style.display = "none";
    cropperfullscreenOverlay.style.display = "none";
    cropper.destroy();
    cropImageButton.style.display = "none"; // إخفاء الزر بعد القص
});
