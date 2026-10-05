// App-wide configuration: remote endpoints and external links.
// Swap these values when the production backend/CDN is ready — no code changes.
export const config = {
  /** Base URL for streamed Bible audio (MP3 per chapter). Falls back to bundled demo audio. */
  audioBaseUrl: "https://mahima-church-media.example.com/audio",
  audioUrlFor: (version: "telugu" | "english-kjv", bookId: string, chapter: number) =>
    `https://mahima-church-media.example.com/audio/${version}/${bookId}/${String(chapter).padStart(3, "0")}.mp3`,

  /** Local bundled demo audio (Genesis 1, Telugu, free AI voice). */
  demoAudio: require("../assets/audio/genesis1-te.mp3"),

  youtube: {
    channelHandle: "@mahimaswaramu416",
    channelUrl: "https://youtube.com/@mahimaswaramu416",
    sermonPlaylistId: "PLw4SzPvOSSXh0FbZgaU5BsDtiBL4TMmzz",
    sermonPlaylistUrl:
      "https://youtube.com/playlist?list=PLw4SzPvOSSXh0FbZgaU5BsDtiBL4TMmzz",
    // Exact testimony playlist URL still pending from Tj — placeholder until supplied.
    testimonyPlaylistUrl: "https://youtube.com/@mahimaswaramu416",
  },

  giving: {
    upiLink: "upi://pay?pa=mahimafoundation.62576912@hdfcbank&pn=MAHIMA%20FOUNDATION&cu=INR",
    payeeName: "MAHIMA FOUNDATION",
  },

  church: {
    name: "Mahima Ministries",
    tagline: "The Voice of Grace",
    logo: require("../assets/church-logo.png"),
  },
};
