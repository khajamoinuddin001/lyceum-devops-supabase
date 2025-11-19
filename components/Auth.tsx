
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useToast } from './Toast';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const { addToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!supabase) {
        addToast("Supabase keys are missing. Please configure env variables.", "error");
        setLoading(false);
        return;
    }

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // App.tsx listener will handle the redirect
      } else if (view === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        addToast("Check your email for the confirmation link!", "success");
      }
    } catch (error: any) {
      addToast(error.error_description || error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin,
          });
          if (error) throw error;
          addToast("Password reset email sent!", "success");
          setView('login');
      } catch (error: any) {
          addToast(error.message, "error");
      } finally {
          setLoading(false);
      }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    if (!supabase) return;

    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin,
            }
        });
        if (error) throw error;
    } catch (error: any) {
        addToast(`Failed to sign in with ${provider}: ${error.message}`, "error");
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
            <div className="flex justify-center mb-6">
                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                     <svg className="w-10 h-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
            </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Lyceum Academy</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            {view === 'login' && 'Sign in to your account'}
            {view === 'signup' && 'Create your student account'}
            {view === 'forgot-password' && 'Reset your password'}
          </p>
          
          {!supabase && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                      <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                              Missing Supabase Keys.
                          </p>
                      </div>
                  </div>
              </div>
          )}

          {view === 'forgot-password' ? (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                      <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="you@example.com"
                      />
                  </div>
                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                  >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <div className="text-center">
                      <button type="button" onClick={() => setView('login')} className="text-sm text-primary-600 hover:text-primary-500">
                          Back to Sign In
                      </button>
                  </div>
              </form>
          ) : (
              <form onSubmit={handleAuth} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                
                {view === 'login' && (
                    <div className="flex justify-end">
                        <button type="button" onClick={() => setView('forgot-password')} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Forgot password?
                        </button>
                    </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !supabase}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Loading...' : view === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>
          )}

          {view !== 'forgot-password' && (
            <>
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => handleOAuth('google')}
                            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="ml-2">Google</span>
                        </button>

                        <button 
                            onClick={() => handleOAuth('apple')}
                            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-black text-sm font-medium text-white hover:bg-gray-800"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                            </svg>
                            <span className="ml-2">Apple</span>
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                    {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                        className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    >
                        {view === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                    </p>
                </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
