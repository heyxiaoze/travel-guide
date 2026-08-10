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
  function renderBlock(b, dayId) {
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
      case 'points':
        return renderPoints(b);
      case 'checklist':
        return renderChecklist(b);
      case 'table':
        var head = '<tr>' + b.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>';
        var rows = b.rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
        }).join('');
        return '<div class="table-wrap"><table class="tbl"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
      case 'day':
        return renderDay(b, dayId);
      case 'food':
        return renderFood(b);
      case 'budget':
        return renderBudget(b);
      case 'summary':
        return renderSummary(b);
      case 'gallery':
        return renderGallery(b);
      default:
        return '';
    }
  }

  /* ---------- 要点卡片（替代长 callout 的① ② ③串段） ---------- */
  function renderPoints(p) {
    var nums = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];
    return '<div class="points-list">' + (p.items || []).map(function (it, i) {
      return '<div class="point-item">' +
        '<span class="point-num">' + (nums[i] || (i + 1)) + '</span>' +
        '<div class="point-content">' +
          '<div class="point-k">' + esc(it.k) + '</div>' +
          '<div class="point-v">' + it.v + '</div>' +
        '</div></div>';
    }).join('') + '</div>';
  }

  /* ---------- Checkbox 清单 ---------- */
  function renderChecklist(c) {
    return '<div class="checklist-list">' + (c.groups || []).map(function (g) {
      var titleHtml = g.title ? '<div class="checklist-group-title">' + esc(g.title) + '</div>' : '';
      var itemsHtml = (g.items || []).map(function (it) {
        return '<label class="checklist-item">' +
          '<input type="checkbox" class="checklist-cb" />' +
          '<span class="checklist-text">' + esc(it) + '</span>' +
        '</label>';
      }).join('');
      return '<div class="checklist-group">' + titleHtml + '<div class="checklist-items">' + itemsHtml + '</div></div>';
    }).join('') + '</div>';
  }

  // 把地点/活动的性质标签映射成颜色类（关键词匹配，避免数据里写死 class）
  function tagClass(t) {
    if (/免费|不收费/.test(t)) return 'free';
    if (/预约|需约|必抢|抢票/.test(t)) return 'book';
    if (/拍照|出片|摄影/.test(t)) return 'photo';
    if (/换电|充电|补能/.test(t)) return 'charge';
    if (/洗澡|温泉|淋浴/.test(t)) return 'bath';
    if (/可选|备选/.test(t)) return 'opt';
    if (/补给|采购|补给/.test(t)) return 'supply';
    return 'neutral';
  }
  function renderTags(it) {
    if (!it.tags || !it.tags.length) return '';
    return '<div class="tl-tags">' + it.tags.map(function (t) {
      return '<span class="tl-tag tag-' + tagClass(t) + '">' + esc(t) + '</span>';
    }).join('') + '</div>';
  }

  function renderDay(d, id) {
    var items = (d.items || []).map(function (it) {
      var meta = '<div class="tl-meta"><div class="tl-time">' + esc(it.time || '') + '</div>' + renderTags(it) + '</div>';
      if (it.place) {
        return '<li class="tl-item">' + meta +
          '<div class="tl-text">' + window.P(it.place.name, it.place.copy, it.place.sub) + (it.note ? '<div class="tl-note">' + it.note + '</div>' : '') + '</div></li>';
      }
      return '<li class="tl-item">' + meta + '<div class="tl-text">' + it.s + '</div></li>';
    }).join('');

    var foot = '';
    if (d.sleep) foot += '<div class="day-foot"><div class="label">过夜 / 休息</div><div class="place-row">' + window.P(d.sleep.name, d.sleep.copy, d.sleep.sub) + '</div></div>';
    if (d.eat) foot += '<div class="day-foot"><div class="label">吃</div><div class="place-row">' + window.Plist(d.eat) + '</div></div>';
    if (d.note) foot += '<div class="day-foot"><div class="callout info" style="margin:8px 0 0">' + d.note + '</div></div>';

    return '' +
      '<div class="day"' + (id ? ' id="' + esc(id) + '"' : '') + '>' +
        '<div class="day-head">' +
          '<div class="day-no">' + esc(d.no) + '</div>' +
          '<div><div class="day-title">' + esc(d.title) + '</div>' +
          (d.date ? '<div class="day-date">' + esc(d.date) + '</div>' : '') + '</div>' +
          (d.km ? '<div class="day-km"><i class="ph ph-car"></i> ' + esc(d.km) + '</div>' : '') +
        '</div>' +
        '<div class="day-body"><ul class="timeline">' + items + '</ul></div>' +
        foot +
      '</div>';
  }

  function renderFood(f) {
    var cards = (f.items || []).map(function (i) {
      return '<div class="food-item">' +
        '<div class="fname"><i class="ph ph-fork-knife"></i>' + esc(i.name) + '</div>' +
        (i.addr ? '<div class="fmeta"><i class="ph ph-map-pin"></i> ' + esc(i.addr) + '</div>' : '') +
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

  function renderSummary(b) {
    var rows = (b.rows || []).map(function (r) {
      return '<div class="summary-item"><span class="sl">' + esc(r.k) + '</span><span class="sv">' + r.v + '</span></div>';
    }).join('');
    return '<div class="summary-panel"><div class="summary-grid">' + rows + '</div></div>';
  }

  function renderGallery(b) {
    var items = (b.items || []).map(function (it) {
      var label = esc(it.label || it.title || '');
      var grad = it.gradient || 'linear-gradient(135deg,#b8956b,#d4b88a)';
      if (it.src) {
        return '<div class="gallery-item"><img src="' + esc(it.src) + '" alt="' + label + '" loading="lazy" /></div>';
      }
      return '<div class="gallery-item"><div class="placeholder" style="background:' + grad + '">' + label + '</div></div>';
    }).join('');
    var cap = b.caption ? '<div class="gallery-caption">' + b.caption + '</div>' : '';
    return '<div class="gallery">' + cap + '<div class="gallery-grid">' + items + '</div></div>';
  }

  /* ---------- 首页（Dashboard 风格） ---------- */
  function countPlaces(guide) {
    var n = 0;
    (guide.sections || []).forEach(function (s) {
      (s.blocks || []).forEach(function (b) {
        if (b.t === 'place') n += 1;
        if (b.t === 'places') n += (b.items || []).length;
        if (b.t === 'day') {
          (b.items || []).forEach(function (it) { if (it.place) n += 1; });
          if (b.sleep) n += 1;
          if (b.eat) n += (b.eat || []).length;
        }
      });
    });
    return n;
  }
  function extractDate(subtitle) {
    var m = (subtitle || '').match(/(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}[\/\-]\d{1,2}|\d{1,2}月\d{1,2}日?)/);
    return m ? m[1] : '';
  }

  function renderHome() {
    var guides = window.GUIDE_ORDER.map(function (id) { return window.TRAVEL_GUIDES[id]; });
    var totalDays = 0, totalPlaces = 0;
    guides.forEach(function (g) {
      totalDays += (g.sections || []).reduce(function (acc, s) {
        return acc + (s.blocks || []).filter(function (b) { return b.t === 'day'; }).length;
      }, 0);
      totalPlaces += countPlaces(g);
    });
    var latest = guides[0];
    var latestDate = latest ? (extractDate(latest.subtitle) || '近期') : '-';

    var cards = guides.map(function (g, i) {
      var days = (g.sections || []).reduce(function (acc, s) {
        return acc + (s.blocks || []).filter(function (b) { return b.t === 'day'; }).length;
      }, 0);
      var places = countPlaces(g);
      return '<div class="guide-card reveal" data-id="' + esc(g.id) + '">' +
        '<div class="guide-cover cover-' + (i % 2) + '">' + (g.emoji || '<i class="ph ph-fill ph-compass"></i>') + '</div>' +
        '<div class="guide-body">' +
          '<div class="guide-meta-top">' + days + ' 天<span class="dot"></span>' + places + ' 地点</div>' +
          '<h3>' + esc(g.title) + '</h3>' +
          '<p class="guide-sub">' + esc(g.subtitle || '') + '</p>' +
          '<div class="chips">' +
            (g.meta || []).slice(0, 3).map(function (m) { return '<span class="chip">' + esc(m) + '</span>'; }).join('') +
          '</div>' +
          '<span class="guide-go">查看攻略 <span class="arrow">→</span></span>' +
        '</div></div>';
    }).join('');

    return '' +
      '<header class="hero"><div class="wrap">' +
        '<div class="hero-inner hero-anim d1">' +
          '<span class="eyebrow">旅行日志 · Travel Journal</span>' +
          '<h1>把每次出发，<br>都变成可回看的记录</h1>' +
          '<p class="hero-lead">路线、营地、门票、补能、美食与备忘——地点框框点一下即可复制，直接粘进高德 / 百度导航。</p>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-primary" href="#guides">浏览全部攻略</a>' +
            (guides.length ? '<a class="btn btn-ghost" href="#/guide/' + esc(guides[0].id) + '">最新一篇 →</a>' : '') +
          '</div>' +
        '</div>' +
        '<div class="meta-strip hero-anim d2">' +
          '<div class="meta-item"><span class="meta-k">攻略</span><span class="meta-v">' + guides.length + '</span></div>' +
          '<div class="meta-item"><span class="meta-k">累计天数</span><span class="meta-v">' + totalDays + '</span></div>' +
          '<div class="meta-item"><span class="meta-k">地点</span><span class="meta-v">' + totalPlaces + '</span></div>' +
          '<div class="meta-item"><span class="meta-k">最近出发</span><span class="meta-v">' + esc(latestDate) + '</span></div>' +
        '</div>' +
      '</div></header>' +
      '<div class="wrap"><div class="section-head"><h2>全部攻略</h2><span class="count">' + guides.length + ' 篇</span></div>' +
      (guides.length ? '<div class="guide-grid" id="guides">' + cards + '</div>' : '<div class="empty-note">还没有攻略，把数据文件放进 <code>data/</code> 并在 <code>index.html</code> 引入即可。</div>') +
      '</div>';
  }

  /* ---------- 指南详情 ---------- */
  function renderGuide(id) {
    var g = window.TRAVEL_GUIDES[id];
    if (!g) return '<div class="wrap"><p>未找到该攻略。</p><a href="#/">← 返回首页</a></div>';

    // 收集所有 day 块（跨 section），分配全局唯一序号，避免 去程D1 与 环线day1 重复
    var days = [];
    (g.sections || []).forEach(function (s) {
      (s.blocks || []).forEach(function (b) {
        if (b.t === 'day') days.push({ no: b.no, title: b.title });
      });
    });
    var subs = days.map(function (d, i) {
      return '<a href="#day-' + i + '" data-day="' + i + '" title="' + esc(d.title || '') + '">' + esc(d.no) + '</a>';
    }).join('');

    var dayIdx = 0;
    var sections = (g.sections || []).map(function (s, i) {
      var blocks = (s.blocks || []).map(function (b) {
        return renderBlock(b, b.t === 'day' ? 'day-' + dayIdx++ : null);
      }).join('');
      return '<section class="section reveal" id="sec-' + i + '">' +
        '<h2><span class="ic">' + (s.icon || '<i class="ph ph-circle"></i>') + '</span>' + esc(s.title) + '</h2>' +
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
      return '<div class="fact"><span class="fi">' + (f.i || '<i class="ph ph-circle"></i>') + '</span>' +
        '<span class="fk">' + esc(f.k) + '</span><span class="fv">' + esc(f.v) + '</span></div>';
    }).join('') + '</div>' : '';

    var badge = g.badge ? '<span class="hero-badge">' + g.badge + '</span>' : '';

    return '' +
      '<div class="guide-hero"><div class="wrap">' +
        crumbHtml +
        badge +
        '<div class="cover-row">' +
          '<div class="emoji">' + (g.emoji || '<i class="ph ph-fill ph-compass"></i>') + '</div>' +
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
            var act = document.querySelector('.subnav a[data-day="' + e.target.id.split('-')[1] + '"]');
            if (act) act.classList.add('active');
          }
        });
      }, { rootMargin: '-70px 0px -65% 0px' });
      document.querySelectorAll('.day').forEach(function (s) { obs.observe(s); });
    }
  }

  // 卡片点击
  document.addEventListener('click', function (e) {
    var card = e.target.closest('.guide-card');
    if (card) { location.hash = '#/guide/' + card.getAttribute('data-id'); }
  });

  // 子导航点击：平滑滚动到对应 day，避免 href=#day-N 触发 router 跳回首页
  document.addEventListener('click', function (e) {
    var link = e.target.closest('.subnav a');
    if (!link) return;
    e.preventDefault();
    var target = document.getElementById(link.getAttribute('href').replace('#', ''));
    if (!target) return;
    var y = target.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' });
    document.querySelectorAll('.subnav a').forEach(function (l) { l.classList.remove('active'); });
    link.classList.add('active');
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
