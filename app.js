/* eslint-disable no-alert */
(() => {
  const OWNER = {
    waPhoneRaw: "01201016897",
    waPhoneIntl: "201201016897", // wa.me format (country code + number)
    email: "omarmohamed01201016897@gmail.com",
  };

  const STORAGE_KEY = "tech_services_user_v1";

  const el = (id) => document.getElementById(id);

  const loginModal = el("loginModal");
  const confirmModal = el("confirmModal");

  const loginForm = el("loginForm");
  const loginError = el("loginError");

  const servicesGrid = el("servicesGrid");
  const panel = el("panel");
  const panelTitle = el("panelTitle");
  const panelSubtitle = el("panelSubtitle");
  const panelBody = el("panelBody");
  const backBtn = el("backBtn");

  const quickWhatsApp = el("quickWhatsApp");
  const quickEmail = el("quickEmail");
  const logoutBtn = el("logoutBtn");

  const footerWhatsApp = el("footerWhatsApp");
  const footerEmail = el("footerEmail");

  const confirmText = el("confirmText");
  const confirmWhatsApp = el("confirmWhatsApp");
  const confirmEmail = el("confirmEmail");
  const confirmClose = el("confirmClose");

  let navStack = [];
  let lastPayload = null;

  function normalizeDigits(s) {
    return String(s || "").replace(/[^\d]/g, "");
  }

  function isValidEgyptMobile11(phoneDigits) {
    return /^01\d{9}$/.test(phoneDigits);
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
    const profile = getProfile();
    if (profile) return profile;
    loginModal.showModal();
    return null;
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
      `الإيميل: ${payload.email}`,
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
    { title: "موقع جرد مخازن", desc: "إدارة مخزون + تقارير + صلاحيات مستخدمين." },
    { title: "موقع تنظيم مطاعم", desc: "قائمة طعام + طلبات + إدارة طاولات." },
    { title: "موقع إعلانات", desc: "نشر إعلانات + بحث وتصنيفات + رسائل." },
    { title: "موقع عيادة/حجز مواعيد", desc: "حجز مواعيد + تذكير + ملفات مرضى." },
    { title: "موقع متجر إلكتروني", desc: "منتجات + سلة + دفع/شحن." },
    { title: "موقع كورسات", desc: "دروس + اشتراكات + اختبارات." },
    { title: "موقع عقارات", desc: "عروض + خرائط + تواصل سريع." },
    { title: "موقع شركة خدمات", desc: "تعريف بالخدمات + نماذج طلب + معرض أعمال." },
    { title: "موقع مدرسة/تعليم", desc: "محتوى + نتائج + تواصل مع أولياء الأمور." },
    { title: "موقع صيانة وبلاغات", desc: "تسجيل بلاغ + متابعة حالة + تقييم خدمة." },
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
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
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
            const img = svgDataUri(idea.title);
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
  }) {
    const t = title || (subsection ? `${section} — ${subsection}` : section);
    const st = subtitle || "اكتب الاستفسار ثم اضغط تم.";

    showPanel({
      title: t,
      subtitle: st,
      bodyHtml: `
        <div class="card">
          <form class="form" id="reqForm">
            <label class="field">
              <span class="field__label">اكتب استفسارك / بياناتك</span>
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
  }

  function wireEvents() {
    backBtn.addEventListener("click", popNav);

    confirmClose.addEventListener("click", () => confirmModal.close());

    logoutBtn.addEventListener("click", () => {
      clearProfile();
      navStack = [];
      panel.hidden = true;
      loginModal.showModal();
    });

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      loginError.hidden = true;

      const fullName = String(el("fullName").value || "").trim();
      const phoneDigits = normalizeDigits(el("phone").value);
      const email = String(el("email").value || "").trim();
      const password = String(el("password").value || "");

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

      if (!email.includes("@") || !email.includes(".")) {
        loginError.textContent = "اكتب بريد إلكتروني صحيح.";
        loginError.hidden = false;
        return;
      }

      if (password.length < 4) {
        loginError.textContent = "كلمة المرور قصيرة جدًا (4 أحرف/أرقام على الأقل).";
        loginError.hidden = false;
        return;
      }

      setProfile({
        fullName,
        phone: phoneDigits,
        email,
        password: password,
        createdAt: new Date().toISOString(),
      });
      loginModal.close();
      renderHome();
    });
  }

  function boot() {
    setQuickContacts();
    wireEvents();
    renderHome();

    const profile = getProfile();
    if (!profile) loginModal.showModal();
  }

  boot();
})();

