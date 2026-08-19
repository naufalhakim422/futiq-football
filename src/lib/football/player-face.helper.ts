/**
 * CANONICAL PLAYER FACE HELPER
 *
 * Re-exports verified identity resolver methods.
 * Completely eliminates any fuzzy name matching or unverified stock photos.
 */

import { playerIdentityResolver } from "./player-identity.resolver";

export function getPlayerFacePhoto(name?: string, number?: number, playerId?: string): string | null {
  return playerIdentityResolver.resolvePlayerPhoto(playerId, null);
}
