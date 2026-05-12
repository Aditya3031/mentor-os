/**
 * WebRTC peer-connection helpers.
 *
 * Uses Google + Cloudflare public STUN servers for NAT traversal. Works for
 * roughly 85% of home and office networks. The other 15% (symmetric NATs,
 * restrictive corporate firewalls) need a TURN relay — not free, can be added
 * later via Twilio/Cloudflare Calls/Metered when you actually have users
 * complaining about failed connections.
 */

/**
 * STUN handles the simple case (peer behind a typical home NAT).
 * TURN is a relay server used as fallback when STUN can't punch through —
 * needed for symmetric NATs, carrier-grade NAT, restrictive corporate
 * networks, and cross-continent connections where direct paths fail.
 *
 * OpenRelay is a free public TURN service (https://www.metered.ca/tools/openrelay/).
 * Fine for personal projects. For production use, switch to your own
 * Twilio / Cloudflare Calls / Metered.ca credentials so you're not relying
 * on someone else's bandwidth.
 */
export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
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
