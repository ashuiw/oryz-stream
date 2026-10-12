export default function StreamingStyles() {
  return (
    <style jsx global>{`
      .streaming-page,
      .oryz-section-page {
        min-height: 100vh;
        color: #fff;
        background:
          radial-gradient(circle at 82% 0%, rgba(255, 255, 255, .045), transparent 34rem),
          radial-gradient(circle at 10% 24%, rgba(255, 255, 255, .025), transparent 30rem),
          #070707;
      }

      .streaming-shell,
      .oryz-section-shell {
        width: min(1280px, calc(100% - 40px));
        margin: 0 auto;
        padding: 44px 0 80px;
      }

      .streaming-intro,
      .oryz-section-hero {
        position: relative;
        overflow: hidden;
        padding: 46px 0 30px;
      }

      .streaming-intro:before,
      .oryz-section-hero:before {
        content: "";
        position: absolute;
        width: 560px;
        height: 280px;
        left: -120px;
        top: -100px;
        background: radial-gradient(circle, rgba(255,255,255,.065), transparent 68%);
        pointer-events: none;
      }

      .streaming-kicker,
      .oryz-section-kicker {
        position: relative;
        color: rgba(255,255,255,.36);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .2em;
        text-transform: uppercase;
      }

      .streaming-title,
      .oryz-section-title {
        position: relative;
        margin: 9px 0 0;
        font-size: clamp(42px, 6vw, 72px);
        line-height: .96;
        letter-spacing: -.055em;
        font-weight: 800;
      }

      .streaming-subtitle,
      .oryz-section-description {
        position: relative;
        max-width: 680px;
        margin: 13px 0 0;
        color: rgba(255,255,255,.48);
        font-size: 14px;
        line-height: 1.65;
      }

      .provider-logo {
        position: relative;
        width: 100%;
        height: 62px;
        display: grid;
        place-items: center;
        overflow: hidden;
        border-radius: 18px;
        color: #fff;
        text-align: center;
      }
      .provider-logo img { width: 100%; height: 100%; object-fit: contain; padding: 9px 16px; display: block; border-radius: 18px; }
      .provider-logo span { font-weight: 900; letter-spacing: -.045em; line-height: .95; font-size: 19px; }
      .provider-logo-large { width: 82px; height: 82px; flex: 0 0 82px; border: 1px solid rgba(255,255,255,.08); border-radius: 22px; background: rgba(255,255,255,.045); }
      .provider-logo-large img { padding: 13px; border-radius: 18px; }
      .provider-logo-large span { font-size: 24px; }

      .streaming-section { margin-top: 48px; }
      .streaming-section-head { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 18px; }
      .streaming-brand { display: flex; align-items: center; gap: 13px; min-width: 0; }
      .streaming-brand h2 { margin: 0; font-size: 20px; letter-spacing: -.02em; }
      .streaming-brand p { margin: 4px 0 0; color: rgba(255,255,255,.35); font-size: 12px; }
      .see-all, .stream-back-link { border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.045); color: rgba(255,255,255,.78); border-radius: 999px; padding: 9px 14px; text-decoration: none; font-size: 12px; transition: .2s; white-space: nowrap; }
      .see-all:hover, .stream-back-link:hover { background: rgba(255,255,255,.09); color: #fff; border-color: rgba(255,255,255,.14); }
      .content-heading { margin: 25px 0 12px; color: rgba(255,255,255,.52); font-size: 13px; font-weight: 700; }

      .media-carousel { position: relative; min-width: 0; }
      .media-row { display: grid; grid-auto-flow: column; grid-auto-columns: 148px; gap: 13px; overflow-x: auto; padding: 2px 42px 12px; scrollbar-width: none; scroll-behavior: smooth; }
      .media-row::-webkit-scrollbar { display: none; }
      .media-row-no-wheel { overscroll-behavior-x: contain; }
      .media-carousel-arrow { position: absolute; top: 50%; z-index: 4; transform: translateY(-62%); width: 38px; height: 38px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.11); border-radius: 999px; background: rgba(10,10,10,.88); color: rgba(255,255,255,.85); backdrop-filter: blur(12px); cursor: pointer; box-shadow: 0 12px 30px rgba(0,0,0,.35); transition: transform .18s ease, background .18s ease, border-color .18s ease; }
      .media-carousel-arrow:hover { transform: translateY(-62%) scale(1.06); background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.2); color: #fff; }
      .media-carousel-arrow-left { left: 3px; }
      .media-carousel-arrow-right { right: 3px; }
      .stream-card { min-width: 0; color: inherit; text-decoration: none; }
      .stream-card-poster { position: relative; aspect-ratio: 2 / 3; overflow: hidden; border-radius: 17px; border: 1px solid rgba(255,255,255,.07); background: #111; transition: transform .22s ease, border-color .22s ease; }
      .stream-card:hover .stream-card-poster { transform: translateY(-3px); border-color: rgba(255,255,255,.15); }
      .stream-card-poster > img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .stream-card-gradient { position: absolute; inset: 45% 0 0; background: linear-gradient(transparent, rgba(0,0,0,.94)); }
      .stream-card-meta { position: absolute; left: 9px; right: 9px; bottom: 8px; z-index: 2; }
      .stream-card-meta strong { display: block; font-size: 11px; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .stream-card-meta span { display: block; margin-top: 4px; color: rgba(255,255,255,.65); font-size: 9px; }
      .stream-card-empty { height: 100%; display: grid; place-items: center; color: #666; font-size: 11px; }

      .provider-detail-hero { display: flex; align-items: center; gap: 18px; padding: 46px 0 28px; }
      .provider-detail-title { margin: 6px 0 0; font-size: clamp(36px, 5vw, 58px); line-height: .98; letter-spacing: -.05em; }
      .provider-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
      .type-tabs { display: inline-flex; gap: 4px; padding: 4px; border: 1px solid rgba(255,255,255,.08); border-radius: 13px; background: rgba(255,255,255,.035); }
      .type-tabs button { border: 0; color: rgba(255,255,255,.42); background: transparent; border-radius: 9px; padding: 10px 16px; cursor: pointer; font: 600 12px inherit; }
      .type-tabs button.active { color: #fff; background: rgba(255,255,255,.13); }
      .catalog-count { color: rgba(255,255,255,.3); font-size: 11px; }
      .detail-grid { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 20px 14px; }
      .load-more-wrap { display: flex; justify-content: center; padding: 34px 0; }
      .load-more { border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.06); color: #fff; border-radius: 999px; padding: 12px 22px; font-weight: 700; cursor: pointer; }
      .load-more:disabled { opacity: .5; cursor: wait; }
      .empty-catalog { padding: 70px 20px; text-align: center; color: rgba(255,255,255,.35); }
      .loading-line { height: 3px; width: 100%; overflow: hidden; background: rgba(255,255,255,.05); }
      .loading-line:after { content: ""; display: block; height: 100%; width: 35%; background: rgba(255,255,255,.35); animation: streamLoad 1.1s infinite ease-in-out; }
      @keyframes streamLoad { from { transform: translateX(-120%); } to { transform: translateX(320%); } }
      .stream-error { margin: 20px 0; padding: 15px 17px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; color: rgba(255,255,255,.55); background: rgba(255,255,255,.035); }

      @media (max-width: 1100px) {
        .detail-grid { grid-template-columns: repeat(5, minmax(0,1fr)); }
      }
      @media (max-width: 760px) {
        .streaming-shell, .oryz-section-shell { width: calc(100% - 28px); padding-top: 30px; }
        .streaming-intro, .oryz-section-hero { padding-top: 30px; }
        .streaming-title, .oryz-section-title { font-size: clamp(38px, 13vw, 58px); }
        .media-row { grid-auto-columns: 132px; padding-left: 38px; padding-right: 38px; }
        .media-carousel-arrow { width: 34px; height: 34px; }
        .detail-grid { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 13px; }
        .provider-detail-hero { align-items: flex-start; }
      }
      @media (max-width: 430px) {
        .streaming-shell, .oryz-section-shell { width: calc(100% - 20px); }
        .detail-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
        .provider-logo-large { width: 66px; height: 66px; flex-basis: 66px; }
        .provider-detail-hero { gap: 12px; }
        .provider-actions { align-items: flex-start; flex-direction: column; }
      }
    `}</style>
  );
}
