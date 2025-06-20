document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded and script running');
  
  // Set default theme if none is selected
  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'light');
  }
  
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme');
  document.body.className = ''; // Clear all classes first
  document.body.classList.add('theme-' + savedTheme);
  console.log('Applied theme:', savedTheme);
  
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
      console.log('Theme dropdown toggled');
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
        console.log('Theme selected:', selectedTheme);
        
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
  
  // Syntax highlighting
  document.querySelectorAll('pre code').forEach(block => {
    if (window.Prism) {
      Prism.highlightElement(block);
    }
  });
});
