"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Jembatan antara bilah atas dan layar game.
 *
 * Tombol Menu hidup di bilah atas, yang ada di semua halaman, sementara
 * "acak ulang lagu" hanya punya arti di halaman game. Daripada bilah atas
 * mengetahui isi game, layar game mendaftarkan satu tindakan ke sini dan
 * bilah atas memanggilnya kalau ada. Di halaman konten tidak ada yang
 * mendaftar, jadi tombolnya memang tidak dirender, bukan dirender mati.
 */
interface GameBridge {
  reroll: (() => void) | null;
  registerReroll: (handler: (() => void) | null) => void;
}

const GameBridgeContext = createContext<GameBridge | null>(null);

export function GameBridgeProvider({ children }: { children: ReactNode }) {
  const slot = useRef<(() => void) | null>(null);
  const [available, setAvailable] = useState(false);

  const registerReroll = useCallback((handler: (() => void) | null) => {
    slot.current = handler;
    setAvailable(handler !== null);
  }, []);

  // Fungsinya disimpan di ref, bukan di state, dan state hanya menyimpan
  // "ada atau tidak". Menyimpan fungsi langsung di state lewat setState akan
  // membuat React memperlakukannya sebagai updater dan menyimpan nilai
  // kembaliannya, bukan fungsinya.
  const reroll = useMemo(
    () => (available ? () => slot.current?.() : null),
    [available],
  );

  const value = useMemo(() => ({ reroll, registerReroll }), [reroll, registerReroll]);

  return (
    <GameBridgeContext.Provider value={value}>{children}</GameBridgeContext.Provider>
  );
}

export function useGameBridge(): GameBridge {
  const bridge = useContext(GameBridgeContext);
  if (!bridge) throw new Error("useGameBridge dipakai di luar GameBridgeProvider");
  return bridge;
}
