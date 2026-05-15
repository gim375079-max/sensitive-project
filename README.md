# FROM TEXT TO FEELING

AI 기반 감성 분석 서비스입니다. 사용자가 입력한 문장을 분석하여 긍정, 부정, 중립으로 분류하고 신뢰도와 분석 이유를 제공합니다.

## 🚀 주요 기능
- **실시간 감성 분석**: OpenAI GPT 모델을 사용한 정확한 감성 판단
- **직관적인 UI**: 신뢰도 게이지와 분석 결과 요약 제공
- **기록 저장**: 모든 분석 결과는 Supabase DB에 자동으로 기록

## 🛠 기술 스택
- **Frontend**: HTML5, Vanilla CSS, JavaScript
- **Backend**: Node.js, Express
- **AI**: OpenAI API
- **Database**: Supabase

## ⚙️ 설정 방법

1. 저장소를 클론합니다.
2. `.env.example` 파일을 복사하여 `.env` 파일을 만듭니다.
   ```bash
   cp .env.example .env
   ```
3. `.env` 파일에 필요한 API Key와 URL을 입력합니다.
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 의존성 패키지를 설치합니다.
   ```bash
   npm install
   ```
5. 서버를 실행합니다.
   ```bash
   npm run dev
   ```

## 📝 라이선스
MIT License
