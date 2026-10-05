/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Volume2,
  HelpCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Award,
  Search,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Sparkles,
  Zap,
  Bookmark,
  Type,
} from 'lucide-react';
import {
  LO_PRINCIPAL_RULES,
  QUICK_EXAM_TIPS,
  EXAMEN_1_SECTIONS,
  EXAMEN_2_SECTIONS,
  QuestionItem,
} from './examData.ts';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'principal' | 'examen1' | 'examen2' | 'flashcards' | 'quiz'>('examen1');

  // Font size setting: 'normal' (standard), 'large' (default larger font), 'huge' (extra large)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');

  // Interactive Spanish -> Armenian translation toggle state
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string, boolean>>({});
  // Master reveal state for translations
  const [showAllTranslations, setShowAllTranslations] = useState(false);

  // Dedicated "Ответ / Պատասխան" toggle state
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  // User interactive answer selections (for self-testing)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [userTextInputs, setUserTextInputs] = useState<Record<string, string>>({});

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  // Audio Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Flashcards state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Quiz mode state
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Speak Spanish text using SpeechSynthesis API
  const speakSpanish = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert('Ձեր բրաուզերը չի աջակցում ձայնային արտասանությանը:');
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#—–]/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Armenian translation for a specific item
  const toggleTranslation = (id: string) => {
    setRevealedTranslations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle answer for a specific question
  const toggleAnswer = (id: string) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle bookmark
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Master translation reveal handler
  const handleToggleAllTranslations = () => {
    const nextState = !showAllTranslations;
    setShowAllTranslations(nextState);
    if (!nextState) {
      setRevealedTranslations({});
    }
  };

  // Master answer reveal handler
  const handleToggleAllAnswers = () => {
    const nextState = !showAllAnswers;
    setShowAllAnswers(nextState);
    if (!nextState) {
      setRevealedAnswers({});
    }
  };

  // Check if translation is shown for an item
  const isTranslationVisible = (id: string) => {
    return showAllTranslations || !!revealedTranslations[id];
  };

  // Check if answer is shown for an item
  const isAnswerVisible = (id: string) => {
    return showAllAnswers || !!revealedAnswers[id];
  };

  // Handle selecting an option
  const handleSelectOption = (questionId: string, optionId: string, correctOptionId?: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    // Auto mark in quiz mode
    if (activeTab === 'quiz') {
      setQuizSubmitted((prev) => ({
        ...prev,
        [questionId]: true,
      }));
      if (optionId === correctOptionId && !quizSubmitted[questionId]) {
        setQuizScore((score) => score + 1);
      }
    }
  };

  // Reset progress
  const handleResetProgress = () => {
    if (confirm('Ցանկանո՞ւմ եք մաքրել բոլոր պատասխանները և սկսել նորից:')) {
      setUserAnswers({});
      setUserTextInputs({});
      setRevealedAnswers({});
      setShowAllAnswers(false);
      setQuizSubmitted({});
      setQuizScore(0);
    }
  };

  // Flatten all questions for flashcards and quiz
  const allQuestions = useMemo(() => {
    const list: QuestionItem[] = [];
    EXAMEN_1_SECTIONS.forEach((s) => list.push(...s.questions));
    EXAMEN_2_SECTIONS.forEach((s) => list.push(...s.questions));
    return list;
  }, []);

  // Filter sections for Examen 1
  const filteredExamen1 = useMemo(() => {
    return EXAMEN_1_SECTIONS.map((section) => {
      const filteredQuestions = section.questions.filter((q) => {
        const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
        const matchesSearch =
          searchQuery === '' ||
          q.promptEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.promptHy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.correctAnswerEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.correctAnswerHy.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      return { ...section, questions: filteredQuestions };
    }).filter((s) => s.questions.length > 0 || (searchQuery === '' && selectedCategory === 'all'));
  }, [searchQuery, selectedCategory]);

  // Filter sections for Examen 2
  const filteredExamen2 = useMemo(() => {
    return EXAMEN_2_SECTIONS.map((section) => {
      const filteredQuestions = section.questions.filter((q) => {
        const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
        const matchesSearch =
          searchQuery === '' ||
          q.promptEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.promptHy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.correctAnswerEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.correctAnswerHy.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      return { ...section, questions: filteredQuestions };
    }).filter((s) => s.questions.length > 0 || (searchQuery === '' && selectedCategory === 'all'));
  }, [searchQuery, selectedCategory]);

  // Categories list for filtering
  const categories = [
    { id: 'all', labelEs: 'Todos', labelHy: 'Բոլորը' },
    { id: 'sinonimos', labelEs: 'Sinónimos', labelHy: 'Հոմանիշներ' },
    { id: 'antonimos', labelEs: 'Antónimos', labelHy: 'Հականիշներ' },
    { id: 'polisemia', labelEs: 'Polisemia', labelHy: 'Բազմիմաստություն' },
    { id: 'monosemia', labelEs: 'Monosemia', labelHy: 'Մենիմաստություն' },
    { id: 'campo_semantico', labelEs: 'Campo semántico', labelHy: 'Իմաստային դաշտ' },
    { id: 'familia_lexica', labelEs: 'Familia léxica', labelHy: 'Բառակազմական ընտանիք' },
    { id: 'contexto', labelEs: 'Contexto', labelHy: 'Համատեքստ' },
    { id: 'figurado', labelEs: 'Figurado / Literal', labelHy: 'Փոխաբերական / Ուղիղ' },
    { id: 'intruso', labelEs: 'Intruso', labelHy: 'Ավելորդ բառ' },
  ];

  // Total questions count and answered count
  const totalCount = allQuestions.length;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white font-black text-2xl">
              🇪🇸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base md:text-xl tracking-tight text-white flex items-center gap-1.5">
                  <span>Palabras y significados</span>
                  <span className="text-amber-400 font-normal">|</span>
                  <span className="text-amber-400 text-base md:text-lg font-bold">Բառերը և դրանց իմաստները</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  7-րդ դասարան 🇦🇲
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300">
                Քննական վարժություններ, հայերեն թարգմանություն սեղմումով և առանձին պատասխաններ
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Font Size Adjuster Control (Шрифт чуть побольше) */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80" title="Փոխել տառաչափը / Изменить размер шрифта">
              <span className="px-2 text-xs text-slate-400 flex items-center gap-1 font-semibold">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Տառաչափ:</span>
              </span>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  fontSize === 'normal'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Սովորական տառաչափ"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 rounded-lg text-sm font-extrabold transition ${
                  fontSize === 'large'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Մեծ տառաչափ (Առաջարկվող)"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('huge')}
                className={`px-2.5 py-1 rounded-lg text-base font-black transition ${
                  fontSize === 'huge'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Շատ մեծ տառաչափ"
              >
                A++
              </button>
            </div>

            {/* Toggle All Armenian Translations */}
            <button
              onClick={handleToggleAllTranslations}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm ${
                showAllTranslations
                  ? 'bg-amber-500 text-slate-950 font-black hover:bg-amber-400'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Ցույց տալ կամ թաքցնել բոլոր հայերեն թարգմանությունները"
            >
              {showAllTranslations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAllTranslations ? 'Թաքցնել հայերենը' : 'Բոլոր հայերենը 🇦🇲'}</span>
            </button>

            {/* Toggle All Answers */}
            <button
              onClick={handleToggleAllAnswers}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm ${
                showAllAnswers
                  ? 'bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Ցույց տալ կամ թաքցնել բոլոր ճիշտ պատասխանները"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showAllAnswers ? 'Թաքցնել պատասխանները' : 'Բոլոր պատասխանները 💡'}</span>
            </button>

            {/* Reset Progress */}
            <button
              onClick={handleResetProgress}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
              title="Մաքրել պատասխանները"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 pt-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('examen1')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-base font-semibold rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'examen1'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>🇪🇸 Examen 1 (12 վարժություն)</span>
            <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-200 font-bold">
              {EXAMEN_1_SECTIONS.reduce((acc, s) => acc + s.questions.length, 0)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('examen2')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-base font-semibold rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'examen2'
                ? 'border-rose-400 text-rose-300 bg-slate-800/80 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>🇪🇸 Examen 2 (30 հարց)</span>
            <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-200 font-bold">
              {EXAMEN_2_SECTIONS.reduce((acc, s) => acc + s.questions.length, 0)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('principal')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-base font-semibold rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'principal'
                ? 'border-indigo-400 text-indigo-300 bg-slate-800/80 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📌 Ամենակարևորը (Lo Principal)</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-base font-semibold rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'flashcards'
                ? 'border-emerald-400 text-emerald-300 bg-slate-800/80 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ֆլեշ-քարտեր (Tarjetas)</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-base font-semibold rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Քննական թեստ (Թեստավորում)</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* Interaction Hint Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-sm md:text-base">
          <div className="flex items-center gap-3 text-slate-200">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xl">👆</span>
            <div>
              <span className="font-extrabold text-amber-300">Ինտերակտիվ թարգմանություն.</span>{' '}
              <span className="text-slate-200">
                Սեղմի՛ր ցանկացած իսպաներեն հարցի կամ նախադասության վրա՝ հայերեն թարգմանությունը բացելու համար:
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs md:text-sm border border-emerald-500/30">
              💡 «Պատասխան» կոճակը ցույց է տալիս ճիշտ տարբերակը
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs md:text-sm border border-indigo-500/30">
              🔊 Լսել իսպաներեն արտասանությունը
            </span>
          </div>
        </div>

        {/* Search & Category Filter (for Examen 1 and Examen 2 tabs) */}
        {(activeTab === 'examen1' || activeTab === 'examen2') && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Փնտրել բառ, հարց կամ թարգմանություն (es / hy)..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm md:text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Progress status */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm">
                <span className="text-slate-300 font-medium">Պատասխանված է.</span>
                <span className="font-extrabold text-amber-400">
                  {answeredCount} / {totalCount}
                </span>
                <div className="w-20 bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${(answeredCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700/70'
                  }`}
                >
                  <span>{cat.labelHy}</span>
                  <span className="ml-1 text-xs opacity-80">({cat.labelEs})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: LO PRINCIPAL */}
        {activeTab === 'principal' && (
          <div className="space-y-6">
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900 border border-slate-700/80 shadow-xl">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">📌</span>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-amber-300 tracking-tight">
                      Lo principal — Ամենակարևորը
                    </h2>
                    <p className="text-sm md:text-base text-slate-300 mt-1">
                      7-րդ դասարանի քննության 6 հիմնական կանոններն ու սահմանումները
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {LO_PRINCIPAL_RULES.map((rule) => {
                  const isArmenianOpen = isTranslationVisible(`rule-${rule.id}`);
                  return (
                    <div
                      key={rule.id}
                      className="p-5 md:p-6 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-md"
                    >
                      <div>
                        {/* Title and Pronunciation */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-lg md:text-xl text-amber-400">
                              🇪🇸 {rule.conceptEs}
                            </span>
                            <span className="text-slate-400">↔</span>
                            <span className="font-extrabold text-base md:text-lg text-indigo-300">
                              🇦🇲 {rule.conceptHy}
                            </span>
                          </div>
                          <button
                            onClick={(e) => speakSpanish(rule.conceptEs + '. ' + rule.defEs, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                            title="Լսել իսպաներեն"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Spanish Definition (Clickable for Armenian translation) */}
                        <div
                          onClick={() => toggleTranslation(`rule-${rule.id}`)}
                          className="cursor-pointer p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition border border-slate-700 group/click"
                          title="Սեղմի՛ր հայերեն թարգմանության համար"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-base md:text-lg font-bold text-slate-100 leading-snug">
                              <span className="text-amber-400 font-extrabold mr-1.5">🇪🇸</span>
                              {rule.defEs}
                            </p>
                            <span className="text-xs font-bold text-amber-400 group-hover/click:text-amber-300 whitespace-nowrap mt-0.5">
                              {isArmenianOpen ? 'Փակել 🇦🇲' : 'Թարգմանել 🇦🇲'}
                            </span>
                          </div>

                          {/* Armenian translation dropdown */}
                          {isArmenianOpen && (
                            <div className="mt-3 pt-3 border-t border-slate-700 text-sm md:text-base text-amber-200 font-medium leading-relaxed">
                              <span className="font-extrabold text-rose-400 mr-1.5">🇦🇲</span>
                              {rule.defHy}
                            </div>
                          )}
                        </div>

                        {/* Examples */}
                        <div className="mt-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm space-y-1.5">
                          <p className="text-slate-200">
                            <strong className="text-slate-400">Օրինակ (Ejemplo):</strong> {rule.exampleEs}
                          </p>
                          {isArmenianOpen && (
                            <p className="text-indigo-300 border-t border-slate-800/80 pt-1.5">
                              <strong>🇦🇲:</strong> {rule.exampleHy}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Tip badge */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs md:text-sm">
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <Zap className="w-4 h-4" /> {rule.quickTipEs}
                        </span>
                        <span className="text-slate-300 font-medium">{rule.quickTipHy}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Exam Tips Comparison Box */}
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30">
              <div className="flex items-center gap-3.5 mb-5">
                <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 font-bold text-2xl">🧠</span>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-indigo-200">
                    Para responder rápido en el examen — Քննության համար արագ հիշելու ձև
                  </h3>
                  <p className="text-sm text-slate-300 mt-0.5">
                    Ստուգիչ հարցեր քննության ժամանակ վայրկյանների ընթացքում ճիշտ տարբերակը գտնելու համար
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {QUICK_EXAM_TIPS.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-800/80 border border-indigo-500/20 hover:border-indigo-400/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-sm font-extrabold text-slate-100 mb-1">🇪🇸 {tip.questionEs}</p>
                      <p className="text-xs md:text-sm text-slate-300 mb-3">🇦🇲 {tip.questionHy}</p>
                    </div>
                    <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-sm font-black text-amber-400">➜ {tip.answerEs}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Crucial Difference Alert */}
              <div className="mt-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <h4 className="text-base md:text-lg font-black text-amber-300 flex items-center gap-2 mb-2">
                  <span>⚠️</span> Diferencia importante — Քննության համար ամենակարևոր տարբերությունը
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-200 mt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <p className="font-extrabold text-base text-emerald-400 mb-1.5">
                      flor – florista – florero
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      ➡️ misma raíz (նույն արմատը՝ <code className="text-amber-300 font-bold bg-slate-800 px-1.5 py-0.5 rounded">flor-</code>) →{' '}
                      <span className="text-emerald-300 font-extrabold">Familia léxica (Բառակազմական ընտանիք)</span>
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <p className="font-extrabold text-base text-sky-400 mb-1.5">
                      rosa – tulipán – clavel
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      ➡️ mismo tema, raíces diferentes (նույն թեման է, բայց տարբեր արմատներ) →{' '}
                      <span className="text-sky-300 font-extrabold">Campo semántico (Իմաստային դաշտ)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXAMEN 1 (12 Exercises + Mini Examen Final) */}
        {activeTab === 'examen1' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-amber-300">
                  Palabras y significados — Examen de práctica 1
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Վարժություններ 1 - 12 և Վերջնական մինի քննություն (30+ առաջադրանք)
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                12 վարժություն + Քննություն
              </span>
            </div>

            {filteredExamen1.map((section) => (
              <div
                key={section.id}
                className="p-5 md:p-7 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md space-y-5"
              >
                {/* Section Header */}
                <div className="border-b border-slate-700/80 pb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg md:text-2xl font-black text-white flex items-center gap-2">
                      <span className="text-amber-400">{section.titleEs}</span>
                      <span className="text-slate-400 font-normal">|</span>
                      <span className="text-amber-300 text-base md:text-xl font-bold">{section.titleHy}</span>
                    </h3>
                    {(section.subtitleEs || section.subtitleHy) && (
                      <p className="text-xs md:text-sm text-slate-300 mt-1">
                        {section.subtitleEs} — {section.subtitleHy}
                      </p>
                    )}
                  </div>
                  <span className="text-xs md:text-sm text-slate-300 font-bold px-3 py-1 rounded-lg bg-slate-800 border border-slate-700">
                    {section.questions.length} առաջադրանք
                  </span>
                </div>

                {/* Section Note if any */}
                {section.noteEs && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm space-y-1.5">
                    <p className="text-amber-200 font-bold">🇪🇸 {section.noteEs}</p>
                    <p className="text-slate-200">🇦🇲 {section.noteHy}</p>
                  </div>
                )}

                {/* Text for reading comprehension if any */}
                {section.textEs && (
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm md:text-base font-extrabold text-amber-400 flex items-center gap-2">
                        📖 Կարդա՛ և վերլուծի՛ր տեքստը / Lee el texto y analiza:
                      </span>
                      <button
                        onClick={(e) => speakSpanish(section.textEs || '', e)}
                        className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-slate-300 hover:text-amber-400"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Լսել տեքստը</span>
                      </button>
                    </div>

                    {/* Spanish Text Clickable for Armenian */}
                    <div
                      onClick={() => toggleTranslation(`text-${section.id}`)}
                      className="cursor-pointer p-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 transition border border-slate-700"
                    >
                      <p className="text-base md:text-lg text-slate-100 leading-relaxed font-serif">
                        <strong className="text-amber-400 font-sans mr-2">🇪🇸</strong>
                        {section.textEs}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs md:text-sm text-amber-400 font-bold">
                        <span>👆 Սեղմի՛ր տեքստի վրա՝ հայերեն թարգմանությունը տեսնելու համար</span>
                        <span>{isTranslationVisible(`text-${section.id}`) ? 'Թաքցնել 🇦🇲' : 'Բացել 🇦🇲'}</span>
                      </div>
                      {isTranslationVisible(`text-${section.id}`) && (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-700 text-sm md:text-base text-amber-200 leading-relaxed">
                          <strong className="text-rose-400 mr-2">🇦🇲</strong>
                          {section.textHy}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Questions Grid */}
                <div className="space-y-4">
                  {section.questions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      fontSize={fontSize}
                      question={question}
                      isTranslationVisible={isTranslationVisible(question.id)}
                      isAnswerVisible={isAnswerVisible(question.id)}
                      userAnswer={userAnswers[question.id]}
                      userTextInput={userTextInputs[question.id] || ''}
                      isBookmarked={!!bookmarkedIds[question.id]}
                      onToggleTranslation={() => toggleTranslation(question.id)}
                      onToggleAnswer={() => toggleAnswer(question.id)}
                      onToggleBookmark={(e) => toggleBookmark(question.id, e)}
                      onSelectOption={(optId) => handleSelectOption(question.id, optId, question.correctOptionId)}
                      onChangeTextInput={(text) =>
                        setUserTextInputs((prev) => ({ ...prev, [question.id]: text }))
                      }
                      onSpeak={(text, e) => speakSpanish(text, e)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: EXAMEN 2 (30 Practice Exam Questions) */}
        {activeTab === 'examen2' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-rose-300">
                  Palabras y significados — Examen de práctica 2 (Փորձնական քննություն 2)
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  30 նոր քննական հարցեր՝ սինոնիմներ, անտոնիմներ, պոլիսեմիա, իմաստային դաշտ, բառակազմություն և տեքստ
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                30 հարց 🇪🇸
              </span>
            </div>

            {filteredExamen2.map((section) => (
              <div
                key={section.id}
                className="p-5 md:p-7 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md space-y-5"
              >
                {/* Section Header */}
                <div className="border-b border-slate-700/80 pb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg md:text-2xl font-black text-white flex items-center gap-2">
                    <span className="text-rose-400">{section.titleEs}</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-rose-300 text-base md:text-xl font-bold">{section.titleHy}</span>
                  </h3>
                  <span className="text-xs md:text-sm text-slate-300 font-bold px-3 py-1 rounded-lg bg-slate-800 border border-slate-700">
                    {section.questions.length} հարց
                  </span>
                </div>

                {/* Text for reading comprehension if any */}
                {section.textEs && (
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm md:text-base font-extrabold text-rose-400 flex items-center gap-2">
                        📖 Կարդա՛ և վերլուծի՛ր տեքստը / Lee el texto y analiza:
                      </span>
                      <button
                        onClick={(e) => speakSpanish(section.textEs || '', e)}
                        className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-slate-300 hover:text-rose-400"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Լսել տեքստը</span>
                      </button>
                    </div>

                    {/* Spanish Text Clickable for Armenian */}
                    <div
                      onClick={() => toggleTranslation(`text-${section.id}`)}
                      className="cursor-pointer p-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 transition border border-slate-700"
                    >
                      <p className="text-base md:text-lg text-slate-100 leading-relaxed font-serif">
                        <strong className="text-rose-400 font-sans mr-2">🇪🇸</strong>
                        {section.textEs}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs md:text-sm text-rose-400 font-bold">
                        <span>👆 Սեղմի՛ր տեքստի վրա՝ հայերեն թարգմանությունը տեսնելու համար</span>
                        <span>{isTranslationVisible(`text-${section.id}`) ? 'Թաքցնել 🇦🇲' : 'Բացել 🇦🇲'}</span>
                      </div>
                      {isTranslationVisible(`text-${section.id}`) && (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-700 text-sm md:text-base text-rose-200 leading-relaxed">
                          <strong className="text-rose-400 mr-2">🇦🇲</strong>
                          {section.textHy}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Questions Grid */}
                <div className="space-y-4">
                  {section.questions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      fontSize={fontSize}
                      question={question}
                      isTranslationVisible={isTranslationVisible(question.id)}
                      isAnswerVisible={isAnswerVisible(question.id)}
                      userAnswer={userAnswers[question.id]}
                      userTextInput={userTextInputs[question.id] || ''}
                      isBookmarked={!!bookmarkedIds[question.id]}
                      onToggleTranslation={() => toggleTranslation(question.id)}
                      onToggleAnswer={() => toggleAnswer(question.id)}
                      onToggleBookmark={(e) => toggleBookmark(question.id, e)}
                      onSelectOption={(optId) => handleSelectOption(question.id, optId, question.correctOptionId)}
                      onChangeTextInput={(text) =>
                        setUserTextInputs((prev) => ({ ...prev, [question.id]: text }))
                      }
                      onSpeak={(text, e) => speakSpanish(text, e)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: FLASHCARDS (Tarjetas de repaso) */}
        {activeTab === 'flashcards' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-emerald-300">
                Ֆլեշ-քարտեր արագ կրկնության համար (Flashcards)
              </h2>
              <p className="text-sm md:text-base text-slate-300">
                Սեղմի՛ր քարտի վրա՝ այն շրջելու և հայերեն թարգմանությունն ու ճիշտ պատասխանը տեսնելու համար
              </p>
            </div>

            {/* Flashcard Component */}
            {allQuestions.length > 0 && (
              <div className="space-y-4">
                <div
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className="cursor-pointer min-h-[320px] p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 hover:border-emerald-500/60 shadow-2xl transition-all duration-300 flex flex-col justify-between relative group"
                >
                  {/* Top Bar on Card */}
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="px-3 py-1 rounded-full font-bold bg-slate-700 text-slate-200">
                      Քարտ {currentFlashcardIndex + 1} / {allQuestions.length}
                    </span>
                    <span className="px-3 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {allQuestions[currentFlashcardIndex].categoryLabelHy} (
                      {allQuestions[currentFlashcardIndex].categoryLabelEs})
                    </span>
                  </div>

                  {/* Card Content (Front = Spanish question, Back = Armenian + Answer) */}
                  <div className="my-auto py-6 text-center">
                    {!isCardFlipped ? (
                      <div className="space-y-4">
                        <div className="inline-block px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black text-sm md:text-base">
                          🇪🇸 Իսպաներեն հարց (Pregunta)
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                          {allQuestions[currentFlashcardIndex].promptEs}
                        </p>
                        <p className="text-sm text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                          <span>👆 Սեղմիր քարտին՝ հայերենն ու պատասխանը տեսնելու համար</span>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="inline-block px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 font-black text-sm md:text-base">
                          🇦🇲 Հայերեն թարգմանություն և Պատասխան
                        </div>
                        <p className="text-lg md:text-xl font-semibold text-slate-200 leading-relaxed">
                          {allQuestions[currentFlashcardIndex].promptHy}
                        </p>
                        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left">
                          <p className="text-sm font-bold text-emerald-400 mb-1.5">
                            ✅ Ճիշտ պատասխան (Respuesta):
                          </p>
                          <p className="text-base md:text-lg font-extrabold text-white">
                            {allQuestions[currentFlashcardIndex].correctAnswerEs}
                          </p>
                          <p className="text-sm md:text-base text-emerald-200 font-medium mt-1">
                            {allQuestions[currentFlashcardIndex].correctAnswerHy}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Audio Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakSpanish(allQuestions[currentFlashcardIndex].promptEs);
                      }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs md:text-sm font-bold"
                    >
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>Արտասանել</span>
                    </button>
                    <span className="text-xs md:text-sm text-slate-400 font-semibold">
                      {isCardFlipped ? 'Շրջել առաջ 🇪🇸' : 'Շրջել ետ 🇦🇲'}
                    </span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    disabled={currentFlashcardIndex === 0}
                    onClick={() => {
                      setIsCardFlipped(false);
                      setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition text-sm md:text-base"
                  >
                    ← Նախորդ քարտը
                  </button>
                  <button
                    onClick={() => {
                      setIsCardFlipped(false);
                      const randomIndex = Math.floor(Math.random() * allQuestions.length);
                      setCurrentFlashcardIndex(randomIndex);
                    }}
                    className="px-5 py-3.5 rounded-xl bg-slate-800 text-amber-400 font-bold hover:bg-slate-700 text-base"
                    title="Պատահական քարտ"
                  >
                    🔀
                  </button>
                  <button
                    disabled={currentFlashcardIndex === allQuestions.length - 1}
                    onClick={() => {
                      setIsCardFlipped(false);
                      setCurrentFlashcardIndex((prev) => Math.min(allQuestions.length - 1, prev + 1));
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none transition text-sm md:text-base"
                  >
                    Հաջորդ քարտը →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: QUIZ / EXAM SIMULATOR */}
        {activeTab === 'quiz' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-3xl font-black text-amber-300">
                  7-րդ դասարանի քննության ստուգիչ թեստ
                </h2>
                <p className="text-sm md:text-base text-slate-300 mt-1">
                  Ընտրի՛ր ճիշտ տարբերակները, ստուգի՛ր ինքդ քեզ և տե՛ս քո վերջնական գնահատականը:
                </p>
              </div>

              {/* Score Widget */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-lg">
                <Award className="w-9 h-9 text-amber-400" />
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Միավորներ</div>
                  <div className="text-xl md:text-2xl font-black text-white">
                    <span className="text-amber-400">{quizScore}</span> / {allQuestions.filter((q) => q.type === 'choice').length}
                  </div>
                </div>
              </div>
            </div>

            {/* List of Choice Questions for Exam Simulation */}
            <div className="space-y-4">
              {allQuestions
                .filter((q) => q.type === 'choice')
                .map((question, index) => {
                  const selectedOpt = userAnswers[question.id];
                  const hasAnswered = !!selectedOpt;
                  const isCorrect = selectedOpt === question.correctOptionId;

                  return (
                    <div
                      key={question.id}
                      className={`p-5 md:p-6 rounded-2xl border transition-all ${
                        hasAnswered
                          ? isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-rose-950/20 border-rose-500/40'
                          : 'bg-slate-850/80 border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-700/80 text-amber-300">
                            {question.categoryLabelHy}
                          </span>
                        </div>
                        {hasAnswered && (
                          <span
                            className={`flex items-center gap-1.5 text-xs md:text-sm font-bold px-3 py-1 rounded-full ${
                              isCorrect
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>{isCorrect ? 'Ճիշտ է' : 'Սխալ է'}</span>
                          </span>
                        )}
                      </div>

                      {/* Spanish Prompt (Clickable for Armenian) */}
                      <div
                        onClick={() => toggleTranslation(question.id)}
                        className="cursor-pointer p-4 rounded-xl bg-slate-900 hover:bg-slate-850 transition border border-slate-700/80 mb-3"
                      >
                        <p className="text-base md:text-lg font-bold text-white flex items-center gap-2 leading-relaxed">
                          <span className="text-amber-400">🇪🇸</span>
                          <span>{question.promptEs}</span>
                        </p>
                        <div className="mt-1.5 text-xs text-amber-400 font-bold">
                          <span>👆 Սեղմիր՝ հայերեն թարգմանությունը տեսնելու համար</span>
                        </div>
                        {isTranslationVisible(question.id) && (
                          <div className="mt-2.5 pt-2.5 border-t border-slate-700 text-sm md:text-base text-amber-200 font-medium">
                            <span>🇦🇲 {question.promptHy}</span>
                          </div>
                        )}
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {question.options?.map((opt) => {
                          const isOptSelected = selectedOpt === opt.id;
                          const isOptCorrect = opt.id === question.correctOptionId;

                          let btnStyle = 'bg-slate-900/90 hover:bg-slate-700/60 border-slate-700 text-slate-200';
                          if (hasAnswered) {
                            if (isOptCorrect) {
                              btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-extrabold';
                            } else if (isOptSelected) {
                              btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-200 line-through';
                            } else {
                              btnStyle = 'opacity-40 bg-slate-900 border-slate-800 text-slate-400';
                            }
                          }

                          return (
                            <button
                              key={opt.id}
                              onClick={() =>
                                handleSelectOption(question.id, opt.id, question.correctOptionId)
                              }
                              className={`p-3 md:p-3.5 rounded-xl border text-left text-sm md:text-base transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span className="font-semibold">{opt.textEs}</span>
                              {opt.textHy && isTranslationVisible(question.id) && (
                                <span className="text-xs text-slate-400 ml-2">({opt.textHy})</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Dedicated Answer button */}
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-700/60">
                        <button
                          onClick={() => toggleAnswer(question.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-650 text-amber-300 font-black text-xs md:text-sm"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>{isAnswerVisible(question.id) ? 'Փակել պատասխանը' : 'Տեսնել պատասխանը 💡'}</span>
                        </button>
                      </div>

                      {/* Answer Details Box */}
                      {isAnswerVisible(question.id) && (
                        <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-amber-500/30 text-sm space-y-2 animate-in fade-in">
                          <p className="font-extrabold text-emerald-400">
                            ✅ Ճիշտ պատասխան. {question.correctAnswerEs}
                          </p>
                          <p className="text-amber-200 font-medium">🇦🇲 {question.correctAnswerHy}</p>
                          {question.explanationEs && (
                            <p className="text-slate-300 border-t border-slate-800 pt-2 text-xs md:text-sm">
                              <strong>Բացատրություն:</strong> {question.explanationEs}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-6 px-4 text-center text-xs md:text-sm text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>🇪🇸 🇦🇲</span>
            <span className="font-bold text-slate-300">
              Palabras y significados — Բառերը և դրանց իմաստները
            </span>
            <span>• 7-րդ դասարանի քննության նախապատրաստում</span>
          </div>
          <div>
            Սեղմիր իսպաներեն տեքստին՝ հայերեն թարգմանությունը բացելու համար | Կոճակ «Պատասխան»
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponent: QuestionCard (Single Question with Click-to-Translate & Dedicated Answer Button)
interface QuestionCardProps {
  fontSize: 'normal' | 'large' | 'huge';
  question: QuestionItem;
  isTranslationVisible: boolean;
  isAnswerVisible: boolean;
  userAnswer?: string;
  userTextInput?: string;
  isBookmarked: boolean;
  onToggleTranslation: () => void;
  onToggleAnswer: () => void;
  onToggleBookmark: (e: React.MouseEvent) => void;
  onSelectOption: (optionId: string) => void;
  onChangeTextInput: (text: string) => void;
  onSpeak: (text: string, e: React.MouseEvent) => void;
}

function QuestionCard({
  fontSize,
  question,
  isTranslationVisible,
  isAnswerVisible,
  userAnswer,
  userTextInput,
  isBookmarked,
  onToggleTranslation,
  onToggleAnswer,
  onToggleBookmark,
  onSelectOption,
  onChangeTextInput,
  onSpeak,
}: QuestionCardProps) {
  const isSelected = !!userAnswer;
  const isCorrect = question.type === 'choice' && userAnswer === question.correctOptionId;

  // Dynamic Typography according to selected font size
  const promptClass =
    fontSize === 'huge'
      ? 'text-xl md:text-2xl font-black'
      : fontSize === 'large'
      ? 'text-lg md:text-xl font-extrabold'
      : 'text-base md:text-lg font-bold';

  const translationClass =
    fontSize === 'huge'
      ? 'text-base md:text-lg font-semibold'
      : fontSize === 'large'
      ? 'text-sm md:text-base font-medium'
      : 'text-xs md:text-sm font-medium';

  const optionClass =
    fontSize === 'huge'
      ? 'text-base md:text-lg font-semibold'
      : fontSize === 'large'
      ? 'text-sm md:text-base font-semibold'
      : 'text-xs md:text-sm font-medium';

  const answerClass =
    fontSize === 'huge'
      ? 'text-base md:text-lg font-black'
      : fontSize === 'large'
      ? 'text-sm md:text-base font-extrabold'
      : 'text-xs md:text-sm font-bold';

  return (
    <div
      className={`p-5 md:p-6 rounded-2xl border transition-all ${
        isAnswerVisible
          ? 'bg-slate-850 border-amber-500/40 shadow-lg'
          : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 shadow-sm'
      }`}
    >
      {/* Top Meta Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          {question.number && (
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs md:text-sm flex items-center justify-center border border-amber-500/40">
              {question.number}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {question.categoryLabelHy} ({question.categoryLabelEs})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onSpeak(question.promptEs, e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
            title="Լսել իսպաներեն արտասանությունը"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleBookmark}
            className={`p-1.5 rounded-lg transition ${
              isBookmarked ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title="Նշել որպես կարևոր"
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Spanish Prompt (CLICKABLE TO OPEN ARMENIAN TRANSLATION!) */}
      <div
        onClick={onToggleTranslation}
        className="cursor-pointer p-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 transition border border-slate-700 group shadow-inner"
        title="Սեղմի՛ր իսպաներեն տեքստին՝ հայերեն թարգմանությունը բացելու համար"
      >
        <div className="flex items-start justify-between gap-3">
          <p className={`${promptClass} text-slate-100 whitespace-pre-line leading-relaxed`}>
            <span className="text-amber-400 mr-2">🇪🇸</span>
            {question.promptEs}
          </p>
          <span className="text-xs font-extrabold text-amber-400 group-hover:text-amber-300 whitespace-nowrap flex items-center gap-1 mt-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            {isTranslationVisible ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Թաքցնել 🇦🇲</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Հայերեն 🇦🇲</span>
              </>
            )}
          </span>
        </div>

        {/* Revealed Armenian Translation */}
        {isTranslationVisible && (
          <div className={`mt-3.5 pt-3.5 border-t border-slate-700 ${translationClass} text-amber-200 font-medium whitespace-pre-line leading-relaxed animate-in fade-in`}>
            <span className="text-rose-400 font-black mr-2">🇦🇲</span>
            {question.promptHy}
          </div>
        )}
      </div>

      {/* Optional Context */}
      {question.contextEs && (
        <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 text-sm text-slate-300 border border-slate-800">
          <p>
            <strong className="text-slate-400">Համատեքստ:</strong> {question.contextEs}
          </p>
          {isTranslationVisible && question.contextHy && (
            <p className="text-indigo-300 mt-1.5 font-medium">{question.contextHy}</p>
          )}
        </div>
      )}

      {/* Multiple Choice Options if type === 'choice' */}
      {question.type === 'choice' && question.options && (
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((opt) => {
            const isOptSelected = userAnswer === opt.id;
            const isOptCorrect = opt.id === question.correctOptionId;

            let optClasses = 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-200';
            if (isAnswerVisible) {
              if (isOptCorrect) {
                optClasses = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-extrabold shadow-sm';
              } else if (isOptSelected) {
                optClasses = 'bg-rose-950/50 border-rose-500 text-rose-200 line-through';
              }
            } else if (isOptSelected) {
              optClasses = 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold';
            }

            return (
              <button
                key={opt.id}
                onClick={() => onSelectOption(opt.id)}
                className={`p-3 md:p-3.5 rounded-xl border text-left ${optionClass} transition flex items-center justify-between ${optClasses}`}
              >
                <span>{opt.textEs}</span>
                {opt.textHy && isTranslationVisible && (
                  <span className="text-xs md:text-sm text-slate-400 ml-2 font-normal">({opt.textHy})</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Open Text Answer Input if type !== 'choice' */}
      {question.type !== 'choice' && (
        <div className="mt-3.5">
          <input
            type="text"
            value={userTextInput}
            onChange={(e) => onChangeTextInput(e.target.value)}
            placeholder="Գրի՛ր քո պատասխանը այստեղ..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm md:text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
          />
        </div>
      )}

      {/* Dedicated Answer & Explanation Control Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={onToggleAnswer}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-black transition shadow-sm ${
            isAnswerVisible
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              : 'bg-emerald-600/25 text-emerald-300 hover:bg-emerald-600/35 border border-emerald-500/40'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{isAnswerVisible ? 'Թաքցնել պատասխանը' : 'Պատասխան (Ver respuesta) 💡'}</span>
        </button>

        {/* Small Status indicator */}
        <span className="text-xs font-semibold text-slate-400">
          {isAnswerVisible ? '✅ Պատասխանը բացված է' : '❓ Սեղմիր՝ ստուգելու համար'}
        </span>
      </div>

      {/* Revealed Dedicated Answer Box */}
      {isAnswerVisible && (
        <div className="mt-3.5 p-4 md:p-5 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-2.5 animate-in fade-in zoom-in-98 duration-150 shadow-inner">
          <div className="flex items-start gap-3">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-base font-bold">✅</span>
            <div>
              <p className={`${answerClass} text-emerald-300`}>
                🇪🇸 {question.correctAnswerEs}
              </p>
              <p className="text-sm md:text-base text-amber-200 mt-1 font-semibold">
                🇦🇲 {question.correctAnswerHy}
              </p>
            </div>
          </div>

          {(question.explanationEs || question.explanationHy) && (
            <div className="pt-2.5 border-t border-slate-800/80 text-xs md:text-sm text-slate-300 space-y-1.5">
              {question.explanationEs && (
                <p>
                  <strong className="text-slate-400">Explicación:</strong> {question.explanationEs}
                </p>
              )}
              {question.explanationHy && (
                <p className="text-indigo-300">
                  <strong className="text-slate-400">Բացատրություն:</strong> {question.explanationHy}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
