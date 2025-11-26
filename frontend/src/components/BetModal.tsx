import {useState} from 'react';

type BetModalProps = {
  matchId: number;
  teamId: number;
  teamName: string;
  userBalance: number;
  onClose: () => void;
  onConfirm: (matchId: number, teamId: number, amount: number) => Promise<void>;
  onSuccess?: () => void;
};

export function BetModal({
  matchId,
  teamId,
  teamName,
  userBalance,
  onClose,
  onConfirm,
  onSuccess,
}: BetModalProps) {
  const [betAmount, setBetAmount] = useState<string>('');
  const [betError, setBetError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleConfirm = async () => {
    setBetError(null);
    
    if (!betAmount || parseFloat(betAmount) <= 0) {
      setBetError('Por favor ingresa un monto válido mayor a $0');
      return;
    }

    const amount = parseFloat(betAmount);
    if (amount > userBalance) {
      setBetError(`Saldo insuficiente. Tu saldo actual es $${userBalance}`);
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm(matchId, teamId, amount);
      onSuccess?.();
      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setBetError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAmountChange = (value: string) => {
    if (value === '' || parseFloat(value) >= 0) {
      setBetAmount(value);
      setBetError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-200 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader 
          teamName={teamName}
          onClose={handleClose}
        />

        <BetAmountInput
          value={betAmount}
          userBalance={userBalance}
          onChange={handleAmountChange}
          onKeyDown={handleKeyDown}
        />

        {betError && (
          <ErrorMessage message={betError} />
        )}

        <ActionButtons
          onCancel={handleClose}
          onConfirm={handleConfirm}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}

type ModalHeaderProps = {
  teamName: string;
  onClose: () => void;
};

function ModalHeader({teamName, onClose}: ModalHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Quemá tus ahorros</h2>
        <p className="text-slate-400 text-sm">
          Apostando por: <span className="font-semibold text-blue-400">{teamName}</span>
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white text-2xl"
      >
        ×
      </button>
    </div>
  );
}

type BetAmountInputProps = {
  value: string;
  userBalance: number;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

function BetAmountInput({value, userBalance, onChange, onKeyDown}: BetAmountInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm text-slate-300 mb-2 font-semibold">
        Monto a apostar
      </label>
      <input
        type="number"
        placeholder="0.00"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-lg text-white text-lg text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
        autoFocus
      />
      <p className="text-xs text-slate-400 mt-2 text-center">
        Saldo disponible: <span className="font-semibold text-green-400">${userBalance}</span>
      </p>
    </div>
  );
}

function ErrorMessage({message}: {message: string}) {
  return (
    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg animate-shake">
      <p className="text-sm text-red-300 text-center font-medium">{message}</p>
    </div>
  );
}

type ActionButtonsProps = {
  onCancel: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
};

function ActionButtons({onCancel, onConfirm, isProcessing}: ActionButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onCancel}
        disabled={isProcessing}
        className="flex-1 px-4 py-3 bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        disabled={isProcessing}
        className="flex-1 px-4 py-3 bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Procesando...' : 'Confirmar apuesta'}
      </button>
    </div>
  );
}
