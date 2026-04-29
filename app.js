/* eslint-disable no-alert */
(() => {
  const OWNER = {
    waPhoneRaw: "01201016897",
    waPhoneIntl: "201201016897", // wa.me format (country code + number)
    email: "omarmohamed01201016897@gmail.com",
  };

  // لو هتستخدم Firebase (لتخزين البيانات + تحقق البريد):
  // 1) اعمل Firebase project
  // 2) فعل Authentication (Email/Password)
  // 3) اعمل Firestore Database
  // 4) حط بيانات config هنا بدل null
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBLWoOfEwXty6oLVCRoEn0jkFsyArXp-Nk",
    authDomain: "market-maroo.firebaseapp.com",
    projectId: "market-maroo",
    storageBucket: "market-maroo.firebasestorage.app",
    messagingSenderId: "972296690748",
    appId: "1:972296690748:web:92805be7fac72a16637739",
    measurementId: "G-HD9E7SK4KC",
  };
  const FIREBASE_CONFIG_KEY = "tech_services_firebase_config_v1";
  const STORAGE_KEY = "tech_services_user_v1"; // fallback cache (لو Firebase مش متضبط)
  const SESSION_KEY = "tech_services_logged_in";
  const THEME_KEY = "tech_services_theme";
  const LOGO_STYLE_KEY = "tech_services_logo_style";
  const LOGIN_LANG_KEY = "tech_services_login_lang";

  const el = (id) => document.getElementById(id);

  const loginModal = el("loginModal");
  const confirmModal = el("confirmModal");

  const loginForm = el("loginForm");
  const loginError = el("loginError");
  const forgotPasswordBtn = el("forgotPasswordBtn");
  const resetModal = el("resetModal");
  const resetForm = el("resetForm");
  const resetEmail = el("resetEmail");
  const resetPhone = el("resetPhone");
  const resetPassword = el("resetPassword");
  const resetPassword2 = el("resetPassword2");
  const resetError = el("resetError");
  const resetClose = el("resetClose");

  const setupModal = el("setupModal");
  const setupForm = el("setupForm");
  const setupLater = el("setupLater");
  const firebaseConfigInput = el("firebaseConfigInput");
  const setupError = el("setupError");

  const servicesGrid = el("servicesGrid");
  const panel = el("panel");
  const panelTitle = el("panelTitle");
  const panelSubtitle = el("panelSubtitle");
  const panelBody = el("panelBody");
  const backBtn = el("backBtn");

  const quickWhatsApp = el("quickWhatsApp");
  const quickEmail = el("quickEmail");
  const logoutBtn = el("logoutBtn");
  const themeToggle = el("themeToggle");
  const logoStyleSelect = el("logoStyleSelect");
  const brandTitle = el("brandTitle");

  const loginLangSelect = el("loginLangSelect");
  const loginTitle = el("loginTitle");
  const loginSubtitle = el("loginSubtitle");
  const langLabel = el("langLabel");
  const labelFullName = el("labelFullName");
  const labelPhone = el("labelPhone");
  const labelAddress = el("labelAddress");
  const labelEmail = el("labelEmail");
  const labelPassword = el("labelPassword");

  const footerWhatsApp = el("footerWhatsApp");
  const footerEmail = el("footerEmail");

  const confirmText = el("confirmText");
  const confirmWhatsApp = el("confirmWhatsApp");
  const confirmEmail = el("confirmEmail");
  const confirmClose = el("confirmClose");

  let navStack = [];
  let lastPayload = null;
  let profileCache = null;
  let firebaseState = { ok: false, auth: null, db: null, user: null };

  function normalizeDigits(s) {
    return String(s || "").replace(/[^\d]/g, "");
  }

  function isValidEgyptMobile11(phoneDigits) {
    return /^01\d{9}$/.test(phoneDigits);
  }

  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function applyTheme(theme) {
    const t = theme === "dark" ? "dark" : "light";
    document.body.setAttribute("data-theme", t);
    if (themeToggle) themeToggle.textContent = t === "dark" ? "☀️" : "🌙";
    localStorage.setItem(THEME_KEY, t);
  }

  function applyLogoStyle(style) {
    const allowed = ["style1", "style2", "style3", "style4", "style5"];
    const s = allowed.includes(style) ? style : "style1";
    document.body.classList.remove(...allowed.map((x) => `logo-${x}`));
    document.body.classList.add(`logo-${s}`);
    if (logoStyleSelect) logoStyleSelect.value = s;
    localStorage.setItem(LOGO_STYLE_KEY, s);
  }

  function applyLoginLanguage(lang) {
    const isEn = lang === "en";
    document.documentElement.lang = isEn ? "en" : "ar";
    if (loginLangSelect) loginLangSelect.value = isEn ? "en" : "ar";
    if (brandTitle) brandTitle.textContent = "Maroo";
    if (loginTitle) loginTitle.textContent = isEn ? "Account" : "الحساب";
    if (loginSubtitle) {
      loginSubtitle.textContent = isEn
        ? "Enter your info once to attach it to every inquiry."
        : "اكتب بياناتك مرة واحدة عشان تتسجل تلقائيًا مع أي استفسار.";
    }
    if (langLabel) langLabel.textContent = isEn ? "Language" : "اللغة";
    if (labelFullName) labelFullName.textContent = isEn ? "Full Name (3 parts)" : "الاسم الثلاثي";
    if (labelPhone) labelPhone.textContent = isEn ? "Mobile Number (11 digits)" : "رقم الموبايل (11 رقم)";
    if (labelAddress) labelAddress.textContent = isEn ? "Address" : "العنوان";
    if (labelEmail) labelEmail.textContent = isEn ? "Email" : "البريد الإلكتروني";
    if (labelPassword) labelPassword.textContent = isEn ? "Password" : "كلمة المرور";
    if (forgotPasswordBtn) forgotPasswordBtn.textContent = isEn ? "Forgot password?" : "نسيت كلمة المرور؟";
    if (logoutBtn) logoutBtn.textContent = isEn ? "Logout" : "تسجيل خروج";
    if (quickWhatsApp) quickWhatsApp.textContent = isEn ? "WhatsApp" : "واتساب";
    if (quickEmail) quickEmail.textContent = isEn ? "Email" : "البريد";
    localStorage.setItem(LOGIN_LANG_KEY, isEn ? "en" : "ar");
  }

  function getProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p || typeof p !== "object") return null;
      return p;
    } catch {
      return null;
    }
  }

  function setProfile(profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  function clearProfile() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function ensureLogin() {
    const profile = profileCache || getProfile();
    const loggedIn = sessionStorage.getItem(SESSION_KEY) === "1";
    if (profile && loggedIn) return profile;
    loginModal.showModal();
    return null;
  }

  function initFirebaseIfPossible() {
    try {
      if (!window.firebase) return;
      const stored = localStorage.getItem(FIREBASE_CONFIG_KEY);
      const cfg = stored ? JSON.parse(stored) : FIREBASE_CONFIG;
      if (!cfg) return;
      // prevent double init
      if (!window.firebase.apps || window.firebase.apps.length === 0) {
        window.firebase.initializeApp(cfg);
      }
      firebaseState = {
        ok: true,
        auth: null,
        db: window.firebase.firestore(),
        user: null,
      };
    } catch {
      // ignore (fallback to local only)
    }
  }

  function maybeShowSetup() {
    // مع وجود config داخل الكود، نافذة الإعداد لا تظهر للمستخدمين.
    return;
  }

  async function saveProfileToFirebase(profile) {
    if (!firebaseState.ok) return;
    await firebaseState.db
      .collection("users")
      .doc(profile.phone)
      .set(
        {
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address || "",
          email: profile.email || "",
          createdAt: profile.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
  }

  async function storeRequestToFirebase(payload, channel) {
    if (!firebaseState.ok) return;
    await firebaseState.db.collection("requests").add({
      createdAt: new Date().toISOString(),
      channel: channel || "unknown",
      section: payload.section || "",
      subsection: payload.subsection || "",
      idea: payload.idea || "",
      message: payload.message || "",
      fullName: payload.fullName || "",
      phone: payload.phone || "",
      address: payload.address || "",
    });
  }

  function buildWhatsAppUrl(messageText) {
    const text = encodeURIComponent(messageText);
    return `https://wa.me/${OWNER.waPhoneIntl}?text=${text}`;
  }

  function buildMailtoUrl(subject, body) {
    const s = encodeURIComponent(subject || "");
    const b = encodeURIComponent(body || "");
    return `mailto:${OWNER.email}?subject=${s}&body=${b}`;
  }

  function formatPayloadText(payload) {
    const lines = [
      "مرحبًا،",
      "",
      `الاسم: ${payload.fullName}`,
      `الموبايل: ${payload.phone}`,
      `العنوان: ${payload.address || "-"}`,
      `الإيميل: ${payload.email || "-"}`,
      "",
      `القسم: ${payload.section}`,
    ];

    if (payload.subsection) lines.push(`الخدمة: ${payload.subsection}`);
    if (payload.idea) lines.push(`الفكرة المختارة: ${payload.idea}`);

    lines.push("");
    lines.push("الاستفسار/البيانات:");
    lines.push(payload.message || "-");
    lines.push("");
    lines.push("تم الإرسال من موقع الخدمات.");
    return lines.join("\n");
  }

  function setQuickContacts() {
    quickWhatsApp.href = buildWhatsAppUrl("مرحبًا، محتاج استفسار عام.");
    quickWhatsApp.target = "_blank";

    quickEmail.href = buildMailtoUrl("استفسار عام", "مرحبًا، محتاج استفسار عام.");

    footerWhatsApp.href = `https://wa.me/${OWNER.waPhoneIntl}`;
    footerEmail.href = `mailto:${OWNER.email}`;
  }

  function cardHtml({ title, desc, badge }) {
    return `
      <div class="card card--clickable" role="button" tabindex="0" data-title="${escapeAttr(
        title
      )}">
        <div class="card__head">
          <div>
            <h3 class="card__title">${escapeHtml(title)}</h3>
            <p class="card__desc">${escapeHtml(desc)}</p>
          </div>
          ${badge ? `<div class="badge">${escapeHtml(badge)}</div>` : ""}
        </div>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replaceAll("\n", " ");
  }

  const SERVICES = [
    {
      id: "web",
      title: "تصميم وتطوير المواقع",
      desc: "اختيار فكرة موقع + تعديل موقع + تنفيذ فكرة كاملة.",
      badge: "Web",
    },
    {
      id: "cctv",
      title: "كاميرات المراقبه",
      desc: "تركيب — صيانة — استفسارات أخرى.",
      badge: "CCTV",
    },
    {
      id: "pc",
      title: "صيانة اجهزة الكمبيوتر (هاردوير/سوفتوير)",
      desc: "اكتب المشكلة وسيتم فتح واتساب برسالة جاهزة.",
      badge: "PC",
    },
    {
      id: "mobile",
      title: "حل مشاكل سوفتوير الموبايل (جميع الأنواع)",
      desc: "اكتب المشكلة وسيتم فتح واتساب برسالة جاهزة.",
      badge: "Mobile",
    },
    {
      id: "other",
      title: "خدمات اخرى",
      desc: "أي خدمة إضافية — اكتب طلبك.",
      badge: "Other",
    },
  ];

  const WEB_SUB = [
    {
      id: "ideas",
      title: "اختارلك فكرا لموقع",
      desc: "10 أفكار جاهزة مع صور + اختيار + تواصل.",
    },
    {
      id: "edit",
      title: "تعديل على موقع معين",
      desc: "اكتب استفسار كامل — هيتفتح واتساب برسالة (قسم تعديل المواقع).",
    },
    {
      id: "build",
      title: "تطبيق فكرة موقع",
      desc: "اكتب كل البيانات المطلوبة لإنشاء موقع — ثم تم لإرسالها.",
    },
  ];

  const CCTV_SUB = [
    { id: "install", title: "تركيب", desc: "تركيب كاميرات — اكتب التفاصيل." },
    { id: "maint", title: "صيانه", desc: "صيانة كاميرات — اكتب المشكلة." },
    {
      id: "otherq",
      title: "اسفسارات اخرى",
      desc: "أي استفسار خاص بالكاميرات.",
    },
  ];

  const PC_SUB = [
    {
      id: "hw",
      title: "حل مشكله متعلقه بالهاردوير",
      desc: "شاشة/هارد/رام/باور/حرارة/أي عطل مادي.",
    },
    {
      id: "sw",
      title: "حل مشكله متعلقه بالسوفتوير",
      desc: "ويندوز/تعريفات/برامج/بطء/فيروسات/شبكة.",
    },
  ];

  const WEB_IDEAS = [
    {
      title: "موقع جرد مخازن",
      desc: "إدارة مخزون + تقارير + صلاحيات مستخدمين.",
      img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "موقع تنظيم مطاعم",
      desc: "قائمة طعام + طلبات + إدارة طاولات.",
      img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "موقع إعلانات",
      desc: "نشر إعلانات + بحث وتصنيفات + رسائل.",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "موقع عيادة/حجز مواعيد",
      desc: "حجز مواعيد + تذكير + ملفات مرضى.",
      img: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "موقع متجر إلكتروني",
      desc: "منتجات + سلة + دفع/شحن.",
      img: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "موقع كورسات",
      desc: "دروس + اشتراكات + اختبارات.",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "موقع عقارات",
      desc: "عروض + خرائط + تواصل سريع.",
      img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "موقع شركة خدمات",
      desc: "تعريف بالخدمات + نماذج طلب + معرض أعمال.",
      img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "موقع مدرسة/تعليم",
      desc: "محتوى + نتائج + تواصل مع أولياء الأمور.",
      img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "موقع صيانة وبلاغات",
      desc: "تسجيل بلاغ + متابعة حالة + تقييم خدمة.",
      img: "https://images.unsplash.com/photo-1581092160607-ee22731d8a94?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  function svgDataUri(title) {
    const t = escapeHtml(title);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#2563eb" stop-opacity="0.22"/>
            <stop offset="1" stop-color="#7c3aed" stop-opacity="0.22"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="600" rx="36" fill="url(#g)"/>
        <rect x="54" y="54" width="1092" height="492" rx="28" fill="rgba(255,255,255,0.55)"/>
        <text x="600" y="300" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial" font-size="54" font-weight="800" fill="#0f172a">${t}</text>
        <text x="600" y="365" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial" font-size="28" font-weight="600" fill="#334155">تصميم مبدئي (صورة توضيحية)</text>
      </svg>
    `.trim();
    const encoded = encodeURIComponent(svg)
      .replaceAll("%0A", "")
      .replaceAll("%20", " ");
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }

  function renderHome() {
    servicesGrid.innerHTML = SERVICES.map((s) => cardHtml(s)).join("");

    servicesGrid.querySelectorAll(".card").forEach((c) => {
      const title = c.getAttribute("data-title");
      const svc = SERVICES.find((x) => x.title === title);
      c.addEventListener("click", () => openService(svc.id));
      c.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") openService(svc.id);
      });
    });
  }

  function showPanel({ title, subtitle, bodyHtml, onAfterRender }) {
    panelTitle.textContent = title;
    panelSubtitle.textContent = subtitle || "";
    panelBody.innerHTML = bodyHtml;
    panel.hidden = false;
    // لو البانل باين بالفعل، ما نعملش نزول مزعج.
    const rect = panel.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isVisible) {
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    if (typeof onAfterRender === "function") onAfterRender();
  }

  function pushNav(state) {
    navStack.push(state);
    backBtn.disabled = navStack.length <= 1;
  }

  function popNav() {
    if (navStack.length <= 1) return;
    navStack.pop();
    const prev = navStack[navStack.length - 1];
    prev.render();
    backBtn.disabled = navStack.length <= 1;
  }

  function openService(serviceId) {
    const svc = SERVICES.find((s) => s.id === serviceId);
    if (!svc) return;
    const profile = ensureLogin();
    if (!profile) return;

    if (serviceId === "web") return openWebRoot();
    if (serviceId === "cctv") return openCctvRoot();
    if (serviceId === "pc") return openPcRoot();
    if (serviceId === "mobile") return openSimpleForm({ section: svc.title });
    if (serviceId === "other") return openSimpleForm({ section: svc.title });
  }

  function openWebRoot() {
    const svcTitle = SERVICES.find((s) => s.id === "web").title;
    const render = () =>
      showPanel({
        title: svcTitle,
        subtitle: "اختر الخدمة داخل قسم تطوير المواقع.",
        bodyHtml: `
          <div class="grid">
            ${WEB_SUB.map((x) =>
              cardHtml({ title: x.title, desc: x.desc, badge: "Web" })
            ).join("")}
          </div>
        `,
        onAfterRender: () => {
          panelBody.querySelectorAll(".card").forEach((c) => {
            const title = c.getAttribute("data-title");
            const sub = WEB_SUB.find((x) => x.title === title);
            c.addEventListener("click", () => openWebSub(sub.id));
          });
        },
      });

    navStack = [];
    pushNav({ render });
    render();
  }

  function openWebSub(subId) {
    const svcTitle = SERVICES.find((s) => s.id === "web").title;
    const sub = WEB_SUB.find((x) => x.id === subId);
    if (!sub) return;

    const render = () => {
      if (subId === "ideas") return renderWebIdeas();
      if (subId === "edit")
        return openWhatsAppDirect({
          section: svcTitle,
          subsection: "(قسم تعديل المواقع)",
          title: sub.title,
          subtitle: "سيتم فتح واتساب برسالة جاهزة — اكتب استفسارك وأرسل.",
          messagePrefix: "عايز تعديل على موقع معين. اكتب الاستفسار كامل هنا:",
        });
      if (subId === "build")
        return openSimpleForm({
          section: svcTitle,
          subsection: "تطبيق فكرة موقع",
          title: sub.title,
          subtitle: "اكتب كل البيانات المطلوبة لإنشاء موقع.",
          placeholder:
            "اكتب: نوع الموقع + الصفحات المطلوبة + الألوان + مثال مواقع + بيانات التواصل + أي ملاحظات...",
        });
    };

    pushNav({ render });
    render();
  }

  function renderWebIdeas() {
    const svcTitle = SERVICES.find((s) => s.id === "web").title;
    showPanel({
      title: "اختارلك فكرا لموقع",
      subtitle: "اختار فكرة واضغط (اختيار) للتواصل.",
      bodyHtml: `
        <div class="grid">
          ${WEB_IDEAS.map((idea, idx) => {
            const img = idea.img || svgDataUri(idea.title);
            return `
              <div class="card">
                <div class="ideaCard">
                  <div class="ideaCard__img">
                    <img src="${img}" alt="${escapeAttr(idea.title)}" />
                  </div>
                  <div>
                    <div class="card__head">
                      <div>
                        <h3 class="card__title">${escapeHtml(idea.title)}</h3>
                        <p class="card__desc">${escapeHtml(idea.desc)}</p>
                      </div>
                      <div class="badge">فكرة #${idx + 1}</div>
                    </div>
                  </div>
                  <div class="ideaCard__actions">
                    <button class="btn btn--primary" type="button" data-choose-idea="${escapeAttr(
                      idea.title
                    )}">
                      اختيار
                    </button>
                    <button class="btn btn--ghost" type="button" data-preview-idea="${escapeAttr(
                      idea.title
                    )}">
                      معاينة الرسالة
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `,
      onAfterRender: () => {
        panelBody.querySelectorAll("[data-choose-idea]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const idea = btn.getAttribute("data-choose-idea");
            openIdeaContact(idea);
          });
        });

        panelBody.querySelectorAll("[data-preview-idea]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const idea = btn.getAttribute("data-preview-idea");
            const p = getProfile();
            const payload = {
              ...p,
              section: svcTitle,
              subsection: "اختارلك فكرا لموقع",
              idea,
              message: `محتاج موقع: ${idea}`,
            };
            alert(formatPayloadText(payload));
          });
        });
      },
    });
  }

  function openIdeaContact(ideaTitle) {
    const p = getProfile();
    const payload = {
      ...p,
      section: SERVICES.find((s) => s.id === "web").title,
      subsection: "اختارلك فكرا لموقع",
      idea: ideaTitle,
      message: `محتاج موقع: ${ideaTitle}`,
    };

    const text = formatPayloadText(payload);
    showConfirm({
      text: "تم اختيار الفكرة. سيتم الرد عليك خلال دقائق.",
      payload,
      waText: text,
      emailSubject: `طلب موقع: ${ideaTitle}`,
      emailBody: text,
    });
  }

  function openCctvRoot() {
    const svcTitle = SERVICES.find((s) => s.id === "cctv").title;
    const render = () =>
      showPanel({
        title: svcTitle,
        subtitle: "اختر (تركيب / صيانة / استفسارات أخرى).",
        bodyHtml: `
          <div class="grid">
            ${CCTV_SUB.map((x) =>
              cardHtml({ title: x.title, desc: x.desc, badge: "CCTV" })
            ).join("")}
          </div>
        `,
        onAfterRender: () => {
          panelBody.querySelectorAll(".card").forEach((c) => {
            const title = c.getAttribute("data-title");
            const sub = CCTV_SUB.find((x) => x.title === title);
            c.addEventListener("click", () => {
              openSimpleForm({
                section: svcTitle,
                subsection: sub.title,
                title: `${svcTitle} — ${sub.title}`,
                subtitle: "اكتب استفسارك وسيتم فتح واتساب برسالة جاهزة.",
                placeholder: "اكتب التفاصيل: المكان/العدد/المشكلة/الميزانية/المواعيد...",
                fields:
                  sub.id === "install"
                    ? [
                        {
                          id: "place",
                          label: "المكان",
                          type: "text",
                          required: true,
                        },
                        {
                          id: "count",
                          label: "عدد الكاميرات",
                          type: "text",
                          required: false,
                        },
                        {
                          id: "time",
                          label: "ميعاد مناسب للمعاينة/التركيب",
                          type: "text",
                          required: false,
                        },
                      ]
                    : [
                        {
                          id: "place",
                          label: "المكان",
                          type: "text",
                          required: false,
                        },
                        {
                          id: "problem",
                          label: "نوع العطل",
                          type: "text",
                          required: false,
                        },
                        {
                          id: "time",
                          label: "ميعاد مناسب للصيانة",
                          type: "text",
                          required: false,
                        },
                      ],
              });
            });
          });
        },
      });

    navStack = [];
    pushNav({ render });
    render();
  }

  function openPcRoot() {
    const svcTitle = SERVICES.find((s) => s.id === "pc").title;

    const render = () =>
      showPanel({
        title: svcTitle,
        subtitle: "اختر نوع المشكلة (هاردوير / سوفتوير).",
        bodyHtml: `
          <div class="grid">
            ${PC_SUB.map((x) =>
              cardHtml({ title: x.title, desc: x.desc, badge: "PC" })
            ).join("")}
          </div>
        `,
        onAfterRender: () => {
          panelBody.querySelectorAll(".card").forEach((c) => {
            const title = c.getAttribute("data-title");
            const sub = PC_SUB.find((x) => x.title === title);
            c.addEventListener("click", () => {
              openSimpleForm({
                section: svcTitle,
                subsection: sub.title,
                title: `${svcTitle} — ${sub.title}`,
                subtitle: "اكتب المشكلة بالتفصيل وسيتم فتح واتساب برسالة جاهزة.",
                placeholder:
                  "اكتب: نوع الجهاز + الموديل (إن وجد) + الأعراض + آخر شيء حدث قبل المشكلة + أي رسائل خطأ...",
                fields: [
                  {
                    id: "device",
                    label: "نوع الجهاز (Desktop/Laptop)",
                    type: "text",
                    required: false,
                  },
                  {
                    id: "model",
                    label: "الموديل (اختياري)",
                    type: "text",
                    required: false,
                  },
                  {
                    id: "time",
                    label: "ميعاد مناسب للتواصل",
                    type: "text",
                    required: false,
                  },
                ],
              });
            });
          });
        },
      });

    navStack = [];
    pushNav({ render });
    render();
  }

  function openWhatsAppDirect({
    section,
    subsection,
    title,
    subtitle,
    messagePrefix,
  }) {
    showPanel({
      title,
      subtitle,
      bodyHtml: `
        <div class="card">
          <div class="form">
            <label class="field">
              <span class="field__label">اكتب استفسارك</span>
              <textarea class="textarea" id="directMessage" placeholder="اكتب هنا..." required></textarea>
              <div class="hint">بعد (تم) هيتفتح واتساب برسالة جاهزة. عدّل/زود أي تفاصيل ثم اضغط إرسال.</div>
            </label>
            <button class="btn btn--primary" id="directSend" type="button">تم</button>
          </div>
        </div>
      `,
      onAfterRender: () => {
        const directMessage = el("directMessage");
        const directSend = el("directSend");

        directMessage.value = messagePrefix ? `${messagePrefix}\n` : "";
        directSend.addEventListener("click", () => {
          const p = getProfile();
          const msg = String(directMessage.value || "").trim();
          if (!msg) return;
          const payload = {
            ...p,
            section,
            subsection,
            message: msg,
          };
          const text = formatPayloadText(payload);
          showConfirm({
            text: "سيتم الرد عليك خلال دقائق.",
            payload,
            waText: text,
            emailSubject: `${section} - ${subsection}`,
            emailBody: text,
          });
        });
      },
    });
  }

  function openSimpleForm({
    section,
    subsection,
    title,
    subtitle,
    placeholder,
    fields,
  }) {
    const t = title || (subsection ? `${section} — ${subsection}` : section);
    const st = subtitle || "اكتب الاستفسار ثم اضغط تم.";

    const formFields =
      fields && Array.isArray(fields) && fields.length
        ? fields
        : [
            { id: "subject", label: "عنوان مختصر", type: "text", required: true },
            {
              id: "location",
              label: "المكان (اختياري)",
              type: "text",
              required: false,
            },
            {
              id: "time",
              label: "ميعاد مناسب للتواصل (اختياري)",
              type: "text",
              required: false,
            },
          ];

    const fieldsHtml = formFields
      .map((f) => {
        return `
          <label class="field">
            <span class="field__label">${escapeHtml(f.label)}</span>
            <input class="input" id="f_${escapeAttr(f.id)}" type="${escapeAttr(
              f.type || "text"
            )}" ${f.required ? "required" : ""} />
          </label>
        `;
      })
      .join("");

    showPanel({
      title: t,
      subtitle: st,
      bodyHtml: `
        <div class="card">
          <form class="form" id="reqForm">
            ${fieldsHtml}
            <label class="field">
              <span class="field__label">التفاصيل</span>
              <textarea class="textarea" id="reqMessage" placeholder="${escapeAttr(
                placeholder ||
                  "اكتب المشكلة/الطلب بالتفصيل (الأجهزة/البرامج/الأعراض/الموديل/الوقت المناسب...)"
              )}" required></textarea>
              <div class="hint">هتظهر لك رسالة “سيتم الرد عليك خلال دقائق” وبعدين تقدر تضغط واتساب لإرسال الطلب.</div>
            </label>
            <button class="btn btn--primary" type="submit">تم</button>
          </form>
        </div>
      `,
      onAfterRender: () => {
        const form = el("reqForm");
        const reqMessage = el("reqMessage");
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const p = getProfile();
          const msg = String(reqMessage.value || "").trim();
          if (!msg) return;

          const parts = [];
          formFields.forEach((f) => {
            const v = String(el(`f_${f.id}`)?.value || "").trim();
            if (v) parts.push(`${f.label}: ${v}`);
          });

          const payload = {
            ...p,
            section,
            subsection,
            message: parts.length ? `${parts.join("\n")}\n\n${msg}` : msg,
          };
          const text = formatPayloadText(payload);
          showConfirm({
            text: "سيتم الرد عليك خلال دقائق.",
            payload,
            waText: text,
            emailSubject: subsection ? `${section} - ${subsection}` : section,
            emailBody: text,
          });
          form.reset();
        });
      },
    });
  }

  function showConfirm({ text, payload, waText, emailSubject, emailBody }) {
    lastPayload = payload || null;
    confirmText.textContent = text || "سيتم الرد عليك خلال دقائق.";
    confirmWhatsApp.href = buildWhatsAppUrl(waText);
    confirmEmail.href = buildMailtoUrl(emailSubject, emailBody);
    confirmModal.showModal();

    // حفظ الطلب عندك (لو Firebase متضبط)
    storeRequestToFirebase(payload || {}, "confirm").catch(() => {});
  }

  function wireEvents() {
    backBtn.addEventListener("click", popNav);

    confirmClose.addEventListener("click", () => confirmModal.close());

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const current = document.body.getAttribute("data-theme") || "light";
        applyTheme(current === "dark" ? "light" : "dark");
      });
    }

    if (logoStyleSelect) {
      logoStyleSelect.addEventListener("change", () => {
        applyLogoStyle(logoStyleSelect.value);
      });
    }

    if (loginLangSelect) {
      loginLangSelect.addEventListener("change", () => {
        applyLoginLanguage(loginLangSelect.value);
      });
    }

    logoutBtn.addEventListener("click", () => {
      profileCache = null;
      sessionStorage.removeItem(SESSION_KEY);
      navStack = [];
      panel.hidden = true;
      loginModal.showModal();
    });

    forgotPasswordBtn.addEventListener("click", () => {
      resetError.hidden = true;
      resetForm.reset();
      resetModal.showModal();
    });

    resetClose.addEventListener("click", () => resetModal.close());

    resetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      resetError.hidden = true;

      const existing = getProfile();
      if (!existing) {
        resetError.textContent = "لا يوجد حساب محفوظ على هذا الجهاز.";
        resetError.hidden = false;
        return;
      }

      const email = String(resetEmail.value || "").trim();
      const phone = normalizeDigits(resetPhone.value);
      const newPass = String(resetPassword.value || "");
      const newPass2 = String(resetPassword2.value || "");

      if (!isValidEmail(email)) {
        resetError.textContent = "اكتب بريد إلكتروني صحيح.";
        resetError.hidden = false;
        return;
      }
      if (!isValidEgyptMobile11(phone)) {
        resetError.textContent = "رقم الموبايل غير صحيح.";
        resetError.hidden = false;
        return;
      }
      if (newPass.length < 6) {
        resetError.textContent = "كلمة المرور لازم تكون 6 أحرف/أرقام على الأقل.";
        resetError.hidden = false;
        return;
      }
      if (newPass !== newPass2) {
        resetError.textContent = "تأكيد كلمة المرور غير مطابق.";
        resetError.hidden = false;
        return;
      }
      if (existing.email !== email || existing.phone !== phone) {
        resetError.textContent = "الإيميل أو رقم الموبايل غير مطابقين للبيانات المسجلة.";
        resetError.hidden = false;
        return;
      }

      const updated = {
        ...existing,
        password: newPass,
        updatedAt: new Date().toISOString(),
      };
      setProfile(updated);
      profileCache = updated;
      saveProfileToFirebase(updated).catch(() => {});
      resetModal.close();
      loginError.textContent = "تم تغيير كلمة المرور بنجاح. ادخل بالباسورد الجديد.";
      loginError.hidden = false;
    });

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      loginError.hidden = true;
      const fullName = String(el("fullName").value || "").trim();
      const phoneDigits = normalizeDigits(el("phone").value);
      const address = String(el("address").value || "").trim();
      const email = String(el("email").value || "").trim();
      const password = String(el("password").value || "");

      if (!isValidEmail(email)) {
        loginError.textContent = "اكتب بريد إلكتروني صحيح.";
        loginError.hidden = false;
        return;
      }
      if (password.length < 6) {
        loginError.textContent = "الباسورد لازم يكون 6 أحرف/أرقام على الأقل.";
        loginError.hidden = false;
        return;
      }

      const existing = getProfile();

      // لو الحساب موجود بنفس الإيميل: ندقق فقط في الباسورد
      if (existing && existing.email === email) {
        if (existing.password !== password) {
          loginError.textContent = "الإيميل أو الباسورد غير صحيح.";
          loginError.hidden = false;
          return;
        }

        profileCache = existing;
        sessionStorage.setItem(SESSION_KEY, "1");
        loginModal.close();
        renderHome();
        return;
      }

      // أول تسجيل (أو إيميل جديد): نطلب البيانات الكاملة
      if (!fullName || fullName.split(/\s+/).length < 3) {
        loginError.textContent = "اكتب الاسم الثلاثي (3 كلمات على الأقل).";
        loginError.hidden = false;
        return;
      }
      if (!isValidEgyptMobile11(phoneDigits)) {
        loginError.textContent =
          "رقم الموبايل لازم يكون 11 رقم ويبدأ بـ 01 (مثال: 01201016897).";
        loginError.hidden = false;
        return;
      }
      if (!address) {
        loginError.textContent = "اكتب العنوان.";
        loginError.hidden = false;
        return;
      }

      const p = {
        fullName,
        phone: phoneDigits,
        address,
        email,
        password,
        createdAt: new Date().toISOString(),
      };
      setProfile(p);
      profileCache = p;
      sessionStorage.setItem(SESSION_KEY, "1");

      saveProfileToFirebase(p).catch(() => {});

      loginModal.close();
      renderHome();
    });
  }

  function wireSetup() {
    if (!setupModal || !setupForm || !setupLater || !firebaseConfigInput || !setupError) {
      return;
    }

    setupLater.addEventListener("click", () => setupModal.close());

    setupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      setupError.hidden = true;
      const raw = String(firebaseConfigInput.value || "").trim();
      if (!raw) return;
      try {
        const cfg = JSON.parse(raw);
        if (!cfg || typeof cfg !== "object") throw new Error("bad");
        if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId) throw new Error("bad");
        localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(cfg));
        setupModal.close();
        // إعادة تهيئة Firebase بعد الحفظ
        initFirebaseIfPossible();
        alert("تم حفظ الإعدادات. دلوقتي حفظ البيانات والاستفسارات شغال.");
      } catch {
        setupError.textContent =
          "صيغة غير صحيحة. الصق Firebase config كـ JSON كامل (يبدأ بـ { وينتهي بـ }).";
        setupError.hidden = false;
      }
    });
  }

  function boot() {
    initFirebaseIfPossible();
    applyTheme(localStorage.getItem(THEME_KEY) || "light");
    applyLogoStyle(localStorage.getItem(LOGO_STYLE_KEY) || "style1");
    applyLoginLanguage(localStorage.getItem(LOGIN_LANG_KEY) || "ar");
    setQuickContacts();
    wireEvents();
    renderHome();
    wireSetup();

    const profile = getProfile();
    if (!profile || sessionStorage.getItem(SESSION_KEY) !== "1") loginModal.showModal();

    maybeShowSetup();
  }

  boot();
})();

