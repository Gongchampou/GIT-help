      const root = document.documentElement;
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light") root.classList.add("light");

      function currentMermaidTheme() {
        return root.classList.contains("light") ? "default" : "dark";
      }

      function ensureMermaid(cb) {
        if (window.mermaid) {
          cb();
          return;
        }
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
        s.onload = () => cb();
        document.body.appendChild(s);
      }

      function renderMermaid(){
      ensureMermaid(() => {
        window.mermaid.initialize({ startOnLoad:false, theme: currentMermaidTheme() });
        document.querySelectorAll('.mermaid').forEach(el => {
          const prev = el.previousElementSibling;
          const srcTag = prev && prev.matches('script.m-src') ? prev : null;
          const srcText = srcTag ? srcTag.textContent.trim() : '';
          if(!el.dataset.src){ el.dataset.src = srcText || el.textContent.trim(); }
          el.removeAttribute('data-processed');
          // Use textContent to avoid HTML entity re-interpretation (e.g., &)
          el.textContent = el.dataset.src;
        });
        window.mermaid.run({ querySelector: '.mermaid' });
      });
    }

    // Ensure fixed header doesn't overlap content
    function applyHeaderOffset(){
      const tb = document.querySelector('.topbar');
      if(!tb) return;
      const h = tb.offsetHeight;
      document.body.style.paddingTop = h + 'px';
      document.documentElement.style.setProperty('--header-h', h + 'px');
    }
    applyHeaderOffset();
    window.addEventListener('resize', applyHeaderOffset);

      document.getElementById("themeBtn").addEventListener("click", () => {
        root.classList.toggle("light");
        localStorage.setItem(
          "theme",
          root.classList.contains("light") ? "light" : "dark",
        );
        renderMermaid();
        updateThemeIcon();
        applyHeaderOffset();
      });

      // Set initial theme icon on load
      updateThemeIcon();

      // Progress bar based on scroll through content
      const progress = document.getElementById("progressBar");
      const sections = [...document.querySelectorAll("main .content section")];
      const navLinks = [...document.querySelectorAll(".nav a")];

      // Ensure nav links always scroll, even if hash is already set
      navLinks.forEach((a) => {
        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#')) return;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const id = href.slice(1);
          const target = document.getElementById(id);
          if (!target) return;
          const headerVar = getComputedStyle(document.documentElement).getPropertyValue('--header-h');
          const headerH = parseFloat(headerVar) || (document.querySelector('.topbar')?.offsetHeight || 64);
          const gap = 2;
          const top = target.getBoundingClientRect().top + window.scrollY - headerH - gap;
          window.scrollTo({ top, behavior: 'smooth' });
          history.replaceState(null, '', '#' + id);
          // Immediately reflect active state on click
          navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
        });
      });

      function updateProgress() {
        const scrollY = window.scrollY;
        const docH = document.body.scrollHeight - window.innerHeight;
        const pct = Math.max(0, Math.min(1, docH ? scrollY / docH : 0));
        progress.style.transform = `scaleX(${pct})`;
      }
      window.addEventListener("scroll", updateProgress, { passive: true });
      updateProgress();

      // Floating tooltip helpers (match flow.html)
      const tooltip = document.getElementById("tooltip");
      function showTooltip(text, x, y) {
        if (!tooltip) return;
        tooltip.textContent = text;
        tooltip.style.display = "block";
        tooltip.style.left = `${x + 12}px`;
        tooltip.style.top = `${y + 12}px`;
      }
      function hideTooltip() {
        if (!tooltip) return;
        tooltip.style.display = "none";
      }

      // Icon helpers for copy buttons
      function clipboardIconSVG() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
      }
      function checkIconSVG() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
      }
      function sunIconSVG(){
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
      }
      function moonIconSVG(){
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
      }
      function updateThemeIcon(){
        const btn = document.getElementById('themeBtn');
        if(!btn) return;
        btn.innerHTML = root.classList.contains('light') ? sunIconSVG() : moonIconSVG();
      }

      // Copy buttons (icon-only, persistent after click — no hover toggle)
      document.querySelectorAll("pre").forEach((pre) => {
        const btn = pre.querySelector(".copy");
        if (!btn) return;
        btn.setAttribute("aria-label", "Copy");
        btn.innerHTML = clipboardIconSVG();
        // No hover tooltip; avoid visual toggle on pointer move
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const codeEl = pre.querySelector("code");
          const code = codeEl ? codeEl.innerText : "";
          try {
            // Deactivate all other active copy buttons
            document.querySelectorAll('pre .copy.ok').forEach((other) => {
              if (other !== btn) {
                other.innerHTML = clipboardIconSVG();
                other.classList.remove('ok');
              }
            });
            await navigator.clipboard.writeText(code);
            btn.innerHTML = checkIconSVG();
            btn.classList.add("ok");
            // Persist state; do not revert on hover/mouseleave
          } catch (e) {
            const ta = document.createElement("textarea");
            ta.value = code;
            document.body.appendChild(ta);
            ta.select();
            try {
              document.execCommand("copy");
            } catch (_) {}
            document.body.removeChild(ta);
          }
        });
      });

      // Active nav link based on section in view
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              navLinks.forEach((a) =>
                a.classList.toggle(
                  "active",
                  a.getAttribute("href") === "#" + id,
                ),
              );
            }
          });
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: [0, 1] },
      );
      sections.forEach((sec) => obs.observe(sec));
      // Initial active link based on hash or first section
      (function setInitialActive(){
        const current = (location.hash || '').slice(1) || (sections[0] && sections[0].id) || 'welcome';
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
      })();
      // Initial render for Mermaid diagrams
      renderMermaid();