document.addEventListener('DOMContentLoaded', function() {
  // Set default theme if none is selected
  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'light');
  }
  
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme');
  document.body.className = ''; // Clear all classes first
  document.body.classList.add('theme-' + savedTheme);
  
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
        
        // Remove all theme classes
        document.body.className = '';
        
        // Add selected theme class
        document.body.classList.add('theme-' + selectedTheme);
        
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
      '<p class="search-suggestions-title">Blogs suggerés</p>' +
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
      '<h2 class="search-results-title">Resultats de recherche</h2>' +
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
        searchResultsSubtitle.textContent = 'Aucun blog trouve pour "' + query + '".';
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
        meta.textContent = match.category ? 'Categorie: ' + match.category : 'Blog';

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
