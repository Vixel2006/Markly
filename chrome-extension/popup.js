document.addEventListener('DOMContentLoaded', async () => {
  const loginSection = document.getElementById('loginSection');
  const bookmarkSection = document.getElementById('bookmarkSection');
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginMessageDiv = document.getElementById('loginMessage');
  const loginBtn = document.getElementById('loginBtn');

  const urlInput = document.getElementById('url');
  const titleInput = document.getElementById('title');
  const addBookmarkBtn = document.getElementById('addBookmarkBtn');
  const bookmarkMessageDiv = document.getElementById('bookmarkMessage');
  const logoutBtn = document.getElementById('logoutBtn');

  const MARKLY_API_BASE_URL = 'http://localhost:8080/api'; // Base URL for your Markly backend API

  let authToken = null;

  const updateUI = (loggedIn) => {
    if (loggedIn) {
      loginSection.style.display = 'none';
      bookmarkSection.style.display = 'block';
      // Get current tab URL and title
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab) {
          urlInput.value = currentTab.url;
          titleInput.value = currentTab.title;
        }
      });
    } else {
      loginSection.style.display = 'block';
      bookmarkSection.style.display = 'none';
      emailInput.value = '';
      passwordInput.value = '';
    }
  };

  // Check for existing token on load
  chrome.storage.sync.get(['marklyAuthToken'], (result) => {
    authToken = result.marklyAuthToken || null;
    updateUI(!!authToken);
  });

  // Handle Login
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginBtn.disabled = true;
    loginMessageDiv.textContent = 'Logging in...';

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const response = await fetch(`${MARKLY_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        authToken = data.token; // Assuming your backend returns a 'token' field
        await chrome.storage.sync.set({ marklyAuthToken: authToken });
        loginMessageDiv.textContent = 'Login successful!';
        updateUI(true);
      } else {
        const errorData = await response.json();
        loginMessageDiv.textContent = `Login failed: ${errorData.message || response.statusText}`;
      }
    } catch (error) {
      loginMessageDiv.textContent = `Network error: ${error.message}`;
    } finally {
      loginBtn.disabled = false;
    }
  });

  // Handle Add Bookmark
  addBookmarkBtn.addEventListener('click', async () => {
    const url = urlInput.value;
    const title = titleInput.value;

    if (!url || !title) {
      bookmarkMessageDiv.textContent = 'URL and Title cannot be empty.';
      return;
    }

    bookmarkMessageDiv.textContent = 'Adding bookmark...';
    addBookmarkBtn.disabled = true;

    try {
      const response = await fetch(`${MARKLY_API_BASE_URL}/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ url, title }),
      });

      if (response.ok) {
        bookmarkMessageDiv.textContent = 'Bookmark added successfully!';
        // Optionally clear fields or close popup
      } else {
        const errorData = await response.json();
        bookmarkMessageDiv.textContent = `Error: ${errorData.message || response.statusText}`;
      }
    } catch (error) {
      bookmarkMessageDiv.textContent = `Network error: ${error.message}`;
    } finally {
      addBookmarkBtn.disabled = false;
    }
  });

  // Handle Logout
  logoutBtn.addEventListener('click', async () => {
    authToken = null;
    await chrome.storage.sync.remove('marklyAuthToken');
    updateUI(false);
    bookmarkMessageDiv.textContent = ''; // Clear any previous messages
  });
});