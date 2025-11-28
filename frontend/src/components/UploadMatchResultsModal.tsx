import {useState, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {ModalOverlay, ModalHeader} from './ModalOverlay';
import {CloseIcon} from './CloseIcon';
import {Button} from './Button';
import {ErrorMessage} from './ErrorMessage';
import {LiveMatchTimer} from './LiveMatchTimer';
import {UploadIcon} from './Icons';
import {useFormError} from '../hooks/useFormError';

type MatchSummary = {
  id: number;
  match_date: string;
  team_a_name?: string;
  team_b_name?: string;
  team_a_image?: string;
  team_b_image?: string;
};

type Props = {
  isOpen: boolean;
  isClosing: boolean;
  match: MatchSummary | null;
  onClose: () => void;
  onSubmit: (resultsFile: File, statsFile: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export function UploadMatchResultsModal({
  isOpen,
  isClosing,
  match,
  onClose,
  onSubmit,
  isLoading,
  error,
}: Props) {
  const [resultsFile, setResultsFile] = useState<File | null>(null);
  const [statsFile, setStatsFile] = useState<File | null>(null);
  const {
    displayError,
    setError: setLocalError,
    clearError,
  } = useFormError(error);
  const [exampleKind, setExampleKind] = useState<'results' | 'stats' | null>(
    null
  );

  const handleSubmit = async () => {
    clearError();
    if (!match) return;
    if (!resultsFile || !statsFile) {
      setLocalError('Se requieren ambos archivos: resultados y estadísticas.');
      return;
    }
    try {
      await onSubmit(resultsFile, statsFile);
    } catch (err: any) {
      setLocalError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      isClosing={isClosing}
      onClose={onClose}
      maxWidth="2xl"
    >
      <div className="flex flex-col max-h-[80vh]">
        <ModalHeader title="Cargar resultados" onClose={onClose} />

        <div className="space-y-4 overflow-y-auto pr-2 flex-1">
          <div className="bg-slate-900/40 border border-white/10 rounded-lg p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {match?.team_a_image && (
                <img
                  src={match.team_a_image}
                  alt={match.team_a_name}
                  className="w-8 h-8 object-contain shrink-0"
                />
              )}
              <div className="text-white font-semibold text-sm">
                {match?.team_a_name || 'Equipo A'}
              </div>
              <div className="text-slate-400 text-sm">vs</div>
              <div className="text-white font-semibold text-sm">
                {match?.team_b_name || 'Equipo B'}
              </div>
              {match?.team_b_image && (
                <img
                  src={match.team_b_image}
                  alt={match.team_b_name}
                  className="w-8 h-8 object-contain shrink-0"
                />
              )}
            </div>
            <div className="text-slate-400 text-sm text-right">
              <div>
                {match?.match_date
                  ? new Date(match.match_date).toLocaleString()
                  : ''}
              </div>
              {match?.match_date && new Date(match.match_date) <= new Date() ? (
                <div className="mt-1">
                  <LiveMatchTimer startTime={match.match_date} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            <div>
              <input
                id="results-upload"
                type="file"
                accept=".csv"
                onChange={e => setResultsFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <label
                htmlFor="results-upload"
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer inline-flex flex-col items-center w-full"
              >
                <UploadIcon className="w-12 h-12 text-slate-400 mb-3" />
                <span className="text-slate-300 font-semibold mb-1 text-lg">
                  {resultsFile
                    ? resultsFile.name
                    : 'Hacé clic acá para seleccionar el archivo CSV "results.csv"'}
                </span>
                <span className="text-slate-500 text-sm">
                  o arrastra y soltá el archivo acá
                </span>
              </label>

              <div className="mt-2 text-left">
                <button
                  type="button"
                  onClick={() => setExampleKind('results')}
                  className="text-blue-400 text-sm hover:underline"
                >
                  Hacé clic acá para un ejemplo.
                </button>
              </div>
            </div>

            <div>
              <input
                id="stats-upload"
                type="file"
                accept=".csv"
                onChange={e => setStatsFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <label
                htmlFor="stats-upload"
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer inline-flex flex-col items-center w-full"
              >
                <UploadIcon className="w-12 h-12 text-slate-400 mb-3" />
                <span className="text-slate-300 font-semibold mb-1 text-lg">
                  {statsFile
                    ? statsFile.name
                    : 'Hacé clic acá para seleccionar el archivo CSV "stats.csv"'}
                </span>
                <span className="text-slate-500 text-sm">
                  o arrastra y soltá el archivo acá
                </span>
              </label>

              <div className="mt-2 text-left">
                <button
                  type="button"
                  onClick={() => setExampleKind('stats')}
                  className="text-blue-400 text-sm hover:underline"
                >
                  Hacé clic acá para un ejemplo.
                </button>
              </div>
            </div>
          </div>

          <ErrorMessage
            message={displayError}
            variant="display"
            className="mt-2"
          />
          {exampleKind && (
            <ExamplesModal
              isOpen={true}
              isClosing={isClosing}
              onClose={() => setExampleKind(null)}
              kind={exampleKind}
            />
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3 shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !resultsFile || !statsFile}
            isLoading={isLoading}
            variant="gradient"
            className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            Cargar CSVs
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// Examples modal
function ExamplesModal({
  isOpen,
  isClosing,
  onClose,
  kind,
}: {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  kind: 'results' | 'stats';
}) {
  const resultsExample = `winning_team_id;team_a_score;team_b_score
7;13;7`;

  const statsExample = `player_id;kills;headshot_kills;assists;deaths
31;42;18;7;29
32;57;22;11;33
33;33;9;5;27
34;66;28;14;41
35;49;15;10;38
36;28;6;4;25
37;74;31;12;46
38;51;17;9;37
39;63;20;8;40
40;38;12;6;30
`;

  if (!isOpen) return null;

  // local closing state so we can animate before unmounting
  const [localIsClosing, setLocalIsClosing] = useState(false);
  useEffect(() => {
    // reset local closing when opened
    if (isOpen) setLocalIsClosing(false);
  }, [isOpen]);

  let closeTimeout: ReturnType<typeof setTimeout> | null = null;
  const handleRequestClose = () => {
    // start local closing animation, then call parent onClose after animation
    setLocalIsClosing(true);
    closeTimeout = setTimeout(() => {
      onClose();
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (closeTimeout) clearTimeout(closeTimeout as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const content = (
    <ModalOverlay
      isOpen={isOpen}
      isClosing={Boolean(isClosing || localIsClosing)}
      onClose={handleRequestClose}
      maxWidth="md"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold text-white">
            {kind === 'results' ? 'Ejemplo: results.csv' : 'Ejemplo: stats.csv'}
          </h4>
          <button
            onClick={handleRequestClose}
            className="text-slate-400 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Parsed CSV preview as a table */}
        <CsvPreview
          kind={kind}
          resultsExample={resultsExample}
          statsExample={statsExample}
        />
      </div>
    </ModalOverlay>
  );

  // Render examples modal into document.body so it doesn't interfere with parent modal layout
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
}

export default UploadMatchResultsModal;

// Small helper component to render CSV string as a table and provide a copy button
function CsvPreview({
  kind,
  resultsExample,
  statsExample,
}: {
  kind: 'results' | 'stats';
  resultsExample: string;
  statsExample: string;
}) {
  const csv = kind === 'results' ? resultsExample : statsExample;
  const rows = csv
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(r => r.split(';'));
  const header: string[] = rows[0] ?? [];
  const body: string[][] = rows.length > 1 ? rows.slice(1) : [];
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(csv);
      } else {
        // fallback: create a textarea, select and copy
        const ta = document.createElement('textarea');
        ta.value = csv;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      // shorter feedback duration
      timeoutRef.current = window.setTimeout(
        () => setCopied(false),
        800
      ) as unknown as number;
    } catch (err) {
      // ignore copy errors
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current)
        clearTimeout(timeoutRef.current as unknown as number);
    };
  }, []);

  return (
    <div>
      <div className="overflow-auto max-h-56 border border-white/10 rounded bg-slate-900/40 p-2">
        <table className="w-full text-sm table-auto">
          <thead>
            <tr>
              {header.map((h, i) => (
                <th
                  key={i}
                  className="text-left text-slate-300 text-xs font-medium px-2 py-1"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-slate-800/30' : ''}>
                {r.map((c, ci) => (
                  <td key={ci} className="px-2 py-1 text-slate-200 text-sm">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          onClick={handleCopy}
          variant="gradient"
          disabled={copied}
          className={`px-3 py-1.5 text-sm font-semibold ${
            copied ? 'opacity-90' : ''
          }`}
        >
          {copied ? '¡Copiado!' : 'Clic para copiar'}
        </Button>
      </div>
    </div>
  );
}
