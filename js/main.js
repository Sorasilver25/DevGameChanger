document.addEventListener('DOMContentLoaded', function() {
  // Set default theme if none is selected
  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'light');
  }

  if (!localStorage.getItem('nav-style')) {
    localStorage.setItem('nav-style', 'authentique');
  }

  const applyTheme = function(themeName) {
    const existingThemeClasses = Array.from(document.body.classList)
      .filter(className => className.startsWith('theme-'));
    existingThemeClasses.forEach(className => document.body.classList.remove(className));
    document.body.classList.add('theme-' + themeName);
  };

  const applyNavStyle = function(styleName) {
    document.body.classList.remove('nav-mode-authentique', 'nav-mode-fluide', 'nav-mode-paradoxe');
    document.body.classList.add('nav-mode-' + styleName);
  };
  
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme');
  const savedNavStyleRaw = localStorage.getItem('nav-style');
  const savedNavStyle = savedNavStyleRaw === 'paradoxe' ? 'paradoxe' : 'authentique';
  if (savedNavStyleRaw !== savedNavStyle) {
    localStorage.setItem('nav-style', savedNavStyle);
  }
  applyTheme(savedTheme);
  applyNavStyle(savedNavStyle);
  
  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const sidebar = document.querySelector('.app-sidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  }
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', function(event) {
    if (window.innerWidth <= 992 && 
        sidebar && 
        sidebar.classList.contains('active') && 
        !sidebar.contains(event.target) && 
        !menuToggle.contains(event.target)) {
      sidebar.classList.remove('active');
    }
  });
  
  // Theme selector dropdown toggle
  const themeButton = document.querySelector('.theme-button');
  const themeDropdown = document.querySelector('.theme-dropdown');
  
  if (themeButton && themeDropdown) {
    themeButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      themeDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (themeDropdown.classList.contains('show') && !themeDropdown.contains(e.target) && !themeButton.contains(e.target)) {
        themeDropdown.classList.remove('show');
      }
    });
  }
  
  // Theme options
  const themeOptions = document.querySelectorAll('.theme-option');
  
  if (themeOptions.length > 0) {
    themeOptions.forEach(option => {
      option.addEventListener('click', function(e) {
        e.preventDefault();
        const selectedTheme = this.getAttribute('data-theme');

        // Apply selected theme while keeping nav-style classes
        applyTheme(selectedTheme);
        applyNavStyle(localStorage.getItem('nav-style') || 'authentique');
        
        // Save theme preference
        localStorage.setItem('theme', selectedTheme);
        
        // Update active state in dropdown
        themeOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        
        // Close dropdown
        themeDropdown.classList.remove('show');
      });
      
      // Set active state based on current theme
      if (option.getAttribute('data-theme') === localStorage.getItem('theme')) {
        option.classList.add('active');
      }
    });
  }

  const appHeaderActions = document.querySelector('.app-header-actions');
  let navModeToggle = document.querySelector('.nav-mode-toggle');
  let syncParadoxUiState = function() {};

  const updateNavToggleButton = function() {
    if (!navModeToggle) {
      return;
    }

    const currentStyle = localStorage.getItem('nav-style') === 'paradoxe' ? 'paradoxe' : 'authentique';
    const isAuthentique = currentStyle === 'authentique';

    navModeToggle.setAttribute('aria-pressed', String(!isAuthentique));
    navModeToggle.setAttribute('title', isAuthentique ? 'Passer en mode navigation paradoxe' : 'Revenir en mode navigation authentique');
    navModeToggle.innerHTML =
      '<i class="fas ' + (isAuthentique ? 'fa-shuffle' : 'fa-compass') + '"></i>' +
      '<span>' + (isAuthentique ? 'Mode paradoxe' : 'Mode authentique') + '</span>';
  };

  if (!navModeToggle && appHeaderActions) {
    navModeToggle = document.createElement('button');
    navModeToggle.type = 'button';
    navModeToggle.className = 'nav-mode-toggle';
    navModeToggle.setAttribute('aria-label', 'Changer le style de navigation');
    appHeaderActions.insertBefore(navModeToggle, appHeaderActions.firstChild);
  }

  if (navModeToggle) {
    updateNavToggleButton();
    navModeToggle.addEventListener('click', function() {
      const currentStyle = localStorage.getItem('nav-style') === 'paradoxe' ? 'paradoxe' : 'authentique';
      const nextStyle = currentStyle === 'authentique' ? 'paradoxe' : 'authentique';
      localStorage.setItem('nav-style', nextStyle);
      applyNavStyle(nextStyle);
      updateNavToggleButton();
      syncParadoxUiState();
    });
  }

  // Compact and expandable sidebar categories
  const sidebarCategories = document.querySelectorAll('.sidebar-category');

  sidebarCategories.forEach(category => {
    const title = category.querySelector('.category-title');
    const items = category.querySelector('.category-items');

    if (!title || !items) {
      return;
    }

    category.classList.add('is-collapsible');
    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');

    const hasActiveItem = !!category.querySelector('.sidebar-item.active');
    category.classList.toggle('expanded', hasActiveItem);
    title.setAttribute('aria-expanded', hasActiveItem ? 'true' : 'false');

    const toggleCategory = function() {
      const isExpanded = category.classList.toggle('expanded');
      title.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    };

    title.addEventListener('click', toggleCategory);
    title.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleCategory();
      }
    });
  });

  const buildParadoxNavigation = function() {
    const sections = Array.from(document.querySelectorAll('.app-sidebar .sidebar-section'));
    if (!sections.length) {
      return;
    }

    let trigger = document.querySelector('.paradox-nav-trigger');
    let overlay = document.querySelector('.paradox-nav-overlay');

    if (!trigger) {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'paradox-nav-trigger';
      trigger.setAttribute('aria-label', 'Ouvrir la navigation paradoxe');
      trigger.innerHTML = '<i class="fas fa-compass-drafting"></i><span>Explorer</span>';
      document.body.appendChild(trigger);
    }

    if (!overlay) {
      overlay = document.createElement('section');
      overlay.className = 'paradox-nav-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML =
        '<div class="paradox-nav-panel">' +
        '<div class="paradox-nav-head">' +
        '<p class="paradox-nav-kicker">Navigation alternative</p>' +
        '<h2>Carte de tes blogs</h2>' +
        '<button type="button" class="paradox-nav-close" aria-label="Fermer la navigation"><i class="fas fa-xmark"></i></button>' +
        '</div>' +
        '<div class="paradox-nav-tools">' +
        '<div class="paradox-nav-stats">' +
        '<span id="paradox-total-topics" class="paradox-pill"></span>' +
        '<span id="paradox-total-posts" class="paradox-pill"></span>' +
        '<span id="paradox-visible-posts" class="paradox-pill paradox-pill-strong"></span>' +
        '</div>' +
        '<div class="paradox-nav-actions">' +
        '<input type="search" id="paradox-nav-search" class="paradox-nav-search" placeholder="Filtrer un sujet, techno, mot-clé..." autocomplete="off">' +
        '<button type="button" id="paradox-random-link" class="paradox-random-link">Surprends-moi</button>' +
        '</div>' +
        '</div>' +
        '<div id="paradox-nav-shortcuts" class="paradox-nav-shortcuts"></div>' +
        '<div class="paradox-nav-grid"></div>' +
        '</div>';
      document.body.appendChild(overlay);
    }

    const grid = overlay.querySelector('.paradox-nav-grid');
    const shortcuts = overlay.querySelector('#paradox-nav-shortcuts');
    const totalTopics = overlay.querySelector('#paradox-total-topics');
    const totalPosts = overlay.querySelector('#paradox-total-posts');
    const visiblePosts = overlay.querySelector('#paradox-visible-posts');
    const localNormalize = function(text) {
      return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    let totalLinkCount = 0;
    let cardCount = 0;

    if (grid) {
      grid.innerHTML = '';
      if (shortcuts) {
        shortcuts.innerHTML = '';
      }

      sections.forEach(section => {
        const sectionTitle = section.querySelector('.section-header span')?.textContent?.trim() || 'Navigation';
        const sectionIconClass = section.querySelector('.section-header i')?.className || 'fas fa-layer-group';
        const links = Array.from(section.querySelectorAll('.sidebar-item a'));

        if (!links.length) {
          return;
        }

        const card = document.createElement('article');
        card.className = 'paradox-nav-card';
        card.id = 'paradox-section-' + cardCount;
        cardCount += 1;

        const heading = document.createElement('h3');
        heading.className = 'paradox-nav-card-title';
        heading.innerHTML = '<i class="' + sectionIconClass + '"></i><span>' + sectionTitle + '</span>';

        const list = document.createElement('ul');
        list.className = 'paradox-nav-links';

        links.forEach(linkNode => {
          const href = linkNode.getAttribute('href');
          if (!href) {
            return;
          }

          const item = document.createElement('li');
          const link = document.createElement('a');
          const parentCategory = linkNode.closest('.sidebar-category');
          const categoryName = parentCategory?.querySelector('.category-title span:last-child')?.textContent?.trim() || '';
          const searchableText = localNormalize([linkNode.textContent.trim(), categoryName, sectionTitle].join(' '));

          link.href = href;
          link.textContent = linkNode.textContent.trim();
          link.className = 'paradox-nav-link';
          link.setAttribute('data-search', searchableText);
          if (categoryName) {
            link.setAttribute('data-category', categoryName);
          }

          if (linkNode.closest('.sidebar-item')?.classList.contains('active')) {
            link.classList.add('is-current');
          }

          item.appendChild(link);
          list.appendChild(item);
          totalLinkCount += 1;
        });

        card.appendChild(heading);
        card.appendChild(list);
        grid.appendChild(card);

        if (shortcuts) {
          const sectionShortcut = document.createElement('button');
          sectionShortcut.type = 'button';
          sectionShortcut.className = 'paradox-shortcut';
          sectionShortcut.textContent = sectionTitle + ' (' + links.length + ')';
          sectionShortcut.setAttribute('data-target', card.id);
          sectionShortcut.addEventListener('click', function() {
            const target = document.getElementById(card.id);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
          shortcuts.appendChild(sectionShortcut);
        }
      });

      if (totalTopics) {
        totalTopics.textContent = cardCount + ' espaces';
      }
      if (totalPosts) {
        totalPosts.textContent = totalLinkCount + ' articles';
      }
      if (visiblePosts) {
        visiblePosts.textContent = totalLinkCount + ' visibles';
      }
    }

    const searchInput = overlay.querySelector('#paradox-nav-search');
    if (searchInput) {
      searchInput.value = '';
      searchInput.addEventListener('input', function() {
        const query = localNormalize(searchInput.value.trim());
        const allCards = Array.from(overlay.querySelectorAll('.paradox-nav-card'));
        const allLinks = Array.from(overlay.querySelectorAll('.paradox-nav-link'));
        let visibleCount = 0;

        allLinks.forEach(link => {
          const matches = !query || (link.getAttribute('data-search') || '').includes(query);
          const listItem = link.closest('li');
          if (listItem) {
            listItem.style.display = matches ? '' : 'none';
          }
          if (matches) {
            visibleCount += 1;
          }
        });

        allCards.forEach(card => {
          const hasVisibleItem = !!card.querySelector('li:not([style*="display: none"])');
          card.style.display = hasVisibleItem ? '' : 'none';
        });

        if (visiblePosts) {
          visiblePosts.textContent = visibleCount + ' visibles';
        }
      });
    }

    const randomButton = overlay.querySelector('#paradox-random-link');
    if (randomButton) {
      randomButton.addEventListener('click', function() {
        const visibleLinks = Array.from(overlay.querySelectorAll('.paradox-nav-link')).filter(link => {
          const li = link.closest('li');
          const card = link.closest('.paradox-nav-card');
          return (!li || li.style.display !== 'none') && (!card || card.style.display !== 'none');
        });

        if (!visibleLinks.length) {
          return;
        }

        const pick = visibleLinks[Math.floor(Math.random() * visibleLinks.length)];
        const targetHref = pick.getAttribute('href');
        if (targetHref) {
          window.location.href = targetHref;
        }
      });
    }

    const closeOverlay = function() {
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('paradox-nav-open');
    };

    const openOverlay = function() {
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('paradox-nav-open');
    };

    trigger.addEventListener('click', function() {
      if (overlay.classList.contains('show')) {
        closeOverlay();
      } else {
        openOverlay();
      }
    });

    overlay.addEventListener('click', function(event) {
      if (event.target === overlay) {
        closeOverlay();
      }
    });

    overlay.querySelector('.paradox-nav-close')?.addEventListener('click', closeOverlay);

    overlay.querySelectorAll('.paradox-nav-link').forEach(link => {
      link.addEventListener('click', closeOverlay);
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && overlay.classList.contains('show')) {
        closeOverlay();
      }
    });

    syncParadoxUiState = function() {
      const isParadox = localStorage.getItem('nav-style') === 'paradoxe';
      trigger.hidden = !isParadox;

      if (!isParadox) {
        closeOverlay();
      }
    };

    syncParadoxUiState();
  };

  buildParadoxNavigation();

  // Global header search (all pages) + advanced keyword matching
  const appHeader = document.querySelector('.app-header');

  const ensureHeaderSearch = function() {
    if (!appHeader || document.getElementById('course-search')) {
      return;
    }

    const searchContainer = document.createElement('div');
    searchContainer.className = 'header-search';
    searchContainer.setAttribute('role', 'search');
    searchContainer.setAttribute('aria-label', 'Recherche de blogs');
    searchContainer.innerHTML =
      '<div class="search-input-wrap">' +
      '<i class="fas fa-search" aria-hidden="true"></i>' +
      '<input type="search" id="course-search" placeholder="Ex: docker, pydantic, sql, async..." autocomplete="off">' +
      '<button type="button" id="course-search-clear" class="search-clear" aria-label="Effacer la recherche">Effacer</button>' +
      '</div>' +
      '<div id="search-suggestions" class="search-suggestions" hidden>' +
      '<p class="search-suggestions-title">Blogs suggérés</p>' +
      '<ul id="search-suggestions-list" class="search-suggestions-list"></ul>' +
      '</div>';

    const headerActions = appHeader.querySelector('.app-header-actions');
    if (headerActions) {
      appHeader.insertBefore(searchContainer, headerActions);
    } else {
      appHeader.appendChild(searchContainer);
    }
  };

  ensureHeaderSearch();

  const searchInput = document.getElementById('course-search');
  const searchClearButton = document.getElementById('course-search-clear');
  const suggestionsBox = document.getElementById('search-suggestions');
  const suggestionsList = document.getElementById('search-suggestions-list');

  const normalizeText = function(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const tokenizeQuery = function(query) {
    const normalized = normalizeText(query || '');
    const camelSplit = (query || '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return Array.from(new Set((normalized + ' ' + camelSplit)
      .split(/[^a-z0-9]+/)
      .filter(Boolean)));
  };

  const escapeRegExp = function(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const buildFlexibleRegex = function(tokens) {
    if (!tokens.length) {
      return null;
    }

    const lookaheads = tokens.map(token => {
      const flexibleToken = token
        .split('')
        .map(char => escapeRegExp(char))
        .join('[^a-z0-9]{0,2}');
      return '(?=.*' + flexibleToken + ')';
    }).join('');

    return new RegExp(lookaheads + '.*', 'i');
  };

  const extractSearchableTextFromHtml = function(htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const title = doc.querySelector('title')?.textContent || '';
    const h1 = doc.querySelector('h1')?.textContent || '';
    const mainText = doc.querySelector('main')?.textContent || doc.body?.textContent || '';
    return normalizeText((title + ' ' + h1 + ' ' + mainText).slice(0, 40000));
  };

  const getEntriesFromSidebar = function() {
    const anchors = Array.from(document.querySelectorAll('.app-sidebar .sidebar-item a'));
    const seen = new Set();
    const entries = [];

    anchors.forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (!href || seen.has(href) || href.endsWith('index.html')) {
        return;
      }

      seen.add(href);
      const title = anchor.textContent.trim();
      const category = anchor.closest('.sidebar-category')?.querySelector('.category-title span:last-child')?.textContent.trim() || '';
      const slug = href.split('/').pop();
      const slugTokens = normalizeText(slug.replace(/\.html$/i, '').replace(/[-_]/g, ' '));
      const searchable = normalizeText([title, category, slugTokens].join(' '));

      entries.push({
        href,
        title,
        category,
        searchable,
        contentSearchable: ''
      });
    });

    return entries;
  };

  const hydrateEntriesWithPageContent = async function(entries) {
    await Promise.all(entries.map(async entry => {
      try {
        const response = await fetch(entry.href);
        if (!response.ok) {
          return;
        }
        const html = await response.text();
        entry.contentSearchable = extractSearchableTextFromHtml(html);
      } catch (error) {
        // Ignore fetch/parsing issues (file:// mode or blocked requests).
      }
    }));
  };

  const homepageSectionGroups = Array.from(document.querySelectorAll('.section-group'));
  const isHomeWithSections = homepageSectionGroups.length > 0;
  let searchResultsView = document.getElementById('search-results-view');
  let searchResultsList = document.getElementById('search-results-list');
  let searchResultsSubtitle = document.getElementById('search-results-subtitle');

  if (isHomeWithSections && !searchResultsView) {
    const courseHeader = document.querySelector('.course-header');
    const resultsNode = document.createElement('section');
    resultsNode.id = 'search-results-view';
    resultsNode.className = 'search-results-view';
    resultsNode.innerHTML =
      '<h2 class="search-results-title">Résultats de recherche</h2>' +
      '<p id="search-results-subtitle" class="search-results-subtitle"></p>' +
      '<ul id="search-results-list" class="search-results-list"></ul>';

    if (courseHeader && courseHeader.parentNode) {
      courseHeader.parentNode.insertBefore(resultsNode, courseHeader.nextSibling);
      searchResultsView = resultsNode;
      searchResultsList = resultsNode.querySelector('#search-results-list');
      searchResultsSubtitle = resultsNode.querySelector('#search-results-subtitle');
    }
  }

  if (searchInput) {
    const entries = getEntriesFromSidebar();
    hydrateEntriesWithPageContent(entries);

    const rankEntries = function(query) {
      const normalizedQuery = normalizeText(query.trim());
      if (!normalizedQuery) {
        return [];
      }

      const tokens = tokenizeQuery(query);
      const regex = buildFlexibleRegex(tokens);

      return entries.map(entry => {
        let score = 0;
        const titleNorm = normalizeText(entry.title);
        const categoryNorm = normalizeText(entry.category);
        const contentNorm = entry.contentSearchable || '';
        const combined = entry.searchable + ' ' + contentNorm;

        if (combined.includes(normalizedQuery)) {
          score += 14;
        }

        if (regex && regex.test(combined)) {
          score += 12;
        }

        tokens.forEach(token => {
          if (titleNorm.includes(token)) {
            score += 10;
          }
          if (categoryNorm.includes(token)) {
            score += 5;
          }
          if (contentNorm.includes(token)) {
            score += 6;
          }
          if (combined.includes(token)) {
            score += 2;
          }
        });

        return { entry, score };
      }).filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.entry);
    };

    const renderSuggestions = function(matches) {
      if (!suggestionsBox || !suggestionsList) {
        return;
      }

      suggestionsList.innerHTML = '';

      if (matches.length === 0) {
        suggestionsBox.hidden = true;
        return;
      }

      matches.slice(0, 8).forEach(match => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = match.href;
        link.textContent = match.title + (match.category ? ' (' + match.category + ')' : '');
        item.appendChild(link);
        suggestionsList.appendChild(item);
      });

      suggestionsBox.hidden = false;
    };

    const renderHomepageResults = function(matches, query) {
      if (!isHomeWithSections || !searchResultsView || !searchResultsList || !searchResultsSubtitle) {
        return;
      }

      searchResultsList.innerHTML = '';

      if (!query) {
        document.body.classList.remove('search-mode');
        return;
      }

      document.body.classList.add('search-mode');

      if (matches.length === 0) {
        searchResultsSubtitle.textContent = 'Aucun blog trouvé pour "' + query + '".';
        return;
      }

      searchResultsSubtitle.textContent = matches.length + ' blog(s) trouvé(s) pour "' + query + '".';

      matches.forEach(match => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        const meta = document.createElement('span');

        link.className = 'search-results-link';
        link.href = match.href;
        link.textContent = match.title;

        meta.className = 'search-results-meta';
        meta.textContent = match.category ? 'Catégorie : ' + match.category : 'Blog';

        item.appendChild(link);
        item.appendChild(meta);
        searchResultsList.appendChild(item);
      });
    };

    const applySearch = function() {
      const query = searchInput.value.trim();
      const matches = rankEntries(query);
      renderSuggestions(matches);
      renderHomepageResults(matches, query);
    };

    searchInput.addEventListener('input', applySearch);
    searchInput.addEventListener('focus', function() {
      applySearch();
    });

    document.addEventListener('click', function(event) {
      if (!suggestionsBox || !searchInput) {
        return;
      }

      const searchContainer = searchInput.closest('.header-search');
      if (searchContainer && !searchContainer.contains(event.target)) {
        suggestionsBox.hidden = true;
      }
    });

    if (searchClearButton) {
      searchClearButton.addEventListener('click', function() {
        searchInput.value = '';
        if (suggestionsBox) {
          suggestionsBox.hidden = true;
        }
        document.body.classList.remove('search-mode');
        if (searchResultsList) {
          searchResultsList.innerHTML = '';
        }
        searchInput.focus();
      });
    }
  }
  
  // Syntax highlighting
  document.querySelectorAll('pre code').forEach(block => {
    if (window.Prism) {
      Prism.highlightElement(block);
    }
  });
});
