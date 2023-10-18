/**
 * Ported from : https://github.com/tachiyomiorg/tachiyomi-extensions/blob/master/multisrc/overrides/mangareader/mangareaderto/src/ImageInterceptor.kt
 */
import {
  CGSize,
  RedrawInstruction,
  RedrawWithSizeCommand,
} from "@suwatte/daisuke";
import seedrandom from "seedrandom";

// Define the structure for a piece
interface Piece {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const redraw = (size: CGSize): RedrawWithSizeCommand => {
  // Constants and initializations
  const KEY = "stay"; // Seed key for random number generation
  const PIECE_SIZE = 200; // Standard size for each piece of the image
  const commands: RedrawInstruction[] = []; // Array to hold redraw commands

  // Memoization storage to prevent redundant calculations for known sizes
  const memo: any = {};

  // Break the image into pieces based on PIECE_SIZE
  const pieces: Piece[] = [];
  for (let y = 0; y < size.height; y += PIECE_SIZE) {
    for (let x = 0; x < size.width; x += PIECE_SIZE) {
      const w = Math.min(PIECE_SIZE, size.width - x);
      const h = Math.min(PIECE_SIZE, size.height - y);
      pieces.push({ x, y, w, h });
    }
  }

  // Group pieces by their size
  const groups: Record<number, Piece[]> = {};
  for (const piece of pieces) {
    const key = (piece.w << 16) | piece.h; // Unique key for each size
    if (!groups[key]) groups[key] = [];
    groups[key].push(piece);
  }

  // Process each group of pieces
  for (const group of Object.values(groups)) {
    const size = group.length;

    // Generate or retrieve a permutation for the group's size
    const permutation =
      memo[size] ||
      (() => {
        const rng = seedrandom(KEY); // Seeded random number generator
        // Create an array of indices from 0 to size-1
        const indices = Array.from({ length: size }, (_, i) => i);
        // Shuffle the indices based on the seeded random generator
        return Array.from({ length: size }, () => {
          const nextDouble = rng();
          return indices.splice(Math.floor(nextDouble * indices.length), 1)[0];
        });
      })();

    // Use the permutation to determine how to rearrange the pieces
    for (const [i, original] of permutation.entries()) {
      const src = group[i];
      const dst = group[original];

      // Push the redraw instructions based on the original and destination pieces
      commands.push({
        source: {
          size: {
            width: src.w,
            height: src.h,
          },
          origin: {
            x: src.x,
            y: src.y,
          },
        },
        destination: {
          size: {
            width: dst.w,
            height: dst.h,
          },
          origin: {
            x: dst.x,
            y: dst.y,
          },
        },
      });
    }
  }

  // Return the final size and list of redraw commands
  return {
    size,
    commands,
  };
};
