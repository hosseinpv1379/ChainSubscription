// Utility function for debouncing
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
  };
};

// Core functionality manager
class ContentManager {
  constructor() {
      this.init();
  }

  init() {
      this.setupTheme();
      this.setupNavigation();
      this.setupTableOfContents();
      this.setupSearch();
      this.setupScrollFeatures();
  }

  // Theme handling
  setupTheme() {
      const themeToggle = document.createElement('button');
      themeToggle.className = 'theme-toggle';
      themeToggle.innerHTML = '🌓';
      document.body.appendChild(themeToggle);

      const toggleTheme = () => {
          const isDark = document.body.classList.toggle('dark-theme');
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
      };

      // Initialize theme
      if (localStorage.getItem('theme') === 'dark') {
          document.body.classList.add('dark-theme');
      }

      themeToggle.addEventListener('click', toggleTheme);
  }

  // Navigation and scroll features
  setupNavigation() {
      // Smooth scroll for anchor links
      document.querySelectorAll('a[href^="#"]').forEach(link => {
          link.addEventListener('click', (e) => {
              e.preventDefault();
              const target = document.querySelector(link.getAttribute('href'));
              if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
          });
      });

      // Add active class to current section
      const sections = document.querySelectorAll('.container[id]');
      window.addEventListener('scroll', debounce(() => {
          let currentSection = '';
          sections.forEach(section => {
              const sectionTop = section.offsetTop;
              if (window.pageYOffset >= sectionTop - 100) {
                  currentSection = section.getAttribute('id');
              }
          });

          document.querySelectorAll('.nav-link').forEach(link => {
              link.classList.toggle('active', 
                  link.getAttribute('href') === `#${currentSection}`);
          });
      }, 100));
  }

  // Table of contents
  setupTableOfContents() {
      const toc = document.createElement('div');
      toc.className = 'toc';
      
      const title = document.createElement('h3');
      title.textContent = 'فهرست مطالب';
      toc.appendChild(title);

      const list = document.createElement('ol');
      
      document.querySelectorAll('h3, h4').forEach((heading, index) => {
          const id = heading.id || `section-${index}`;
          heading.id = id;

          const item = document.createElement('li');
          const link = document.createElement('a');
          
          link.href = `#${id}`;
          link.textContent = heading.textContent;
          link.className = heading.tagName === 'H4' ? 'toc-sub-item' : 'toc-item';

          item.appendChild(link);
          list.appendChild(item);
      });

      toc.appendChild(list);
      const firstContainer = document.querySelector('.container');
      if (firstContainer) {
          firstContainer.insertBefore(toc, firstContainer.firstChild);
      }
  }

  // Search functionality
  setupSearch() {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'search-container';
      searchContainer.innerHTML = `
          <input type="text" class="search-input" placeholder="جستجو...">
          <div class="search-results"></div>
      `;

      document.querySelector('.header').appendChild(searchContainer);

      const searchInput = searchContainer.querySelector('.search-input');
      const resultsContainer = searchContainer.querySelector('.search-results');

      const searchContent = debounce((query) => {
          if (query.length < 2) {
              resultsContainer.innerHTML = '';
              return;
          }

          const results = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, li'))
              .filter(element => element.textContent.toLowerCase().includes(query))
              .slice(0, 5);

          if (results.length === 0) {
              resultsContainer.innerHTML = '<div class="no-results">نتیجه‌ای یافت نشد</div>';
              return;
          }

          resultsContainer.innerHTML = results
              .map(element => `
                  <div class="search-result">
                      <div class="result-text">${this.truncateText(element.textContent)}</div>
                  </div>
              `).join('');

          resultsContainer.querySelectorAll('.search-result').forEach((result, index) => {
              result.addEventListener('click', () => {
                  results[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                  results[index].classList.add('highlight');
                  setTimeout(() => results[index].classList.remove('highlight'), 2000);
                  resultsContainer.innerHTML = '';
                  searchInput.value = '';
              });
          });
      }, 300);

      searchInput.addEventListener('input', (e) => searchContent(e.target.value.toLowerCase()));
  }

  // Scroll features
  setupScrollFeatures() {
      // Scroll to top button
      const scrollButton = document.createElement('button');
      scrollButton.className = 'scroll-top';
      scrollButton.innerHTML = '↑';
      document.body.appendChild(scrollButton);

      scrollButton.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      // Progress bar
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      document.body.appendChild(progressBar);

      // Handle scroll events
      window.addEventListener('scroll', debounce(() => {
          // Update scroll button visibility
          scrollButton.classList.toggle('visible', window.pageYOffset > 300);

          // Update progress bar
          const winScroll = document.documentElement.scrollTop;
          const height = document.documentElement.scrollHeight - window.innerHeight;
          const scrolled = (winScroll / height) * 100;
          progressBar.style.width = scrolled + '%';
      }, 100));
  }

  // Helper function for truncating text
  truncateText(text, maxLength = 150) {
      return text.length > maxLength ? text.substr(0, maxLength) + '...' : text;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new ContentManager());
