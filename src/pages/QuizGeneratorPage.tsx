import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, TrendingUp, Play, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSupabase } from '../contexts/SupabaseContext';
import toast from 'react-hot-toast';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Department {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  semester: number;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const QuizGeneratorPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment && selectedSemester) {
      fetchCourses();
    }
  }, [selectedDepartment, selectedSemester]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code, semester')
        .eq('department_id', selectedDepartment)
        .eq('semester', parseInt(selectedSemester))
        .order('name');
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const generateQuiz = async () => {
    if (!selectedCourse) {
      toast.error('Please select all fields');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Get course details
      const selectedCourseData = courses.find(c => c.id === selectedCourse);
      if (!selectedCourseData) {
        throw new Error('Course not found');
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        toast.error('Gemini API key not configured. Please check your .env file.');
        throw new Error('API key not configured');
      }

      console.log('Using Gemini API with key:', apiKey.substring(0, 10) + '...');

      // Initialize Google Generative AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `Generate ${numberOfQuestions} multiple choice questions for the subject "${selectedCourseData.name}" (${selectedCourseData.code}) with ${difficulty} difficulty level. 
              
Format the response as a JSON array of objects with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer"
  }
]

Rules:
- correctAnswer should be the index (0-3) of the correct option
- Each question should have exactly 4 options
- Questions should be relevant to the subject
- Difficulty: ${difficulty === 'easy' ? 'Basic concepts and definitions' : difficulty === 'medium' ? 'Application and analysis' : 'Advanced problem-solving and critical thinking'}
- Return ONLY the JSON array, no additional text`;

      console.log('Generating content with Gemini 2.0 Flash...');
      const result = await model.generateContent(prompt);
      const response = result.response;
      const generatedText = response.text();
      
      console.log('Generated text:', generatedText);
      
      // Extract JSON from the response (sometimes Gemini wraps it in markdown code blocks)
      let jsonText = generatedText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7);
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.substring(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.substring(0, jsonText.length - 3);
      }
      
      const questions: Question[] = JSON.parse(jsonText.trim());
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid quiz format received');
      }

      setQuiz(questions);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswers(new Array(questions.length).fill(-1));
      setShowResults(false);
      toast.success('Quiz generated successfully!');
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      if (error instanceof Error) {
        toast.error(`Failed to generate quiz: ${error.message}`);
      } else {
        toast.error('Failed to generate quiz. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswers.includes(-1)) {
      toast.error('Please answer all questions before submitting');
      return;
    }
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setQuiz([]);
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setSelectedDepartment('');
    setSelectedSemester('');
    setSelectedCourse('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 relative overflow-hidden">
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="flex items-center justify-center h-screen">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-200 font-mono relative overflow-hidden selection:bg-cyan-500/30">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 pt-36">
        {!quizStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-slate-900 border border-cyan-500/30 p-4 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Brain className="w-12 h-12 text-cyan-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2 text-white tracking-tight glitch-text">QUIZ GENERATOR</h1>
              <p className="text-slate-400 tracking-widest text-sm uppercase">
                Create practice quizzes for your courses
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md rounded-sm p-8 shadow-lg border border-slate-800 relative overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>

              <form onSubmit={(e) => { e.preventDefault(); generateQuiz(); }} className="space-y-6 relative z-10">
                {/* Department Selection */}
                <div>
                  <label className="block text-xs font-bold mb-2 text-cyan-500 uppercase tracking-wider">
                    <BookOpen className="w-3 h-3 inline mr-2" />
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedCourse('');
                      setCourses([]);
                    }}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 transition-colors"
                    required
                  >
                    <option value="">SELECT DEPARTMENT</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester Selection */}
                <div>
                  <label className="block text-xs font-bold mb-2 text-cyan-500 uppercase tracking-wider">
                    Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => {
                      setSelectedSemester(e.target.value);
                      setSelectedCourse('');
                    }}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 transition-colors"
                    required
                    disabled={!selectedDepartment}
                  >
                    <option value="">SELECT SEMESTER</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        SEMESTER {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-bold mb-2 text-cyan-500 uppercase tracking-wider">
                    Course / Subject
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 transition-colors"
                    required
                    disabled={!selectedSemester}
                  >
                    <option value="">SELECT MODULE</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-xs font-bold mb-2 text-cyan-500 uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3 inline mr-2" />
                    Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level as 'easy' | 'medium' | 'hard')}
                        className={`px-4 py-3 rounded-sm font-bold text-xs uppercase tracking-wider transition-all border ${
                          difficulty === level
                            ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-xs font-bold mb-2 text-cyan-500 uppercase tracking-wider">
                    Number of Questions
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumberOfQuestions(num)}
                        className={`px-4 py-3 rounded-sm font-bold text-xs transition-all border ${
                          numberOfQuestions === num
                            ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-6 rounded-sm transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">INITIALIZING...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      GENERATE QUIZ
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : showResults ? (
          // Results Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-slate-900/80 border border-slate-800 rounded-sm p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-white uppercase tracking-widest">Quiz Results</h2>
                <div className="text-6xl font-bold text-cyan-400 mb-2 font-mono text-shadow-glow">
                  {calculateScore()} / {quiz.length}
                </div>
                <p className="text-slate-400 uppercase tracking-widest text-sm">
                  ACCURACY: {Math.round((calculateScore() / quiz.length) * 100)}%
                </p>
              </div>

              <div className="space-y-6">
                {quiz.map((question, index) => {
                  const isCorrect = selectedAnswers[index] === question.correctAnswer;
                  return (
                    <div key={index} className="bg-slate-950 border border-slate-800 rounded-sm p-6">
                      <div className="flex items-start gap-3 mb-4">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-200 mb-3 font-mono">
                            <span className="text-cyan-500 mr-2">[{index + 1}]</span>
                            {question.question}
                          </h3>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => {
                              const isSelected = selectedAnswers[index] === optionIndex;
                              const isCorrectOption = optionIndex === question.correctAnswer;
                              
                              return (
                                <div
                                  key={optionIndex}
                                  className={`p-3 rounded-sm border ${
                                    isCorrectOption
                                      ? 'bg-green-900/20 border-green-500/50 text-green-400'
                                      : isSelected
                                      ? 'bg-red-900/20 border-red-500/50 text-red-400'
                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <span className="font-mono">{option}</span>
                                  {isCorrectOption && (
                                    <span className="ml-2 text-green-500 text-xs uppercase font-bold">[CORRECT]</span>
                                  )}
                                  {isSelected && !isCorrectOption && (
                                    <span className="ml-2 text-red-500 text-xs uppercase font-bold">[SELECTED]</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-cyan-900/10 border-l-2 border-cyan-500 rounded-r-sm">
                              <p className="text-xs text-cyan-400 font-mono">
                                <strong className="uppercase mr-2">Analysis:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-center">
                  <button
                    onClick={resetQuiz}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-sm transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  >
                    START NEW QUIZ
                  </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Quiz Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-slate-900/80 border border-slate-800 rounded-sm p-8 shadow-lg relative">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-cyan-500 mb-2 uppercase tracking-widest font-bold">
                  <span>Question {currentQuestionIndex + 1} / {quiz.length}</span>
                  <span>{selectedAnswers.filter(a => a !== -1).length} ANSWERED</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1 border border-slate-800">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-white font-mono">
                  <span className="text-cyan-500 mr-3">Q{currentQuestionIndex + 1}_</span>
                  {quiz[currentQuestionIndex]?.question}
                </h2>

                <div className="space-y-3">
                  {quiz[currentQuestionIndex]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-sm border transition-all font-mono ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold mr-3 text-xs opacity-50">0{index + 1}</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-slate-950 border border-slate-700 text-slate-300 rounded-sm hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs font-bold"
                >
                  &lt; PREV
                </button>

                {currentQuestionIndex === quiz.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-sm transition-all font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  >
                    SUBMIT QUIZ
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-sm transition-all font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  >
                    NEXT &gt;
                  </button>
                )}
              </div>

              {/* Question Navigator */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest">Question Map:</p>
                <div className="flex flex-wrap gap-2">
                  {quiz.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded-sm font-bold text-xs transition-all border ${
                        currentQuestionIndex === index
                          ? 'bg-cyan-500 text-black border-cyan-500'
                          : selectedAnswers[index] !== -1
                          ? 'bg-green-900/20 text-green-500 border-green-500/50'
                          : 'bg-slate-950 text-slate-600 border-slate-800'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
      </div>
    </div>
  );
};

export default QuizGeneratorPage;
