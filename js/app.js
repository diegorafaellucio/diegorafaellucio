(function () {
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function setHTML(node, html) {
    node.innerHTML = html || '';
  }

  function clearAndGet(id) {
    var node = document.getElementById(id);
    if (!node) return null;
    node.innerHTML = '';
    return node;
  }

  function titleCase(s) {
    if (!s) return '';
    return String(s)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function inferSectionType(key, value) {
    if (key === 'skills') return 'skills';
    if (key === 'publications') return 'publications';
    if (key === 'badges') return 'badges';

    if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
      if ('year' in value[0] && 'title' in value[0]) return 'publications';
      if ('group' in value[0] && 'items' in value[0]) return 'skills';
      return 'timeline';
    }

    if (value && typeof value === 'object') {
      if (Array.isArray(value.items) && value.items.length && value.items[0] && value.items[0].src) return 'badges';
    }

    return 'timeline';
  }

  function inferIcon(key, type) {
    var map = {
      about: 'person-outline',
      experience: 'briefcase-outline',
      education: 'school-outline',
      skills: 'code-slash-outline',
      publications: 'library-outline',
      badges: 'ribbon-outline'
    };
    if (map[key]) return map[key];
    if (type === 'timeline') return 'list-outline';
    if (type === 'skills') return 'code-slash-outline';
    if (type === 'publications') return 'library-outline';
    if (type === 'badges') return 'ribbon-outline';
    return 'ellipsis-horizontal-outline';
  }

  function inferSections(data) {
    var out = [];

    if (data.about) {
      out.push({ id: 'about', key: 'about', type: 'about', label: 'About', icon: 'person-outline' });
    }

    var sections = data.sections || {};
    Object.keys(sections).forEach(function (key) {
      var type = inferSectionType(key, sections[key]);
      out.push({
        id: key,
        key: key,
        type: type,
        label: titleCase(key),
        icon: inferIcon(key, type)
      });
    });

    return out;
  }

  function buildSections(data, sectionDefs) {
    var host = clearAndGet('sections');
    if (!host) return;

    sectionDefs.forEach(function (s) {
      if (!s || !s.id) return;

      var section = document.createElement('section');
      section.id = s.id;
      section.className = 'section reveal';

      if (s.type !== 'about') {
        var h2 = document.createElement('h2');
        h2.className = 'section-title section-title-spaced';
        h2.textContent = s.label || s.id;
        section.appendChild(h2);
      }

      if (s.type === 'about') {
        var aboutDiv = document.createElement('div');
        aboutDiv.id = 'about-content';
        section.appendChild(aboutDiv);
      } else if (s.type === 'skills') {
        var grid = document.createElement('div');
        grid.id = s.id + '-grid';
        grid.className = 'skill-grid';
        section.appendChild(grid);
      } else if (s.type === 'publications') {
        var pubs = document.createElement('div');
        pubs.id = s.id + '-timeline';
        pubs.className = 'timeline pub-timeline';
        section.appendChild(pubs);
      } else if (s.type === 'badges') {
        var badges = document.createElement('div');
        badges.id = s.id + '-grid';
        badges.className = 'badges';
        section.appendChild(badges);
      } else {
        var tl = document.createElement('div');
        tl.id = s.id + '-timeline';
        tl.className = 'timeline';
        section.appendChild(tl);
      }

      host.appendChild(section);
    });
  }

  function renderTopbar(data) {
    var root = clearAndGet('topbar-inner');
    if (!root) return;

    var brand = el('a', 'brand', (data.site && data.site.brand && data.site.brand.text) || '');
    brand.href = (data.site && data.site.brand && data.site.brand.href) || '#top';

    var nav = el('nav', 'nav');
    inferSections(data).forEach(function (it) {
      var a = document.createElement('a');
      a.href = '#' + (it.id || '');

      if (it.icon) {
        var icon = document.createElement('ion-icon');
        icon.setAttribute('name', it.icon);
        a.appendChild(icon);
      }

      var span = document.createElement('span');
      span.textContent = it.label || '';
      a.appendChild(span);

      nav.appendChild(a);
    });

    root.appendChild(brand);
    root.appendChild(nav);
  }

  function renderAbout(data) {
    var root = clearAndGet('about-content');
    if (!root) return;

    var about = data.about || {};

    var hero = el('div', 'hero-card');

    var photoWrap = el('div', 'hero-photo');
    var photoRound = el('div', 'hero-photo-round');
    var img = document.createElement('img');
    img.className = 'hero-photo-img';
    img.src = (about.photo && about.photo.src) || '';
    img.alt = (about.photo && about.photo.alt) || '';
    photoRound.appendChild(img);
    photoWrap.appendChild(photoRound);
    hero.appendChild(photoWrap);

    var info = el('div', 'hero-info');
    info.appendChild(el('h1', 'hero-name', about.name || ''));

    var role = el('p', 'hero-role');
    setHTML(role, about.roleHtml || '');
    info.appendChild(role);

    var details = document.createElement('dl');
    details.className = 'hero-details';
    details.setAttribute('aria-label', 'Profile details');

    function addDetail(label, valueNode) {
      var wrap = el('div', 'detail');
      var dt = el('dt', 'detail-k', label);
      var dd = el('dd', 'detail-v');
      dd.appendChild(valueNode);
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      details.appendChild(wrap);
    }

    var d = about.details || {};

    var emailWrap = document.createElement('span');
    var emailLink = document.createElement('a');
    emailLink.id = 'email-link';
    emailLink.href = 'mailto:' + (d.email || '');
    emailLink.textContent = d.email || '';
    emailWrap.appendChild(emailLink);

    var copyBtn = document.createElement('button');
    copyBtn.id = 'copy-email';
    copyBtn.className = 'icon-btn';
    copyBtn.type = 'button';
    copyBtn.setAttribute('aria-label', 'Copy email address');
    copyBtn.title = 'Copy';
    var copyIcon = document.createElement('ion-icon');
    copyIcon.setAttribute('name', 'copy-outline');
    copyBtn.appendChild(copyIcon);
    emailWrap.appendChild(copyBtn);

    var feedback = document.createElement('span');
    feedback.id = 'copy-feedback';
    feedback.className = 'sr-only';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    emailWrap.appendChild(feedback);

    addDetail('Email', emailWrap);

    if (d.phone) {
      var phoneLink = document.createElement('a');
      phoneLink.href = d.phoneHref || '#';
      phoneLink.textContent = d.phone;
      addDetail('Phone', phoneLink);
    }

    if (d.location) {
      addDetail('Location', document.createTextNode(d.location));
    }

    if (d.focus && d.focus.length) {
      var chips = el('span', 'chips');
      d.focus.forEach(function (c) {
        chips.appendChild(el('span', 'chip', c));
      });
      addDetail('Focus', chips);
    }

    info.appendChild(details);

    var quick = el('div', 'quick-links');
    quick.setAttribute('aria-label', 'Quick links');
    (about.quickLinks || []).forEach(function (q) {
      var a = el('a', 'q-link');
      a.href = q.href || '#';
      a.target = '_blank';
      a.rel = 'noreferrer';

      if (q.icon) {
        var icon = document.createElement('ion-icon');
        icon.setAttribute('name', q.icon);
        a.appendChild(icon);
      }

      var span = document.createElement('span');
      span.textContent = q.label || '';
      a.appendChild(span);
      quick.appendChild(a);
    });
    info.appendChild(quick);
    hero.appendChild(info);

    var pres = el('div', 'hero-presentation');
    var lead = el('p', 'section-lead');
    setHTML(lead, about.leadHtml || '');
    pres.appendChild(lead);

    var ul = document.createElement('ul');
    ul.className = 'highlights';
    (about.highlights || []).forEach(function (h) {
      var li = document.createElement('li');
      setHTML(li, h);
      ul.appendChild(li);
    });
    pres.appendChild(ul);
    hero.appendChild(pres);

    root.appendChild(hero);
  }

  function renderTimelineItem(item, opts) {
    var tItem = el('div', 't-item');

    var left = el('div', 't-left');
    left.appendChild(el('div', 't-period', item.period || item.year || ''));
    if (opts && opts.showRole && item.role) {
      left.appendChild(el('div', 't-role', item.role));
    }

    var mid = el('div', 't-mid');
    mid.appendChild(el('span', 't-dot'));

    var right = el('div', 't-right');
    if (item.title) right.appendChild(el('div', 't-title', item.title));

    var desc = el('div', 't-desc');

    if (opts && opts.publication) {
      var pubTitle = el('div', 'pub-title', item.title || '');
      desc.appendChild(pubTitle);
      right.innerHTML = '';
      if (item.venue) right.appendChild(el('div', 't-title', item.venue));
      right.appendChild(desc);
    } else {
      if (item.bullets && item.bullets.length) {
        var ul = document.createElement('ul');
        item.bullets.forEach(function (b) {
          ul.appendChild(el('li', null, b));
        });
        desc.appendChild(ul);
      }

      if (item.desc && !item.bullets) {
        desc.appendChild(document.createTextNode(item.desc));
      }

      if (item.tech) {
        var techWrap = document.createElement('div');
        var strong = document.createElement('strong');
        strong.textContent = 'Key technologies:';
        techWrap.appendChild(strong);
        techWrap.appendChild(document.createTextNode(' ' + item.tech));
        desc.appendChild(techWrap);
      }

      if (desc.childNodes.length) right.appendChild(desc);
    }

    tItem.appendChild(left);
    tItem.appendChild(mid);
    tItem.appendChild(right);
    return tItem;
  }

  function renderExperience(data) {
    var root = clearAndGet('experience-timeline');
    if (!root) return;
    var items = (data.sections && data.sections.experience) ? data.sections.experience : [];
    items.forEach(function (it) {
      root.appendChild(renderTimelineItem(it, { showRole: true }));
    });
  }

  function renderEducation(data) {
    var root = clearAndGet('education-timeline');
    if (!root) return;
    var items = (data.sections && data.sections.education) ? data.sections.education : [];
    items.forEach(function (it) {
      root.appendChild(renderTimelineItem(it, { showRole: true }));
    });
  }

  function renderSkills(data) {
    var root = clearAndGet('skills-grid');
    if (!root) return;

    var groups = (data.sections && data.sections.skills) ? data.sections.skills : [];
    groups.forEach(function (group) {
      var card = el('div', 'skill-card');
      card.appendChild(el('h3', null, group.group || ''));

      var badges = el('div', 'skill-badges');
      (group.items || []).forEach(function (it) {
        var icon = el('span', 'skill-icon');
        if (it.label) icon.setAttribute('data-tip', it.label);

        if (it.type === 'ion' && it.name) {
          var ion = document.createElement('ion-icon');
          ion.setAttribute('name', it.name);
          icon.appendChild(ion);
        } else if (it.type === 'img' && it.src) {
          var img = document.createElement('img');
          img.src = it.src;
          img.alt = it.label || '';
          icon.appendChild(img);
        }

        badges.appendChild(icon);
      });

      card.appendChild(badges);
      root.appendChild(card);
    });
  }

  function renderPublications(data) {
    var root = clearAndGet('publications-timeline');
    if (!root) return;

    var items = (data.sections && data.sections.publications) ? data.sections.publications : [];
    items.forEach(function (it) {
      root.appendChild(renderTimelineItem({
        year: it.year,
        venue: it.venue,
        title: it.title
      }, { publication: true }));
    });
  }

  function renderBadges(data) {
    var root = clearAndGet('badges-grid');
    if (!root) return;
    var b = (data.sections && data.sections.badges && data.sections.badges.items) ? data.sections.badges.items : [];
    b.forEach(function (it) {
      if (!it || !it.src) return;
      var img = document.createElement('img');
      img.className = 'badge';
      img.alt = it.alt || '';
      img.src = it.src;
      root.appendChild(img);
    });
  }

  function showError(err) {
    var topbar = document.getElementById('topbar-inner');
    if (topbar && !topbar.querySelector('.brand')) {
      var brand = el('a', 'brand', 'Portfolio');
      brand.href = '#top';
      topbar.innerHTML = '';
      topbar.appendChild(brand);
    }

    var sectionsHost = document.getElementById('sections');
    if (sectionsHost && !sectionsHost.textContent) {
      sectionsHost.innerHTML = '';
      var p = document.createElement('p');
      p.textContent = 'Failed to load content.';
      sectionsHost.appendChild(p);
    }

    if (err && typeof console !== 'undefined' && console.error) {
      console.error(err);
    }
  }

  window.__contentReady = (async function () {
    try {
      var res = await fetch('data/content.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load data/content.json: ' + res.status);
      var data = await res.json();

      var sectionDefs = inferSections(data);

      if (data.site && data.site.title) {
        document.title = data.site.title;
      }

      buildSections(data, sectionDefs);
      renderTopbar(data);

      sectionDefs.forEach(function (s) {
        if (!s) return;
        if (s.type === 'about') {
          renderAbout(data);
          return;
        }

        if (s.type === 'skills') {
          var skillsRoot = document.getElementById(s.id + '-grid');
          if (skillsRoot) skillsRoot.id = 'skills-grid';
          renderSkills(data);
          if (skillsRoot) skillsRoot.id = s.id + '-grid';
          return;
        }

        if (s.type === 'publications') {
          var pubRoot = document.getElementById(s.id + '-timeline');
          if (pubRoot) pubRoot.id = 'publications-timeline';
          renderPublications(data);
          if (pubRoot) pubRoot.id = s.id + '-timeline';
          return;
        }

        if (s.type === 'badges') {
          var badgeRoot = document.getElementById(s.id + '-grid');
          if (badgeRoot) badgeRoot.id = 'badges-grid';
          renderBadges(data);
          if (badgeRoot) badgeRoot.id = s.id + '-grid';
          return;
        }

        var tlRoot = document.getElementById(s.id + '-timeline');
        if (!tlRoot) return;
        var items = (data.sections && data.sections[s.key]) ? data.sections[s.key] : [];
        tlRoot.innerHTML = '';
        items.forEach(function (it) {
          tlRoot.appendChild(renderTimelineItem(it, { showRole: true }));
        });
      });

      var reveals = document.querySelectorAll('.reveal');
      reveals.forEach(function (el) {
        el.classList.add('is-visible');
      });
    } catch (e) {
      showError(e);
      throw e;
    }
  })();
})();
