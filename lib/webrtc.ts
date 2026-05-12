/**
 * WebRTC peer-connection helpers.
 *
 * Uses Google + Cloudflare public STUN servers for NAT traversal. Works for
 * roughly 85% of home and office networks. The other 15% (symmetric NATs,
 * restrictive corporate firewalls) need a TURN relay — not free, can be added
 * later via Twilio/Cloudflare Calls/Metered when you actually have users
 * complaining about failed connections.
 */

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
];

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 4,
  });
}

/**
 * Generate a short, human-friendly room code.
 * 6 characters from A-Z + 2-9 (no 0/O/1/I confusion).
 */
export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
