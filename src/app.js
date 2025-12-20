import {__jacJsx, __jacSpawn} from "./client_runtime.js";
import { useState, useEffect, createContext, useContext } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { createUser, getNextLesson, healthCheck, getDashboard, recommendNext, updateMastery, generateQuiz, saveNote, getNotes, getConceptDynamic, recordLessonProgress } from "./api.js";
import ThemeProvider, { useTheme, ThemeToggle } from "./components/ThemeProvider.jsx";
import CodeProvider from "./components/CodeContext.jsx";
import Dashboard from "./components/Dashboard.jsx";
import LessonPage from "./components/LessonPage.jsx";
import QuizPage from "./components/QuizPage.jsx";
import CodeEditor from "./components/CodeEditor.jsx";
import { DashboardSkeleton, LessonSkeleton } from "./components/Skeleton.jsx";
function app() {
  useEffect(() => {
    // Completely disable service worker in development
    // If one exists, unregister it
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => {
          console.log('Unregistering old service worker:', reg.scope);
          reg.unregister();
        });
      });
    }
  }, []);
  return __jacJsx(ThemeProvider, {}, [__jacJsx(CodeProvider, {}, [__jacJsx(AppContent, {}, [])])]);
}
function AppContent() {
  const { isDark } = useTheme();
  let [user, setUser] = useState("demo_user");
  let [lesson, setLesson] = useState(null);
  let [quiz, setQuiz] = useState(null);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(null);
  let [apiOnline, setApiOnline] = useState(false);
  let [refreshKey, setRefreshKey] = useState(0);
  async function fetchNextLesson() {
    let next = await getNextLesson(user);
    console.log("Next lesson:", next);
    if (next && next.next_lesson) {
      setLesson(next.next_lesson);
    } else if (next && next.recommended_review) {
      console.log("Recommended review:", next.recommended_review);
      setLesson(null);
    } else {
      setLesson(null);
    }
  }
  async function handleLessonComplete(completedLesson) {
    console.log("Lesson completed:", completedLesson.title);
    setRefreshKey(prev => prev + 1);
    await fetchNextLesson();
  }
  useEffect(() => {
    async function boot() {
      setLoading(true);
      setError(null);
      let isOnline = await healthCheck().catch(err => {
        console.error("Health check error:", err);
        return false;
      });
      setApiOnline(isOnline);
      if (!isOnline) {
        setError("Backend API is not available. Run: jac serve app.jac");
        setLoading(false);
        return;
      }
      let userResult = await createUser(user).catch(err => {
        console.error("Create user error:", err);
        return {error: err.message};
      });
      console.log("User created/exists:", userResult);
      if (userResult.error) {
        console.error("Failed to create user:", userResult.error);
      }
      await fetchNextLesson().catch(err => {
        console.error("Boot error:", err);
        setError(err.message);
      });
      setLoading(false);
    }
    boot();
  }, [user]);
  if (loading) {
    return __jacJsx("div", {"className": "min-h-screen bg-gray-900"}, [__jacJsx("header", {"className": "bg-gray-800 shadow-lg p-4 border-b border-gray-700"}, [__jacJsx("div", {"className": "max-w-6xl mx-auto flex justify-between items-center"}, [__jacJsx("h1", {"className": "text-xl font-bold text-white"}, ["Interactive Jac Tutor"]), __jacJsx("div", {"className": "flex items-center gap-4"}, [__jacJsx("span", {"className": "text-xs px-2 py-1 rounded bg-gray-700 text-gray-400"}, ["◌ Connecting..."])])])]), __jacJsx("main", {"className": "max-w-6xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-3 sm:px-4"}, [__jacJsx(DashboardSkeleton, {}, []), __jacJsx(LessonSkeleton, {}, [])])]);
  }
  if (error) {
    return __jacJsx("div", {"className": "min-h-screen bg-gray-900 flex items-center justify-center p-4"}, [__jacJsx("div", {"className": "bg-gray-800 p-6 rounded-lg max-w-lg border border-red-900/50"}, [__jacJsx("div", {"className": "flex items-center gap-3 mb-4"}, [__jacJsx("span", {"className": "text-3xl"}, ["⚠️"]), __jacJsx("h2", {"className": "text-xl font-bold text-red-400"}, ["Connection Error"])]), __jacJsx("p", {"className": "text-gray-300 mb-4"}, [error]), __jacJsx("div", {"className": "text-sm text-gray-400 bg-gray-900 p-4 rounded mb-4"}, [__jacJsx("p", {"className": "mb-2 font-medium text-gray-300"}, ["To start the backend:"]), __jacJsx("code", {"className": "bg-gray-800 px-3 py-2 rounded block text-green-400 font-mono"}, ["jac serve app.jac"])]), __jacJsx("button", {"onClick": () => {
      window.location.reload();
    }, "className": "w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors"}, ["🔄 Retry Connection"])])]);
  }
  let editorDefaultValue = "let a = 5;\\nlet b = 7;\\nlet sum = a + b;\\nprint(\\\"Sum =\\\", sum);";
  let bgClass = "min-h-screen transition-colors duration-300 ";
  if (isDark) {
    bgClass = bgClass + "bg-gray-900";
  } else {
    bgClass = bgClass + "bg-gray-100";
  }
  let headerClass = "shadow-lg p-3 sm:p-4 border-b transition-colors duration-300 ";
  if (isDark) {
    headerClass = headerClass + "bg-gray-800 border-gray-700";
  } else {
    headerClass = headerClass + "bg-white border-gray-200";
  }
  let titleClass = "text-lg sm:text-xl font-bold ";
  if (isDark) {
    titleClass = titleClass + "text-white";
  } else {
    titleClass = titleClass + "text-gray-900";
  }
  let statusClass = "text-xs px-2 py-1 rounded ";
  if (apiOnline) {
    statusClass = statusClass + "bg-green-900 text-green-300";
  } else {
    statusClass = statusClass + "bg-red-900 text-red-300";
  }
  let userClass = "text-xs sm:text-sm ";
  if (isDark) {
    userClass = userClass + "text-gray-400";
  } else {
    userClass = userClass + "text-gray-600";
  }
  return __jacJsx("div", {"className": bgClass}, [__jacJsx("header", {"className": headerClass}, [__jacJsx("div", {"className": "max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4"}, [__jacJsx("h1", {"className": titleClass}, ["🚀 Interactive Jac Tutor"]), __jacJsx("div", {"className": "flex items-center gap-2 sm:gap-4 flex-wrap justify-center"}, [__jacJsx(ThemeToggle, {}, []), __jacJsx("span", {"className": statusClass}, [apiOnline && "\u25cf Online" || "\u25cb Offline"]), __jacJsx("span", {"className": userClass}, ["👤 ", user])])])]), __jacJsx("main", {"className": "max-w-6xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-3 sm:px-4"}, [__jacJsx(Dashboard, {"userId": user, "refreshKey": refreshKey}, []), lesson && __jacJsx(LessonPage, {"userId": user, "lesson": lesson, "onComplete": handleLessonComplete}, []), quiz && __jacJsx(QuizPage, {"quiz": quiz, "userId": user}, []), __jacJsx("section", {"id": "code-playground", "className": "p-5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 scroll-mt-4"}, [__jacJsx("h3", {"className": "font-semibold mb-4 text-white text-lg"}, ["🔧 Code Playground"]), __jacJsx(CodeEditor, {"value": editorDefaultValue, "language": "javascript", "onChange": v => {
    console.log("code changed", v);
  }}, [])])])]);
}
export { AppContent, app };
