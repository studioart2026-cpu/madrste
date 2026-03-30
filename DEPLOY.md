# Deployment

هذا المشروع جاهز للنشر بشرط أساسي: وجود مساحة تخزين دائمة قابلة للكتابة، لأن النظام يحفظ بياناته التشغيلية في ملفات JSON.

## Required environment variables

- `AUTH_SESSION_SECRET`: مفتاح طويل وعشوائي لتوقيع الجلسات.
- `DATA_DIRECTORY`: مسار مجلد التخزين الدائم. مثال: `/app/data`.
- `PORT`: اختياري، الافتراضي `3000`.

## Local production run on PowerShell

أنشئ ملف البيئة الإنتاجية:

```powershell
cd "C:\Users\User\Desktop\madrsa"
Copy-Item .env.example .env.production
```

عدّل القيم داخل `.env.production` ثم شغّل:

```powershell
cd "C:\Users\User\Desktop\madrsa"
npm.cmd install
npm.cmd run build
npm.cmd run start
```

بعد التشغيل:

- النظام: `http://localhost:3000`
- فحص الصحة: `http://localhost:3000/api/health`

## Docker

بناء الصورة:

```bash
docker build -t madrsa .
```

تشغيل الحاوية:

```bash
docker run -p 3000:3000 \
  -e AUTH_SESSION_SECRET=change-me-to-a-long-random-secret \
  -e DATA_DIRECTORY=/app/data \
  -v madrsa-data:/app/data \
  madrsa
```

## Railway

المشروع صار يتضمن ملف [railway.json](/c:/Users/User/Desktop/madrsa/railway.json) بحيث يستخدم `Dockerfile` ويضبط فحص الصحة تلقائيًا على `/api/health`.

خطوات الرفع:

1. ارفع المشروع إلى GitHub.
2. في Railway اختر `New Project` ثم `Deploy from GitHub Repo`.
3. تأكد أن الخدمة تستخدم المستودع نفسه وتقرأ `railway.json`.
4. من `Variables` أضف:
   - `AUTH_SESSION_SECRET`
   - `DATA_DIRECTORY=/app/data`
5. أضف `Volume` واربطه بالخدمة على المسار `/app/data`.
6. نفّذ `Deploy` ثم اختبر:
   - `/api/health`
   - تسجيل الدخول
   - حفظ البيانات وبقاؤها بعد إعادة التشغيل

مهم:

- لا تنشر بدون `Volume` لأن بيانات `data/*.json` ستضيع عند إعادة التشغيل.
- صورة Docker الحالية أصبحت مهيأة للكتابة مباشرة داخل `/app/data` في Railway بدون متغيرات تشغيل إضافية.
- لا ترفع ملفات `data/*.json` الحالية إلى المستودع العام.
- إذا غيّرت متغيرات البيئة في Railway، أعد `Deploy` حتى تطبق القيم الجديدة.

## Deployment checklist

- فعّل HTTPS في الخادم أو المنصة.
- اربط مجلد بيانات دائم مع `DATA_DIRECTORY`.
- لا تنشر ملف `data/*.json` داخل المستودع العام.
- اختبر بعد النشر المسار `/api/health`.
- نفّذ أول تسجيل دخول بحساب إداري وتأكد من إنشاء الجلسة بشكل طبيعي.

## Hosting notes

- مناسب لمنصات تدعم ملفات دائمة مثل VPS أو Docker أو Railway Volume أو Render Persistent Disk.
- غير مناسب للاستضافة السيرفرلس التي تمسح الملفات بعد كل إعادة تشغيل.
