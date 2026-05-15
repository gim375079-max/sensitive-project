require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isUrlValid = supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));
const supabase = (isUrlValid && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// API Route: Analyze Sentiment
app.post('/api/analyze', async (req, res) => {
  const { text } = req.body;

  // 1. Validation
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: '분석할 텍스트를 입력해주세요.' });
  }

  if (text.length > 1000) {
    return res.status(400).json({ error: '텍스트가 너무 깁니다. (최대 1000자)' });
  }

  try {
    // 2. OpenAI API Request
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a cost-effective model
      messages: [
        {
          role: "system",
          content: "너는 한국어 텍스트 감성 분석기다. 사용자 텍스트를 positive, negative, neutral 중 하나로 분류한다. confidence는 0부터 100 사이의 정수로 작성한다. reason은 한국어로 한 문장만 작성한다. 과장하지 말고 텍스트 근거만 사용한다. 반드시 JSON 형식으로 응답하라. 예: {\"sentiment\": \"positive\", \"confidence\": 90, \"reason\": \"문장에 긍정적인 표현이 포함되어 있습니다.\"}"
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Normalize sentiment values just in case
    const validSentiments = ['positive', 'negative', 'neutral'];
    if (!validSentiments.includes(result.sentiment)) {
        result.sentiment = 'neutral';
    }

    // 3. Supabase Logging (Optional/Non-blocking)
    if (supabase) {
      try {
        const { error } = await supabase
          .from('sentiment_logs')
          .insert([
            { 
              input_text: text, 
              sentiment: result.sentiment, 
              confidence: result.confidence, 
              reason: result.reason 
            }
          ]);
        
        if (error) console.error('Supabase logging error:', error.message);
      } catch (dbError) {
        console.error('Database connection error:', dbError.message);
      }
    }

    // 4. Return result to frontend
    res.json(result);

  } catch (error) {
    console.error('Analysis error:', error);
    
    let errorMessage = '분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    if (error.code === 'invalid_api_key') {
      errorMessage = 'OpenAI API 키가 올바르지 않습니다. 서버 설정을 확인해주세요.';
    }

    res.status(500).json({ error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
