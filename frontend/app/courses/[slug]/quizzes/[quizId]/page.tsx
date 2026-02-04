"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getApiBase } from "@/lib/api";
import { fetchWithAuth } from "@/lib/auth";
import Cookies from 'js-cookie';
import PureLogicsNavbar from "@/app/components/PureLogicsNavbar";
import { useToast } from "@/app/contexts/ToastContext";
import { colors } from "@/lib/colors";

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
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  useEffect(() => {
    // Use Cookies instead of localStorage (consistent with rest of app)
    const token = typeof window !== 'undefined' ? Cookies.get('access_token') : null;
    if (!token) {
      router.push("/login");
      return;
    }

    checkEnrollmentAndLoadQuiz();
  }, [quizId, courseSlug]);

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

  const checkEnrollmentAndLoadQuiz = async () => {
    try {
      setCheckingEnrollment(true);
      
      // First, get the course by slug
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

      // Check enrollment
      const enrollments = await fetchWithAuth("/enrollments/");
      const enrollment = (enrollments.results || enrollments || []).find(
        (e: any) => (e.course?.id === courseId || e.course === courseId) && 
                     (e.status === 'active' || e.status === 'completed')
      );

      if (!enrollment) {
        // Not enrolled - redirect to course page
        showError("You must be enrolled in this course to access quizzes.");
        router.push(`/courses/${courseSlug}`);
        return;
      }

      setIsEnrolled(true);
      
      // Now load the quiz
      const data = await fetchWithAuth(`/quizzes/${quizId}/`);
      setQuiz(data);
    } catch (error: any) {
      
      if (error.message && error.message.includes('enrolled')) {
        showError("You must be enrolled in this course to access quizzes.");
        router.push(`/courses/${courseSlug}`);
      } else {
        showError(error.message || "Quiz not found. Please check if the quiz exists for this course.");
      }
    } finally {
      setLoading(false);
      setCheckingEnrollment(false);
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
      
      showError("Failed to submit quiz. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || checkingEnrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}></div>
          <p style={{ color: colors.text.dark }}>{checkingEnrollment ? 'Checking enrollment...' : 'Loading quiz...'}</p>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center max-w-md px-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text.dark }}>Access Denied</h2>
          <p className="mb-6" style={{ color: colors.text.muted }}>You must be enrolled in this course to access quizzes.</p>
          <Link
            href={`/courses/${courseSlug}`}
            className="inline-block px-6 py-3 text-white font-semibold rounded-sm transition-colors"
            style={{ backgroundColor: colors.accent.primary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accent.secondary}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent.primary}
          >
            View Course
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <p style={{ color: colors.text.dark }}>Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
      <PureLogicsNavbar />
      <main className="section-after-header mx-auto max-w-4xl px-6 pb-8">
        <div className="mb-6">
          <Link
            href={`/learn/${courseSlug}`}
            className="mb-4 inline-block transition-colors"
            style={{ color: colors.accent.primary }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.accent.secondary}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.accent.primary}
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.dark }}>{quiz.title}</h1>
          <p className="mb-4" style={{ color: colors.text.muted }}>{quiz.description}</p>
          <div className="flex items-center gap-4 text-sm" style={{ color: colors.text.muted }}>
            <span>Passing Score: {quiz.passing_score}%</span>
            {quiz.time_limit_minutes && (
              <span>Time Limit: {quiz.time_limit_minutes} minutes</span>
            )}
            <span>Max Attempts: {quiz.max_attempts}</span>
          </div>
          {timeRemaining !== null && !submitted && (
            <div className="mt-4 p-3 rounded-sm border" style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary }}>
              <div className="flex items-center justify-between">
                <span style={{ color: colors.text.dark }}>Time Remaining:</span>
                <span
                  className="font-mono text-lg font-bold"
                  style={{ color: timeRemaining < 60 ? colors.accent.secondary : colors.accent.primary }}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          )}
        </div>

        {submitted && result ? (
          <div className="rounded-sm border p-8 text-center" style={{ borderColor: colors.border.primary, backgroundColor: colors.background.card }}>
            <div className="text-6xl mb-4">{result.passed ? "🎉" : "📝"}</div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text.dark }}>
              {result.passed ? "Congratulations! You Passed!" : "Quiz Completed"}
            </h2>
            <div className="text-4xl font-bold mb-2">
              <span style={{ color: result.passed ? colors.accent.primary : colors.accent.secondary }}>
                {result.score.toFixed(1)}%
              </span>
            </div>
            <p className="mb-6" style={{ color: colors.text.muted }}>
              Passing Score: {quiz.passing_score}%
            </p>
            <Link
              href={`/learn/${courseSlug}`}
              className="inline-block px-6 py-3 text-white font-semibold rounded-sm transition-colors"
              style={{ backgroundColor: colors.accent.primary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accent.secondary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent.primary}
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
                    className="rounded-sm border p-6"
                    style={{ borderColor: colors.border.primary, backgroundColor: colors.background.card }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: colors.text.dark }}>
                        Question {idx + 1}: {question.question_text}
                      </h3>
                      <span className="text-sm" style={{ color: colors.text.muted }}>{question.points} points</span>
                    </div>

                    {question.question_type === "multiple_choice" && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center gap-3 p-3 rounded-sm cursor-pointer border transition-colors"
                            style={{ 
                              borderColor: colors.border.primary,
                              backgroundColor: answers[question.id] === option.id ? colors.background.secondary : colors.background.card
                            }}
                            onMouseEnter={(e) => {
                              if (answers[question.id] !== option.id) {
                                e.currentTarget.style.backgroundColor = colors.background.secondary;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (answers[question.id] !== option.id) {
                                e.currentTarget.style.backgroundColor = colors.background.card;
                              }
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option.id}
                              checked={answers[question.id] === option.id}
                              onChange={() => handleAnswerChange(question.id, option.id)}
                              className="w-4 h-4"
                              style={{ accentColor: colors.accent.primary }}
                            />
                            <span style={{ color: colors.text.dark }}>{option.option_text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.question_type === "true_false" && (
                      <div className="space-y-2">
                        {["True", "False"].map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-3 p-3 rounded-sm cursor-pointer border transition-colors"
                            style={{ 
                              borderColor: colors.border.primary,
                              backgroundColor: answers[question.id] === option ? colors.background.secondary : colors.background.card
                            }}
                            onMouseEnter={(e) => {
                              if (answers[question.id] !== option) {
                                e.currentTarget.style.backgroundColor = colors.background.secondary;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (answers[question.id] !== option) {
                                e.currentTarget.style.backgroundColor = colors.background.card;
                              }
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={() => handleAnswerChange(question.id, option)}
                              className="w-4 h-4"
                              style={{ accentColor: colors.accent.primary }}
                            />
                            <span style={{ color: colors.text.dark }}>{option}</span>
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
                        className="w-full px-4 py-2 rounded-sm focus:outline-none focus:ring-2"
                        style={{ 
                          backgroundColor: colors.background.card,
                          borderColor: colors.border.primary,
                          color: colors.text.dark,
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = colors.accent.primary;
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}40`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = colors.border.primary;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-between pt-6">
                  <p style={{ color: colors.text.muted }}>
                    Answered: {Object.keys(answers).length} / {quiz.questions.length}
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={submitted || Object.keys(answers).length === 0}
                    className="px-8 py-3 text-white font-semibold rounded-sm transition-colors disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: (submitted || Object.keys(answers).length === 0) ? colors.border.primary : colors.accent.primary
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = colors.accent.secondary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = colors.accent.primary;
                      }
                    }}
                  >
                    Submit Quiz
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-sm border p-8 text-center" style={{ borderColor: colors.border.primary, backgroundColor: colors.background.card }}>
                <p style={{ color: colors.text.muted }}>No questions available for this quiz.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
