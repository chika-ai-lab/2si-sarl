import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, ImageOff } from "lucide-react";

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
      <Label>Images (URLs)</Label>

      {/* Input + bouton */}
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
