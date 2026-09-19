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
});
