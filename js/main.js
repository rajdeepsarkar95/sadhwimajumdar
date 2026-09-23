/* Sadhwi Majumder · main site interactions (v4) */
(function(){
  "use strict";

  /* ---- custom cursor ---- */
  const dot = document.querySelector(".cursor");
  const ring = document.querySelector(".cursor-ring");
  if (dot && ring && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("mousemove", e => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    });
    (function loop(){
      rx += (x - rx) * .14; ry += (y - ry) * .14;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a,button,.row-link,.faq-q,input,select,textarea,.pay-tab,.buy-btn").forEach(el => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
  }

  /* ---- mobile nav: right slide drawer ---- */
  const burger = document.querySelector(".burger");
  const links  = document.querySelector(".nav-links");
  if (burger && links) {
    let scrollY = 0;
    const placeholder = document.createComment("nav-links-placeholder");

    let scrim = document.querySelector(".nav-scrim");
    if (!scrim) {
      scrim = document.createElement("div");
      scrim.className = "nav-scrim";
      scrim.setAttribute("aria-hidden", "true");
      document.body.appendChild(scrim);
    }

    function isMobileNav(){ return window.matchMedia("(max-width:920px)").matches; }

    function closeNav(){
      links.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      scrim.classList.remove("show");
      document.body.style.top = "";
      document.body.style.position = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      if (placeholder.parentNode) {
        placeholder.parentNode.insertBefore(links, placeholder);
        placeholder.remove();
      }
    }
    function openNav(){
      scrollY = window.scrollY || window.pageYOffset;
      if (isMobileNav() && links.parentElement !== document.body) {
        links.parentNode.insertBefore(placeholder, links);
        document.body.appendChild(links);
      }
      links.classList.add("open");
      burger.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
      document.body.style.position = "fixed";
      document.body.style.top = "-" + scrollY + "px";
      document.body.style.width = "100%";
      void scrim.offsetWidth;
      scrim.classList.add("show");
    }
    burger.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (links.classList.contains("open")) closeNav();
      else openNav();
    });
    scrim.addEventListener("click", closeNav);
    links.querySelectorAll("a").forEach(function(a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && links.classList.contains("open")) closeNav();
    });
    addEventListener("resize", function() {
      if (!isMobileNav() && links.classList.contains("open")) closeNav();
      if (!isMobileNav() && links.parentElement === document.body && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(links, placeholder);
        placeholder.remove();
        links.classList.remove("open");
        scrim.classList.remove("show");
      }
    });
  }

  /* ---- scroll reveal ---- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: .08, rootMargin: "0px 0px -4% 0px" });
  document.querySelectorAll(".rv").forEach(el => io.observe(el));

  /* ---- hero word animation (whole words only — no letter split on mobile) ---- */
  const isNarrow = matchMedia("(max-width:640px)").matches || matchMedia("(prefers-reduced-motion:reduce)").matches;
  if (!isNarrow) {
    document.querySelectorAll(".hero h1 .word").forEach(w => {
      const txt = w.textContent;
      w.textContent = "";
      [...txt].forEach((ch, i) => {
        const s = document.createElement("span");
        s.textContent = ch === " " ? "\u00A0" : ch;
        s.style.display = "inline-block";
        s.style.transform = "translateY(110%)";
        s.style.animation = `rise 1s cubic-bezier(.22,1,.36,1) ${i * 0.026}s forwards`;
        w.appendChild(s);
      });
    });
  } else {
    // simple fade-up of whole rows on mobile
    document.querySelectorAll(".hero h1 .row").forEach((row, i) => {
      row.style.opacity = "0";
      row.style.transform = "translateY(24px)";
      row.style.transition = `opacity .7s ease ${i * 0.1}s, transform .7s cubic-bezier(.22,1,.36,1) ${i * 0.1}s`;
      requestAnimationFrame(() => {
        row.style.opacity = "1";
        row.style.transform = "none";
      });
    });
  }

  // CSS keyframe used by letter animation
  if (!document.getElementById("rise-kf")) {
    const style = document.createElement("style");
    style.id = "rise-kf";
    style.textContent = "@keyframes rise{to{transform:translateY(0)}}";
    document.head.appendChild(style);
  }

  /* ---- marquee seamless loop ---- */
  document.querySelectorAll(".marquee-track").forEach(t => {
    t.innerHTML += t.innerHTML;
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach(item => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
      q.setAttribute("aria-expanded", open);
    });
  });

  /* ---- booking form (front-end) ---- */
  const form = document.querySelector("#booking-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach(inp => {
        const field = inp.closest(".field");
        const bad = !inp.value.trim() || (inp.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value));
        if (field) field.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) return;
      form.style.display = "none";
      const okBox = form.parentElement.querySelector(".form-ok");
      if (okBox) {
        okBox.style.display = "block";
        okBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    form.querySelectorAll("[required]").forEach(inp => {
      inp.addEventListener("input", () => {
        const f = inp.closest(".field");
        if (f) f.classList.remove("invalid");
      });
    });
  }

  /* ---- STREAM: pay-per-view checkout ---- */
  const modal = document.querySelector("#checkout-modal");
  if (modal) {
    const UNLOCK_KEY = "sm_unlocked_videos";
    const getUnlocked = () => { try { return JSON.parse(localStorage.getItem(UNLOCK_KEY)) || []; } catch (e) { return []; } };
    const setUnlocked = (arr) => localStorage.setItem(UNLOCK_KEY, JSON.stringify(arr));

    const titleEl  = modal.querySelector("[data-co-title]");
    const priceEl  = modal.querySelector("[data-co-price]");
    const cardPane = modal.querySelector("#pane-card");
    const rzPane   = modal.querySelector("#pane-rzp");
    const formPane = modal.querySelector("#co-form-panes");
    const procPane = modal.querySelector("#co-processing");
    const okPane   = modal.querySelector("#co-success");
    const tabs     = modal.querySelectorAll(".pay-tab");
    let currentId = null, currentPrice = null;

    const fmt = (p, cur) => cur === "inr" ? "\u20B9" + p.toLocaleString("en-IN") : "$" + p;

    function openModal(card) {
      currentId    = card.dataset.id;
      currentPrice = { inr: +card.dataset.inr, usd: +card.dataset.usd };
      if (titleEl) titleEl.textContent = card.dataset.title;
      if (priceEl) priceEl.textContent = fmt(currentPrice.inr, "inr") + "  \u00B7  " + fmt(currentPrice.usd, "usd") + "  \u00B7  one-time rental";
      if (formPane) formPane.style.display = "block";
      if (procPane) procPane.style.display = "none";
      if (okPane) okPane.style.display = "none";
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-buy]").forEach(btn => {
      const card = btn.closest(".buy-card");
      if (!card) return;
      if (getUnlocked().includes(card.dataset.id)) {
        btn.textContent = "Watch now";
        btn.classList.add("owned");
        const veil = card.querySelector(".lockveil");
        if (veil) veil.style.display = "none";
        const badge = card.querySelector(".badge");
        if (badge) badge.textContent = "Owned";
      }
      btn.addEventListener("click", () => {
        if (btn.classList.contains("owned")) {
          const frame = card.querySelector(".buy-player");
          if (frame) {
            frame.style.display = "block";
            const iframe = frame.querySelector("iframe");
            if (iframe) iframe.src = card.dataset.embed;
            frame.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }
        openModal(card);
      });
    });

    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      const isRzp = t.dataset.tab === "rzp";
      if (cardPane) cardPane.classList.toggle("active", !isRzp);
      if (rzPane) rzPane.classList.toggle("active", isRzp);
    }));

    const closeBtn = modal.querySelector(".modal-x");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

    const cc = modal.querySelector("#cc-num");
    if (cc) cc.addEventListener("input", () => {
      cc.value = cc.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    });
    const exp = modal.querySelector("#cc-exp");
    if (exp) exp.addEventListener("input", () => {
      let v = exp.value.replace(/\D/g, "").slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
      exp.value = v;
    });

    function validatePane() {
      let ok = true;
      const pane = cardPane && cardPane.classList.contains("active") ? cardPane : rzPane;
      if (!pane) return true;
      pane.querySelectorAll("[required]").forEach(inp => {
        const f = inp.closest(".f-field");
        const bad = !inp.value.trim() ||
          (inp.id === "cc-num" && inp.value.replace(/\s/g, "").length < 15) ||
          (inp.id === "cc-exp" && !/^\d{2}\/\d{2}$/.test(inp.value)) ||
          (inp.id === "cc-cvc" && inp.value.length < 3) ||
          (inp.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value));
        if (f) f.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      return ok;
    }
    modal.querySelectorAll("#checkout-modal [required]").forEach(inp => {
      inp.addEventListener("input", () => {
        const f = inp.closest(".f-field");
        if (f) f.classList.remove("invalid");
      });
    });

    const payBtn = modal.querySelector("#co-pay");
    if (payBtn) payBtn.addEventListener("click", () => {
      if (!validatePane()) return;
      if (formPane) formPane.style.display = "none";
      if (procPane) procPane.style.display = "block";
      setTimeout(() => {
        if (procPane) procPane.style.display = "none";
        if (okPane) okPane.style.display = "block";
        const arr = getUnlocked();
        if (!arr.includes(currentId)) arr.push(currentId);
        setUnlocked(arr);
        const card = document.querySelector(`.buy-card[data-id="${currentId}"]`);
        if (card) {
          const btn = card.querySelector("[data-buy]");
          if (btn) { btn.textContent = "Watch now"; btn.classList.add("owned"); }
          const veil = card.querySelector(".lockveil");
          if (veil) veil.style.display = "none";
          const badge = card.querySelector(".badge");
          if (badge) badge.textContent = "Owned";
        }
      }, 1800);
    });

    const doneBtn = modal.querySelector("#co-done");
    if (doneBtn) doneBtn.addEventListener("click", () => {
      closeModal();
      const card = document.querySelector(`.buy-card[data-id="${currentId}"]`);
      if (card) {
        const frame = card.querySelector(".buy-player");
        if (frame) {
          frame.style.display = "block";
          const iframe = frame.querySelector("iframe");
          if (iframe) iframe.src = card.dataset.embed;
          frame.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  }
})();

/* ---- membership plan buttons (demo state) ---- */
(function(){
  document.querySelectorAll("[data-plan]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      if (btn.dataset.busy) return;
      btn.dataset.busy = "1";
      const orig = btn.textContent;
      btn.textContent = "Connect Razorpay / Stripe to activate";
      btn.style.pointerEvents = "none";
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.pointerEvents = "";
        delete btn.dataset.busy;
      }, 2400);
    });
  });
})();
