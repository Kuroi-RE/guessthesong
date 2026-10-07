export type AudioFailure =
  | "offline"
  | "fetch"
  | "no-preview"
  | "decode"
  | "needs-gesture";

export class AudioError extends Error {
  readonly kind: AudioFailure;
  constructor(kind: AudioFailure, message?: string) {
    super(message ?? kind);
    this.kind = kind;
    this.name = "AudioError";
  }
}

interface LoadedClip {
  songId: string;
  buffer: AudioBuffer;
  /** Titik awal pemutaran di dalam preview, dalam detik. */
  offset: number;
}

/**
 * Pemutar klip presisi.
 *
 * Elemen <audio> biasa tidak bisa dipercaya untuk klip 0,1 detik: jeda antara
 * play() dan pause() diukur dalam puluhan milidetik, jadi pemain akan mendengar
 * durasi yang berbeda dari yang dijanjikan. Web Audio API menjadwalkan
 * start dan stop pada jam audio, jadi 0,1 detik benar-benar 0,1 detik
 * (PRD bagian 7.1).
 */
export class ClipPlayer {
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private clip: LoadedClip | null = null;
  private volume = 0.8;

  private ensureContext(): AudioContext {
    if (!this.context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) throw new AudioError("decode", "Web Audio API tidak tersedia");
      this.context = new Ctor();
      this.gain = this.context.createGain();
      this.gain.gain.value = this.volume;
      this.gain.connect(this.context.destination);
    }
    return this.context;
  }

  /**
   * Harus dipanggil dari dalam handler interaksi pemain. Browser mobile
   * membiarkan AudioContext dalam keadaan suspended sampai ada sentuhan
   * (PRD bagian 7.2), dan itulah yang membedakan "bisu" dari "error".
   */
  async unlock(): Promise<void> {
    const context = this.ensureContext();
    if (context.state === "suspended") {
      await context.resume();
    }
    if (context.state !== "running") {
      throw new AudioError("needs-gesture");
    }
  }

  isUnlocked(): boolean {
    return this.context?.state === "running";
  }

  setVolume(value: number): void {
    this.volume = Math.min(1, Math.max(0, value));
    if (this.gain) this.gain.gain.value = this.volume;
  }

  isLoaded(songId: string): boolean {
    return this.clip?.songId === songId;
  }

  async load(
    songId: string,
    clipUrl: string,
    startFrom: "beginning" | "elsewhere",
    longestClip: number,
  ): Promise<void> {
    if (this.clip?.songId === songId) return;

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new AudioError("offline");
    }

    let response: Response;
    try {
      response = await fetch(clipUrl, { cache: "no-store" });
    } catch {
      throw new AudioError("fetch");
    }

    if (response.status === 404) throw new AudioError("no-preview");
    if (!response.ok) throw new AudioError("fetch");

    const bytes = await response.arrayBuffer();
    const context = this.ensureContext();

    let buffer: AudioBuffer;
    try {
      buffer = await context.decodeAudioData(bytes);
    } catch {
      throw new AudioError("decode");
    }

    // "Dari bagian lain" tetap menyisakan ruang untuk klip terpanjang, kalau
    // tidak, tahap 15 detik akan terpotong di ujung preview.
    const room = Math.max(0, buffer.duration - longestClip);
    const offset = startFrom === "elsewhere" ? Math.random() * room : 0;

    this.clip = { songId, buffer, offset };
  }

  /**
   * Memutar klip sepanjang `seconds`, lalu melaporkan selesai.
   * Mengembalikan fungsi untuk menghentikan lebih awal.
   */
  play(seconds: number, onEnded: () => void): () => void {
    if (!this.clip) throw new AudioError("fetch", "klip belum dimuat");
    const context = this.ensureContext();
    if (context.state !== "running") throw new AudioError("needs-gesture");

    this.stop();

    const source = context.createBufferSource();
    source.buffer = this.clip.buffer;
    source.connect(this.gain!);

    const length = Math.min(
      seconds,
      Math.max(0.05, this.clip.buffer.duration - this.clip.offset),
    );

    source.onended = () => {
      if (this.source === source) this.source = null;
      onEnded();
    };

    source.start(context.currentTime, this.clip.offset, length);
    this.source = source;

    return () => this.stop();
  }

  stop(): void {
    if (!this.source) return;
    const source = this.source;
    this.source = null;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // Sudah berhenti sendiri. Tidak ada yang perlu dilakukan.
    }
    source.disconnect();
  }

  reset(): void {
    this.stop();
    this.clip = null;
  }
}
