/* helpers.js — 在加载数据文件之前引入。
   提供 P() 生成「地点小框框 + 复制图标」，以及文本转义。 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  window.__esc = esc;

  // 生成一个地点小框框：点击即可复制 copy（默认复制 name）
  // P(name, copy, sub)
  window.P = function (name, copy, sub) {
    copy = copy == null ? name : copy;
    return (
      '<span class="place" data-copy="' + esc(copy) + '" title="点击复制地点">' +
        '<i class="ph ph-map-pin ic-pin" aria-hidden="true"></i>' +
        '<span class="place-body"><span class="place-name">' + esc(name) + '</span>' +
        (sub ? '<span class="place-sub">' + esc(sub) + '</span>' : '') +
        '</span>' +
        '<i class="ph ph-copy ic-copy" aria-hidden="true"></i>' +
      '</span>'
    );
  };

  // 多地点：P.list([{name, copy, sub}, ...]) 返回一组框框
  window.Plist = function (items) {
    return (items || []).map(function (i) {
      return window.P(i.name, i.copy, i.sub);
    }).join('');
  };

  // 指南注册表
  window.TRAVEL_GUIDES = window.TRAVEL_GUIDES || {};
  window.GUIDE_ORDER = window.GUIDE_ORDER || [];
  window.registerGuide = function (g) {
    window.TRAVEL_GUIDES[g.id] = g;
    if (window.GUIDE_ORDER.indexOf(g.id) === -1) window.GUIDE_ORDER.push(g.id);
  };
})();
