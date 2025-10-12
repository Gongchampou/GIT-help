
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
        const el = document.getElementById('chart');
        const srcTag = document.getElementById('chart-src');
        const srcText = srcTag ? srcTag.textContent.trim() : '';
        if(!el.dataset.src){ el.dataset.src = srcText || el.textContent.trim(); }
        el.removeAttribute('data-processed');
        // Use textContent to avoid HTML entity re-interpretation (e.g., &)
        el.textContent = el.dataset.src;
        window.mermaid.run({ querySelector:'#chart' }).then(attachInteractivity);
      });
    }

      // Ensure fixed header doesn't overlap content
      function applyHeaderOffset(){
        const tb = document.querySelector('.topbar');
        if(!tb) return;
        document.body.style.paddingTop = tb.offsetHeight + 'px';
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
        applyHeaderOffset();
        updateThemeIcon();
      });

      // Set initial icon based on saved/current theme
      updateThemeIcon();

      const tooltip = document.getElementById("tooltip");
      const modal = document.getElementById("modal");
      const dlgTitle = document.getElementById("dlg-title");
      const dlgContent = document.getElementById("dlg-content");
      const dlgCode = document.querySelector("#dlg-code code");

      // Icons for copy buttons
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
      function setupCopyButtons() {
        // Pre block copy buttons
        document.querySelectorAll('pre .copy').forEach((btn) => {
          btn.setAttribute('aria-label','Copy');
          btn.innerHTML = clipboardIconSVG();
          const insideModal = !!btn.closest('#modal');
          // Only non-modal copy buttons get hover tooltips
          if (!insideModal) {
            btn.addEventListener('mouseenter', (e) => showTooltip('Copy', e.clientX, e.clientY));
            btn.addEventListener('mousemove', (e) => showTooltip('Copy', e.clientX, e.clientY));
            btn.addEventListener('mouseleave', hideTooltip);
          }
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const code = btn.parentElement.querySelector('code');
            const txt = code ? code.innerText : '';
            if (!txt) return;
            // Deactivate all other active copy buttons globally
            document.querySelectorAll('pre .copy.ok').forEach((other) => {
              if (other !== btn) {
                other.innerHTML = clipboardIconSVG();
                other.classList.remove('ok');
              }
            });
            await navigator.clipboard.writeText(txt);
            btn.innerHTML = checkIconSVG();
            btn.classList.add('ok');
            if (!insideModal) {
              showTooltip('Copied!', e.clientX, e.clientY);
              const revert = () => { btn.innerHTML = clipboardIconSVG(); btn.classList.remove('ok'); hideTooltip(); btn.removeEventListener('mouseleave', revert); };
              btn.addEventListener('mouseleave', revert);
            }
          });
        });
      }

      const info = {
        WD: {
          title: "Working Directory",
          tip: "Your files on disk. Edit freely here.",
          html: `<p>This is where you create and edit files. Git watches this folder.</p>
              <ol><li>Make changes in your editor</li><li>Stage what you want to save</li><li>Commit with a clear message</li></ol>`,
          code: `git status\n# See changed files\ngit diff`,
        },
        ST: {
          title: "Staging Area",
          tip: "Choose the changes to include in the next snapshot.",
          html: `<p>Stage changes you want to include in the next commit.</p>`,
          code: `git add file1 file2\n# Or everything\ngit add .`,
        },
        LR: {
          title: "Local Repository",
          tip: "Your commit history stored locally.",
          html: `<p>Commits are snapshots with messages. Keep them small and meaningful.</p>`,
          code: `git commit -m "Describe what changed"\ngit log --oneline`,
        },
        REM: {
          title: "Remote Repository",
          tip: "A hosted copy (GitHub, GitLab). Push and pull to sync.",
          html: `<p>Share code with collaborators and back it up online.</p>`,
          code: `git remote add origin https://github.com/user/repo.git\ngit push -u origin main\ngit pull`,
        },
        BR: {
          title: "Branch",
          tip: "Work on a new idea without breaking main.",
          html: `<p>Create a branch for each feature or fix.</p>`,
          code: `git switch -c feature/thing\n# later\ngit switch main`,
        },
        PR: {
          title: "Pull Request",
          tip: "Propose merging your branch. Get review.",
          html: `<p>Open a PR on GitHub. Review, test, and then merge.</p>`,
          code: `# Push branch then open PR on the host\ngit push -u origin feature/thing`,
        },
        RB: {
          title: "Rebase",
          tip: "Replay commits on top of a new base to keep history clean.",
          html: `<p>Use rebase to update your branch with latest main. Resolve conflicts carefully.</p>`,
          code: `git fetch origin\ngit rebase origin/main\n# if conflicts\ngit add .\ngit rebase --continue`,
        },
        RV: {
          title: "Revert",
          tip: "Safely undo a commit by creating a new one.",
          html: `<p>Best for shared branches: history stays intact.</p>`,
          code: `git revert <commit_sha>`,
        },
        RS: {
          title: "Reset",
          tip: "Move HEAD and optionally discard work. Risky if pushed.",
          html: `<p>Use carefully. Prefer revert on shared branches.</p>`,
          code: `git reset --soft <commit_sha>   # keep staged\ngit reset --mixed <commit_sha>  # keep working tree\ngit reset --hard <commit_sha>   # discard changes`,
        },
        SH: {
          title: "Stash",
          tip: "Temporarily shelve changes without committing.",
          html: `<p>Great when you need to switch tasks quickly.</p>`,
          code: `git stash push -m "WIP"\ngit stash list\ngit stash pop`,
        },
        TG: {
          title: "Tags",
          tip: "Name important points (releases).",
          html: `<p>Tag versions and share them with your team.</p>`,
          code: `git tag -a v1.0.0 -m "Release 1.0.0"\ngit push origin v1.0.0`,
        },
        CI: {
          title: "CI/CD Pipeline",
          tip: "Automate build, test, and deploy after push.",
          html: `<p>A pipeline runs on every push (e.g., GitHub Actions) to build, test, and deploy your site.</p>
              <p>Great for auto deploy to Netlify, Vercel, or GitHub Pages.</p>`,
          code: `# .github/workflows/deploy.yml\nname: deploy\non:\n  push:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm run build`,
        },
        BUILD: {
          title: "Build & Test",
          tip: "Prepare production files before deployment.",
          html: `<p>Build your site/app for production. Many hosts deploy from a build folder.</p>`,
          code: `npm ci\nnpm run build\n# examples\n# Next.js: next build\n# React: vite build / react-scripts build\n# Hugo: hugo\n# Jekyll: bundle exec jekyll build`,
        },
        HOST: {
          title: "Hosting / Deploy",
          tip: "Publish your site to the web.",
          html: `<p>Deploy to a static host (Netlify, Vercel, GitHub Pages) or your server.</p>\n<ul><li><strong>Netlify:</strong> Connect repo; build command: <code>npm run build</code>, publish dir (e.g., <code>dist</code>)</li>\n<li><strong>Vercel:</strong> Import repo; auto detects framework and deploys</li>\n<li><strong>GitHub Pages:</strong> Deploy <code>dist</code> or use Pages for static files</li></ul>`,
          code: `# Netlify CLI\nnpm i -g netlify-cli\nnetlify init\nnetlify deploy --prod\n\n# Vercel CLI\nnpm i -g vercel\nvercel --prod\n\n# GitHub Pages (static)\n# Settings -> Pages -> Deploy from /docs or gh-pages branch`,
        },
      };

      function showTooltip(text, x, y) {
        tooltip.textContent = text;
        tooltip.style.display = "block";
        const pad = 10;
        const maxX = window.innerWidth - tooltip.offsetWidth - pad;
        const maxY = window.innerHeight - tooltip.offsetHeight - pad;
        tooltip.style.left = Math.min(x + 12, maxX) + "px";
        tooltip.style.top = Math.min(y + 12, maxY) + "px";
      }
      function hideTooltip() {
        tooltip.style.display = "none";
      }

      function openModal(key) {
        const data = info[key];
        if (!data) return;
        dlgTitle.textContent = data.title;
        dlgContent.innerHTML = data.html;
        dlgCode.textContent = data.code || "";
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        // disable background scroll and interactions for accessibility
        document.body.classList.add("no-scroll");
        const mainEl = document.querySelector("main");
        if (mainEl) mainEl.setAttribute("aria-hidden", "true");
        // header copy button removed
      }
      function closeModal() {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
        const mainEl = document.querySelector("main");
        if (mainEl) mainEl.removeAttribute("aria-hidden");
        // Reset copy icons inside modal (header copy button removed)
        modal.querySelectorAll("pre .copy").forEach((btn) => {
          btn.innerHTML = clipboardIconSVG();
          btn.classList.remove("ok");
        });
      }

      // header copy button removed
      document.getElementById("closeBtn").addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        // Click outside dialog closes
        if (e.target === modal) {
          closeModal();
          return;
        }
        // Prevent any link clicks inside the dialog from navigating/responding
        const link = e.target.closest("a");
        if (link && e.currentTarget.contains(link)) {
          e.preventDefault();
          e.stopPropagation();
        }
      });

      function findNode(svg, id) {
        // Mermaid often prefixes IDs, e.g., flowchart-12345-WD
        return (
          (svg.getElementById && svg.getElementById(id)) ||
          svg.querySelector(`#${CSS.escape(id)}`) ||
          svg.querySelector(`[id$='-${CSS.escape(id)}']`) ||
          svg.querySelector(`[data-id='${id}']`) ||
          svg.querySelector(`[id*='-${CSS.escape(id)}-']`)
        );
      }

      function attachInteractivity() {
        const svg = document.querySelector("#chart svg");
        if (!svg) return;
        // Add <title> tooltips for native hover as fallback
        Object.keys(info).forEach((id) => {
          const g = findNode(svg, id);
          if (!g) return;
          // Ensure a title element exists
          let t = g.querySelector("title");
          if (!t) {
            t = document.createElementNS("http://www.w3.org/2000/svg", "title");
            g.prepend(t);
          }
          t.textContent = info[id].tip;
          // JS tooltip + click
          g.style.cursor = "pointer";
          g.addEventListener("mouseenter", (e) => {
            showTooltip(info[id].tip, e.clientX, e.clientY);
          });
          g.addEventListener("mousemove", (e) => {
            showTooltip(info[id].tip, e.clientX, e.clientY);
          });
          g.addEventListener("mouseleave", hideTooltip);
          g.addEventListener("click", () => openModal(id));
        });
      }

      // ---------- Practice Board (Drag & Drop) ----------
      const paletteEl = document.getElementById("paletteCards");
      const zones = Array.from(document.querySelectorAll(".zone"));
      const resetBtn = document.getElementById("resetBoard");
      const showBtn = document.getElementById("showAnswers");
      const editToggle = document.getElementById("editToggle");

      const cardsData = [
        {
          key: "WD",
          label: "Working Directory",
          allowed: ["local"],
          preferred: "local",
        },
        {
          key: "ST",
          label: "Staging Area",
          allowed: ["local"],
          preferred: "local",
        },
        {
          key: "LR",
          label: "Local Repository",
          allowed: ["local"],
          preferred: "local",
        },
        {
          key: "REM",
          label: "Remote Repository",
          allowed: ["remote"],
          preferred: "remote",
        },
        {
          key: "BR",
          label: "Branch",
          allowed: ["version"],
          preferred: "version",
        },
        {
          key: "PR",
          label: "Pull Request",
          allowed: ["remote"],
          preferred: "remote",
        },
        {
          key: "RB",
          label: "Rebase",
          allowed: ["version"],
          preferred: "version",
        },
        {
          key: "RV",
          label: "Revert",
          allowed: ["version"],
          preferred: "version",
        },
        {
          key: "RS",
          label: "Reset",
          allowed: ["version", "risky"],
          preferred: "risky",
        },
        { key: "SH", label: "Stash", allowed: ["local"], preferred: "local" },
        {
          key: "TG",
          label: "Tags",
          allowed: ["version"],
          preferred: "version",
        },
        {
          key: "BUILD",
          label: "Build & Test",
          allowed: ["remote"],
          preferred: "remote",
        },
        {
          key: "CI",
          label: "CI/CD Pipeline",
          allowed: ["remote"],
          preferred: "remote",
        },
        {
          key: "HOST",
          label: "Hosting/Deploy",
          allowed: ["remote"],
          preferred: "remote",
        },
      ];

      function makeCardEl(card) {
        const el = document.createElement("div");
        el.className = "card";
        el.draggable = true;
        el.dataset.key = card.key;
        el.title = info[card.key]?.tip || "";
        el.innerHTML = `<span class="label">${card.label}</span><span class="badge">${card.key}</span>`;
        // Clicking opens instruction dialog
        el.addEventListener("click", (e) => {
          // avoid opening when double clicking to select text in edit mode
          if (editToggle.checked) return;
          openModal(card.key);
        });
        // Drag events
        el.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", card.key);
          e.dataTransfer.effectAllowed = "move";
          // keep reference to element
          draggedCard = el;
        });
        return el;
      }

      // Board state
      let draggedCard = null;

      function buildPalette() {
        paletteEl.innerHTML = "";
        cardsData.forEach((c) => {
          paletteEl.appendChild(makeCardEl(c));
        });
      }

      function zoneLabel(zoneId) {
        switch (zoneId) {
          case "local":
            return "Local Work";
          case "version":
            return "Versioning";
          case "remote":
            return "Remote/Collab";
          case "risky":
            return "Risky Actions";
        }
        return zoneId;
      }

      function validatePlacement(key, zoneId) {
        const card = cardsData.find((c) => c.key === key);
        if (!card) return { ok: false, msg: "Unknown card" };
        const ok = card.allowed.includes(zoneId);
        if (!ok) {
          const targets = card.allowed.map(zoneLabel).join(" or ");
          return { ok: false, msg: `Place "${card.label}" in ${targets}.` };
        }
        if (zoneId !== card.preferred) {
          return {
            ok: true,
            msg: `Correct, but best in "${zoneLabel(card.preferred)}".`,
          };
        }
        return { ok: true, msg: "Great placement." };
      }

      function attachZoneDnD() {
        zones.forEach((zone) => {
          const drop = zone.querySelector(".drop");
          zone.addEventListener("dragenter", (e) => {
            e.preventDefault();
            zone.classList.add("highlight");
          });
          zone.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          });
          zone.addEventListener("dragleave", () =>
            zone.classList.remove("highlight"),
          );
          zone.addEventListener("drop", (e) => {
            e.preventDefault();
            zone.classList.remove("highlight");
            const key = (
              e.dataTransfer.getData("text/plain") ||
              draggedCard?.dataset.key ||
              ""
            ).trim();
            if (!key) return;
            const res = validatePlacement(key, zone.dataset.zone);
            const el =
              draggedCard ||
              document.querySelector(`.card[data-key='${CSS.escape(key)}']`);
            if (!el) return;
            drop.appendChild(el);
            el.classList.remove("ok", "bad");
            if (res.ok) {
              el.classList.add("ok");
            } else {
              el.classList.add("bad");
            }
            const msgEl = zone.querySelector("footer .msg");
            if (msgEl) msgEl.textContent = res.msg;
            // friendly nudge if wrong
            if (!res.ok) {
              el.animate(
                [
                  { transform: "translateX(0)" },
                  { transform: "translateX(-4px)" },
                  { transform: "translateX(4px)" },
                  { transform: "translateX(0)" },
                ],
                { duration: 280 },
              );
            }
          });
        });
        // Allow dropping back to palette
        const palette = document.querySelector(".palette");
        palette.addEventListener("dragover", (e) => {
          e.preventDefault();
        });
        palette.addEventListener("drop", (e) => {
          e.preventDefault();
          const key = (
            e.dataTransfer.getData("text/plain") ||
            draggedCard?.dataset.key ||
            ""
          ).trim();
          const el =
            draggedCard ||
            document.querySelector(`.card[data-key='${CSS.escape(key)}']`);
          if (!el) return;
          paletteEl.appendChild(el);
          el.classList.remove("ok", "bad");
        });
      }

      function setEditable(on) {
        document.querySelectorAll(".card .label").forEach((lbl) => {
          lbl.contentEditable = on ? "true" : "false";
          lbl.style.outline = on ? "1px dashed var(--border)" : "none";
        });
      }

      function showAnswers() {
        // Move cards to their preferred zones
        cardsData.forEach((card) => {
          const el = document.querySelector(
            `.card[data-key='${CSS.escape(card.key)}']`,
          );
          const zone = document.querySelector(
            `.zone[data-zone='${card.preferred}'] .drop`,
          );
          if (el && zone) {
            zone.appendChild(el);
            el.classList.add("ok");
            el.classList.remove("bad");
          }
        });
        zones.forEach((z) => {
          const msgEl = z.querySelector("footer .msg");
          if (msgEl) msgEl.textContent = "Answer shown.";
        });
      }

      function resetBoard() {
        // Move all existing cards (from any zone) back to the palette
        const allCards = Array.from(document.querySelectorAll(".card"));
        allCards.forEach((card) => {
          card.classList.remove("ok", "bad");
          paletteEl.appendChild(card);
        });
        // Reset zone messages and visuals
        zones.forEach((z) => {
          const msgEl = z.querySelector("footer .msg");
          if (msgEl)
            msgEl.textContent = msgEl.dataset.default || msgEl.textContent;
          z.classList.remove("highlight");
        });
      }

      function initBoard() {
        // Save default messages
        document.querySelectorAll(".zone footer .msg").forEach((m) => {
          m.dataset.default = m.textContent;
        });
        buildPalette();
        attachZoneDnD();
        editToggle.addEventListener("change", () =>
          setEditable(editToggle.checked),
        );
        resetBtn.addEventListener("click", resetBoard);
        showBtn.addEventListener("click", showAnswers);
      }
      initBoard();
      // Initialize copy button behaviors
      setupCopyButtons();

      // Initial render
      renderMermaid();