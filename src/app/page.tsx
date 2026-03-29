'use client';

import { Play, Trophy, BookOpen, X, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GameResult {
  player_name: string;
  correct_answers: number;
  total_questions: number;
  difficulty: string;
  created_at: string;
}

export default function Home() {
  const router = useRouter();
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState('');

  useEffect(() => {
    if (showResultsModal) {
      loadResults();
    }
  }, [showResultsModal]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/results');
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResults = results.filter(result => 
    result.player_name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 max-w-4xl w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">Obesidade Infantil QUIZ</h1>
          <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-4xl sm:text-5xl lg:text-6xl">🍎</div>
            <div className="text-4xl sm:text-5xl lg:text-6xl">🥦</div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 px-2">Teste seus conhecimentos sobre nutrição e saúde infantil!</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => router.push('/game')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-colors shadow-lg text-sm sm:text-base lg:text-lg"
          >
            <Play size={20} className="sm:hidden" />
            <Play size={24} className="hidden sm:block lg:hidden" />
            <Play size={24} className="hidden lg:block" />
            <span>Jogar</span>
          </button>

          <button
            onClick={() => setShowResultsModal(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-colors shadow-lg text-sm sm:text-base"
          >
            <Trophy size={16} className="sm:hidden" />
            <Trophy size={20} className="hidden sm:block" />
            <span>Ver Pontuação</span>
          </button>
        </div>

        <div className="text-right mt-3 sm:mt-4">
          <button
            onClick={() => router.push('/dicas')}
            className="inline-flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-xs sm:text-sm"
          >
            <BookOpen size={12} className="sm:hidden" />
            <BookOpen size={16} className="hidden sm:block" />
            <span>Dicas Saudáveis</span>
          </button>
        </div>
      </div>

      {/* Modal de Resultados */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[9999]">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white z-10 pb-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">🏆 Ranking de Jogadores</h2>
              <button
                onClick={() => setShowResultsModal(false)}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X size={16} className="sm:hidden" />
                <X size={20} className="hidden sm:block lg:hidden" />
                <X size={24} className="hidden lg:block" />
              </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <Filter size={16} className="sm:hidden" />
                <Filter size={20} className="hidden sm:block" />
                <span className="text-sm sm:text-base font-medium text-gray-600">Buscar:</span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nome do jogador..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="w-full p-2 sm:p-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none text-sm sm:text-base text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Lista de Resultados */}
            <div className="overflow-y-auto max-h-[50vh] sm:max-h-[50vh]">
              {loading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
                  <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-600">Carregando resultados...</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-sm sm:text-base text-gray-600">
                    {nameFilter 
                      ? `Nenhum resultado encontrado para "${nameFilter}".` 
                      : 'Nenhum resultado disponível ainda. Jogue para ser o primeiro!'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredResults.map((result, index) => (
                    <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-0">
                        <div className="text-lg sm:text-2xl font-bold text-gray-700 w-6 sm:w-8">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">{result.player_name}</div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {result.correct_answers}/{result.total_questions} acertos 
                            ({Math.round((result.correct_answers / result.total_questions) * 100)}%)
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-end gap-1 sm:gap-2">
                        <div className="text-xs text-gray-500">
                          {new Date(result.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={() => setShowResultsModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors text-sm sm:text-base"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
