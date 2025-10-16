# Quiz Generator Setup Guide

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key
5. Open the `.env` file in your project root
6. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key

Example:
```
VITE_GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

## Features

### Quiz Generation Form
- **Department Selection**: Choose from available VTU engineering departments
- **Semester Selection**: Select semester (1-8)
- **Subject Selection**: Pick a specific course/subject
- **Difficulty Level**: Choose between Easy, Medium, or Hard
- **Number of Questions**: Select 5-20 questions (slider)

### Quiz Interface
- Multiple choice questions with 4 options each
- Progress bar showing current question number
- Quick navigation to jump between questions
- Answer tracking (shows which questions are answered)
- Previous/Next navigation buttons

### Results Screen
- Shows overall score (correct/total)
- Percentage score
- Detailed review of each question:
  - Correct answer highlighted in green
  - Wrong answer highlighted in red
  - Explanation for each question
- Option to generate a new quiz

## How It Works

1. **Select Course**: User selects department, semester, and subject
2. **Configure Quiz**: Choose difficulty and number of questions
3. **Generate**: Click "Generate Quiz" button
4. **AI Processing**: Gemini API creates relevant questions based on the subject
5. **Take Quiz**: Answer all questions
6. **Review**: See results with explanations

## API Usage

The quiz generator uses Google's Gemini Pro model to:
- Generate contextually relevant questions for the selected subject
- Create appropriate difficulty levels
- Provide explanations for answers
- Ensure questions follow VTU engineering curriculum

## Important Notes

- Make sure you have a valid Gemini API key
- The API key should be kept secret (never commit `.env` to version control)
- Free tier has usage limits - check Google AI Studio for details
- Questions are generated dynamically, so each quiz is unique

## Troubleshooting

If quiz generation fails:
1. Check that your API key is correctly set in `.env`
2. Verify you have internet connection
3. Check the browser console for error messages
4. Ensure you haven't exceeded API quota limits
5. Try restarting the development server after adding the API key

## Privacy & Security

- Quiz data is not stored in the database
- API calls are made directly from the client
- No personal information is sent to Gemini API
- Only the subject name and difficulty level are used in the prompt
