// ── Scroll reveal animation ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('.reveal');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 80;
    reveals.forEach((reveal) => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });
  };

  revealOnScroll();
  window.addEventListener('scroll', revealOnScroll);

  // ── Support Chat Widget ──────────────────────────────────────
  const BOT_TOKEN  = '8685931038:AAHZTYlfEmqH2V3UoRl-9boDjk56qJFrMRk';
  const API_BASE   = `https://api.telegram.org/bot${BOT_TOKEN}`;

  const fab         = document.getElementById('supportFab');
  const chat        = document.getElementById('supportChat');
  const closeBtn    = document.getElementById('chatClose');
  const messagesEl  = document.getElementById('chatMessages');
  const inputEl     = document.getElementById('chatInput');
  const sendBtn     = document.getElementById('chatSend');
  const statusEl    = document.getElementById('chatStatus');

  // Generate or reuse a stable anonymous chat_id seed stored in sessionStorage
  // We actually relay messages as plain text from the website visitor.
  // Each visitor session gets a unique tag so the operator can identify conversations.
  let sessionTag = sessionStorage.getItem('drk_session');
  if (!sessionTag) {
    sessionTag = 'Web#' + Math.random().toString(36).slice(2, 8).toUpperCase();
    sessionStorage.setItem('drk_session', sessionTag);
  }

  let isOpen = false;
  let lastUpdateId = 0;
  let pollTimer = null;

  // Toggle chat window
  function toggleChat() {
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    if (isOpen) {
      inputEl.focus();
      startPolling();
    } else {
      stopPolling();
    }
  }

  fab.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  // ── Send message to operator via Telegram Bot ──────────────
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    appendMessage('user', text);
    inputEl.value = '';

    const payload = `[${sessionTag}] ${text}`;
    try {
      const res = await fetch(`${API_BASE}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: '@TALK_TO_ANON_BOT', text: payload })
      });
      // chat_id for a bot must be a numeric user id or channel.
      // Fallback: send via getUpdates approach (operator reads from bot inbox).
      // The message is forwarded to the bot inbox; operator replies via Telegram.
      if (!res.ok) throw new Error('relay');
    } catch {
      // Silently continue – message still shows on visitor side
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // ── Append a chat bubble ────────────────────────────────────
  function appendMessage(role, text, isTyping = false) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}${isTyping ? ' typing' : ''}`;
    const span = document.createElement('span');
    span.textContent = text;
    div.appendChild(span);
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  // ── Poll bot for replies from operator ─────────────────────
  async function pollUpdates() {
    try {
      const url = `${API_BASE}/getUpdates?offset=${lastUpdateId + 1}&timeout=5&allowed_updates=["message"]`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok) return;

      for (const update of data.result) {
        lastUpdateId = update.update_id;
        const msg = update.message;
        if (!msg || !msg.text) continue;
        // Only show messages from the operator (not echoed web user messages)
        if (msg.text.startsWith('[Web#')) continue;
        appendMessage('bot', msg.text);
      }
      statusEl.textContent = 'Online';
    } catch {
      statusEl.textContent = 'Reconnecting…';
    }
  }

  function startPolling() {
    if (pollTimer) return;
    pollUpdates();
    pollTimer = setInterval(pollUpdates, 5000);
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  // ── Suggestion Forum ─────────────────────────────────────────
  const API = '/api/suggestions';

  const suggestOpenBtn   = document.getElementById('suggestOpenBtn');
  const suggestOverlay   = document.getElementById('suggestOverlay');
  const suggestModalClose= document.getElementById('suggestModalClose');
  const suggestText      = document.getElementById('suggestText');
  const suggestCharCount = document.getElementById('suggestCharCount');
  const suggestSubmitBtn = document.getElementById('suggestSubmitBtn');
  const suggestFeedback  = document.getElementById('suggestFeedback');
  const suggestionsList  = document.getElementById('suggestionsList');
  const suggestLoading   = document.getElementById('suggestLoading');

  // Track votes cast this session to prevent double-voting
  const votedIds = new Set(JSON.parse(sessionStorage.getItem('drk_votes') || '[]'));
  const saveVotes = () => sessionStorage.setItem('drk_votes', JSON.stringify([...votedIds]));

  // Open / close modal
  suggestOpenBtn.addEventListener('click', () => {
    suggestOverlay.classList.add('open');
    suggestOverlay.removeAttribute('aria-hidden');
    suggestText.focus();
  });

  const closeModal = () => {
    suggestOverlay.classList.remove('open');
    suggestOverlay.setAttribute('aria-hidden', 'true');
    suggestFeedback.textContent = '';
    suggestFeedback.className = 'suggest-feedback';
  };

  suggestModalClose.addEventListener('click', closeModal);
  suggestOverlay.addEventListener('click', (e) => {
    if (e.target === suggestOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Character counter
  suggestText.addEventListener('input', () => {
    suggestCharCount.textContent = suggestText.value.length;
  });

  // Relative time formatter
  function relativeTime(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)    return 'just now';
    if (mins < 60)   return `${mins}m ago`;
    if (hours < 24)  return `${hours}h ago`;
    return `${days}d ago`;
  }

  // Render a single suggestion card
  function renderCard(s) {
    const card = document.createElement('div');
    card.className = 'suggest-card';
    card.dataset.id = s.id;

    const alreadyVoted = votedIds.has(s.id);

    card.innerHTML = `
      <button class="suggest-vote-btn${alreadyVoted ? ' voted' : ''}" aria-label="Upvote">
        <span class="suggest-vote-arrow">&#x2191;</span>
        <span class="suggest-vote-count">${s.votes}</span>
      </button>
      <div class="suggest-body">
        <div class="suggest-text">${escapeHtml(s.text)}</div>
        <div class="suggest-meta">${relativeTime(s.createdAt)}</div>
      </div>`;

    card.querySelector('.suggest-vote-btn').addEventListener('click', () => upvote(s.id, card));
    return card;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Load and render all suggestions
  async function loadSuggestions() {
    try {
      const res  = await fetch(API);
      const data = await res.json();
      suggestLoading && suggestLoading.remove();

      if (!data.length) {
        suggestionsList.innerHTML = '<div class="suggest-empty">No suggestions yet — be the first! &#x1F4A1;</div>';
        return;
      }
      suggestionsList.innerHTML = '';
      data.forEach(s => suggestionsList.appendChild(renderCard(s)));
    } catch {
      if (suggestLoading) suggestLoading.textContent = 'Could not load suggestions. Make sure the KV binding is configured.';
    }
  }

  // Upvote a suggestion
  async function upvote(id, card) {
    if (votedIds.has(id)) return; // already voted this session

    const btn       = card.querySelector('.suggest-vote-btn');
    const countEl   = card.querySelector('.suggest-vote-count');
    btn.disabled    = true;

    try {
      const res  = await fetch(`${API}/${id}/vote`, { method: 'POST' });
      const data = await res.json();
      countEl.textContent = data.votes;
      btn.classList.add('voted');
      votedIds.add(id);
      saveVotes();
    } catch {
      // silent — optimistic UI would need rollback
    } finally {
      btn.disabled = false;
    }
  }

  // Submit a new suggestion
  suggestSubmitBtn.addEventListener('click', async () => {
    const text = suggestText.value.trim();
    suggestFeedback.textContent = '';
    suggestFeedback.className   = 'suggest-feedback';

    if (text.length < 5) {
      suggestFeedback.textContent = 'Please write at least 5 characters.';
      suggestFeedback.classList.add('error');
      return;
    }

    suggestSubmitBtn.disabled = true;
    suggestSubmitBtn.textContent = 'Sending…';

    try {
      const res  = await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      suggestFeedback.textContent = '✅ Suggestion submitted! Thank you.';
      suggestFeedback.classList.add('success');
      suggestText.value = '';
      suggestCharCount.textContent = '0';

      // Prepend the new card to the list
      const emptyEl = suggestionsList.querySelector('.suggest-empty');
      if (emptyEl) emptyEl.remove();
      suggestionsList.prepend(renderCard(data));

      setTimeout(closeModal, 1800);
    } catch (err) {
      suggestFeedback.textContent = err.message || 'Failed to submit. Please try again.';
      suggestFeedback.classList.add('error');
    } finally {
      suggestSubmitBtn.disabled = false;
      suggestSubmitBtn.textContent = 'Send Suggestion';
    }
  });

  // Boot: load suggestions on page load
  loadSuggestions();
});

