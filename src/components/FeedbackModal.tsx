import React, { useState } from 'react';
import { X, MessageSquare, Star, Send, CheckCircle2, Heart } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { submitFeedback } from '../services/firebase';

interface FeedbackModalProps {
  currentUserUid?: string;
  currentUsername?: string;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  currentUserUid,
  currentUsername,
  onClose,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('Sugestão');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const categories = ['Sugestão', 'Elogio', 'Bug/Erro', 'Ideia de Modo', 'Outro'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    soundManager.playButtonClick();
    setSubmitting(true);

    await submitFeedback({
      uid: currentUserUid,
      username: currentUsername || 'Anônimo',
      rating,
      category,
      comment: comment.trim(),
    });

    setSubmitting(false);
    setSubmitted(true);
    soundManager.playDailyMissionComplete();

    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-gradient-to-b from-[#002244] via-[#002f5c] to-[#004282] border-4 border-sky-400 rounded-3xl p-5 sm:p-7 max-w-md w-full text-white shadow-2xl shadow-sky-950/80 relative overflow-hidden flex flex-col gap-4">
        {/* Brilho decorativo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-24 bg-sky-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-sky-500/30 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 border border-sky-400/40 rounded-xl text-sky-300">
              <MessageSquare size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide uppercase">
                Enviar Feedback
              </h2>
              <p className="text-xs text-sky-200/80">
                Sua opinião e ideias ajudam a moldar o jogo!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors cursor-pointer border border-sky-500/20"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-white">Muito obrigado pelo seu feedback!</h3>
            <p className="text-xs text-slate-300 max-w-xs">
              Lemos todas as mensagens para implementar novas melhorias, modos e balanceamentos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Avaliação em Estrelas */}
            <div className="text-center space-y-1">
              <label className="text-xs font-bold text-sky-200 block uppercase tracking-wider">
                Como está sendo sua experiência?
              </label>
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating !== null ? hoverRating : rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => {
                        soundManager.playButtonClick();
                        setRating(star);
                      }}
                      className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer focus:outline-hidden"
                    >
                      <Star
                        size={28}
                        className={
                          filled
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow'
                            : 'text-slate-600'
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categorias */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-sky-200 block uppercase tracking-wider">
                Assunto do Feedback
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      setCategory(cat);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      category === cat
                        ? 'bg-sky-400 text-slate-950 border-sky-300 shadow-sm'
                        : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo de Texto */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-sky-200 uppercase tracking-wider">
                  Sua Mensagem
                </label>
                <span className="text-[11px] text-slate-400">{comment.length}/400</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 400))}
                rows={3}
                placeholder="Escreva sua sugestão, crítica ou ideia para o jogo..."
                className="w-full p-3 rounded-xl bg-slate-950/70 border border-sky-500/40 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-hidden focus:border-amber-400 transition-colors resize-none"
                required
              />
            </div>

            {/* Botão de Enviar */}
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="w-full py-3 px-4 rounded-xl font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/30"
            >
              <Send size={16} />
              <span>{submitting ? 'Enviando...' : 'Enviar Feedback'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
