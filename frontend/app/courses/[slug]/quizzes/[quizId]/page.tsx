"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getApiBase } from "@/lib/api";
import { fetchWithAuth } from "@/lib/auth";
import Cookies from 'js-cookie';
import PureLogicsNavbar from "@/app/components/PureLogicsNavbar";
import { useToast } from "@/app/contexts/ToastContext";

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  options?: Array<{ id: number; option_text: string; is_correct: boolean }>;
  correct_answer?: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes?: number;
  max_attempts: number;
  questions: Question[];
}

export default function QuizPage() {
  const router = useRouter();
  const { showError, showWarning } = useToast();
  const params = useParams();
  const courseSlug = params?.slug as string;
  const quizId = params?.quizId as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use Cookies instead of localStorage (consistent with rest of app)
    const token = typeof window !== 'undefined' ? Cookies.get('access_token') : null;
    if (!token) {
      router.push("/login");
      return;
    }

    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz?.time_limit_minutes && !submitted) {
      const totalSeconds = quiz.time_limit_minutes * 60;
      setTimeRemaining(totalSeconds);
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            if (prev === 1) {
              handleSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, submitted]);

  const loadQuiz = async () => {
    try {
      const data = await fetchWithAuth(`/quizzes/${quizId}/`);
      setQuiz(data);
    } catch (error: any) {
      console.error("Failed to load quiz:", error);
      showError(error.message || "Quiz not found. Please check if the quiz exists for this course.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (submitted) return;

    try {
      const apiBase = getApiBase();
      const token = Cookies.get("access_token");

      // Get course by slug using API
      const coursesRes = await fetch(`${getApiBase()}/courses/?slug=${encodeURIComponent(courseSlug)}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('access_token')}`,
        },
      });
      if (!coursesRes.ok) {
        throw new Error('Failed to fetch course');
      }
      const coursesData = await coursesRes.json();
      const courseData = Array.isArray(coursesData.results) 
        ? coursesData.results.find((c: any) => c.slug === courseSlug) || coursesData.results[0]
        : (coursesData.results && coursesData.results.length > 0 ? coursesData.results[0] : null) || coursesData[0];
      const courseId = courseData?.id;
      
      if (!courseId) {
        throw new Error('Course not found');
      }

      const enrollments = await fetchWithAuth("/enrollments/");
      const enrollment = (enrollments.results || enrollments || []).find(
        (e: any) => e.course?.id === courseId || e.course === courseId
      );

      if (!enrollment) {
        showWarning("You must be enrolled in this course to take the quiz.");
        return;
      }

      const attemptRes = await fetch(`${apiBase}/quiz-attempts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enrollment: enrollment.id,
          quiz: parseInt(quizId),
        }),
      });

      if (!attemptRes.ok) {
        throw new Error("Failed to create quiz attempt");
      }

      const attempt = await attemptRes.json();

      const submitRes = await fetch(`${apiBase}/quiz-attempts/${attempt.id}/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (!submitRes.ok) {
        throw new Error("Failed to submit quiz");
      }

      const resultData = await submitRes.json();
      setResult(resultData);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      showError("Failed to submit quiz. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#000F2C]">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#000F2C]">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PureLogicsNavbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <Link
            href={`/learn/${courseSlug}`}
            className="text-[#10B981] hover:text-[#10B981] mb-4 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-[#000F2C]">{quiz.title}</h1>
          <p className="text-[#6a6f73] mb-4">{quiz.description}</p>
          <div className="flex items-center gap-4 text-sm text-[#6a6f73]">
            <span>Passing Score: {quiz.passing_score}%</span>
            {quiz.time_limit_minutes && (
              <span>Time Limit: {quiz.time_limit_minutes} minutes</span>
            )}
            <span>Max Attempts: {quiz.max_attempts}</span>
          </div>
          {timeRemaining !== null && !submitted && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#000F2C]">Time Remaining:</span>
                <span
                  className={`font-mono text-lg font-bold ${timeRemaining < 60 ? "text-red-500" : "text-[#10B981]"
                    }`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          )}
        </div>

        {submitted && result ? (
          <div className="rounded-sm border border-gray-200 bg-white p-8 text-center">
            <div className="text-6xl mb-4">{result.passed ? "🎉" : "📝"}</div>
            <h2 className="text-2xl font-bold mb-4 text-[#000F2C]">
              {result.passed ? "Congratulations! You Passed!" : "Quiz Completed"}
            </h2>
            <div className="text-4xl font-bold mb-2">
              <span className={result.passed ? "text-[#10B981]" : "text-red-500"}>
                {result.score.toFixed(1)}%
              </span>
            </div>
            <p className="text-[#6a6f73] mb-6">
              Passing Score: {quiz.passing_score}%
            </p>
            <Link
              href={`/learn/${courseSlug}`}
              className="inline-block px-6 py-3 bg-[#10B981] hover:bg-[#10B981] text-[#000F2C] font-semibold rounded-sm transition-colors"
            >
              Back to Course
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {quiz.questions && quiz.questions.length > 0 ? (
              <>
                {quiz.questions.map((question, idx) => (
                  <div
                    key={question.id}
                    className="rounded-sm border border-gray-200 bg-white p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#000F2C]">
                        Question {idx + 1}: {question.question_text}
                      </h3>
                      <span className="text-sm text-[#6a6f73]">{question.points} points</span>
                    </div>

                    {question.question_type === "multiple_choice" && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center gap-3 p-3 rounded-sm hover:bg-gray-50 cursor-pointer border border-gray-200"
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option.id}
                              checked={answers[question.id] === option.id}
                              onChange={() => handleAnswerChange(question.id, option.id)}
                              className="w-4 h-4 text-[#10B981]"
                            />
                            <span className="text-[#000F2C]">{option.option_text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.question_type === "true_false" && (
                      <div className="space-y-2">
                        {["True", "False"].map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-3 p-3 rounded-sm hover:bg-gray-50 cursor-pointer border border-gray-200"
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={() => handleAnswerChange(question.id, option)}
                              className="w-4 h-4 text-[#10B981]"
                            />
                            <span className="text-[#000F2C]">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.question_type === "short_answer" && (
                      <textarea
                        value={answers[question.id] || ""}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Type your answer here..."
                        rows={4}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-sm text-[#000F2C] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                      />
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-between pt-6">
                  <p className="text-[#6a6f73]">
                    Answered: {Object.keys(answers).length} / {quiz.questions.length}
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={submitted || Object.keys(answers).length === 0}
                    className="px-8 py-3 bg-[#10B981] hover:bg-[#10B981] disabled:bg-gray-300 disabled:cursor-not-allowed text-[#000F2C] font-semibold rounded-sm transition-colors"
                  >
                    Submit Quiz
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-sm border border-gray-200 bg-white p-8 text-center">
                <p className="text-[#6a6f73]">No questions available for this quiz.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
