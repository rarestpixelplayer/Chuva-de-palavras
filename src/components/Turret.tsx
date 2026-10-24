import React from 'react';
import { CannonBall } from '../types/game';

interface TurretProps {
  targetX?: number; // 0 to 100 percentage
  targetY?: number; // 0 to 100 percentage
  isFiring?: boolean;
  cannonBalls: CannonBall[];
  equippedSkinId?: string;
}

export const Turret: React.FC<TurretProps> = ({
  targetX = 50,
  targetY = 20,
  isFiring = false,
  cannonBalls,
  equippedSkinId = 'classic',
}) => {
  // Configurações visuais por Skin
  const skinStyles: Record<string, { dome: string; barrel: string; glow: string; bulletGlow: string }> = {
    classic: {
      dome: 'from-orange-600 via-orange-500 to-orange-400 border-orange-200',
      barrel: 'from-slate-950 via-slate-800 to-slate-900',
      glow: '#38bdf8',
      bulletGlow: 'rgba(251, 191, 36, 0.9)',
    },
    emerald: {
      dome: 'from-emerald-700 via-emerald-600 to-teal-500 border-emerald-300',
      barrel: 'from-emerald-950 via-emerald-850 to-teal-950',
      glow: '#34d399',
      bulletGlow: 'rgba(52, 211, 153, 0.9)',
    },
    laser: {
      dome: 'from-fuchsia-700 via-purple-600 to-fuchsia-500 border-fuchsia-300',
      barrel: 'from-purple-950 via-indigo-900 to-purple-950',
      glow: '#e879f9',
      bulletGlow: 'rgba(244, 114, 182, 0.9)',
    },
    cosmic: {
      dome: 'from-blue-700 via-sky-600 to-indigo-500 border-sky-300',
      barrel: 'from-slate-950 via-blue-900 to-slate-950',
      glow: '#38bdf8',
      bulletGlow: 'rgba(56, 189, 248, 0.9)',
    },
    golden: {
      dome: 'from-amber-500 via-yellow-400 to-amber-300 border-yellow-100',
      barrel: 'from-amber-950 via-yellow-800 to-amber-950',
      glow: '#fde047',
      bulletGlow: 'rgba(250, 204, 21, 0.9)',
    },
    dragon: {
      dome: 'from-red-700 via-rose-600 to-orange-500 border-red-300',
      barrel: 'from-stone-950 via-red-950 to-stone-950',
      glow: '#f87171',
      bulletGlow: 'rgba(244, 63, 94, 0.9)',
    },
    solar: {
      dome: 'from-amber-400 via-orange-500 to-yellow-300 border-yellow-200',
      barrel: 'from-amber-950 via-orange-900 to-amber-950',
      glow: '#fef08a',
      bulletGlow: 'rgba(251, 191, 36, 0.95)',
    },
  };

  const currentSkin = skinStyles[equippedSkinId] || skinStyles.classic;
  // Canhão centralizado em x = 50%, y = chão (100%) - rastreamento automático do alvo
  const dx = targetX - 50;
  // O chão está em 100%. Ponto de pivô do canhão fica a ~96%.
  const dy = Math.min(-0.01, targetY - 96);
  const angleRad = Math.atan2(dx, -dy);
  let angleDeg = angleRad * (180 / Math.PI);

  // Limite estrito de 180 graus: de -90° (horizontal esquerda) a +90° (horizontal direita)
  angleDeg = Math.max(-90, Math.min(90, angleDeg));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Bolas de canhão teleguiadas voando pelo ar com rastro de cometa e faíscas */}
      {cannonBalls.map((ball) => {
        const ballDx = ball.targetX - ball.x;
        const ballDy = ball.targetY - ball.y;
        const trajAngle = Math.atan2(ballDy, ballDx) * (180 / Math.PI);

        return (
          <div
            key={ball.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-center transition-transform duration-75"
            style={{
              left: `${ball.x}%`,
              top: `${ball.y}%`,
            }}
          >
            {/* Rastro de plasma / cometa atrás da bala de canhão */}
            <div
              className="absolute pointer-events-none origin-right flex items-center"
              style={{
                width: '32px',
                height: '14px',
                right: '50%',
                transform: `rotate(${trajAngle + 180}deg)`,
              }}
            >
              {/* Cauda de fogo/fumaça gradiente */}
              <div
                className="w-full h-full rounded-l-full blur-[1px] opacity-80"
                style={{
                  background:
                    'linear-gradient(to left, rgba(251, 191, 36, 0.9), rgba(249, 115, 22, 0.7) 40%, rgba(239, 68, 68, 0.4) 75%, transparent 100%)',
                }}
              />
              {/* Núcleo brilhante branco */}
              <div className="absolute right-0 w-3 h-1.5 bg-white rounded-full blur-[0.5px]" />
            </div>

            {/* Brilho halo exterior pulsante */}
            <div className="absolute w-8 h-8 bg-amber-400/30 rounded-full blur-xs -z-10 animate-pulse" />
            <div className="absolute w-5 h-5 bg-orange-500/50 rounded-full blur-[1px] -z-10" />

            {/* Bola de canhão de ferro maciço com sombreamento 3D esférico */}
            <div
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-xl relative flex items-center justify-center border border-slate-700/80"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, #94a3b8 0%, #475569 35%, #1e293b 65%, #020617 100%)',
                boxShadow: '0 3px 8px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.6)',
              }}
            >
              {/* Reflexo especular vítreo */}
              <div className="absolute top-1 left-1.5 w-1.5 h-1.5 bg-white/90 rounded-full blur-[0.3px]" />
              {/* Segundo reflexo suave */}
              <div className="absolute bottom-1 right-1.5 w-1 h-1 bg-amber-400/40 rounded-full blur-[0.4px]" />
            </div>
          </div>
        );
      })}

      {/* CANHÃO TOCANDO O CHÃO (bottom-0) COM ROTAÇÃO DE 180 GRAUS */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-end z-25 pointer-events-none select-none"
        style={{ width: '128px', height: '68px' }}
      >
        {/* Cano giratório com amplitude total de 180° (-90° a +90°) e recuo mecânico */}
        <div
          className={`absolute transition-all ${
            isFiring ? 'duration-75' : 'duration-150 ease-out'
          }`}
          style={{
            bottom: '15px', // Pivô centralizado dentro do domo blindado
            left: '50%',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${angleDeg}deg) ${
              isFiring ? 'scaleY(0.85) translateY(4px)' : 'scaleY(1)'
            }`,
            zIndex: 15,
          }}
        >
          {/* Corpo do cano cilíndrico de aço blindado */}
          <div
            className={`w-4.5 sm:w-5 h-10 sm:h-11 bg-gradient-to-r ${currentSkin.barrel} rounded-t-sm shadow-2xl border border-slate-700 relative`}
            style={{
              boxShadow:
                '0 4px 12px rgba(0,0,0,0.6), inset 1px 0 2px rgba(255,255,255,0.25)',
            }}
          >
            {/* Anéis de reforço no cano */}
            <div className="absolute inset-x-0 top-3 h-1 bg-slate-950 border-y border-slate-600/80" />
            <div className="absolute inset-x-0 top-6.5 h-0.5 bg-slate-950/80 border-y border-slate-700/60" />

            {/* Boca reforçada do cano com anel de queima */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-gradient-to-r from-slate-950 via-slate-700 to-slate-950 rounded-xs border-b border-amber-600/50 shadow-md" />

            {/* Clarão luminoso cinemático, faíscas e anel de plasma na boca do canhão no instante do disparo */}
            {isFiring && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-30">
                {/* Onda de choque de plasma em expansão */}
                <div className="absolute w-14 h-14 border-2 border-amber-300 rounded-full animate-ping opacity-90" />
                <div className="absolute w-10 h-10 border border-orange-400 rounded-full animate-pulse" />
                
                {/* Clarão esférico hiper-brilhante */}
                <div className="w-12 h-12 bg-amber-200/90 rounded-full blur-[4px] shadow-2xl shadow-amber-400" />
                <div className="w-8 h-8 bg-orange-500 rounded-full absolute blur-[2px]" />
                <div className="w-4 h-4 bg-white rounded-full absolute shadow-lg shadow-white" />

                {/* Faíscas radiantes disparadas da boca do cano */}
                <div className="absolute -top-2 left-0 w-1.5 h-1.5 bg-yellow-200 rounded-full shadow-xs animate-ping" />
                <div className="absolute -top-3 right-0 w-1 h-1 bg-amber-300 rounded-full shadow-xs animate-ping" />
                <div className="absolute top-1 -left-3 w-1.5 h-1.5 bg-orange-400 rounded-full shadow-xs" />
                <div className="absolute top-1 -right-3 w-1.5 h-1.5 bg-orange-400 rounded-full shadow-xs" />

                {/* Nuvem rápida de pólvora/fumaça ascendente */}
                <div className="absolute -top-5 w-6 h-6 bg-slate-300/40 rounded-full blur-xs pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* CÚPULA / DOMO BLINDADO DA SKIN */}
        <div
          className={`relative z-20 w-18 sm:w-20 h-8.5 bg-gradient-to-t ${currentSkin.dome} rounded-t-full shadow-2xl border-t-2 border-x-2 flex items-center justify-center overflow-hidden`}
          style={{
            boxShadow:
              '0 -3px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4)',
          }}
        >
          {/* Brilho interior vítreo no domo */}
          <div className="w-10 h-4 bg-white/40 rounded-t-full absolute top-0.5 pointer-events-none" />

          {/* Marcadores de setor de mira na cúpula (indicando os 180°) */}
          <div className="absolute inset-x-2 top-2 flex justify-between opacity-50 text-[7px] font-mono text-white pointer-events-none">
            <span>◂90°</span>
            <span className="text-[6px]">▲</span>
            <span>90°▸</span>
          </div>

          {/* LED de prontidão / energia do canhão */}
          <div className="relative z-30 flex items-center justify-center mt-3">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-orange-200 flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-300 animate-pulse" />
            </div>
          </div>

          {/* Rebites mecânicos nas bordas */}
          <div className="absolute bottom-1 left-2.5 w-1 h-1 rounded-full bg-orange-800 shadow-xs" />
          <div className="absolute bottom-1 right-2.5 w-1 h-1 rounded-full bg-orange-800 shadow-xs" />
        </div>

        {/* BASE DE AÇO FUNDIDO ANCORADA DIRETAMENTE NO CHÃO */}
        <div className="w-28 sm:w-32 h-3.5 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 rounded-t-sm border-t-2 border-x border-slate-600 shadow-2xl flex items-center justify-between px-2.5 relative z-30">
          {/* Rebite esquerdo fixado no chão */}
          <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-400 shadow-xs" />

          {/* Mostrador mecânico de ângulo do canhão (Mostra os 180° em tempo real) */}
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-slate-300 tracking-tight">
            <span className="text-sky-300/80 text-[8px]">-90°</span>
            <span
              className={`px-1.5 py-0.2 rounded font-black text-[9px] border transition-colors ${
                Math.abs(angleDeg) > 80
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              {Math.round(angleDeg)}°
            </span>
            <span className="text-sky-300/80 text-[8px]">+90°</span>
          </div>

          {/* Rebite direito fixado no chão */}
          <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-400 shadow-xs" />
        </div>
      </div>
    </div>
  );
};
