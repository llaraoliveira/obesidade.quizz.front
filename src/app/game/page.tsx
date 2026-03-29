'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';

interface Question {
  id: number;
  question: string;
  alternatives: string[];
  correct_answer: number;
  difficulty: 'facil' | 'medio' | 'dificil';
}

interface GameResult {
  playerName: string;
  correctAnswers: number;
  difficulty: string;
  totalQuestions: number;
}

export default function GamePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'difficulty' | 'playing' | 'result'>('difficulty');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // Contadores com useRef (mantêm valor entre renderizações)
  const countersRef = useRef({
    correctAnswers: 0,
    easyCorrect: 0,
    mediumCorrect: 0,
    hardCorrect: 0,
    easyTotal: 0,
    mediumTotal: 0,
    hardTotal: 0
  });
  
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [easyCorrect, setEasyCorrect] = useState(0);
  const [mediumCorrect, setMediumCorrect] = useState(0);
  const [hardCorrect, setHardCorrect] = useState(0);
  const [easyTotal, setEasyTotal] = useState(0);
  const [mediumTotal, setMediumTotal] = useState(0);
  const [hardTotal, setHardTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playerName, setPlayerName] = useState('');
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleNextQuestion();
    }
  }, [timeLeft, gameState]);

  const startGame = async () => {
    // Resetar contadores ref
    countersRef.current = {
      correctAnswers: 0,
      easyCorrect: 0,
      mediumCorrect: 0,
      hardCorrect: 0,
      easyTotal: 0,
      mediumTotal: 0,
      hardTotal: 0
    };
    
    // Resetar estados
    setCorrectAnswers(0);
    setEasyCorrect(0);
    setMediumCorrect(0);
    setHardCorrect(0);
    setEasyTotal(0);
    setMediumTotal(0);
    setHardTotal(0);
    
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.QUESTIONS));
      const data = await response.json();
      
      if (data.success) {
        // Adaptar à quantidade de perguntas disponíveis
        const availableQuestions = data.questions;
        const totalQuestions = availableQuestions.length;
        
        if (totalQuestions === 0) {
          alert('Nenhuma pergunta cadastrada. Cadastre perguntas no backoffice para começar a jogar!');
          return;
        }
        
        // Se tiver 10 ou menos, usa todas; se tiver mais, seleciona aleatoriamente 10
        const questionsToUse = totalQuestions <= 10 
          ? availableQuestions 
          : availableQuestions
              .sort(() => Math.random() - 0.5)
              .slice(0, 10);
        
        const shuffledQuestions = questionsToUse
          .sort(() => Math.random() - 0.5);
        
        setQuestions(shuffledQuestions.map((q: any) => {
          // Garantir que alternatives seja um array
          let alternativesArray: any[] = [];
          
          try {
            if (Array.isArray(q.alternatives)) {
              alternativesArray = q.alternatives;
            } else if (typeof q.alternatives === 'string') {
              alternativesArray = JSON.parse(q.alternatives);
            } else {
              console.error('Tipo inesperado de alternatives:', typeof q.alternatives, q.alternatives);
              alternativesArray = [];
            }
            
            if (!Array.isArray(alternativesArray)) {
              console.error('alternativesArray não é array:', alternativesArray);
              alternativesArray = [];
            }
          } catch (error) {
            console.error('Erro ao parsear alternatives:', error, q.alternatives);
            alternativesArray = [];
          }
          
          // Criar array de alternativas com seus índices originais
          const alternativesWithIndex = alternativesArray.map((alt: any, index: any) => ({
            text: alt,
            originalIndex: index
          }));
          
          // Embaralhar as alternativas mantendo o índice original
          const shuffledAlternatives = alternativesWithIndex.sort(() => Math.random() - 0.5);
          
          // Encontrar o novo índice da resposta correta
          const newCorrectAnswer = shuffledAlternatives.findIndex(alt => alt.originalIndex === q.correct_answer);
          
          return {
            ...q,
            alternatives: shuffledAlternatives.map((alt: any) => alt.text),
            correct_answer: newCorrectAnswer
          };
        }));
        
        // Ajustar o tempo baseado na quantidade de perguntas
        const adjustedTime = Math.max(20, Math.floor(totalQuestions * 2)); // Mínimo 20s, 2s pergunta
        
        setGameState('playing');
        setCurrentQuestion(0);
        setTimeLeft(adjustedTime);
        setSelectedAnswer(null);
        
        // Incrementar contadores de total pela dificuldade da primeira pergunta
        if (questions.length > 0) {
          const firstQuestion = questions[0];
          if (firstQuestion.difficulty === 'facil') {
            countersRef.current.easyTotal++;
          } else if (firstQuestion.difficulty === 'medio') {
            countersRef.current.mediumTotal++;
          } else if (firstQuestion.difficulty === 'dificil') {
            countersRef.current.hardTotal++;
          }
        }
        
        // Mostrar informação sobre quantidade de perguntas
        if (totalQuestions < 10) {
          console.log(`Usando todas as ${totalQuestions} perguntas disponíveis`);
        } else {
          console.log(`Selecionadas 10 perguntas aleatórias de ${totalQuestions} disponíveis`);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      alert('Erro ao carregar perguntas. Tente novamente.');
    }
  };

  const saveQuestionResponse = async (questionId: number, selectedAnswer: number, correctAnswer: number, isCorrect: boolean, difficulty: string) => {
    try {
      await fetch(buildApiUrl(API_ENDPOINTS.QUESTION_RESPONSES), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          selected_answer: selectedAnswer,
          correct_answer: correctAnswer,
          is_correct: isCorrect,
          difficulty: difficulty
        })
      });
    } catch (error) {
      console.error('Erro ao salvar resposta da pergunta:', error);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    const currentQ = questions[currentQuestion];
    const isCorrect = answerIndex === currentQ.correct_answer;
    
    // Salvar resposta individualmente
    saveQuestionResponse(currentQ.id, answerIndex, currentQ.correct_answer, isCorrect, currentQ.difficulty);
    
    // Usar contadores com useRef (mantêm valor entre renderizações)
    if (isCorrect) {
      countersRef.current.correctAnswers++;
      
      if (currentQ.difficulty === 'facil') {
        countersRef.current.easyCorrect++;
      } else if (currentQ.difficulty === 'medio') {
        countersRef.current.mediumCorrect++;
      } else if (currentQ.difficulty === 'dificil') {
        countersRef.current.hardCorrect++;
      }
    }
    
    // Atualizar estados para UI
    setCorrectAnswers(countersRef.current.correctAnswers);
    setEasyCorrect(countersRef.current.easyCorrect);
    setMediumCorrect(countersRef.current.mediumCorrect);
    setHardCorrect(countersRef.current.hardCorrect);
    setEasyTotal(countersRef.current.easyTotal);
    setMediumTotal(countersRef.current.mediumTotal);
    setHardTotal(countersRef.current.hardTotal);
    
    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      const nextQuestionIndex = currentQuestion + 1;
      const nextQuestion = questions[nextQuestionIndex];
      
      // Incrementar contadores de total pela dificuldade da próxima pergunta
      if (nextQuestion.difficulty === 'facil') {
        countersRef.current.easyTotal++;
      } else if (nextQuestion.difficulty === 'medio') {
        countersRef.current.mediumTotal++;
      } else if (nextQuestion.difficulty === 'dificil') {
        countersRef.current.hardTotal++;
      }
      
      setCurrentQuestion(nextQuestionIndex);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      // Pequeno delay para garantir que todos os estados foram atualizados
      setTimeout(() => {
        endGame();
      }, 100);
    }
  };

  const endGame = () => {
    const result: GameResult = {
      playerName: playerName || 'Anônimo',
      correctAnswers: countersRef.current.correctAnswers,
      difficulty: 'misto',
      totalQuestions: questions.length
    };
    setGameResult(result);
    setGameState('result');
    // Não salva mais automaticamente - espera o usuário concluir
  };

  const saveResultSimple = async () => {
    if (!gameResult) return;
    
    // Determinar o nome final
    const finalName = playerName.trim() || 'Anônimo';
    
    // Se tiver nome com menos de 3 caracteres, avisar
    if (playerName && playerName.trim().length > 0 && playerName.trim().length < 3) {
      alert('O nome deve ter pelo menos 3 caracteres!');
      return;
    }
    
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.TEST_DIFFICULTY), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_name: finalName,
          correct_answers: countersRef.current.correctAnswers,
          difficulty: 'misto',
          total_questions: questions.length,
          easy_correct: countersRef.current.easyCorrect,
          medium_correct: countersRef.current.mediumCorrect,
          hard_correct: countersRef.current.hardCorrect,
          easy_total: countersRef.current.easyTotal,
          medium_total: countersRef.current.mediumTotal,
          hard_total: countersRef.current.hardTotal
        })
      });
      
      if (!response.ok) {
        // Fallback sem os campos novos
        const fallbackResponse = await fetch(buildApiUrl(API_ENDPOINTS.TEST_DIFFICULTY), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            player_name: finalName,
            correct_answers: countersRef.current.correctAnswers,
            difficulty: 'misto',
            total_questions: questions.length
          })
        });
        
        if (!fallbackResponse.ok) {
          throw new Error('Erro ao salvar resultado');
        }
      }
      
      // Sucesso - redirecionar
      router.push('/');
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
      alert('Erro ao salvar resultado. Tente novamente.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'difficulty') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">Quiz Obesidade Infantil</h1>
            <p className="text-gray-600 text-sm sm:text-base">Teste seus conhecimentos sobre nutrição e saúde infantil!</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">As perguntas terão dificuldades variadas (fácil, médio e difícil)</p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700 text-xs sm:text-sm">
                <strong>Adaptação Inteligente:</strong> O jogo se ajusta à quantidade de perguntas disponíveis
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => startGame()}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors shadow-lg text-sm sm:text-base"
            >
              Iniciar Jogo
            </button>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 sm:mt-6 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={16} className="sm:hidden" />
            <ArrowLeft size={20} className="hidden sm:block" />
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'facil': return 'bg-green-100 text-green-800';
        case 'medio': return 'bg-yellow-100 text-yellow-800';
        case 'dificil': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="text-sm sm:text-lg font-semibold text-gray-700">
              Pergunta {currentQuestion + 1} de {questions.length}
              {questions.length < 10 && (
                <span className="block text-xs sm:text-sm text-gray-500 font-normal mt-1">
                  Usando todas as {questions.length} perguntas disponíveis
                </span>
              )}
            </div>
            <div className={`flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
              <Clock size={16} className="sm:hidden" />
              <Clock size={20} className="hidden sm:block" />
              <span className="font-mono font-bold text-sm sm:text-base">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDifficultyColor(currentQ.difficulty)}`}>
                {currentQ.difficulty.charAt(0).toUpperCase() + currentQ.difficulty.slice(1)}
              </span>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center px-2">
              {currentQ.question}
            </h2>

            <div className="space-y-2 sm:space-y-3">
              {currentQ.alternatives.map((alternative, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQ.correct_answer;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-3 sm:p-4 rounded-xl text-left font-medium transition-all text-sm sm:text-base ${
                      isSelected && isCorrect
                        ? 'bg-green-500 text-white'
                        : isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : selectedAnswer !== null && isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="font-bold mr-2 sm:mr-3">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {alternative}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result' && gameResult) {
    const percentage = Math.round((gameResult.correctAnswers / gameResult.totalQuestions) * 100);
    
    let performanceLevel = {
      emoji: '',
      title: '',
      message: '',
      color: '',
      bgColor: ''
    };

    if (percentage === 100) {
      performanceLevel = {
        emoji: '🏆',
        title: 'PERFEITO!',
        message: 'Você é um mestre da nutrição!',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50'
      };
    } else if (percentage >= 80) {
      performanceLevel = {
        emoji: '🌟',
        title: 'EXCELENTE!',
        message: 'Quase perfeito! Parabéns!',
        color: 'text-green-500',
        bgColor: 'bg-green-50'
      };
    } else if (percentage >= 60) {
      performanceLevel = {
        emoji: '👍',
        title: 'MUITO BOM!',
        message: 'Você está no caminho certo!',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
      };
    } else if (percentage >= 40) {
      performanceLevel = {
        emoji: '💪',
        title: 'BOM ESFORÇO!',
        message: 'Continue praticando para melhorar!',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50'
      };
    } else {
      performanceLevel = {
        emoji: '📚',
        title: 'PRECISA MELHORAR!',
        message: 'Estude mais e tente novamente!',
        color: 'text-red-500',
        bgColor: 'bg-red-50'
      };
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-4">Jogo Concluído!</h1>
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">🏆</div>
          </div>

          <div className={`${performanceLevel.bgColor} rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-opacity-20`} style={{borderColor: performanceLevel.color.replace('text-', '')}}>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl mb-2">{performanceLevel.emoji}</div>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${performanceLevel.color} mb-2`}>
                {performanceLevel.title}
              </h2>
              <p className={`text-sm sm:text-base lg:text-lg ${performanceLevel.color} font-medium`}>
                {performanceLevel.message}
              </p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">Seu Resultado:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="bg-white p-3 sm:p-4 rounded-lg text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{gameResult.correctAnswers}</div>
                <div className="text-xs sm:text-sm text-gray-600">Acertos</div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">{gameResult.totalQuestions - gameResult.correctAnswers}</div>
                <div className="text-xs sm:text-sm text-gray-600">Erros</div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{percentage}%</div>
                <div className="text-xs sm:text-sm text-gray-600">Percentual</div>
              </div>
            </div>
            
            <div className="text-center text-gray-700 text-sm sm:text-base">
              <span className="font-medium">Modo:</span> Misto (dificuldades variadas)
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <input
              type="text"
              placeholder="Seu nome (opcional)"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:outline-none text-sm sm:text-base text-gray-800 placeholder-gray-500"
              minLength={3}
            />
            <button
              onClick={saveResultSimple}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors shadow-lg text-sm sm:text-base"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white">Carregando...</div>
    </div>
  );
}
