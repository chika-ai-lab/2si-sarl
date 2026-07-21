import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Rendu à la place du fallback par défaut. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Libellé de la zone en échec, affiché dans le message. */
  label?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Isole les erreurs de rendu : si un sous-arbre plante, seul ce sous-arbre est
 * remplacé par un message de reprise, le reste de l'application continue de
 * fonctionner. À placer autour de chaque route et de chaque zone indépendante.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? ` ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>

          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Cette section n'a pas pu s'afficher
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Une erreur est survenue{this.props.label ? ` dans ${this.props.label}` : ""}. Le reste
            de l'application reste utilisable.
          </p>

          {import.meta.env.DEV && (
            <pre className="mb-6 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
              {error.message}
            </pre>
          )}

          <div className="flex justify-center gap-3">
            <Button onClick={this.reset} variant="default" size="sm">
              <RotateCcw className="h-4 w-4" />
              Réessayer
            </Button>
            <Button onClick={() => { window.location.href = "/"; }} variant="outline" size="sm">
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
