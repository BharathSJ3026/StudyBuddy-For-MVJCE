import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, TrendingUp, Play, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSupabase } from '../contexts/SupabaseContext';
import toast from 'react-hot-toast';

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

      console.log('Using API endpoint with key:', apiKey.substring(0, 10) + '...');

      // Call Gemini API - Using v1 API with gemini-1.5-pro model
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
      console.log('Calling API URL:', apiUrl.replace(apiKey, 'API_KEY_HIDDEN'));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate ${numberOfQuestions} multiple choice questions for the subject "${selectedCourseData.name}" (${selectedCourseData.code}) with ${difficulty} difficulty level. 
              
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
              - Return ONLY the JSON array, no additional text`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from API');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {!quizStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Brain className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2 text-text-primary">Quiz Generator</h1>
              <p className="text-text-secondary">
                Generate custom quizzes based on your course materials
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-lg">
              <form onSubmit={(e) => { e.preventDefault(); generateQuiz(); }} className="space-y-6">
                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedCourse('');
                      setCourses([]);
                    }}
                    className="w-full px-4 py-3 bg-card-hover border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary">
                    Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => {
                      setSelectedSemester(e.target.value);
                      setSelectedCourse('');
                    }}
                    className="w-full px-4 py-3 bg-card-hover border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                    required
                    disabled={!selectedDepartment}
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary">
                    Subject
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-3 bg-card-hover border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                    required
                    disabled={!selectedSemester}
                  >
                    <option value="">Select Subject</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary">
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level as 'easy' | 'medium' | 'hard')}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                          difficulty === level
                            ? 'bg-primary text-white'
                            : 'bg-card-hover text-text-secondary hover:bg-primary/20'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary">
                    Number of Questions: {numberOfQuestions}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>5</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Generating Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Generate Quiz
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
            <div className="bg-card rounded-lg p-8 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-text-primary">Quiz Results</h2>
                <div className="text-6xl font-bold text-primary mb-2">
                  {calculateScore()} / {quiz.length}
                </div>
                <p className="text-text-secondary">
                  {Math.round((calculateScore() / quiz.length) * 100)}% Correct
                </p>
              </div>

              <div className="space-y-6">
                {quiz.map((question, index) => {
                  const isCorrect = selectedAnswers[index] === question.correctAnswer;
                  return (
                    <div key={index} className="bg-card-hover rounded-lg p-6">
                      <div className="flex items-start gap-3 mb-4">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-text-primary mb-3">
                            {index + 1}. {question.question}
                          </h3>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => {
                              const isSelected = selectedAnswers[index] === optionIndex;
                              const isCorrectOption = optionIndex === question.correctAnswer;
                              
                              return (
                                <div
                                  key={optionIndex}
                                  className={`p-3 rounded-lg ${
                                    isCorrectOption
                                      ? 'bg-green-500/20 border border-green-500'
                                      : isSelected
                                      ? 'bg-red-500/20 border border-red-500'
                                      : 'bg-background border border-gray-700'
                                  }`}
                                >
                                  <span className="text-text-primary">{option}</span>
                                  {isCorrectOption && (
                                    <span className="ml-2 text-green-500 text-sm">✓ Correct</span>
                                  )}
                                  {isSelected && !isCorrectOption && (
                                    <span className="ml-2 text-red-500 text-sm">✗ Your answer</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                              <p className="text-sm text-text-secondary">
                                <strong>Explanation:</strong> {question.explanation}
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
                  className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-all"
                >
                  Generate New Quiz
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
            <div className="bg-card rounded-lg p-8 shadow-lg">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-text-secondary mb-2">
                  <span>Question {currentQuestionIndex + 1} of {quiz.length}</span>
                  <span>{selectedAnswers.filter(a => a !== -1).length} answered</span>
                </div>
                <div className="w-full bg-card-hover rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-text-primary">
                  {quiz[currentQuestionIndex]?.question}
                </h2>

                <div className="space-y-3">
                  {quiz[currentQuestionIndex]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? 'bg-primary text-white'
                          : 'bg-card-hover text-text-primary hover:bg-primary/20'
                      }`}
                    >
                      <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
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
                  className="px-6 py-3 bg-card-hover text-text-primary rounded-lg hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentQuestionIndex === quiz.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                  >
                    Next
                  </button>
                )}
              </div>

              {/* Question Navigator */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-sm text-text-secondary mb-3">Quick Navigation:</p>
                <div className="flex flex-wrap gap-2">
                  {quiz.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentQuestionIndex === index
                          ? 'bg-primary text-white'
                          : selectedAnswers[index] !== -1
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-card-hover text-text-secondary'
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
  );
};

export default QuizGeneratorPage;
