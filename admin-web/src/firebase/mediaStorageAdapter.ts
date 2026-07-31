export interface MediaUploadResult {
  url: string;
  assetKey?: string;
}

export interface MediaStorageAdapter {
  isStorageEnabled(): boolean;
  getNoticeMessage(): string;
  resolveUrl(inputUrl?: string, assetKey?: string, localName?: string): string;
  uploadFile(file: File, path: string): Promise<MediaUploadResult>;
}

export class ExternalUrlMediaAdapter implements MediaStorageAdapter {
  isStorageEnabled(): boolean {
    return false; // Spark plan mode
  }

  getNoticeMessage(): string {
    return "O plano Spark do Firebase está ativo. Upload direto de arquivos desativado. Insira a URL HTTPS pública da mídia ou a chave de ativo (assetKey).";
  }

  resolveUrl(inputUrl?: string, assetKey?: string, localName?: string): string {
    if (inputUrl && inputUrl.trim().startsWith("http")) {
      return inputUrl.trim();
    }
    if (assetKey) {
      return `https://assets.vidasaudavel.app/media/${assetKey}.jpg`;
    }
    if (localName) {
      return `/assets/images/${localName}`;
    }
    return "https://placehold.co/600x400/F8D558/333333?text=Vida+Saudavel+Midia";
  }

  async uploadFile(_file: File, _path: string): Promise<MediaUploadResult> {
    throw new Error(
      "Upload de arquivos desativado no plano Spark. Utilize URL pública HTTPS."
    );
  }
}

export class FirebaseStorageMediaAdapter implements MediaStorageAdapter {
  isStorageEnabled(): boolean {
    return true; // Stub para plano Blaze futuro
  }

  getNoticeMessage(): string {
    return "Upload direto ativo via Firebase Storage.";
  }

  resolveUrl(inputUrl?: string, assetKey?: string, localName?: string): string {
    if (inputUrl) return inputUrl;
    if (assetKey) return `https://firebasestorage.googleapis.com/v0/b/vital-dd47f.appspot.com/o/${assetKey}?alt=media`;
    if (localName) return `/assets/${localName}`;
    return "https://placehold.co/600x400/F8D558/333333?text=Vida+Saudavel";
  }

  async uploadFile(file: File, path: string): Promise<MediaUploadResult> {
    // Exemplo para futuro upgrade no Blaze
    console.log("Future upload attempt:", file.name, path);
    return {
      url: `https://firebasestorage.googleapis.com/v0/b/vital-dd47f.appspot.com/o/${encodeURIComponent(path)}?alt=media`,
      assetKey: file.name
    };
  }
}

// Exporta o adaptador ativo por padrão (Spark)
export const currentMediaAdapter: MediaStorageAdapter = new ExternalUrlMediaAdapter();
