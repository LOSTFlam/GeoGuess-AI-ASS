import React, { useState, useEffect } from 'react';
import { Globe, Map, Sparkles, AlertCircle } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import { analyzeLocation } from './services/gemini';
import { UploadedImage, AnalysisResult, AppStatus } from './types';

const App: React.FC = () => {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (uploadedImage: UploadedImage) => {
    setImage(uploadedImage);
    setStatus(AppStatus.IDLE);
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setImage(null);
    setStatus(AppStatus.IDLE);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setStatus(AppStatus.ANALYZING);
    setError(null);

    try {
      const analysisData = await analyzeLocation(image.base64, image.mimeType);
      setResult(analysisData);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при анализе.");
      setStatus(AppStatus.ERROR);
    }
  };

  // Handle global paste events
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      // Don't interrupt analysis
      if (status === AppStatus.ANALYZING) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              // Extract base64 data without prefix for API
              const base64Data = result.split(',')[1];
              
              handleImageSelected({
                base64: base64Data,
                mimeType: file.type,
                previewUrl: result
              });
            };
            reader.readAsDataURL(file);
          }
          // Only process the first image found
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [status]); // Re-bind if status changes (to update the closure check)

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-slate-100 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg shadow-lg shadow-emerald-500/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              GeoGuessr <span className="text-emerald-400">AI</span> Assistant
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span className="hidden sm:block">POWERED BY GEMINI 2.5</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200">
                <Map className="w-5 h-5 text-cyan-400" />
                Загрузка скриншота
              </h2>
              
              <ImageUploader 
                currentImage={image}
                onImageSelected={handleImageSelected}
                onClear={handleClear}
                disabled={status === AppStatus.ANALYZING}
              />

              {image && status !== AppStatus.ANALYZING && status !== AppStatus.SUCCESS && (
                <button
                  onClick={handleAnalyze}
                  className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Анализировать локацию
                </button>
              )}

              {status === AppStatus.ANALYZING && (
                <button
                  disabled
                  className="w-full mt-6 bg-slate-700 text-slate-400 cursor-not-allowed font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2"
                >
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-emerald-400 rounded-full animate-spin"></div>
                  Анализирую признаки...
                </button>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>

            {/* Tips Section */}
            <div className="hidden lg:block bg-slate-800/20 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Советы по съемке</h3>
              <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                <li>Захватите дорожные знаки крупным планом</li>
                <li>Покажите разметку дороги и бордюры</li>
                <li>Включите в кадр столбы ЛЭП и архитектуру</li>
                <li>Солнце и тени помогают определить полушарие</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            {status === AppStatus.IDLE && !result && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-800/20">
                <Globe className="w-16 h-16 text-slate-700 mb-4" />
                <h3 className="text-xl font-semibold text-slate-500">Ожидание загрузки</h3>
                <p className="text-slate-600 mt-2 max-w-md">
                  Загрузите скриншот из игры, чтобы ИИ определил ваше местоположение на основе визуальных данных. <br/>
                  <span className="text-emerald-500 font-mono text-xs mt-2 block bg-slate-900/50 py-1 px-2 rounded-lg w-fit mx-auto">Поддерживается Ctrl+V</span>
                </p>
              </div>
            )}

            {status === AppStatus.ANALYZING && (
               <div className="h-full flex flex-col items-center justify-center p-12 space-y-6">
                 <div className="relative">
                   <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Map className="w-8 h-8 text-emerald-500/50" />
                   </div>
                 </div>
                 <div className="text-center space-y-2 animate-pulse">
                   <h3 className="text-xl font-bold text-white">Изучаю местность...</h3>
                   <p className="text-slate-400">Смотрю на знаки, растительность и архитектуру</p>
                 </div>
               </div>
            )}

            {result && (
              <ResultDisplay result={result} />
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;