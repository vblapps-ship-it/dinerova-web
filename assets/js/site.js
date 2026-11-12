/* DineroVa — JS compartido. Sin librerías.
   - Cabecera, aparición de secciones y animación del ticket del inicio.
   - Sonidos sintetizados con Web Audio (desactivados por defecto).
   - Calculadoras: todo se calcula en el navegador; no se envía ni se guarda nada. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2, minimumFractionDigits: 2, useGrouping: "always" });
  var eur0 = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" });
  var pct = new Intl.NumberFormat("es-ES", { style: "percent", maximumFractionDigits: 1 });
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function num(v) { var n = parseFloat(String(v).replace(/\./g, "").replace(",", ".")); return isFinite(n) ? n : 0; }

  /* ---------- Sonido ---------- */
  var Sound = (function () {
    var ctx = null, on = false;
    try { on = localStorage.getItem("dv-sound") === "1"; } catch (e) {}
    function ac() {
      if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    function tone(freq, t0, dur, gain, type) {
      var c = ac(); if (!c) return;
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, c.currentTime + t0);
      g.gain.exponentialRampToValueAtTime(gain, c.currentTime + t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
      o.connect(g).connect(c.destination);
      o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
    }
    function chatter(t0, n) {
      var c = ac(); if (!c) return;
      var len = Math.floor(c.sampleRate * 0.03), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      for (var k = 0; k < n; k++) {
        var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        s.buffer = buf; f.type = "bandpass"; f.frequency.value = 2600 + Math.random() * 900; f.Q.value = 1.2;
        g.gain.value = 0.09;
        s.connect(f).connect(g).connect(c.destination);
        s.start(c.currentTime + t0 + k * 0.045);
      }
    }
    return {
      get on() { return on; },
      set: function (v) { on = v; try { localStorage.setItem("dv-sound", v ? "1" : "0"); } catch (e) {} },
      print: function (n) { if (on) chatter(0, n || 8); },
      ding: function () { if (on) { tone(1318.5, 0, 0.5, 0.12); tone(1760, 0.09, 0.7, 0.1); } },
      tick: function () { if (on) tone(880, 0, 0.06, 0.05, "triangle"); }
    };
  })();

  function toast(msg) {
    var t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  var sb = $(".sound");
  if (sb) {
    sb.setAttribute("aria-pressed", Sound.on ? "true" : "false");
    sb.addEventListener("click", function () {
      Sound.set(!Sound.on);
      sb.setAttribute("aria-pressed", Sound.on ? "true" : "false");
      if (Sound.on) { Sound.ding(); toast("Sonido activado"); } else { toast("Sonido desactivado"); }
    });
  }

  /* ---------- Cabecera y apariciones ---------- */
  var top = $(".top");
  if (top) {
    var upd = function () { top.classList.toggle("is-scrolled", window.scrollY > 8); };
    upd(); window.addEventListener("scroll", upd, { passive: true });
  }

  var rises = $$(".rise");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    rises.forEach(function (el) { io.observe(el); });
  } else { rises.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Escena del inicio ---------- */
  var scene = $(".scene");
  if (scene) {
    $$(".r-line", scene).forEach(function (el, i) { el.style.setProperty("--i", i); });
    var play = function () {
      scene.classList.remove("play"); void scene.offsetWidth; scene.classList.add("play");
      if (!reduce) { Sound.print(14); setTimeout(Sound.ding, 3000); }
    };
    requestAnimationFrame(function () { scene.classList.add("play"); });
    var again = $(".replay");
    if (again) again.addEventListener("click", play);
  }

  $$("a[data-play]").forEach(function (a) { a.addEventListener("click", function () { Sound.tick(); }); });

  /* ---------- Calculadoras ---------- */
  function receiptRefresh(el) {
    if (!el) return;
    el.classList.remove("reprint"); void el.offsetWidth; el.classList.add("reprint");
  }
  function bindTool(form, compute) {
    var out = $(".out .receipt");
    var timer = null, first = true;
    function run() {
      compute(form);
      if (!first) { receiptRefresh(out); Sound.print(5); }
      first = false;
    }
    form.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(run, 260); });
    form.addEventListener("change", function () { clearTimeout(timer); timer = setTimeout(run, 60); });
    form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
    compute(form);
  }
  function set(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }
  function val(form, name) {
    var el = form.elements[name]; if (!el) return 0;
    if (el.length && !el.tagName) { for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value; return ""; }
    return el.value;
  }

  // Sueldo neto 2026 (estimación, escala general estatal + autonómica tipo)
  var TRAMOS = [[12450, 0.19], [20200, 0.24], [35200, 0.30], [60000, 0.37], [300000, 0.45], [Infinity, 0.47]];
  function escala(base) {
    var q = 0, prev = 0;
    for (var i = 0; i < TRAMOS.length && base > prev; i++) {
      var hasta = Math.min(base, TRAMOS[i][0]); q += (hasta - prev) * TRAMOS[i][1]; prev = TRAMOS[i][0];
    }
    return q;
  }
  function neto(bruto) {
    var ss = Math.min(bruto, 61214.40) * 0.065;
    var rn = Math.max(0, bruto - ss);
    var red = 0;
    if (rn <= 14852) red = 7302;
    else if (rn <= 17673.52) red = 7302 - 1.75 * (rn - 14852);
    else if (rn <= 19747.5) red = 2364.34 - 1.14 * (rn - 17673.52);
    var base = Math.max(0, rn - 2000 - red);
    var cuota = Math.max(0, escala(base) - escala(Math.min(5550, base)));
    var smi = bruto <= 17094 ? 590.89 : Math.max(0, 590.89 - 0.2 * (bruto - 17094));
    var irpf = Math.max(0, cuota - smi);
    return { ss: ss, irpf: irpf, neto: bruto - ss - irpf };
  }

  var tools = {
    sueldo: function (f) {
      var bruto = num(val(f, "bruto")), pagas = parseInt(val(f, "pagas"), 10) || 12;
      var r = neto(bruto);
      set("o-neto-mes", eur.format(r.neto / pagas));
      set("o-pagas", pagas === 14 ? "en 14 pagas (12 + 2 extra)" : "en 12 pagas al mes");
      set("o-bruto", eur.format(bruto));
      set("o-ss", "−" + eur.format(r.ss));
      set("o-irpf", "−" + eur.format(r.irpf));
      set("o-neto", eur.format(r.neto));
      set("o-tipo", bruto > 0 ? pct.format(r.irpf / bruto) : "0 %");
      var b = $("#o-bar");
      if (b && bruto > 0) {
        b.children[0].style.width = (r.neto / bruto * 100) + "%";
        b.children[1].style.width = (r.ss / bruto * 100) + "%";
        b.children[2].style.width = (r.irpf / bruto * 100) + "%";
      }
    },
    presupuesto: function (f) {
      var ing = num(val(f, "ingresos"));
      var reparto = (val(f, "reparto") || "50-30-20").split("-").map(Number);
      var n = ing * reparto[0] / 100, w = ing * reparto[1] / 100, s = ing * reparto[2] / 100;
      set("o-nec", eur.format(n)); set("o-des", eur.format(w)); set("o-aho", eur.format(s));
      set("o-nec-p", reparto[0] + " %"); set("o-des-p", reparto[1] + " %"); set("o-aho-p", reparto[2] + " %");
      set("o-anual", eur0.format(s * 12));
      set("o-total", eur.format(ing));
      var b = $("#o-bar");
      if (b) { b.children[0].style.width = reparto[0] + "%"; b.children[1].style.width = reparto[1] + "%"; b.children[2].style.width = reparto[2] + "%"; }
    },
    emergencia: function (f) {
      var gastos = num(val(f, "gastos")), meses = parseInt(val(f, "meses"), 10) || 6;
      var tengo = num(val(f, "tengo")), ahorro = num(val(f, "ahorro"));
      var obj = gastos * meses, falta = Math.max(0, obj - tengo);
      set("o-obj", eur0.format(obj)); set("o-meses", meses + " meses de gastos");
      set("o-tengo", eur.format(tengo)); set("o-falta", eur.format(falta));
      var t;
      if (falta === 0) t = "¡Ya lo tienes!";
      else if (ahorro <= 0) t = "Indica cuánto puedes ahorrar al mes";
      else {
        var m = Math.ceil(falta / ahorro), d = new Date(); d.setMonth(d.getMonth() + m);
        var fecha = d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
        t = m + (m === 1 ? " mes" : " meses") + " (" + fecha + ")";
      }
      set("o-plazo", t);
      var p = obj > 0 ? Math.min(1, tengo / obj) : 0;
      var b = $("#o-bar"); if (b) b.children[0].style.width = (p * 100) + "%";
      set("o-prog", pct.format(p) + " conseguido");
    },
    iva: function (f) {
      var imp = num(val(f, "importe")), tipo = parseFloat(val(f, "tipo")) / 100 || 0.21, modo = val(f, "modo");
      var base, cuota, total;
      if (modo === "quitar") { total = imp; base = imp / (1 + tipo); cuota = total - base; }
      else { base = imp; cuota = imp * tipo; total = base + cuota; }
      set("o-base", eur.format(base)); set("o-cuota", eur.format(cuota)); set("o-total", eur.format(total));
      set("o-tipo", (tipo * 100).toLocaleString("es-ES") + " %");
      set("o-head", modo === "quitar" ? "Precio sin IVA" : "Precio con IVA");
      set("o-big", eur.format(modo === "quitar" ? base : total));
    }
  };

  var tf = $("form[data-tool]");
  if (tf && tools[tf.dataset.tool]) bindTool(tf, tools[tf.dataset.tool]);
})();
