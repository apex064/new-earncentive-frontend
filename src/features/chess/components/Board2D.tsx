"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { GameStatus } from "../types/game-status";
import { PieceData } from "../types/piece-data";
import { ChessPosition } from "../types/chess-position";

type PromotionPiece = 'q' | 'r' | 'b' | 'n';

type Board2DProps = {
  game: GameStatus;
  onMove: (
    selectedPiece: PieceData,
    position: ChessPosition,
    promotion?: PromotionPiece,
  ) => void;
  myColor?: "white" | "black" | "spectator";
  isSpectator?: boolean;
};

function getValidFen(fen: string): string {
  if (!fen || fen === "start") {
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  }
  const parts = fen.split(" ");
  if (parts.length >= 6) return fen;
  const position = parts[0];
  const turn = parts[1] === "w" || parts[1] === "b" ? parts[1] : "w";
  const castling = parts[2] || "KQkq";
  const enPassant = parts[3] || "-";
  const halfmove = parts[4] || "0";
  const fullmove = parts[5] || "1";
  return `${position} ${turn} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
}

// Get responsive board width
const getBoardWidth = () => {
  if (typeof window === "undefined") return 500;
  const width = window.innerWidth;
  if (width < 480) return Math.min(width - 40, 300);
  if (width < 640) return Math.min(width - 40, 350);
  if (width < 768) return Math.min(width - 40, 400);
  return Math.min(width - 80, 500);
};

export function Board2D({
  game,
  onMove,
  myColor = "white",
  isSpectator = false,
}: Board2DProps) {
  const [boardWidth, setBoardWidth] = useState(500);

  // Ensure we have a valid position
  const position = getValidFen(game.fen);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setBoardWidth(getBoardWidth());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isPlayerTurn = !isSpectator && game.turn === myColor;
  const isGameOver =
    game.situation === "checkmate" ||
    game.situation === "stalemate" ||
    game.situation === "draw";
  const isCheck = game.situation === "check";

  // Track the currently-selected square for click-to-move
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // Clear selection whenever the position actually changes (move made, sync, etc.)
  useEffect(() => {
    setSelectedSquare(null);
  }, [game.fen]);

  // Legal destination squares for the currently selected piece
  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [];
    try {
      const chess = new Chess(getValidFen(game.fen));
      return chess.moves({ square: selectedSquare as any, verbose: true });
    } catch {
      return [];
    }
  }, [selectedSquare, game.fen]);

  // Shared move-execution logic used by both drag-drop and click-to-move
  const executeMove = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      try {
        const chess = new Chess(getValidFen(game.fen));
        const move = chess.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
        if (!move) return false;

        const fromPos = {
          file: sourceSquare[0].toUpperCase(),
          rank: parseInt(sourceSquare[1]),
        };
        const toPos = {
          file: targetSquare[0].toUpperCase(),
          rank: parseInt(targetSquare[1]),
        };

        let pieceType: string;
        switch (move.piece) {
          case "p":
            pieceType = "pawn";
            break;
          case "n":
            pieceType = "knight";
            break;
          case "b":
            pieceType = "bishop";
            break;
          case "r":
            pieceType = "rook";
            break;
          case "q":
            pieceType = "queen";
            break;
          case "k":
            pieceType = "king";
            break;
          default:
            pieceType = "pawn";
        }

        const movedPieceData: PieceData = {
          id: `${move.piece}-${sourceSquare}-${Date.now()}`,
          type: pieceType,
          rank: fromPos.rank,
          file: fromPos.file,
          rival: move.color === "w" ? "white" : "black",
          isMoved: true,
        };

        const isPromotion = move.flags.includes("p");
        if (isPromotion) {
          onMove(movedPieceData, toPos, "q");
        } else {
          onMove(movedPieceData, toPos);
        }
        return true;
      } catch (error) {
        console.error("Move error:", error);
        return false;
      }
    },
    [game.fen, onMove],
  );

  // v5: onPieceDrop receives a single object { piece, sourceSquare, targetSquare }
  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: string;
      sourceSquare: string;
      targetSquare: string | undefined;
    }) => {
      if (isSpectator || isGameOver || !isPlayerTurn || !targetSquare)
        return false;
      const moved = executeMove(sourceSquare, targetSquare);
      if (moved) setSelectedSquare(null);
      return moved;
    },
    [isSpectator, isGameOver, isPlayerTurn, executeMove],
  );

  // Click-to-move: click a piece to select it (shows dots), click a
  // highlighted square to move there, click elsewhere to deselect.
  const onSquareClick = useCallback(
    ({
      square,
      piece,
    }: {
      square: string;
      piece?: { pieceType: string } | null;
    }) => {
      if (isSpectator || isGameOver || !isPlayerTurn) return;

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
          return;
        }
        const isLegalTarget = legalMoves.some((m) => m.to === square);
        if (isLegalTarget) {
          const moved = executeMove(selectedSquare, square);
          setSelectedSquare(moved ? null : selectedSquare);
          return;
        }
      }

      // Selecting a new piece: only allow selecting your own pieces
      if (piece) {
        const pieceColor = piece.pieceType[0]; // 'w' or 'b'
        const myPieceColor = myColor === "black" ? "b" : "w";
        if (pieceColor === myPieceColor) {
          setSelectedSquare(square);
          return;
        }
      }
      setSelectedSquare(null);
    },
    [
      isSpectator,
      isGameOver,
      isPlayerTurn,
      selectedSquare,
      legalMoves,
      myColor,
      executeMove,
    ],
  );

  // Build highlight styles: selected square + a dot for quiet moves,
  // a ring for captures — mirrors the green/red highlight look of the 3D board
  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "rgba(16, 185, 129, 0.35)",
      };
    }

    legalMoves.forEach((move) => {
      const isCapture = !!move.captured;
      styles[move.to] = isCapture
        ? {
            background:
              "radial-gradient(circle, transparent 55%, rgba(239, 68, 68, 0.65) 56%, rgba(239, 68, 68, 0.65) 68%, transparent 69%)",
          }
        : {
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.55) 22%, transparent 23%)",
          };
    });

    return styles;
  }, [selectedSquare, legalMoves]);

  // v5: all board config lives in a single `options` object
  const chessboardOptions = {
    position,
    onPieceDrop,
    onSquareClick,
    squareStyles,
    boardOrientation: (myColor === "black" ? "black" : "white") as
      | "black"
      | "white",
    allowDragging: !isSpectator && !isGameOver && isPlayerTurn,
    darkSquareStyle: { backgroundColor: "#4a18a8" },
    lightSquareStyle: { backgroundColor: "#f3f4f6" },
    animationDurationInMs: 200,
  };

  return (
    <div className="board-2d-container">
      {isSpectator && (
        <div className="spectator-overlay">
          <div className="spectator-badge">
            👁️ Spectator Mode - Watching Live Game
          </div>
        </div>
      )}

      <div className="turn-indicator">
        {!isSpectator && !isPlayerTurn && !isGameOver && (
          <div className="opponent-turn">⏳ Waiting for opponent...</div>
        )}
        {isSpectator && !isGameOver && (
          <div className="spectator-turn">
            👁️ Spectating - Live Game in Progress
          </div>
        )}
        {isCheck && isPlayerTurn && !isSpectator && (
          <div className="check-indicator">⚠️ CHECK!</div>
        )}
        {isGameOver && (
          <div className="game-over-indicator">
            {game.situation === "checkmate"
              ? "CHECKMATE!"
              : game.situation === "stalemate"
                ? "STALEMATE!"
                : "DRAW!"}
          </div>
        )}
      </div>

      <div className="board-2d-inner">
        <Chessboard options={chessboardOptions} />
      </div>

      <style jsx>{`
        .board-2d-container {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(74, 24, 168, 0.3);
          position: relative;
          display: inline-block;
        }
        .board-2d-inner {
          width: min(90vw, 500px);
        }
        @media (max-width: 640px) {
          .board-2d-container {
            padding: 10px;
          }
        }
        @media (max-width: 480px) {
          .board-2d-container {
            padding: 8px;
          }
        }
        .spectator-overlay {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          pointer-events: none;
        }
        .spectator-badge {
          background: rgba(74, 24, 168, 0.9);
          backdrop-filter: blur(8px);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
          border: 1px solid rgba(139, 92, 246, 0.5);
          white-space: nowrap;
        }
        .turn-indicator {
          text-align: center;
          margin-bottom: 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        @media (max-width: 480px) {
          .turn-indicator {
            margin-bottom: 10px;
            font-size: 0.7rem;
          }
        }
        .opponent-turn {
          color: #f59e0b;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .spectator-turn {
          color: #8b5cf6;
          animation: pulse 2s ease-in-out infinite;
        }
        .check-indicator {
          color: #ef4444;
          animation: pulse 1s ease-in-out infinite;
          font-size: 1.1rem;
        }
        @media (max-width: 480px) {
          .check-indicator {
            font-size: 0.8rem;
          }
        }
        .game-over-indicator {
          color: #a78bfa;
          font-size: 1.1rem;
          font-weight: 700;
        }
        @media (max-width: 480px) {
          .game-over-indicator {
            font-size: 0.8rem;
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
