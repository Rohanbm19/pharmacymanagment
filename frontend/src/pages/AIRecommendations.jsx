import { useEffect, useState } from 'react';
import { Send, Bot, LoaderCircle } from 'lucide-react';
import { getAIRecommendations, getMedicines } from '../services/api';

const starterMessage = {
  role: 'bot',
  text: 'Ask me about fever, cough, headache, allergy, stomach pain, or any other common symptom, and I will suggest the best care guidance.'
};

export default function AIRecommendations() {
  const [medicines, setMedicines] = useState([]);
  const [input, setInput] = useState('fever');
  const [messages, setMessages] = useState([starterMessage]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await getMedicines();
        const items = Array.isArray(response.data) ? response.data : response.data?.medicines || [];
        setMedicines(items);
      } catch (error) {
        console.error('Failed to load medicines for AI recommendations', error);
      }
    };

    fetchMedicines();
  }, []);

  const askBot = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await getAIRecommendations({ question: trimmed, medicines });
      const payload = response.data || {};
      const answer = payload.answer || payload.summary || 'I can help with common symptom guidance. Please describe the problem more clearly.';

      setMessages((prev) => [...prev, { role: 'bot', text: answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'bot',
        text: 'For fever or pain, rest, hydrate, and use gentle medicines only as directed. Please consult a pharmacist or doctor if symptoms worsen or continue.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      askBot();
    }
  };

  return (
    <div className="chatbot-shell">
      <div className="chatbot-card">
        <div className="chatbot-header">
          <div className="bot-icon"><Bot size={18} /></div>
          <div>
            <h3>AI Pharmacy Assistant</h3>
            <p>Ask about symptoms and care</p>
          </div>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={`${msg.role}-${index}`} className={`chat-message ${msg.role}`}>
              <div className="bubble">
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message bot">
              <div className="bubble typing">
                <LoaderCircle size={16} className="spinner" /> Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="chatbot-input-row">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Ask me about fever, cough, headache, allergy, diarrhea..."
          />
          <button className="send-btn" onClick={askBot} disabled={loading}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
