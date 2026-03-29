'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Apple, Activity, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DicasPage() {
  const router = useRouter();
  const [dicasContent, setDicassContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDicassContent();
  }, []);

  const loadDicassContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/dicas');
      const data = await response.json();
      
      if (data.success) {
        setDicassContent(data.content);
      }
    } catch (error) {
      console.error('Erro ao carregar dicas:', error);
      setDicassContent('Conteúdo não disponível no momento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Botão Voltar */}
        <button
          onClick={() => router.push('/')}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors text-sm sm:text-base"
        >
          <ArrowLeft size={16} className="sm:hidden" />
          <ArrowLeft size={20} className="hidden sm:block" />
          Voltar ao Menu
        </button>

        {/* Cabeçalho */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-4">Dicas Saudáveis</h1>
          <p className="text-base sm:text-xl text-gray-600 px-2">Aprenda hábitos saudáveis para uma vida melhor!</p>
        </div>

        {/* Ícones representativos */}
        <div className="flex justify-center gap-4 sm:gap-8 mb-8 sm:mb-12">
          <div className="text-center">
            <div className="bg-green-100 p-3 sm:p-4 rounded-full mb-2">
              <Apple size={24} className="sm:hidden" />
              <Apple size={32} className="hidden sm:block" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Alimentação</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 p-3 sm:p-4 rounded-full mb-2">
              <Activity size={24} className="sm:hidden" />
              <Activity size={32} className="hidden sm:block" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Atividade</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 p-3 sm:p-4 rounded-full mb-2">
              <Brain size={24} className="sm:hidden" />
              <Brain size={32} className="hidden sm:block" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Bem-estar</p>
          </div>
          <div className="text-center">
            <div className="bg-red-100 p-3 sm:p-4 rounded-full mb-2">
              <Heart size={24} className="sm:hidden" />
              <Heart size={32} className="hidden sm:block" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Saúde</p>
          </div>
        </div>

        {/* Conteúdo das Dicas */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600">Carregando dicas saudáveis...</p>
            </div>
          ) : (
            <div className="prose prose-sm sm:prose-lg max-w-none">
              <div 
                className="text-gray-800 leading-relaxed text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: dicasContent }}
              />
            </div>
          )}
        </div>

        {/* Rodapé motivacional */}
        <div className="text-center mt-8 sm:mt-12">
          <div className="bg-green-100 rounded-2xl p-4 sm:p-6 inline-block">
            <p className="text-green-800 font-medium text-sm sm:text-base lg:text-lg">
              💚 Lembre-se: Pequenas mudanças fazem grande diferença!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
