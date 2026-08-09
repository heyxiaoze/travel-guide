/* app.js — 渲染首页与指南详情，处理地点复制。 */
(function () {
  var root = document.getElementById('app');
  var esc = window.__esc;

  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  /* ---------- 区块渲染 ---------- */
  function renderBlock(b) {
    switch (b.t) {
      case 'text':
        if (Array.isArray(b.s)) return '<div class="text-block">' + b.s.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>';
        return '<div class="text-block"><p>' + b.s + '</p></div>';
      case 'callout':
        return '<div class="callout ' + (b.tone || 'info') + '"><span class="ct">' + (b.title || '') + '</span>' + b.s + '</div>';
      case 'place':
        return '<div class="place-row">' + window.P(b.name, b.copy, b.sub) + '</div>';
      case 'places':
        return '<div class="place-row">' + window.Plist(b.items) + '</div>';
      case 'table':
        var head = '<tr>' + b.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>';
        var rows = b.rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
        }).join('');
        return '<div class="table-wrap"><table class="tbl"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
      case 'day':
        return renderDay(b);
      case 'food':
        return renderFood(b);
      case 'budget':
        return renderBudget(b);
      default:
        return '';
    }
  }

  function renderDay(d) {
    var items = (d.items || []).map(function (it) {
      if (it.place) {
        return '<li class="tl-item"><div class="tl-time">' + esc(it.time || '') + '</div>' +
          '<div class="tl-text">' + window.P(it.place.name, it.place.copy, it.place.sub) + (it.note ? ' ' + it.note : '') + '</div></li>';
      }
      return '<li class="tl-item"><div class="tl-time">' + esc(it.time || '') + '</div><div class="tl-text">' + it.s + '</div></li>';
    }).join('');

    var foot = '';
    if (d.sleep) foot += '<div class="day-foot"><div class="label">过夜 / 休息</div><div class="place-row">' + window.P(d.sleep.name, d.sleep.copy, d.sleep.sub) + '</div></div>';
    if (d.eat) foot += '<div class="day-foot"><div class="label">吃</div><div class="place-row">' + window.Plist(d.eat) + '</div></div>';
    if (d.note) foot += '<div class="day-foot"><div class="callout info" style="margin:8px 0 0">' + d.note + '</div></div>';

    return '' +
      '<div class="day">' +
        '<div class="day-head">' +
          '<div class="day-no">' + esc(d.no) + '</div>' +
          '<div><div class="day-title">' + esc(d.title) + '</div>' +
          (d.date ? '<div class="day-date">' + esc(d.date) + '</div>' : '') + '</div>' +
          (d.km ? '<div class="day-km">🚗 ' + esc(d.km) + '</div>' : '') +
        '</div>' +
        '<div class="day-body"><ul class="timeline">' + items + '</ul></div>' +
        foot +
      '</div>';
  }

  function renderFood(f) {
    var cards = (f.items || []).map(function (i) {
      return '<div class="food-item">' +
        '<div class="fname">' + esc(i.name) + '</div>' +
        (i.addr ? '<div class="fmeta">📍 ' + esc(i.addr) + '</div>' : '') +
        (i.price ? '<div class="fprice">' + esc(i.price) + '</div>' : '') +
        (i.src ? '<div class="fsrc">来源：' + esc(i.src) + '</div>' : '') +
        (i.note ? '<div class="fnote">' + esc(i.note) + '</div>' : '') +
        '</div>';
    }).join('');
    return '<div class="food-city"><h3>' + esc(f.city) + (f.flag ? ' <span class="chip">' + esc(f.flag) + '</span>' : '') + '</h3>' +
      '<div class="food-list">' + cards + '</div></div>';
  }

  function renderBudget(b) {
    var cells = (b.cells || []).map(function (c) {
      return '<div class="budget-cell"><div class="bk">' + esc(c.k) + '</div><div class="bv">' + esc(c.v) + '</div>' + (c.n ? '<div class="bn">' + esc(c.n) + '</div>' : '') + '</div>';
    }).join('');
    return '<div class="budget-grid">' + cells + '</div>';
  }

  /* ---------- 首页 ---------- */
  function renderHome() {
    var guides = window.GUIDE_ORDER.map(function (id) { return window.TRAVEL_GUIDES[id]; });
    var cards = guides.map(function (g) {
      return '<div class="guide-card reveal" data-id="' + esc(g.id) + '">' +
        '<div class="guide-cover">' + esc(g.emoji || '🧭') + '</div>' +
        '<div class="body"><h3>' + esc(g.title) + '</h3>' +
        '<p class="sub">' + esc(g.subtitle || '') + '</p>' +
        '<div class="chips">' + (g.meta || []).slice(0, 4).map(function (m) { return '<span class="chip">' + esc(m) + '</span>'; }).join('') + '</div>' +
        '<span class="go">查看攻略 <span class="arrow">→</span></span>' +
        '</div></div>';
    }).join('');

    return '' +
      '<header class="hero"><div class="wrap">' +
        '<span class="eyebrow hero-anim d1">🧭 旅行手账 · Travel Guides</span>' +
        '<h1 class="hero-anim d2">自驾床车 × 充换电 × 错峰避堵，<br>一站收藏你的旅行攻略</h1>' +
        '<p class="hero-anim d3">从大连到青甘大环线：路线、过路费、换电点、景点预约、单人美食与免费营地，全部按日期排好。地点小框框点一下即可复制，直接粘进高德 / 百度导航。</p>' +
        '<div class="cta-row hero-anim d4">' +
          '<a class="cta" href="#guides">浏览全部攻略</a>' +
          (guides.length ? '<a class="cta ghost" href="#/guide/' + esc(guides[0].id) + '">直接看青甘大环线 →</a>' : '') +
        '</div>' +
      '</div></header>' +
      '<div class="wrap"><div class="section-title"><h2>全部攻略</h2><span class="line"></span></div>' +
      (guides.length ? '<div class="guide-grid" id="guides">' + cards + '</div>' : '<div class="empty-note">还没有攻略，把数据文件放进 <code>data/</code> 并在 <code>index.html</code> 引入即可。</div>') +
      '</div>';
  }

  /* ---------- 指南详情 ---------- */
  function renderGuide(id) {
    var g = window.TRAVEL_GUIDES[id];
    if (!g) return '<div class="wrap"><p>未找到该攻略。</p><a href="#/">← 返回首页</a></div>';

    var subs = (g.sections || []).map(function (s, i) {
      return '<a href="#sec-' + i + '" data-sec="' + i + '">' + esc(s.title) + '</a>';
    }).join('');

    var sections = (g.sections || []).map(function (s, i) {
      var blocks = (s.blocks || []).map(renderBlock).join('');
      return '<section class="section reveal" id="sec-' + i + '">' +
        '<h2><span class="ic">' + (s.icon || '•') + '</span>' + esc(s.title) + '</h2>' +
        (s.lead ? '<p class="lead">' + s.lead + '</p>' : '') +
        blocks + '</section>';
    }).join('');

    // 面包屑（KKday 路径风格）：首页 › ... › 当前
    var crumbs = (g.breadcrumb && g.breadcrumb.length) ? g.breadcrumb : [];
    var crumbHtml = '<nav class="crumbs"><a href="#/">首页</a>' +
      crumbs.map(function (c, i) {
        return '<span class="sep">›</span>' + (i === crumbs.length - 1
          ? '<span class="cur">' + esc(c) + '</span>'
          : '<span>' + esc(c) + '</span>');
      }).join('') + '</nav>';

    // 事实条（KKday 行程时长 / 多语言 / 免费取消 风格）
    var factHtml = (g.facts && g.facts.length) ? '<div class="factbar">' + g.facts.map(function (f) {
      return '<div class="fact"><span class="fi">' + esc(f.i || '•') + '</span>' +
        '<span class="fk">' + esc(f.k) + '</span><span class="fv">' + esc(f.v) + '</span></div>';
    }).join('') + '</div>' : '';

    var badge = g.badge ? '<span class="hero-badge">' + esc(g.badge) + '</span>' : '';

    return '' +
      '<div class="guide-hero"><div class="wrap">' +
        crumbHtml +
        badge +
        '<div class="cover-row">' +
          '<div class="emoji">' + esc(g.emoji || '🧭') + '</div>' +
          '<div><h1>' + esc(g.title) + '</h1>' + (g.subtitle ? '<p class="sub">' + esc(g.subtitle) + '</p>' : '') + '</div>' +
        '</div>' +
        factHtml +
      '</div></div>' +
      '<nav class="subnav"><div class="wrap">' + subs + '</div></nav>' +
      '<div class="wrap">' + sections + '</div>';
  }

  /* ---------- 流畅动效：滚动渐显 + 错落入场 ---------- */
  function setupReveal() {
    // 错落入场：首页卡片、详情日卡片按组内序号设置延迟
    document.querySelectorAll('.guide-grid').forEach(function (grid) {
      grid.querySelectorAll('.guide-card').forEach(function (c, i) { if (i < 10) c.style.animationDelay = (i * 60) + 'ms'; });
    });
    document.querySelectorAll('.section').forEach(function (sec) {
      sec.querySelectorAll('.day').forEach(function (d, i) { if (i < 12) d.style.animationDelay = (i * 70) + 'ms'; });
    });

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('is-visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    document.querySelectorAll('.reveal').forEach(function (e) { obs.observe(e); });
  }

  function setupHeaderShadow() {
    var h = document.querySelector('.site-header');
    if (!h) return;
    var onScroll = function () { h.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 路由 ---------- */
  function router() {
    var h = location.hash || '';
    var m = h.match(/^#\/guide\/(.+)$/);
    if (m && window.TRAVEL_GUIDES[m[1]]) {
      root.innerHTML = renderGuide(m[1]);
      window.scrollTo(0, 0);
    } else {
      root.innerHTML = renderHome();
      window.scrollTo(0, 0);
    }
    // 子导航高亮 + 入场动效
    setupReveal();
    var links = document.querySelectorAll('.subnav a');
    if (links.length) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            links.forEach(function (l) { l.classList.remove('active'); });
            var act = document.querySelector('.subnav a[data-sec="' + e.target.id.split('-')[1] + '"]');
            if (act) act.classList.add('active');
          }
        });
      }, { rootMargin: '-70px 0px -70% 0px' });
      document.querySelectorAll('.section').forEach(function (s) { obs.observe(s); });
    }
  }

  // 卡片点击
  document.addEventListener('click', function (e) {
    var card = e.target.closest('.guide-card');
    if (card) { location.hash = '#/guide/' + card.getAttribute('data-id'); }
  });

  // 地点复制
  var toast = document.getElementById('toast');
  var toastTimer;
  document.addEventListener('click', function (e) {
    var p = e.target.closest('.place');
    if (!p) return;
    var text = p.getAttribute('data-copy') || p.textContent;
    var done = function () {
      p.classList.add('copied');
      toast.textContent = '已复制：' + text;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('show'); p.classList.remove('copied'); }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  });
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  window.addEventListener('hashchange', router);
  setupHeaderShadow();
  router();
})();
