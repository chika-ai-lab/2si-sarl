import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, ImageOff, Upload, Loader2 } from "lucide-react";
import { televerserImage } from "@/lib/televersement";

interface ImageUrlInputProps {
  images: string[];
  onChange: (images: string[]) => void;
}

function ImagePreview({ url }: { url: string }) {
  const [error, setError] = useState(false);

  // Réinitialise l'erreur quand l'URL change
  useEffect(() => { setError(false); }, [url]);

  if (!url || error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
        <ImageOff className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="h-full w-full object-cover"
      onError={() => setError(true)}
      onLoad={() => setError(false)}
    />
  );
}

export function ImageUrlInput({ images, onChange }: ImageUrlInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [envois, setEnvois] = useState(0);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [survol, setSurvol] = useState(false);

  const envoyer = async (fichiers: FileList | null) => {
    const liste = Array.from(fichiers ?? []);
    if (!liste.length) return;
    setErreurEnvoi(null);
    setEnvois(liste.length);
    const ajoutees: string[] = [];
    const erreurs: string[] = [];
    for (const f of liste) {
      try {
        ajoutees.push(await televerserImage(f));
      } catch (err) {
        erreurs.push(err instanceof Error ? err.message : `Échec pour « ${f.name} ».`);
      }
      setEnvois((n) => n - 1);
    }
    if (ajoutees.length) onChange([...images, ...ajoutees]);
    if (erreurs.length) setErreurEnvoi(erreurs.join(" "));
  };

  const isValidUrl = (url: string) => {
    try { new URL(url); return true; } catch { return false; }
  };

  const addImage = () => {
    const url = inputValue.trim();
    if (!url || !isValidUrl(url) || images.includes(url)) return;
    onChange([...images, url]);
    setInputValue("");
    setPreviewError(false);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const showPreview = inputValue.trim().length > 10 && isValidUrl(inputValue.trim());

  return (
    <div className="space-y-3">
      <Label>Images</Label>

      {/* Téléversement : la voie principale. Glisser-déposer ou choisir des fichiers. */}
      <label
        onDragOver={(e) => { e.preventDefault(); setSurvol(true); }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => { e.preventDefault(); setSurvol(false); envoyer(e.dataTransfer.files); }}
        className={`flex items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-sm cursor-pointer transition-colors ${
          survol ? "border-primary bg-primary/5" : "hover:bg-muted/40"
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          disabled={envois > 0}
          onChange={(e) => { envoyer(e.target.files); e.target.value = ""; }}
        />
        {envois > 0 ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Envoi de {envois} photo(s)…</>
        ) : (
          <><Upload className="h-4 w-4 text-muted-foreground" />
            <span><span className="font-medium">Téléverser des photos</span>
              <span className="text-muted-foreground"> ou les glisser ici · JPEG, PNG, WebP</span></span></>
        )}
      </label>
      {erreurEnvoi && <p className="text-xs text-destructive">{erreurEnvoi}</p>}

      {/* Ou une image déjà en ligne */}
      <p className="text-xs text-muted-foreground">Ou coller l'adresse d'une image en ligne :</p>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setPreviewError(false); }}
          placeholder="https://exemple.com/image.jpg"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
        />
        <Button type="button" variant="outline" onClick={addImage} disabled={!showPreview}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview de l'URL en cours de saisie */}
      {showPreview && (
        <div className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
          <div className="h-20 w-20 rounded border overflow-hidden shrink-0 bg-muted">
            {previewError ? (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                <ImageOff className="h-5 w-5" />
              </div>
            ) : (
              <img
                src={inputValue.trim()}
                alt="aperçu"
                className="h-full w-full object-cover"
                onError={() => setPreviewError(true)}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Aperçu</p>
            <p className="text-xs font-mono truncate text-muted-foreground">{inputValue.trim()}</p>
            {previewError && (
              <p className="text-xs text-destructive mt-1">Image non accessible ou URL invalide</p>
            )}
          </div>
        </div>
      )}

      {/* Images ajoutées */}
      {images.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">{images.length} image(s) ajoutée(s)</p>
          <div className="flex flex-wrap gap-2">
            {images.map((url, i) => (
              <div key={url} className="relative group h-20 w-20 rounded border overflow-hidden bg-muted shrink-0">
                <ImagePreview url={url} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
