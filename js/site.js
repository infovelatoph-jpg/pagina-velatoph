document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('aiChatToggle');
  const panel = document.getElementById('aiChatPanel');
  const closeBtn = document.getElementById('aiChatClose');
  const form = document.getElementById('aiChatForm');
  const input = document.getElementById('aiChatInput');
  const body = panel ? panel.querySelector('.ai-chat-body') : null;
  const chips = panel ? panel.querySelectorAll('.ai-chip') : [];

  if (!toggle || !panel || !body) return;

  const openPanel = () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (input) input.focus();
  };

  const closePanel = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  };

  const addBubble = (text, kind = 'bot') => {
    const bubble = document.createElement('div');
    bubble.className = `ai-bubble ${kind === 'user' ? 'ai-bubble-user' : 'ai-bubble-bot'}`;
    bubble.textContent = text;
    body.appendChild(bubble);
    body.scrollTop = body.scrollHeight;
  };

  const addUserMessage = (text) => addBubble(text, 'user');
  const addBotMessage = (text) => addBubble(text, 'bot');

  const addThinking = () => {
    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble ai-bubble-bot';
    bubble.textContent = 'Pensando…';
    bubble.dataset.thinking = 'true';
    body.appendChild(bubble);
    body.scrollTop = body.scrollHeight;
    return bubble;
  };

  const removeThinking = () => {
    const thinking = body.querySelector('[data-thinking="true"]');
    if (thinking) thinking.remove();
  };

  const answerPrompt = async (text) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No fue posible obtener respuesta del asistente.');
    }
    return data.reply || 'No pude generar una respuesta en este momento.';
  };

  toggle.addEventListener('click', () => {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });

  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  chips.forEach((chip) => {
    chip.addEventListener('click', async () => {
      const text = chip.textContent.trim();
      addUserMessage(text);
      const thinking = addThinking();
      try {
        const reply = await answerPrompt(text);
        removeThinking();
        addBotMessage(reply);
        if (text.toLowerCase().includes('whatsapp')) {
          window.open('https://wa.me/523121892161', '_blank');
        }
      } catch (error) {
        removeThinking();
        addBotMessage(error.message || 'Ocurrió un problema al consultar el asistente.');
      }
    });
  });

  if (form && input) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addUserMessage(text);
      input.value = '';
      addThinking();
      try {
        const reply = await answerPrompt(text);
        removeThinking();
        addBotMessage(reply);
      } catch (error) {
        removeThinking();
        addBotMessage(error.message || 'Ocurrió un problema al consultar el asistente.');
      }
    });
  }
});
