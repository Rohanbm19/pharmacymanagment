const OpenAI = require('openai');

const aiClient = process.env.GROK_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: 'https://api.x.ai/v1'
    })
  : null;

const normalizeQuestion = (question = '') => String(question || '').trim().toLowerCase();

const getDiseaseProfile = (question) => {
  const text = normalizeQuestion(question);

  if (/(fever|high temperature|pyrexia)/.test(text)) {
    return {
      condition: 'Fever',
      medicines: [
        'Paracetamol / acetaminophen may help reduce fever and body aches when used as directed.',
        'Hydration support with water, oral rehydration salts, and light fluids is important.'
      ],
      precautions: [
        'Check temperature and avoid taking fever medicine repeatedly without a doctor\'s guidance.',
        'Seek medical attention if fever lasts more than 3 days, is very high, or comes with breathing trouble.'
      ],
      tips: [
        'Rest, keep the room cool, and drink fluids regularly.',
        'Avoid heavy meals and keep a simple diet while the fever continues.'
      ]
    };
  }

  if (/(cough|cold|flu|sore throat|runny nose)/.test(text)) {
    return {
      condition: 'Cold / Cough / Flu-like symptoms',
      medicines: [
        'Warm fluids, honey for cough relief in adults, and a simple saline nasal rinse may help.',
        'A pharmacist can suggest a cough syrup or decongestant depending on symptoms.'
      ],
      precautions: [
        'Avoid smoking, cold drafts, and overheating.',
        'Seek care if cough is severe, associated with chest pain, or lasts more than a week.'
      ],
      tips: [
        'Rest, steam inhalation, and warm water can reduce irritation.',
        'Monitor for fever, body weakness, or breathing difficulty.'
      ]
    };
  }

  if (/(headache|migraine|pain in head)/.test(text)) {
    return {
      condition: 'Headache',
      medicines: [
        'Paracetamol may give short-term relief for mild headache when used as directed.',
        'Avoid overuse of pain medicine and keep a regular sleep pattern.'
      ],
      precautions: [
        'Do not take pain tablets repeatedly for a long time without checking with a pharmacist.',
        'Urgent evaluation is needed if the headache is sudden, severe, or with weakness, confusion, or vomiting.'
      ],
      tips: [
        'Stay hydrated, reduce screen time, and rest in a quiet room.',
        'A regular meal and good sleep often help with tension headache.'
      ]
    };
  }

  if (/(stomach pain|abdomen pain|indigestion|gas|diarrhea|vomiting)/.test(text)) {
    return {
      condition: 'Digestive upset',
      medicines: [
        'Oral rehydration solution helps when there is diarrhea or vomiting.',
        'Antacid or digestive support may help mild indigestion, but use only as directed.'
      ],
      precautions: [
        'Avoid oily or spicy food until symptoms settle.',
        'Seek medical help for severe abdominal pain, blood in stool, persistent vomiting, or dehydration.'
      ],
      tips: [
        'Drink clean water and small frequent sips instead of large amounts at once.',
        'Rest and avoid heavy meals until you feel better.'
      ]
    };
  }

  if (/(allergy|itching|rash|sneezing|runny eyes)/.test(text)) {
    return {
      condition: 'Allergy / itching',
      medicines: [
        'An antihistamine may help with itching, sneezing, or mild allergy symptoms when used as directed.',
        'A gentle soothing lotion or cool compress can help skin irritation.'
      ],
      precautions: [
        'Avoid the trigger, such as dust, pollen, or a specific food.',
        'Seek urgent medical help if you develop swelling, breathing trouble, or a severe rash.'
      ],
      tips: [
        'Wash hands regularly and keep the environment clean and dry.',
        'Use an allergy-safe routine and avoid scratching.'
      ]
    };
  }

  return {
    condition: 'General wellness check',
    medicines: [
      'Supportive care and a pharmacist review are helpful for mild common symptoms.',
      'Avoid self-medicating with strong antibiotics or pain medications without guidance.'
    ],
    precautions: [
      'Do not ignore worsening symptoms, high fever, breathing difficulty, or severe pain.',
      'If symptoms are new or severe, consult a doctor or pharmacist.'
    ],
    tips: [
      'Drink enough fluids, rest, and reduce heavy activity while recovering.',
      'Track symptoms and note if they worsen or last longer than expected.'
    ]
  };
};

const buildLocalRecommendations = ({ question, medicines = [] }) => {
  const profile = getDiseaseProfile(question);
  const diseaseText = profile.condition || 'General health concern';

  const answer = `For ${diseaseText.toLowerCase()}, the safest first approach is supportive care, hydration, rest, and checking for worsening symptoms. Use the medicines below only as directed, and contact a doctor if the condition becomes severe or persists.`;

  return {
    source: 'local',
    condition: diseaseText,
    summary: `For ${diseaseText.toLowerCase()}, the safest first-line approach is supportive care, a symptom-focused medicine review, and monitoring for worsening symptoms.`,
    answer,
    recommendations: [
      {
        title: 'Medicines',
        items: profile.medicines
      },
      {
        title: 'Precautions',
        items: profile.precautions
      },
      {
        title: 'Helpful tips',
        items: profile.tips
      }
    ],
    medicines: profile.medicines,
    precautions: profile.precautions,
    tips: profile.tips
  };
};

exports.generateInsight = async (req, res) => {
  res.json({ message: 'Generate AI insight' });
};

exports.generateRecommendations = async (req, res) => {
  try {
    const { question = '', medicines = [] } = req.body || {};
    const safeQuestion = String(question || '').trim();

    if (aiClient && safeQuestion) {
      const prompt = `You are a helpful pharmacy assistant. The user asks: "${safeQuestion}". Give general, non-diagnostic guidance only, and respond in JSON with this exact structure: { "condition": "short label", "summary": "brief paragraph", "recommendations": [{"title": "Medicines", "items": ["...", "..."]}, {"title": "Precautions", "items": ["...", "..."]}, {"title": "Helpful tips", "items": ["...", "..."]}] } Keep advice general, brief, and clearly say to consult a doctor or pharmacist if symptoms are serious.`;

      const completion = await aiClient.chat.completions.create({
        model: 'grok-2-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful pharmacy assistant. Always answer in JSON only and avoid specific medical diagnoses or dangerous dosage instructions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      });

      const content = completion?.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      const localFallback = buildLocalRecommendations({ question, medicines });

      return res.json({
        source: 'grok',
        condition: parsed.condition || localFallback.condition,
        summary: parsed.summary || localFallback.summary,
        answer: parsed.answer || parsed.summary || localFallback.answer,
        recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length ? parsed.recommendations : localFallback.recommendations,
        medicines: Array.isArray(parsed.medicines) ? parsed.medicines : localFallback.medicines,
        precautions: Array.isArray(parsed.precautions) ? parsed.precautions : localFallback.precautions,
        tips: Array.isArray(parsed.tips) ? parsed.tips : localFallback.tips
      });
    }

    const fallback = buildLocalRecommendations({ question, medicines });
    return res.json(fallback);
  } catch (error) {
    console.error('AI recommendation error:', error.message);

    const fallback = buildLocalRecommendations({
      question: req.body?.question || 'general health question',
      medicines: req.body?.medicines || []
    });

    return res.status(200).json({
      ...fallback,
      source: 'fallback',
      summary: 'The Grok API is unavailable right now, so a safe local recommendation model was used instead.'
    });
  }
};
