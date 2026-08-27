/* 「日出」主题交互：主题切换 / 进度条 / 代码复制 / 目录高亮 */
(function () {
  'use strict';

  /* ── 明暗切换 ── */
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var root = document.documentElement;
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('sunrise-theme', next); } catch (e) {}
    });
  }

  /* ── 阅读进度条 ── */
  var bar = document.getElementById('progress-bar');
  if (bar) {
    var ticking = false;
    var updateBar = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateBar);
        ticking = true;
      }
    }, { passive: true });
    updateBar();
  }

  /* ── 代码块复制：按钮由渲染钩子静态生成，此处做全局事件委托 ── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var card = btn.closest('.code-card');
    var pre = card && card.querySelector('pre');
    if (!pre) return;

    var text = pre.innerText.replace(/\n$/, '');
    var txt = btn.querySelector('.copy-btn__txt');
    var done = function () {
      if (txt) txt.textContent = '已复制';
      btn.classList.add('is-done');
      setTimeout(function () {
        if (txt) txt.textContent = '复制';
        btn.classList.remove('is-done');
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else {
      fallback();
    }

    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) {}
      document.body.removeChild(ta);
    }
  });

  /* ── 目录当前章节高亮 ── */
  var toc = document.querySelector('.toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = {};
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) {
      links[decodeURIComponent(a.hash.slice(1))] = a;
    });
    var headings = Object.keys(links)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (headings.length) {
      var visible = new Set();
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { visible.add(en.target.id); } else { visible.delete(en.target.id); }
        });
        for (var id in links) { links[id].classList.remove('is-active'); }
        var firstVisible = headings.find(function (h) { return visible.has(h.id); });
        if (firstVisible) { links[firstVisible.id].classList.add('is-active'); }
      }, { rootMargin: '-15% 0px -70% 0px' });

      headings.forEach(function (h) { observer.observe(h); });
    }
  }

  /* ── 站内搜索（零依赖客户端检索，索引来自 /search-index.json）── */
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    var resultList = document.getElementById('search-results');
    var searchStatus = document.getElementById('search-status');
    var indexPromise = null;
    var debounceTimer = null;

    var loadIndex = function () {
      if (!indexPromise) {
        indexPromise = fetch('/search-index.json').then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        });
      }
      return indexPromise;
    };

    var markUp = function (el, term) {
      var raw = el.textContent;
      if (!term) return;
      var lower = raw.toLowerCase();
      var t = term.toLowerCase();
      var i = 0;
      var idx;
      el.textContent = '';
      while ((idx = lower.indexOf(t, i)) !== -1) {
        el.appendChild(document.createTextNode(raw.slice(i, idx)));
        var mk = document.createElement('mark');
        mk.textContent = raw.substr(idx, t.length);
        el.appendChild(mk);
        i = idx + t.length;
      }
      el.appendChild(document.createTextNode(raw.slice(i)));
    };

    var makeRow = function (item, q) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.url;

      var top = document.createElement('div');
      top.className = 'sr-top';
      var time = document.createElement('time');
      time.textContent = item.date;
      var titleEl = document.createElement('span');
      titleEl.className = 'sr-row__title';
      titleEl.textContent = item.title;
      markUp(titleEl, q);
      top.appendChild(time);
      top.appendChild(titleEl);

      var snippetText = item.summary || '';
      if (q) {
        var hit = item.content.toLowerCase().indexOf(q.toLowerCase());
        if (hit !== -1 && !(item.summary || '').toLowerCase().includes(q.toLowerCase())) {
          var start = Math.max(0, hit - 60);
          snippetText = (start > 0 ? '…' : '') + item.content.slice(start, hit + q.length + 110).trim() + '…';
        }
      }
      var snippet = document.createElement('p');
      snippet.className = 'sr-snippet';
      snippet.textContent = snippetText;
      markUp(snippet, q);

      a.appendChild(top);
      a.appendChild(snippet);
      li.appendChild(a);
      return li;
    };

    var runSearch = function () {
      var q = searchInput.value.trim();
      resultList.innerHTML = '';
      if (!q) { searchStatus.textContent = ''; return; }

      searchStatus.textContent = '检索中 …';
      loadIndex().then(function (docs) {
        var lq = q.toLowerCase();
        var hits = [];
        docs.forEach(function (d) {
          var score = 0;
          var title = (d.title || '').toLowerCase();
          var summary = (d.summary || '').toLowerCase();
          var content = (d.content || '').toLowerCase();
          var tags = (d.tags || []).join(' ').toLowerCase();

          if (title.includes(lq)) score += title.startsWith(lq) ? 6 : 4;
          if (tags.includes(lq)) score += 3;
          if (summary.includes(lq)) score += 2;
          if (content.includes(lq)) {
            var n = content.split(lq).length - 1;
            score += Math.min(n, 5);
          }
          if (score > 0) hits.push({ d: d, s: score });
        });
        hits.sort(function (x, y) { return y.s - x.s; });

        var shown = hits.slice(0, 15);
        shown.forEach(function (h) { resultList.appendChild(makeRow(h.d, q)); });
        searchStatus.textContent = hits.length
          ? '找到 ' + hits.length + ' 篇相关文章' + (hits.length > shown.length ? '（显示前 ' + shown.length + ' 篇）' : '')
          : '未找到与「' + q + '」相关的文章';
      }).catch(function () {
        searchStatus.textContent = '搜索索引加载失败，请刷新重试。';
      });
    };

    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runSearch, 140);
    });

    if (searchInput.value) runSearch();
  }
})();
