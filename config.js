const AppConfig = {
  platforms: {
    tiktok: { right: "15%", bottom: "20%", top: "5%" },
    reels: { right: "12%", bottom: "22%", top: "0%" },
    shorts: { right: "15%", bottom: "20%", top: "10%" }
  },
  platformMeta: {
    all: {
      label: "ALL",
      modeLabel: "ALL / Max Composite",
      overlayCaption: "All-platform master",
      description: "TikTok / Reels / Shorts の最大危険エリアを1つに合成しています。",
      officialNote: "各社公開情報では固定1種類ではない場合があるため、この表示は比較用プリセットとして維持しています。",
      accent: "#0a84ff",
      accentSecondary: "#7dc0ff",
      accentSoft: "rgba(10, 132, 255, 0.18)",
      accentStrong: "rgba(125, 192, 255, 0.92)",
      dangerStrong: "rgba(203, 61, 61, 0.58)",
      dangerSoft: "rgba(203, 61, 61, 0.14)",
      ghost: "rgba(225, 238, 255, 0.28)"
    },
    tiktok: {
      label: "TikTok",
      modeLabel: "TikTok / Native Overlay",
      overlayCaption: "TikTok native overlay",
      description: "TikTokのUI占有位置を想定したネイティブ表示です。",
      officialNote: "TikTok公開仕様では、Safe Zone は caption length や add-on format によって変化すると案内されています。",
      accent: "#25f4ee",
      accentSecondary: "#fe2c55",
      accentSoft: "rgba(37, 244, 238, 0.18)",
      accentStrong: "rgba(37, 244, 238, 0.9)",
      dangerStrong: "rgba(233, 71, 71, 0.56)",
      dangerSoft: "rgba(37, 244, 238, 0.18)",
      ghost: "rgba(227, 255, 253, 0.28)"
    },
    reels: {
      label: "Reels",
      modeLabel: "Reels / Native Overlay",
      overlayCaption: "Reels native overlay",
      description: "Instagram Reels の表示位置を意識したネイティブ表示です。",
      officialNote: "Meta 公開ページは Reels Safe Zone Checker の利用を案内していますが、このセッションでは固定数値を取得できませんでした。",
      accent: "#7b61ff",
      accentSecondary: "#c88fff",
      accentSoft: "rgba(123, 97, 255, 0.18)",
      accentStrong: "rgba(200, 143, 255, 0.92)",
      dangerStrong: "rgba(214, 70, 118, 0.54)",
      dangerSoft: "rgba(123, 97, 255, 0.16)",
      ghost: "rgba(240, 232, 255, 0.28)"
    },
    shorts: {
      label: "Shorts",
      modeLabel: "Shorts / Native Overlay",
      overlayCaption: "Shorts native overlay",
      description: "YouTube Shorts の表示位置に寄せたネイティブ表示です。",
      officialNote: "Google Ads Help は Shorts 向け Safe Zone Template の利用を案内していますが、公開本文では固定比率が明示されていません。",
      accent: "#ff3b30",
      accentSecondary: "#ff9c84",
      accentSoft: "rgba(255, 59, 48, 0.22)",
      accentStrong: "rgba(255, 156, 132, 0.92)",
      dangerStrong: "rgba(214, 48, 48, 0.58)",
      dangerSoft: "rgba(255, 59, 48, 0.18)",
      ghost: "rgba(255, 231, 228, 0.26)"
    }
  }
};
