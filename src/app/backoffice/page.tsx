'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Plus, Edit, Trash2 } from 'lucide-react';
import SideMenu, { ActionButton, IconButton } from '@/components/SideMenu';

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
  password?: string; // Para edição de usuários
}

interface Question {
  id: number;
  question: string;
  alternatives: string[] | string;
  correct_answer: number;
  difficulty: 'facil' | 'medio' | 'dificil';
}

interface GameResult {
  id: number;
  player_name: string;
  correct_answers: number;
  total_questions: number;
  difficulty: string;
  easy_correct: number;
  medium_correct: number;
  hard_correct: number;
  easy_total: number;
  medium_total: number;
  hard_total: number;
  created_at: string;
}

interface DashboardStats {
  total_games: number;
  avg_correct: number;
  easy_games: number;
  medium_games: number;
  hard_games: number;
  difficulty_stats: Array<{
    difficulty: string;
    total_games: number;
    total_correct: number;
    total_questions: number;
    avg_correct: number;
  }>;
  overall_accuracy: number;
  total_correct: number;
  total_questions: number;
}

export default function BackofficePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'users' | 'results' | 'dicas'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados para menus laterais
  const [questionMenuOpen, setQuestionMenuOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [recentResults, setRecentResults] = useState<GameResult[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
  
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    alternatives: ['', '', '', ''],
    correct_answer: 0,
    difficulty: 'facil'
  });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [dicasContent, setDicassContent] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('backoffice_token');
    const savedUser = localStorage.getItem('backoffice_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = async () => {
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/backoffice/dashboard', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setRecentResults(data.recentResults);
        setWrongAnswers(data.wrongAnswers || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  const loadAllResults = async () => {
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/backoffice/results', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setRecentResults(data.results);
      }
    } catch (error) {
      console.error('Erro ao carregar todos os resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/backoffice/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsLoggedIn(true);
        localStorage.setItem('backoffice_token', data.token);
        localStorage.setItem('backoffice_user', JSON.stringify(data.user));
        loadDashboardData();
      } else {
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('backoffice_token');
    localStorage.removeItem('backoffice_user');
    setIsLoggedIn(false);
    setToken('');
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  const loadQuestions = async () => {
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/backoffice/questions', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    }
  };

  const loadUsers = async () => {
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/backoffice/users', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadDicassContent = async () => {
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/backoffice/dicas', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDicassContent(data.content);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo de dicas:', error);
    }
  };

  const handleUpdateDicass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/backoffice/dicas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({ content: dicasContent })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Conteúdo de dicas atualizado com sucesso!');
      } else {
        setError(data.error || 'Erro ao atualizar conteúdo de dicas');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/backoffice/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Usuário criado com sucesso!');
        setNewUser({ username: '', password: '', role: 'user' });
        setUserMenuOpen(false);
        loadUsers();
      } else {
        setError(data.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/backoffice/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          username: editingUser.username,
          password: editingUser.password || undefined, // Só envia senha se tiver sido alterada
          role: editingUser.role
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Usuário atualizado com sucesso!');
        setEditingUser(null);
        setUserMenuOpen(false);
        loadUsers();
      } else {
        setError(data.error || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/backoffice/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Usuário removido com sucesso!');
        loadUsers();
      } else {
        setError(data.error || 'Erro ao remover usuário');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const openEditUser = (user: User) => {
    setEditingUser({
      ...user,
      password: '' // Não mostra a senha atual
    });
    setUserMenuOpen(true);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/backoffice/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          ...newQuestion,
          alternatives: JSON.stringify(newQuestion.alternatives)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Pergunta criada com sucesso!');
        setNewQuestion({
          question: '',
          alternatives: ['', '', '', ''],
          correct_answer: 0,
          difficulty: 'facil'
        });
        setQuestionMenuOpen(false);
        loadQuestions();
      } else {
        setError(data.error || 'Erro ao criar pergunta');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/backoffice/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          ...editingQuestion,
          alternatives: JSON.stringify(editingQuestion.alternatives)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Pergunta atualizada com sucesso!');
        setEditingQuestion(null);
        setQuestionMenuOpen(false);
        loadQuestions();
      } else {
        setError(data.error || 'Erro ao atualizar pergunta');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta pergunta?')) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/backoffice/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Pergunta removida com sucesso!');
        loadQuestions();
      } else {
        setError(data.error || 'Erro ao remover pergunta');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const getAlternatives = (question: Question): string[] => {
    try {
      // Se já for array, retorna diretamente
      if (Array.isArray(question.alternatives)) {
        return question.alternatives;
      }
      
      // Se for string, faz parse
      if (typeof question.alternatives === 'string') {
        const alternatives = JSON.parse(question.alternatives);
        return Array.isArray(alternatives) ? alternatives : ['', '', '', ''];
      }
      
      return ['', '', '', ''];
    } catch {
      return ['', '', '', ''];
    }
  };

  const openEditQuestion = (question: Question) => {
    const parsedAlternatives = getAlternatives(question);
    
    setEditingQuestion({
      ...question,
      alternatives: parsedAlternatives
    });
    setQuestionMenuOpen(true);
  };

  const handleDeleteAllResults = async () => {
    if (!confirm('Tem certeza que deseja remover TODOS os resultados? Esta ação não pode ser desfeita!')) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/backoffice/results', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Todos os resultados removidos com sucesso!');
        loadDashboardData();
      } else {
        setError(data.error || 'Erro ao remover todos os resultados');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este resultado?')) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const savedToken = localStorage.getItem('backoffice_token');
    if (!savedToken) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/backoffice/results/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Resultado removido com sucesso!');
        loadDashboardData();
      } else {
        setError(data.error || 'Erro ao remover resultado');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'dashboard') loadDashboardData();
      if (activeTab === 'questions') loadQuestions();
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'results') loadAllResults();
      if (activeTab === 'dicas') loadDicassContent();
    }
  }, [activeTab, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Backoffice Login</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Menu Hambúrguer Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X size={20} className="text-gray-600" />
                ) : (
                  <Menu size={20} className="text-gray-600" />
                )}
              </button>
              
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                Backoffice - Quiz Obesidade
              </h1>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden sm:block text-gray-600 text-sm sm:text-base">
                Bem-vindo, {currentUser?.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Sair</span>
                <span className="sm:hidden">X</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="bg-white w-64 h-full shadow-lg">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
            
            <nav className="p-4">
              <div className="space-y-2">
                {(['dashboard', 'questions', 'users', 'results', 'dicas'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                      activeTab === tab
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tab === 'dashboard' && '📊'}
                      {tab === 'questions' && '❓'}
                      {tab === 'users' && '👥'}
                      {tab === 'results' && '📈'}
                      {tab === 'dicas' && '💡'}
                      <span>
                        {tab === 'dashboard' && 'Dashboard'}
                        {tab === 'questions' && 'Perguntas'}
                        {tab === 'users' && 'Usuários'}
                        {tab === 'results' && 'Resultados'}
                        {tab === 'dicas' && 'Dicas Saudáveis'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile User Info */}
      <div className="bg-blue-50 px-4 py-2 sm:hidden">
        <div className="max-w-7xl mx-auto">
          <span className="text-blue-800 text-sm">
            Bem-vindo, {currentUser?.username}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Hidden on Mobile */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-2 sm:p-4">
              <div className="space-y-1">
                {(['dashboard', 'questions', 'users', 'results', 'dicas'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                      activeTab === tab
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tab === 'dashboard' && '📊'}
                      {tab === 'questions' && '❓'}
                      {tab === 'users' && '👥'}
                      {tab === 'results' && '📈'}
                      {tab === 'dicas' && '💡'}
                      <span>
                        {tab === 'dashboard' && 'Dashboard'}
                        {tab === 'questions' && 'Perguntas'}
                        {tab === 'users' && 'Usuários'}
                        {tab === 'results' && 'Resultados'}
                        {tab === 'dicas' && 'Dicas Saudáveis'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              {/* Alerts */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  <strong>Erro:</strong> {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  <strong>Sucesso:</strong> {success}
                </div>
              )}

              {/* Dashboard Content */}
              {activeTab === 'dashboard' && stats && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">📊 Dashboard</h2>
                  
                  {/* Cards Principais */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
                      <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">Total de Jogos</h3>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.total_games}</p>
                    </div>
                    <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
                      <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">Taxa de Acerto Geral</h3>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.overall_accuracy?.toFixed(1) || 0}%</p>
                    </div>
                    <div className="bg-purple-50 p-4 sm:p-6 rounded-lg border border-purple-200">
                      <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-2">Média de Acertos</h3>
                      <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.avg_correct?.toFixed(1) || 0}</p>
                    </div>
                  </div>

                  {/* Top 3 Perguntas com Maior Índice de Erro */}
                  <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">🚨 Top Perguntas com Maior Erro</h3>
                    {wrongAnswers && wrongAnswers.length > 0 ? (
                      <div className="space-y-4">
                        {wrongAnswers.map((question, index) => (
                          <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="text-sm sm:text-base font-medium text-gray-800 mb-1">
                                  {question.question}
                                </p>
                                <div className="flex gap-4 text-xs sm:text-sm text-gray-600">
                                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                                    {question.difficulty === 'facil' ? 'Fácil' : question.difficulty === 'medio' ? 'Médio' : 'Difícil'}
                                  </span>
                                  <span>❌ {question.times_wrong} erros</span>
                                  <span>📊 {question.times_appeared} vezes</span>
                                  <span>📈 {question.error_rate}% erro</span>
                                </div>
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-red-600">
                                #{index + 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm sm:text-base">Nenhuma pergunta com erro registrada ainda</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Os dados aparecerão aqui após alguns jogos</p>
                      </div>
                    )}
                  </div>

                  {/* Métricas Adicionais */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-yellow-200">
                      <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">Total Acertos</h3>
                      <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.total_correct || 0}</p>
                    </div>
                    <div className="bg-orange-50 p-4 sm:p-6 rounded-lg border border-orange-200">
                      <h3 className="text-base sm:text-lg font-semibold text-orange-800 mb-2">Total Erros</h3>
                      <p className="text-2xl sm:text-3xl font-bold text-orange-600">{(stats.total_questions || 0) - (stats.total_correct || 0)}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 sm:p-6 rounded-lg border border-indigo-200">
                      <h3 className="text-base sm:text-lg font-semibold text-indigo-800 mb-2">Total Questões</h3>
                      <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.total_questions || 0}</p>
                    </div>
                    <div className="bg-pink-50 p-4 sm:p-6 rounded-lg border border-pink-200">
                      <h3 className="text-base sm:text-lg font-semibold text-pink-800 mb-2">Desempenho Médio</h3>
                      <p className="text-2xl sm:text-3xl font-bold text-pink-600">
                        {stats.total_questions > 0 
                          ? ((stats.total_correct / stats.total_questions) * 100).toFixed(1) 
                          : 0}%
                      </p>
                    </div>
                  </div>

                  {/* Resultados Recentes */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">🕐 Resultados Recentes</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jogador</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acertos</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Total</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Data</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentResults.slice(0, 5).map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.player_name}</td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.correct_answers}</td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{result.total_questions}</td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{new Date(result.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Dicas Content */}
              {activeTab === 'dicas' && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">💡 Gerenciar Dicas Saudáveis</h2>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      <strong>Atenção:</strong> Este conteúdo será exibido na página pública de dicas saudáveis. 
                      Use HTML para formatação (h1, h2, p, ul, li, strong, em, etc.).
                    </p>
                  </div>

                  <form onSubmit={handleUpdateDicass} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Conteúdo das Dicas</label>
                      <textarea
                        value={dicasContent}
                        onChange={(e) => setDicassContent(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm sm:text-base text-gray-800 placeholder-gray-500"
                        rows={20}
                        placeholder="Digite o conteúdo das dicas aqui... Você pode usar HTML para formatação."
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
                      >
                        {loading ? 'Salvando...' : 'Salvar Conteúdo'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Users Content */}
              {activeTab === 'users' && currentUser?.role === 'admin' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">👥 Gerenciar Usuários</h2>
                    <ActionButton
                      onClick={() => {
                        setEditingUser(null);
                        setUserMenuOpen(true);
                      }}
                      variant="primary"
                      className="w-auto px-6"
                    >
                      <Plus size={16} className="inline mr-2" />
                      Novo Usuário
                    </ActionButton>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Data</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {/* Não mostra botões de ação para o usuário admin principal (ID 1) */}
                              {user.id !== 1 && (
                                <div className="flex gap-2">
                                  <IconButton
                                    onClick={() => openEditUser(user)}
                                    variant="edit"
                                    title="Editar usuário"
                                  >
                                    <Edit size={16} />
                                  </IconButton>
                                  <IconButton
                                    onClick={() => handleDeleteUser(user.id)}
                                    variant="delete"
                                    title="Excluir usuário"
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </div>
                              )}
                              {user.id === 1 && (
                                <span className="text-xs text-gray-400 font-medium">Protegido</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Menu Lateral de Usuários */}
                  <SideMenu
                    isOpen={userMenuOpen}
                    onClose={() => setUserMenuOpen(false)}
                    title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                  >
                    <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Usuário</label>
                        <input
                          type="text"
                          value={editingUser ? editingUser.username : newUser.username}
                          onChange={(e) => {
                            if (editingUser) {
                              setEditingUser({...editingUser, username: e.target.value});
                            } else {
                              setNewUser({...newUser, username: e.target.value});
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          {editingUser ? 'Nova Senha (deixe em branco para manter atual)' : 'Senha'}
                        </label>
                        <input
                          type="password"
                          value={editingUser ? editingUser.password || '' : newUser.password}
                          onChange={(e) => {
                            if (editingUser) {
                              setEditingUser({...editingUser, password: e.target.value});
                            } else {
                              setNewUser({...newUser, password: e.target.value});
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                          required={!editingUser}
                          placeholder={editingUser ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Função</label>
                        <select
                          value={editingUser ? editingUser.role : newUser.role}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (editingUser) {
                              setEditingUser({...editingUser, role: value});
                            } else {
                              setNewUser({...newUser, role: value});
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 text-sm sm:text-base"
                        >
                          <option value="user">Usuário</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                      
                      <ActionButton
                        type="submit"
                        disabled={loading}
                        variant="primary"
                      >
                        {loading ? 'Processando...' : (editingUser ? 'Atualizar Usuário' : 'Criar Usuário')}
                      </ActionButton>
                    </form>
                  </SideMenu>
                </div>
              )}

              {/* Results Content */}
              {activeTab === 'results' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">📈 Resultados Completos</h2>
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={handleDeleteAllResults}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
                      >
                        🗑️ Remover Todos
                      </button>
                    )}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jogador</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acertos</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Fáceis</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Médias</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Difíceis</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Data</th>
                          {currentUser?.role === 'admin' && (
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentResults.map((result, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.player_name}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.correct_answers}/{result.total_questions}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{result.easy_correct || 0}/{result.easy_total || 0}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{result.medium_correct || 0}/{result.medium_total || 0}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{result.hard_correct || 0}/{result.hard_total || 0}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{new Date(result.created_at).toLocaleDateString()}</td>
                            {currentUser?.role === 'admin' && (
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <IconButton
                                  onClick={() => result.id && handleDeleteResult(result.id)}
                                  variant="delete"
                                  title="Remover resultado"
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {currentUser?.role === 'admin' && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        <strong>Atenção:</strong> Apenas administradores podem remover resultados. 
                        Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Questions Content */}
              {activeTab === 'questions' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">❓ Gerenciar Perguntas</h2>
                    <ActionButton
                      onClick={() => {
                        setEditingQuestion(null);
                        setQuestionMenuOpen(true);
                      }}
                      variant="primary"
                      className="w-auto px-6"
                    >
                      <Plus size={16} className="inline mr-2" />
                      Nova Pergunta
                    </ActionButton>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pergunta</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dificuldade</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Alternativas</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {questions.map((question) => (
                          <tr key={question.id} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{question.question}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{question.difficulty}</td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                              {(() => {
                                try {
                                  const alternatives = JSON.parse(question.alternatives as string);
                                  return Array.isArray(alternatives) ? alternatives.length : 0;
                                } catch {
                                  return 0;
                                }
                              })()} alternativas
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex gap-2">
                                <IconButton
                                  onClick={() => openEditQuestion(question)}
                                  variant="edit"
                                  title="Editar pergunta"
                                >
                                  <Edit size={16} />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  variant="delete"
                                  title="Excluir pergunta"
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Menu Lateral de Perguntas */}
                  <SideMenu
                    isOpen={questionMenuOpen}
                    onClose={() => setQuestionMenuOpen(false)}
                    title={editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
                  >
                    <form onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Pergunta</label>
                        <textarea
                          value={editingQuestion ? editingQuestion.question : newQuestion.question}
                          onChange={(e) => {
                            if (editingQuestion) {
                              setEditingQuestion({...editingQuestion, question: e.target.value});
                            } else {
                              setNewQuestion({...newQuestion, question: e.target.value});
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Alternativas</label>
                        {(editingQuestion ? getAlternatives(editingQuestion) : newQuestion.alternatives).map((alt: string, index: number) => (
                          <input
                            key={index}
                            type="text"
                            value={alt}
                            onChange={(e) => {
                              const currentAlternatives = editingQuestion ? getAlternatives(editingQuestion) : newQuestion.alternatives;
                              const newAlternatives = [...currentAlternatives];
                              newAlternatives[index] = e.target.value;
                              if (editingQuestion) {
                                setEditingQuestion({...editingQuestion, alternatives: newAlternatives});
                              } else {
                                setNewQuestion({...newQuestion, alternatives: newAlternatives});
                              }
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-500 text-sm sm:text-base mb-2"
                            placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                            required
                          />
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Resposta Correta</label>
                          <select
                            value={editingQuestion ? editingQuestion.correct_answer : newQuestion.correct_answer}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (editingQuestion) {
                                setEditingQuestion({...editingQuestion, correct_answer: value});
                              } else {
                                setNewQuestion({...newQuestion, correct_answer: value});
                              }
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 text-sm sm:text-base"
                          >
                            {(editingQuestion ? getAlternatives(editingQuestion) : newQuestion.alternatives).map((alt: string, index: number) => (
                          <option key={index} value={index}>
                            {String.fromCharCode(65 + index)}
                          </option>
                        ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Dificuldade</label>
                          <select
                            value={editingQuestion ? editingQuestion.difficulty : newQuestion.difficulty}
                            onChange={(e) => {
                              const value = e.target.value as 'facil' | 'medio' | 'dificil';
                              if (editingQuestion) {
                                setEditingQuestion({...editingQuestion, difficulty: value});
                              } else {
                                setNewQuestion({...newQuestion, difficulty: value});
                              }
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 text-sm sm:text-base"
                          >
                            <option value="facil">Fácil</option>
                            <option value="medio">Médio</option>
                            <option value="dificil">Difícil</option>
                          </select>
                        </div>
                      </div>
                      
                      <ActionButton
                        type="submit"
                        disabled={loading}
                        variant="primary"
                      >
                        {loading ? 'Processando...' : (editingQuestion ? 'Atualizar Pergunta' : 'Criar Pergunta')}
                      </ActionButton>
                    </form>
                  </SideMenu>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
