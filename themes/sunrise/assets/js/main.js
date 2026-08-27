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

  /* ── 代码块复制按钮（覆盖 .highlight 与裸 <pre>）── */
  document.querySelectorAll('.prose pre').forEach(function (pre) {
    if (pre.parentElement && pre.parentElement.closest('pre')) return; // 防嵌套重复
    var host = pre.closest('.highlight') || pre; // 按钮挂在定位容器上，避免随横向滚动跑丢
    if (host.querySelector('.copy-btn')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = '复制';
    host.appendChild(btn);

    btn.addEventListener('click', function () {
      var text = pre.innerText.replace(/\n$/, '');
      var done = function () {
        btn.textContent = '已复制';
        btn.classList.add('is-done');
        setTimeout(function () {
          btn.textContent = '复制';
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
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
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
})();
