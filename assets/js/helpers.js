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
        '<svg class="ic-pin" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>' +
        '</svg>' +
        '<span class="place-body"><span class="place-name">' + esc(name) + '</span>' +
        (sub ? '<span class="place-sub">' + esc(sub) + '</span>' : '') +
        '</span>' +
        '<svg class="ic-copy" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/>' +
        '</svg>' +
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
