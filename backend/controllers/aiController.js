const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini if key is provided
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Helper to call Gemini API
 */
const callGemini = async (prompt, systemInstruction = '') => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: systemInstruction
  });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

// @desc    AI Symptom Checker
// @route   POST /api/ai/symptom-check
// @access  Private
exports.symptomCheck = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ success: false, message: 'Please specify symptoms' });
    }

    let responseObj = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Based on these symptoms: "${symptoms}", please diagnose possible concerns.
        Return ONLY a JSON object (without markdown blocks or other text) with the following structure:
        {
          "diseases": ["Disease A", "Disease B"],
          "specialist": "Recommended Specialist Type",
          "precautions": ["Precaution 1", "Precaution 2"],
          "suggestions": ["Suggestion 1", "Suggestion 2"]
        }`;

        const rawText = await callGemini(prompt, "You are a professional medical assistant. Output raw JSON only.");
        // Try parsing the json output (cleaning markdown markers if model added them)
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        responseObj = JSON.parse(cleanJson);
      } catch (err) {
        console.error('Gemini Symptom Check error, falling back:', err.message);
      }
    }

    // Fallback Mock System if Gemini fails or key is missing
    if (!responseObj) {
      const lowerSymptoms = symptoms.toLowerCase();
      if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('cough') || lowerSymptoms.includes('cold')) {
        responseObj = {
          diseases: ['Viral Fever', 'Common Cold', 'Influenza'],
          specialist: 'General Physician',
          precautions: ['Stay hydrated and rest', 'Avoid cold drinks', 'Monitor temperature hourly'],
          suggestions: ['Take paracetamol if fever is high', 'Steam inhalation for congestion', 'Wear a mask to protect others']
        };
      } else if (lowerSymptoms.includes('chest') || lowerSymptoms.includes('heart') || lowerSymptoms.includes('breath')) {
        responseObj = {
          diseases: ['Angina pectoris', 'Cardiovascular strain', 'Mild Asthma'],
          specialist: 'Cardiologist / Pulmonologist',
          precautions: ['Avoid strenuous physical activity', 'Sit upright in a well-ventilated room', 'Seek emergency care if pain radiates'],
          suggestions: ['Monitor blood pressure', 'Keep emergency contact numbers handy', 'Schedule an ECG as soon as possible']
        };
      } else if (lowerSymptoms.includes('stomach') || lowerSymptoms.includes('vomit') || lowerSymptoms.includes('pain')) {
        responseObj = {
          diseases: ['Gastroenteritis', 'Acid Reflux', 'Food Poisoning'],
          specialist: 'Gastroenterologist',
          precautions: ['Drink ORS (Oral Rehydration Salts)', 'Avoid spicy or fatty foods', 'Eat small light meals'],
          suggestions: ['Take antacids if burning sensation persists', 'Keep a food log to identify triggers', 'Stay hydrated']
        };
      } else {
        // General default response
        responseObj = {
          diseases: ['Mild systemic infection', 'Fatigue/Stress induced symptoms'],
          specialist: 'General Practitioner',
          precautions: ['Ensure 8 hours of sleep', 'Drink warm liquids', 'Avoid self-medication with heavy antibiotics'],
          suggestions: ['Maintain a symptom diary', 'Exercise lightly if active', 'Get a routine checkup']
        };
      }
    }

    res.status(200).json({
      success: true,
      data: responseObj,
      warning: 'AI analysis is for informational purposes only and is not a professional medical diagnosis. Please consult a doctor for severe symptoms.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Health Chatbot
// @route   POST /api/ai/chat
// @access  Private
exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please enter a message' });
    }

    let responseText = '';

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `User health question: "${message}". Give a helpful, concise health tip or explanation, and advise consulting a doctor.`;
        responseText = await callGemini(prompt, "You are a friendly, professional AI Medical Chatbot.");
      } catch (err) {
        console.error('Gemini Chat error, falling back:', err.message);
      }
    }

    if (!responseText) {
      // Dynamic simulated chatbot advice
      const msg = message.toLowerCase();
      if (msg.includes('diet') || msg.includes('eat') || msg.includes('food')) {
        responseText = 'A balanced diet rich in leafy greens, lean proteins, and whole grains is foundational to overall health. Try to reduce processed sugars and drink at least 2-3 liters of water daily. Consult a nutritionist for personalized meal planning.';
      } else if (msg.includes('sleep') || msg.includes('insomnia') || msg.includes('tired')) {
        responseText = 'Ensuring a consistent sleep schedule (7-8 hours) is vital. Avoid screen time at least 30 minutes before bed, keep your room cool and dark, and limit late-day caffeine. If fatigue persists, consult a physician to check for vitamin deficiencies.';
      } else if (msg.includes('bp') || msg.includes('hypertension') || msg.includes('blood pressure')) {
        responseText = 'Healthy blood pressure is generally around 120/80 mmHg. To manage high BP, focus on a low-sodium diet, regular aerobic exercise, and stress reduction techniques. Always monitor your readings and discuss modifications with your doctor.';
      } else {
        responseText = `Thank you for your question. Regarding "${message}", it is generally recommended to maintain active lifestyle habits, schedule yearly checkups, and log any recurring symptoms. For specific conditions or medications, checking in with a qualified healthcare professional is the safest path.`;
      }
    }

    res.status(200).json({
      success: true,
      reply: responseText
    });
  } catch (error) {
    next(error);
  }
};
