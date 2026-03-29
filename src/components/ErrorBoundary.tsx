import { Component, type ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches synchronous render errors so the whole app doesn't go blank.
 * Displays the error message and a retry button instead.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as unknown as { state: State }).state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    const label = (this as unknown as { props: Props }).props.label ?? 'component';
    console.error('[ErrorBoundary] Render error in', label, ':\n', error, info.componentStack);
  }

  render() {
    const { error } = (this as unknown as { state: State }).state;
    const { label, children } = (this as unknown as { props: Props }).props;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4 p-6">
          <AlertTriangle className="w-12 h-12 text-coral-500" />
          <h3 className="text-xl font-semibold text-white">Render Error</h3>
          <p className="text-slate-400 text-center max-w-md text-sm">
            {label && <span className="font-semibold text-slate-300">{label}: </span>}
            {error.message}
          </p>
          <pre className="text-xs text-slate-600 bg-navy-900 rounded-lg p-3 max-w-xl w-full overflow-x-auto border border-navy-800 max-h-32">
            {error.stack?.split('\n').slice(0, 6).join('\n')}
          </pre>
          <button
            onClick={() => (this as unknown as Component<Props, State>).setState({ error: null })}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 text-navy-950 font-semibold hover:bg-gold-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return children;
  }
}
