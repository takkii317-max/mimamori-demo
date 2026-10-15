/* はたけみまもり デモ版
 * 位置や通知は本物ではなく、デモ用の「時間」を進めて再現しています。
 * 人物・自宅・畑・記録はすべて架空です。地図は実在の地域(佐賀県白石町付近)を使用しています。 */
(function () {
  'use strict';

  // =========================================================
  // 小道具
  // =========================================================
  const $ = (s, el = document) => el.querySelector(s);
  const app = $('#app');
  const layerOuter = $('#layer');
  layerOuter.innerHTML = '<div class="layer-inner"></div>';
  const layer = $('.layer-inner', layerOuter);
  const pad2 = (n) => String(n).padStart(2, '0');
  const hm = (m) => `${Math.floor(m / 60)}:${pad2(Math.floor(m % 60))}`;
  const dur = (m) => { m = Math.max(0, Math.round(m)); const h = Math.floor(m / 60); return h ? `${h}時間${pad2(m % 60)}分` : `${m}分`; };
  const durShort = (m) => { m = Math.max(0, Math.round(m)); return `${Math.floor(m / 60)}:${pad2(m % 60)}`; };
  const T = (h, m) => h * 60 + m;

  const I = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/></svg>',
    route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.2 4.2-6.5 8-6.5s7 2.3 8 6.5"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c.7-3.6 3.3-5.6 6.5-5.6s5.8 2 6.5 5.6"/><circle cx="17.5" cy="9" r="2.6"/><path d="M17 14.4c2.6.2 4.2 2 4.7 4.8"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5h3.5l1.8 4.6-2.3 1.6a12 12 0 0 0 6.3 6.3l1.6-2.3 4.6 1.8V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.6 2H4.4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
    msg: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 3.5c5.2 0 9 3.4 9 7.6s-3.8 7.6-9 7.6c-1 0-2-.1-2.9-.4L4.5 20l1.2-3.6C4 15 3 13.2 3 11.1 3 6.9 6.8 3.5 12 3.5z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.5h11v9h-11zM13.5 9.5H18l3 3.4v2.6h-7.5"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    walk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4.5" r="2"/><path d="m9 21 2.5-6.5L14 17v4M8 11l3-3.5 3.5 2 2.5 3M11.5 14.5 10.5 9"/></svg>',
    leaf: '<svg viewBox="0 0 48 48" fill="none"><path d="M10 38C10 20 22 9 40 8c0 19-11 30-28 30" fill="#1F4D3A"/><path d="M10 38c6-9 13-15 22-20" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="35" cy="35" r="8" fill="#D9702E"/><path d="M31.5 35.2 34 37.5l4-4.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3.5 7.5 7 11M3.5 7.5H17M17 13l3.5 3.5L17 20M20.5 16.5H7"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    skip: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5v14l9-7zM15 5h3v14h-3z"/></svg>',
    still: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/></svg>',
    signalOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20v-2M9 20v-5M14 20v-8M19 20V8M3 3l18 18"/></svg>',
  };

  // =========================================================
  // 登場人物(すべて架空)
  // =========================================================
  const PEOPLE = {
    taro: { name: '山田 太郎', short: '太郎', av: '太', color: '#1F4D3A', rel: '農家(見守られる人)' },
    taka: { name: '山田 孝', short: '孝', av: '孝', color: '#2F6FD6', rel: '息子' },
    yumi: { name: '中村 由美', short: '由美', av: '由', color: '#A9559A', rel: '娘' },
    sato: { name: '佐藤 健一', short: '佐藤', av: '佐', color: '#B7822A', rel: '近所の農家' },
  };
  const av = (p, size) => `<span class="avatar" style="background:${p.color}${size ? `;width:${size}px;height:${size}px` : ''}">${p.av}</span>`;

  // =========================================================
  // 経路
  // =========================================================
  const R = window.MIMAMORI_ROUTE;
  const PL = R.places;
  const legs = {
    homeToEast: R.fallback.homeToEast,
    eastToSouth: R.fallback.eastToSouth,
    southToHome: [...R.fallback.eastToSouth].reverse().concat([...R.fallback.homeToEast].reverse().slice(1)),
  };

  function haversine(a, b) {
    const toR = Math.PI / 180, Rm = 6371000;
    const dLat = (b[1] - a[1]) * toR, dLng = (b[0] - a[0]) * toR;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * toR) * Math.cos(b[1] * toR) * Math.sin(dLng / 2) ** 2;
    return 2 * Rm * Math.asin(Math.sqrt(s));
  }
  function along(path, f) {
    f = Math.min(1, Math.max(0, f));
    if (!path._cum) {
      let c = [0];
      for (let i = 1; i < path.length; i++) c.push(c[i - 1] + haversine(path[i - 1], path[i]));
      path._cum = c;
    }
    const cum = path._cum, total = cum[cum.length - 1], d = f * total;
    let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const seg = cum[i] - cum[i - 1] || 1, r = (d - cum[i - 1]) / seg;
    const a = path[i - 1], b = path[i];
    return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r];
  }
  // 畑の中を往復する歩き方(持ち歩いているときだけ使う)
  function fieldWalk(center) {
    const pts = [], w = 0.0016, h = 0.0011, rows = 7;
    for (let r = 0; r < rows; r++) {
      const y = center[1] - h / 2 + (h * r) / (rows - 1);
      const xs = r % 2 ? [center[0] + w / 2, center[0] - w / 2] : [center[0] - w / 2, center[0] + w / 2];
      pts.push([xs[0], y], [xs[1], y]);
    }
    return pts;
  }
  const walks = { east: fieldWalk(PL.east.field), south: fieldWalk(PL.south.field) };

  // 起動時に、道路に沿った詳しい経路を取りに行く(取れなければ簡略版のまま)
  async function fetchLeg(a, b) {
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 5000);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
      const r = await fetch(url, { signal: ctl.signal }); const j = await r.json();
      const c = j && j.routes && j.routes[0] && j.routes[0].geometry.coordinates;
      return c && c.length > 1 ? c : null;
    } catch (e) { return null; } finally { clearTimeout(tm); }
  }
  (async () => {
    const [a, b, c] = await Promise.all([fetchLeg(PL.home, PL.east), fetchLeg(PL.east, PL.south), fetchLeg(PL.south, PL.home)]);
    if (a && b && c) {
      legs.homeToEast = a; legs.eastToSouth = b; legs.southToHome = c;
      rebuildTrack(); refresh(true);
    }
  })();

  // =========================================================
  // シナリオ(1日の流れ)
  // =========================================================
  const D1 = T(7, 30), A1 = T(7, 42), D2 = T(11, 50), A2 = T(12, 2), D3 = T(17, 20), DRIVE3 = 15;
  const LOST = T(17, 43), STILL = T(14, 20);
  const SCENARIOS = {
    normal: { name: 'いつもの1日', desc: '作業開始を押して出発し、夕方に帰宅する' },
    forgot: { name: '押し忘れた日', desc: '作業開始を押さずに出発。自動で記録が始まる' },
    late:   { name: '帰りが遅い日', desc: '夕方に電波が途絶え、帰宅の目安を過ぎる' },
    still:  { name: '長く動かない日', desc: 'スマホを持ち歩いていて、畑で動きが止まる' },
  };

  const S = {
    role: null, tab: 'home', detail: null,
    scenario: 'normal', t: T(6, 50), playing: false, speed: 5,
    working: false, workStart: null, autoStarted: false, ended: false,
    track: [], dist: 0, pending: 0, lastFix: null, lastPlace: '自宅',
    events: [], alert: null, ask: null, respondedAt: null, resolvedAt: null,
    returnTime: T(18, 0), stillMin: 30, carry: false,
    share: { taka: true, yumi: true, sato: false },
    notifyPush: true, notifySms: true,
    watching: { taro: true, sato: true },
  };
  const carrying = () => S.scenario === 'still' || S.carry;

  function stayPoint(key, t, t0) {
    const parked = key === 'east' ? legs.homeToEast[legs.homeToEast.length - 1] : legs.eastToSouth[legs.eastToSouth.length - 1];
    if (!carrying()) return { p: parked, moving: false };
    let tt = t;
    let moving = true;
    if (S.scenario === 'still' && key === 'south' && t >= STILL) {
      const resumeAt = S.respondedAt != null ? S.respondedAt + 1 : (S.resolvedAt != null ? S.resolvedAt + 1 : null);
      if (resumeAt == null || t < resumeAt) { tt = STILL; moving = false; }
      else tt = STILL + (t - resumeAt);
    }
    const f = ((tt - t0) / 40) % 1; // 40分で畑を一往復
    return { p: along(walks[key], f), moving };
  }

  // 時刻 t の位置と状態
  function stateAt(t) {
    const home = [PL.home.lng, PL.home.lat];
    let endSouth = D3;
    if (S.scenario === 'late') endSouth = S.resolvedAt != null ? S.resolvedAt + 5 : Infinity;
    if (t < D1) return { p: home, place: '自宅', atHome: true, moving: false, signal: true };
    if (t < A1) return { p: along(legs.homeToEast, (t - D1) / (A1 - D1)), place: '移動中', moving: true, signal: true };
    if (t < D2) { const s = stayPoint('east', t, A1); return { p: s.p, place: PL.east.name, moving: s.moving, signal: true }; }
    if (t < A2) return { p: along(legs.eastToSouth, (t - D2) / (A2 - D2)), place: '移動中', moving: true, signal: true };
    if (t < endSouth) {
      const s = stayPoint('south', t, A2);
      const lost = S.scenario === 'late' && t >= LOST && (S.resolvedAt == null || t < S.resolvedAt);
      return { p: s.p, place: PL.south.name, moving: s.moving, signal: !lost };
    }
    if (t < endSouth + DRIVE3) return { p: along(legs.southToHome, (t - endSouth) / DRIVE3), place: '移動中', moving: true, signal: true };
    return { p: home, place: '自宅', atHome: true, moving: false, signal: true };
  }

  function addEvent(t, text, kind) { S.events.push({ t, text, kind: kind || '' }); }

  function resetDay(scn) {
    stopPlay();
    Object.assign(S, {
      scenario: scn || S.scenario, t: T(6, 50), working: false, workStart: null, autoStarted: false, ended: false,
      track: [], dist: 0, pending: 0, lastFix: { t: T(6, 50), p: [PL.home.lng, PL.home.lat] }, lastPlace: '自宅',
      events: [], alert: null, ask: null, respondedAt: null, resolvedAt: null,
    });
    clearOverlays();
    refresh(true);
  }

  // 1分ずつ時間を進め、そのときに起きることを処理する
  function stepMinute() {
    const prev = stateAt(S.t);
    S.t += 1;
    const t = S.t, cur = stateAt(t);

    // デモ:いつもの1日は、出発の少し前に本人が作業開始を押す
    if ((S.scenario === 'normal' || S.scenario === 'late' || S.scenario === 'still') && !S.working && !S.ended && t === D1 - 2) {
      startWork(t, false, true);
    }
    // 押し忘れて家を出たら、自動で記録を始める
    if (!S.working && !S.ended && prev.atHome && !cur.atHome) {
      startWork(t, true);
    }

    // 場所の変化
    if (prev.place !== cur.place && cur.signal) {
      if (cur.place === '移動中' && prev.place !== '移動中') addEvent(t, `${prev.place}を出発`);
      else if (cur.place !== '移動中' && !cur.atHome) { addEvent(t, `${cur.place}に到着`); notifyFor('watcher', 'info', `${PEOPLE.taro.short}さんが${cur.place}に着きました`, `${hm(t)} 到着`); }
    }

    // 記録
    if (S.working) {
      if (cur.signal) {
        if (S.pending > 0) { addEvent(t, `電波が戻り、保存していた記録${S.pending}件を送信`); S.pending = 0; }
        if (S.track.length) S.dist += haversine(S.track[S.track.length - 1].p, cur.p);
        S.track.push({ t, p: cur.p });
        S.lastFix = { t, p: cur.p }; S.lastPlace = cur.place;
      } else {
        if (prev.signal) addEvent(t, '電波が届かなくなった(記録は端末に保存中)', 'warn');
        S.pending += 1;
      }
    }

    // 帰宅
    if (cur.atHome && !prev.atHome && S.working) endWork(t, true);

    // 帰りが遅い
    if (S.working && !cur.atHome && t === S.returnTime && !S.alert) raiseAlert('late', t);

    // 長く動かない(持ち歩いているときだけ判定)
    if (S.scenario === 'still' && S.working && carrying() && !S.ask && !S.alert && S.respondedAt == null && t === STILL + S.stillMin) askFarmer(t);
    if (S.ask && !S.alert && t >= S.ask.at + 5) { S.ask = null; closeFarmerAsk(); addEvent(t, '確認に応答がありません', 'warn'); raiseAlert('still', t); }

    // 反応がなければSMS
    if (S.alert && S.alert.stage === 1 && !S.alert.acked && S.notifySms && t >= S.alert.at + 10) {
      S.alert.stage = 2; addEvent(t, '見守る人の反応がないため、SMSを送信', 'warn');
      notifyFor('watcher', 'sms', 'SMS', smsText(), true);
    }
  }

  function smsText() {
    const lf = S.lastFix ? `${S.lastPlace}付近(${hm(S.lastFix.t)})` : '不明';
    return S.alert && S.alert.type === 'still'
      ? `【はたけみまもり】${PEOPLE.taro.name}さんが${S.stillMin}分以上動いておらず、確認にも応答がありません。場所:${lf}`
      : `【はたけみまもり】${PEOPLE.taro.name}さんが${hm(S.returnTime)}を過ぎても帰宅していません。最後に確認できた場所:${lf}`;
  }

  function startWork(t, auto, demoPress) {
    S.working = true; S.workStart = t; S.autoStarted = !!auto;
    const cur = stateAt(t);
    S.track = [{ t, p: cur.p }]; S.lastFix = { t, p: cur.p };
    addEvent(t, auto ? '押し忘れのため、自動で記録を開始' : '作業開始(記録を開始)');
    if (auto) notifyFor('farmer', 'info', '自動で記録を始めました', '作業開始が押されないまま家を出たので、記録を始めました。');
    else if (demoPress) toast('(デモ)太郎さんが「作業開始」を押しました');
    notifyFor('watcher', 'info', `${PEOPLE.taro.short}さんが作業を始めました`, `${hm(t)} 記録開始`);
    refresh();
  }
  function endWork(t, auto) {
    S.working = false; S.ended = true;
    addEvent(t, auto ? '帰宅(記録を終了)' : '作業終了(記録を終了)');
    notifyFor('watcher', 'info', `${PEOPLE.taro.short}さんが${auto ? '帰宅しました' : '作業を終えました'}`, `${hm(t)} 作業時間 ${dur(t - S.workStart)}`);
    if (S.alert) { S.alert = null; clearOverlays(); }
    refresh();
  }
  function raiseAlert(type, t) {
    S.alert = { type, at: t, stage: 1, acked: false };
    addEvent(t, type === 'late' ? `帰宅の目安(${hm(S.returnTime)})を過ぎても帰っていない` : `${S.stillMin}分以上動きがない`, 'warn');
    stopPlay();
    if (S.role === 'watcher') showWatcherAlert();
    else toast('見守る人のスマホに知らせが届きました', '見守る側で見る', () => switchRole('watcher', true));
    refresh();
  }

  // =========================================================
  // 時間の進め方(デモ操作)
  // =========================================================
  let timer = null;
  function startPlay() {
    if (S.playing) return; S.playing = true;
    timer = setInterval(() => {
      const n = Math.max(1, Math.round(S.speed / 4));
      for (let i = 0; i < n && S.playing; i++) { stepMinute(); if (S.t >= T(20, 0)) { stopPlay(); break; } }
      refresh();
    }, 250);
    refresh();
  }
  function stopPlay() { S.playing = false; clearInterval(timer); timer = null; }
  function keyTimes() {
    const k = S.scenario === 'forgot' ? [D1, D1 + 1, A1, D2, A2] : [D1 - 2, D1 + 1, A1, D2, A2];
    if (S.scenario === 'still') k.push(STILL, STILL + S.stillMin, STILL + S.stillMin + 5, STILL + S.stillMin + 15);
    if (S.scenario === 'late') k.push(LOST, S.returnTime, S.returnTime + 10);
    else k.push(D3, D3 + DRIVE3);
    if (S.resolvedAt != null) k.push(S.resolvedAt + 5, S.resolvedAt + 5 + DRIVE3);
    return [...new Set(k)].filter((x) => x > S.t).sort((a, b) => a - b);
  }
  function jumpNext() {
    stopPlay();
    const next = keyTimes()[0];
    if (next == null) { toast('この日の出来事はここまでです'); return; }
    while (S.t < next) { stepMinute(); if (S.alert && S.alert.at === S.t) break; if (S.ask && S.ask.at === S.t) break; }
    refresh();
  }
  function rebuildTrack() {
    // 経路データが差し替わったら、今までの記録を作り直す
    if (!S.working && !S.ended) return;
    const from = S.workStart, to = S.t, tr = []; let d = 0;
    for (let t = from; t <= to; t++) { const c = stateAt(t); if (!c.signal) continue; if (tr.length) d += haversine(tr[tr.length - 1].p, c.p); tr.push({ t, p: c.p }); }
    S.track = tr; S.dist = d; if (tr.length) S.lastFix = tr[tr.length - 1];
  }

  // =========================================================
  // 地図
  // =========================================================
  const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const maps = [];
  function destroyMaps() { while (maps.length) { const m = maps.pop(); try { m.map.remove(); } catch (e) {} } }

  function makeMap(el, opts) {
    opts = opts || {};
    const api = { map: null, ready: false, person: null, queue: [] };
    if (!window.maplibregl) { el.innerHTML = '<div class="map-fallback">地図を読み込めませんでした。<br>インターネット接続を確認してください。</div>'; return api; }
    let map;
    try {
      map = new maplibregl.Map({
        container: el, style: STYLE, center: [PL.home.lng + 0.016, PL.home.lat - 0.012], zoom: opts.zoom || 12.6,
        attributionControl: { compact: true }, pitchWithRotate: false, dragRotate: false, interactive: opts.interactive !== false,
      });
    } catch (e) { el.innerHTML = '<div class="map-fallback">この端末では地図を表示できません。</div>'; return api; }
    api.map = map; maps.push(api);
    map.touchZoomRotate && map.touchZoomRotate.disableRotation();
    map.on('error', () => {});
    map.on('load', () => {
      map.addSource('track', { type: 'geojson', data: line([]) });
      map.addSource('ghost', { type: 'geojson', data: line([]) });
      map.addLayer({ id: 'ghost', type: 'line', source: 'ghost', paint: { 'line-color': '#1F4D3A', 'line-width': 4, 'line-opacity': .25, 'line-dasharray': [1, 1.5] }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      map.addLayer({ id: 'track-casing', type: 'line', source: 'track', paint: { 'line-color': '#ffffff', 'line-width': 9 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      map.addLayer({ id: 'track', type: 'line', source: 'track', paint: { 'line-color': '#1F4D3A', 'line-width': 5 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      placeLabels(map);
      api.ready = true; api.queue.forEach((f) => f()); api.queue = [];
    });
    return api;
  }
  const line = (coords) => ({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords.length > 1 ? coords : [] }, properties: {} });
  function whenReady(api, f) { if (!api.map) return; if (api.ready) f(); else api.queue.push(f); }
  function placeLabels(map) {
    const mk = (html, cls, p, anchor) => { const e = document.createElement('div'); e.className = cls; e.innerHTML = html; new maplibregl.Marker({ element: e, anchor: anchor || 'bottom' }).setLngLat(p).addTo(map); };
    mk(`${I.home}自宅`, 'mk-label home', [PL.home.lng, PL.home.lat], 'top');
    mk(`${I.leaf.replace('48 48', '48 48').replace('<svg', '<svg width="14" height="14"')}${PL.east.name}`, 'mk-label', PL.east.field);
    mk(`${I.leaf.replace('<svg', '<svg width="14" height="14"')}${PL.south.name}`, 'mk-label', PL.south.field);
  }
  function setPerson(api, p, cls, lastLabel) {
    whenReady(api, () => {
      if (!api.person) {
        const e = document.createElement('div'); e.className = 'mk-person';
        api.person = new maplibregl.Marker({ element: e }).setLngLat(p).addTo(api.map);
      }
      api.person.setLngLat(p);
      api.person.getElement().className = 'mk-person ' + (cls || '');
      if (lastLabel) {
        if (!api.last) { const e = document.createElement('div'); e.className = 'mk-last'; api.last = new maplibregl.Marker({ element: e, anchor: 'bottom' }).setLngLat(p).addTo(api.map); }
        api.last.setLngLat(p); api.last.getElement().textContent = lastLabel;
      } else if (api.last) { api.last.remove(); api.last = null; }
    });
  }
  function setTrack(api, coords, ghost) {
    whenReady(api, () => {
      api.map.getSource('track').setData(line(coords));
      api.map.getSource('ghost').setData(line(ghost || []));
    });
  }
  function fit(api, coords, padding) {
    whenReady(api, () => {
      const pts = coords.length ? coords : [[PL.home.lng, PL.home.lat]];
      const b = pts.reduce((bb, c) => bb.extend(c), new maplibregl.LngLatBounds(pts[0], pts[0]));
      [[PL.home.lng, PL.home.lat]].forEach((c) => b.extend(c));
      api.map.fitBounds(b, { padding: padding || 50, maxZoom: 15.5, duration: 600 });
    });
  }

  // =========================================================
  // 通知・シート・トースト
  // =========================================================
  let bannerTimer = null;
  function notifyFor(role, kind, title, body, force) {
    if (S.role !== role) return;
    const who = role === 'watcher' ? '見守り' : 'はたけみまもり';
    const old = $('.banner', layer); if (old) old.remove();
    const b = document.createElement('div');
    b.className = 'banner ' + (kind === 'warn' ? 'warn' : kind === 'crit' ? 'crit' : kind === 'sms' ? 'sms' : '');
    b.innerHTML = `<div class="bi">${kind === 'sms' ? I.msg : I.bell}</div><div class="bt"><div class="bh"><span>${kind === 'sms' ? 'メッセージ(SMS)' : who}</span><span>${hm(S.t)}</span></div><b>${title}</b><p>${body}</p></div>`;
    b.addEventListener('click', () => { b.classList.remove('show'); });
    layer.appendChild(b);
    requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add('show')));
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => { b.classList.remove('show'); setTimeout(() => b.remove(), 400); }, force ? 6000 : 3600);
  }
  let toastTimer = null;
  function toast(msg, actionLabel, action) {
    const old = $('.toast', layer); if (old) old.remove();
    const t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = msg + (actionLabel ? ` <button style="margin-left:8px;border:0;background:#fff;color:#17221C;border-radius:8px;padding:4px 10px;font-weight:700;pointer-events:auto">${actionLabel}</button>` : '');
    if (actionLabel) { t.style.pointerEvents = 'auto'; t.querySelector('button').onclick = () => { t.remove(); action(); }; }
    layer.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, actionLabel ? 5000 : 2600);
  }
  function openSheet(html, onMount) {
    closeSheet();
    const sc = document.createElement('div'); sc.className = 'scrim'; sc.dataset.sheet = '1';
    const sh = document.createElement('div'); sh.className = 'sheet'; sh.dataset.sheet = '1';
    sh.setAttribute('role', 'dialog');
    sh.innerHTML = '<div class="grabber"></div>' + html;
    sc.onclick = closeSheet;
    layer.append(sc, sh);
    requestAnimationFrame(() => { sc.classList.add('show'); sh.classList.add('show'); });
    onMount && onMount(sh);
    return sh;
  }
  function closeSheet() {
    layer.querySelectorAll('[data-sheet]').forEach((e) => { e.classList.remove('show'); setTimeout(() => e.remove(), 300); });
  }
  function clearOverlays() { layer.querySelectorAll('.full-alert,[data-sheet]').forEach((e) => e.remove()); }

  // 見守る側:画面いっぱいの知らせ
  function showWatcherAlert() {
    if (!S.alert || S.role !== 'watcher') return;
    layer.querySelectorAll('.full-alert').forEach((e) => e.remove());
    const late = S.alert.type === 'late';
    const el = document.createElement('div');
    el.className = 'full-alert' + (late ? '' : ' crit');
    el.setAttribute('role', 'alertdialog');
    el.innerHTML = `
      <div class="fa-ic">${late ? I.alert : I.still}</div>
      <div class="t">${hm(S.alert.at)} 見守りからの知らせ</div>
      <h2>${late ? `${PEOPLE.taro.short}さんが、<br>まだ帰っていません` : `${PEOPLE.taro.short}さんが、<br>${S.stillMin}分以上動いていません`}</h2>
      <div class="box">${late ? `帰宅の目安 ${hm(S.returnTime)} を過ぎました。` : '本人への確認にも、応答がありません。'}<br>最後に確認できた場所<br><b>${S.lastPlace}付近(${hm(S.lastFix.t)})</b></div>
      <div class="grow"></div>
      <button class="btn white block" data-a="call">${I.phone}${PEOPLE.taro.short}さんに電話する</button>
      <button class="btn line block" data-a="see">地図で場所を見る</button>`;
    el.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      ack();
      el.classList.remove('show'); setTimeout(() => el.remove(), 250);
      if (a.dataset.a === 'call') callSheet(); else { S.tab = 'home'; S.detail = null; render(); }
    });
    layer.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
  }
  function ack() { if (S.alert && !S.alert.acked) { S.alert.acked = true; addEvent(S.t, `${PEOPLE.taka.short}さんが知らせを確認`); refresh(); } }
  function callSheet() {
    openSheet(`
      <h3>${PEOPLE.taro.name}さんに電話</h3>
      <p class="d">デモのため、実際には電話はかかりません。本物のアプリでは、ここから電話をかけます。</p>
      <div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:none;background:var(--bg)">${av(PEOPLE.taro)}<div><b>${PEOPLE.taro.name}</b><div class="muted" style="font-size:14px">090-0000-0000(サンプル)</div></div></div>
      ${S.alert ? `<p class="d" style="margin-top:16px">電話でつながり、無事が確認できたら、下のボタンで知らせを終えます。</p>
      <button class="btn primary block" data-a="ok">${I.check}無事を確認した</button>` : ''}
      <button class="btn ghost block" style="margin-top:10px" data-a="close">閉じる</button>`,
      (sh) => sh.addEventListener('click', (e) => {
        const a = e.target.closest('[data-a]'); if (!a) return;
        if (a.dataset.a === 'ok') resolveAlert();
        closeSheet();
      }));
  }
  function resolveAlert() {
    if (!S.alert) return;
    const type = S.alert.type;
    S.resolvedAt = S.t; S.alert = null;
    addEvent(S.t, '無事を確認(知らせを終了)');
    if (type === 'late') toast('無事を確認しました。このあと帰宅します');
    else toast('無事を確認しました');
    refresh(true);
  }

  // 農家側:「大丈夫ですか?」の確認
  function askFarmer(t) {
    S.ask = { at: t };
    addEvent(t, `${S.stillMin}分動きがないため、本人に確認`, 'warn');
    stopPlay();
    if (S.role === 'farmer') showFarmerAsk();
    else toast('太郎さんのスマホに「大丈夫ですか?」と確認が出ています', '農家側で見る', () => switchRole('farmer', true));
    refresh();
  }
  function showFarmerAsk() {
    if (!S.ask || S.role !== 'farmer') return;
    layer.querySelectorAll('.full-alert').forEach((e) => e.remove());
    const el = document.createElement('div'); el.className = 'full-alert';
    el.innerHTML = `
      <div class="fa-ic">${I.still}</div>
      <div class="t">${hm(S.ask.at)} はたけみまもり</div>
      <h2>大丈夫ですか?</h2>
      <div class="box">${S.stillMin}分ほど、動きがありません。<br>大丈夫なら、下のボタンを押してください。</div>
      <div class="grow"></div>
      <button class="ok-big" data-a="ok">大丈夫</button>
      <div class="countdown" data-bind="cd"></div>`;
    el.addEventListener('click', (e) => { if (e.target.closest('[data-a="ok"]')) respondFarmer(); });
    layer.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    refresh();
  }
  function closeFarmerAsk() { layer.querySelectorAll('.full-alert').forEach((e) => { e.classList.remove('show'); setTimeout(() => e.remove(), 250); }); }
  function respondFarmer() {
    if (!S.ask) return;
    S.respondedAt = S.t; S.ask = null;
    addEvent(S.t, '本人が「大丈夫」と応答');
    closeFarmerAsk();
    toast('「大丈夫」を家族に伝えました');
    refresh(true);
  }

  // =========================================================
  // 画面
  // =========================================================
  function tabbar() {
    const t = (id, label, icon) => `<button data-tab="${id}" aria-current="${S.tab === id ? 'page' : 'false'}"><span class="tab-ic">${icon}</span>${label}</button>`;
    return `<nav class="tabbar">${t('home', S.role === 'farmer' ? 'ホーム' : '見守り', S.role === 'farmer' ? I.home : I.map)}${t('records', '記録', I.route)}${t('me', 'マイページ', I.user)}</nav>`;
  }

  function vWelcome() {
    return `<div class="welcome">
      <div class="logo">${I.leaf}</div>
      <h1>はたけみまもり</h1>
      <p class="lead">畑に出る家族の「もしも」に、すぐ気づける。<br>作業の記録と、見守りのアプリです。</p>
      <div class="grow"></div>
      <button class="role main" data-role="farmer"><span class="ric" style="color:var(--green-700)">${I.truck}</span><span><b>農家として使う</b><span>${PEOPLE.taro.name}さん としてログイン</span></span><span class="chev">${I.chev}</span></button>
      <button class="role" data-role="watcher"><span class="ric">${I.users}</span><span><b>見守る側として使う</b><span>息子の ${PEOPLE.taka.name}さん としてログイン</span></span><span class="chev">${I.chev}</span></button>
      <p class="fine">デモ版です。登場する人物・自宅・畑・記録はすべて架空で、位置や通知は実際には動きません。地図は実在の地域を使用しています。</p>
    </div>`;
  }

  // ---------- 農家側ホーム ----------
  function vFarmerHome() {
    const cur = stateAt(S.t);
    const shares = Object.keys(S.share).filter((k) => S.share[k]).map((k) => PEOPLE[k]);
    const shareLine = `<div class="share-line"><span class="avs">${shares.map((p) => `<i style="background:${p.color}">${p.av}</i>`).join('')}</span><span>${shares.length ? `${shares.map((p) => p.short + 'さん').join('、')}が見守っています` : '位置を見せている人はいません'}</span></div>`;
    if (!S.working) {
      const done = S.ended;
      return `<div class="view">
        <div class="hello"><div class="date">10月25日(日)</div><h1>${done ? 'おつかれさまでした' : 'おはようございます、太郎さん'}</h1></div>
        ${shareLine}
        <div class="start-wrap">
          <button class="start-btn" data-a="start">${I.play}<b>作業開始</b><span>押すと記録が始まります</span></button>
          <p class="start-note">押し忘れても、家を出ると<br>自動で記録を始めます。</p>
        </div>
        <div class="card today">
          <div class="stat"><b data-bind="f-time">${done ? durShort(S.track.length ? S.track[S.track.length - 1].t - S.workStart : 0) : '0:00'}</b><span>今日の作業時間</span></div>
          <div class="stat"><b>${(S.dist / 1000).toFixed(1)}<small>km</small></b><span>移動した距離</span></div>
          <div class="stat"><b>${new Set(S.events.filter((e) => e.text.endsWith('に到着')).map((e) => e.text)).size}<small>か所</small></b><span>行った畑</span></div>
        </div>
        <div style="height:90px"></div>
      </div>`;
    }
    const off = !cur.signal;
    return `<div class="view">
      <div class="hello"><div class="date">10月25日(日)</div><h1>記録しています</h1></div>
      <div class="rec-head ${off ? 'offline' : ''}">
        <div class="top"><span class="tag"><i></i><span data-bind="f-tag">${off ? '電波なし:端末に保存中' : '記録中・家族に共有中'}</span></span><span class="chip" style="background:rgba(255,255,255,.16);color:#fff">${carrying() ? I.walk.replace('<svg', '<svg width="14" height="14"') + '持ち歩き' : I.truck.replace('<svg', '<svg width="14" height="14"') + '軽トラ'}</span></div>
        <div class="elapsed" data-bind="f-elapsed">${durShort(S.t - S.workStart)}</div>
        <div class="place" data-bind="f-place">${cur.place === '移動中' ? '移動しています' : `${cur.place}にいます`}</div>
        ${S.autoStarted ? `<div class="auto">押し忘れていたので、${hm(S.workStart)}に自動で記録を始めました</div>` : ''}
      </div>
      <div class="card rec-stats">
        <div class="stat"><b data-bind="f-start">${hm(S.workStart)}</b><span>開始</span></div>
        <div class="stat"><b data-bind="f-dist">${(S.dist / 1000).toFixed(1)}<small>km</small></b><span>移動距離</span></div>
        <div class="stat"><b data-bind="f-back">${hm(S.returnTime)}</b><span>帰りの目安</span></div>
      </div>
      <div class="minimap"><div class="map" id="mini"></div></div>
      <div class="end-btn"><button class="btn ghost block" data-a="end">${I.stop}作業終了</button></div>
      <p class="sent-line" data-bind="f-sent">${off ? `保存中の記録 ${S.pending}件(電波が戻ると送ります)` : `${hm(S.lastFix ? S.lastFix.t : S.t)} に位置を送りました`}</p>
      <div style="height:90px"></div>
    </div>`;
  }

  // ---------- 見守る側ホーム ----------
  function watcherStatus() {
    const cur = stateAt(S.t);
    if (S.alert) {
      return { cls: S.alert.type === 'late' ? 'warn' : 'crit', chip: S.alert.type === 'late' ? 'warn' : 'crit',
        chipText: '確認が必要', main: S.alert.type === 'late' ? 'まだ帰っていません' : `${S.stillMin}分以上動いていません`,
        where: `最後に確認できた場所:${S.lastPlace}付近(${hm(S.lastFix.t)})`, mk: 'alert' };
    }
    if (S.working && !cur.signal) return { cls: '', chip: 'warn', chipText: '電波なし', main: '電波が届かない場所にいます', where: `最後に確認できた場所:${S.lastPlace}付近(${hm(S.lastFix.t)})`, mk: 'lost' };
    if (S.working) return { cls: '', chip: 'live', chipText: '作業中', main: cur.place === '移動中' ? '移動しています' : `${cur.place}で作業中`, where: `${hm(S.workStart)}から作業中(${dur(S.t - S.workStart)})`, mk: '' };
    if (S.ended) return { cls: '', chip: 'idle', chipText: '帰宅', main: '家にいます', where: `今日の作業は${dur((S.track.length ? S.track[S.track.length - 1].t : S.t) - S.workStart)}でした`, mk: '' };
    return { cls: '', chip: 'idle', chipText: '在宅', main: '家にいます', where: 'まだ作業を始めていません', mk: '' };
  }
  function vWatcherHome() {
    const st = watcherStatus();
    const ago = S.lastFix ? Math.max(0, S.t - S.lastFix.t) : 0;
    const steps = S.alert ? `
      <div class="alert-box ${S.alert.type === 'late' ? '' : 'crit'}">
        <h4>知らせの流れ</h4>
        <ol class="steps">
          <li><span class="bul"></span><time>${hm(S.alert.at)}</time><span>アプリに通知</span></li>
          <li class="${S.alert.stage >= 2 ? '' : 'todo'}"><span class="bul"></span><time>${hm(S.alert.at + 10)}</time><span>${S.alert.acked ? '確認済みのためSMSは送りません' : '反応がなければSMSを送信'}</span></li>
          <li><span class="bul"></span><time>${hm(S.lastFix.t)}</time><span>最後に確認できた場所を地図に表示</span></li>
        </ol>
      </div>` : '';
    return `<div class="watch">
      <div class="watch-map"><div class="map" id="wmap"></div></div>
      <div class="watch-top">
        <button class="person-pill" data-a="center">${av(PEOPLE.taro)}<b>${PEOPLE.taro.short}さん</b></button>
        <button class="icon-btn recenter" data-a="center" aria-label="位置に戻る">${I.target}</button>
      </div>
      <div class="sheet-card" id="wsheet">
        <div class="grabber"></div>
        <div class="st-row">
          ${av(PEOPLE.taro, 48)}
          <div style="flex:1;min-width:0">
            <div class="st-name">${PEOPLE.taro.name}さん <span class="chip ${st.chip}" style="margin-left:6px"><span class="dot"></span>${st.chipText}</span></div>
            <div class="st-main ${st.cls}">${st.main}</div>
            <div class="st-where">${st.where}</div>
          </div>
        </div>
        ${steps}
        <div class="st-meta">
          <div class="stat"><b>${S.workStart != null ? hm(S.workStart) : '--:--'}</b><span>作業開始</span></div>
          <div class="stat"><b>${(S.dist / 1000).toFixed(1)}<small>km</small></b><span>移動距離</span></div>
          <div class="stat"><b>${hm(S.returnTime)}</b><span>帰りの目安</span></div>
        </div>
        <div class="st-actions">
          <button class="btn ${S.alert ? 'warn' : 'primary'}" data-a="call">${I.phone}電話する</button>
          <button class="btn soft" data-a="today">${I.route}今日の経路</button>
        </div>
        <div class="updated">${I.clock.replace('<svg', '<svg width="14" height="14"')}${S.lastFix && S.working ? (ago <= 1 ? 'たった今更新' : `${ago}分前に更新`) : `${hm(S.t)} 現在`}</div>
        <div class="other">
          <div class="lbl">ほかに見守っている人</div>
          <div class="prow">${av(PEOPLE.sato)}<div><b>${PEOPLE.sato.name}さん</b><span>近所の農家</span></div><span class="chip idle"><span class="dot"></span>在宅</span></div>
        </div>
      </div>
    </div>`;
  }

  // ---------- 記録 ----------
  const PAST = [
    { date: '10月24日(土)', title: `${PL.east.name}・${PL.south.name}`, start: T(7, 20), end: T(17, 10), km: 11.2, legs: ['homeToEast', 'eastToSouth', 'southToHome'] },
    { date: '10月23日(金)', title: PL.east.name, start: T(8, 0), end: T(12, 5), km: 6.3, legs: ['homeToEast'] },
    { date: '10月22日(木)', title: PL.south.name, start: T(13, 10), end: T(16, 40), km: 7.4, legs: ['southToHome'] },
  ];
  function pastCoords(d) { return d.legs.flatMap((k) => (k === 'homeToEast' ? legs.homeToEast.concat([...legs.homeToEast].reverse()) : legs[k])); }
  function thumb(coords) {
    if (coords.length < 2) return '<svg viewBox="0 0 74 74"><rect width="74" height="74" fill="#F1F6F1"/></svg>';
    const xs = coords.map((c) => c[0]), ys = coords.map((c) => c[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const s = Math.max(maxX - minX, maxY - minY) || 1;
    const pts = coords.map((c) => `${(10 + ((c[0] - minX) / s) * 54).toFixed(1)},${(64 - ((c[1] - minY) / s) * 54).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 74 74"><rect width="74" height="74" fill="#F1F6F1"/><path d="M0 20h74M0 48h74M26 0v74M52 0v74" stroke="#E2EAE2"/><polyline points="${pts}" fill="none" stroke="#1F4D3A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function vRecords() {
    const who = S.role === 'farmer' ? '' : `${PEOPLE.taro.short}さんの`;
    const todayCoords = S.track.map((x) => x.p);
    const today = (S.working || S.ended) ? `
      <button class="card day-card" data-day="today">
        <span class="day-thumb">${thumb(todayCoords)}</span>
        <span><span class="t">今日 10月25日(日)${S.working ? ' ・ 記録中' : ''}</span><b>${S.lastPlace === '自宅' ? '今日の作業' : S.lastPlace}</b><span class="m">${hm(S.workStart)}〜${S.working ? '' : hm(S.track.length ? S.track[S.track.length - 1].t : S.t)} ・ ${(S.dist / 1000).toFixed(1)}km</span></span>
        <span class="chev">${I.chev}</span>
      </button>` : `<div class="card" style="margin:0 20px 12px;padding:16px;font-size:14px;color:var(--muted)">今日の記録はまだありません。作業を始めると、ここに経路が残ります。</div>`;
    return `<div class="view">
      <div class="appbar"><h1>${who}記録<span class="sub">いつ、どこで、どれくらい作業したか</span></h1></div>
      <div class="section pad">今日</div>
      ${today}
      <div class="section pad">これまで</div>
      ${PAST.map((d, i) => `
        <button class="card day-card" data-day="${i}">
          <span class="day-thumb">${thumb(pastCoords(d))}</span>
          <span><span class="t">${d.date}</span><b>${d.title}</b><span class="m">${hm(d.start)}〜${hm(d.end)} ・ ${d.km}km</span></span>
          <span class="chev">${I.chev}</span>
        </button>`).join('')}
      <div style="height:90px"></div>
    </div>`;
  }
  function dayData(key) {
    if (key === 'today') return { title: '今日 10月25日(日)', pts: S.track.slice(), events: S.events.slice() };
    const d = PAST[key]; const coords = pastCoords(d); const n = coords.length; const span = d.end - d.start;
    return {
      title: d.date, pts: coords.map((p, i) => ({ t: Math.round(d.start + (span * i) / Math.max(1, n - 1)), p })),
      events: [{ t: d.start, text: '作業開始(記録を開始)' }, { t: d.start + 15, text: `${d.title.split('・')[0]}に到着` }, { t: d.end, text: '帰宅(記録を終了)' }],
    };
  }
  function vDetail() {
    const d = dayData(S.detail);
    const first = d.pts[0], last = d.pts[d.pts.length - 1];
    return `<div class="view">
      <div class="appbar"><button class="icon-btn" data-a="back" aria-label="戻る">${I.back}</button><h1>${d.title}<span class="sub">${first ? `${hm(first.t)}〜${hm(last.t)}` : ''}</span></h1></div>
      <div class="detail-map"><div class="map" id="dmap"></div></div>
      <div class="card scrub">
        <div class="scrub-top">
          <button class="play" data-a="replay" aria-label="経路を再生">${I.play}</button>
          <div><div class="clock" data-bind="r-clock">${first ? hm(first.t) : '--:--'}</div><div class="where" data-bind="r-where">スライダーで、その時刻にいた場所を表示</div></div>
        </div>
        <input type="range" id="scrub" min="0" max="${Math.max(0, d.pts.length - 1)}" value="0" aria-label="時刻">
      </div>
      <div class="section pad">出来事</div>
      <div class="card events">
        ${d.events.length ? d.events.map((e) => `<div class="ev ${e.kind || ''}"><time>${hm(e.t)}</time><span class="b"></span><span>${e.text}</span></div>`).join('') : '<p class="muted" style="font-size:14px">まだ出来事はありません</p>'}
      </div>
      <div style="height:90px"></div>
    </div>`;
  }

  // ---------- マイページ ----------
  function sw(id, on, label) { return `<label class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${label}"><i></i></label>`; }
  function vMe() {
    const me = S.role === 'farmer' ? PEOPLE.taro : PEOPLE.taka;
    const shareRows = ['taka', 'yumi', 'sato'].map((k) => `
      <div class="item">${av(PEOPLE[k], 36)}<div class="tx"><b>${PEOPLE[k].name}さん</b><span>${PEOPLE[k].rel}</span></div>${sw('share-' + k, S.share[k], PEOPLE[k].name + 'さんに位置を見せる')}</div>`).join('');
    const watchRows = ['taro', 'sato'].map((k) => `
      <div class="item">${av(PEOPLE[k], 36)}<div class="tx"><b>${PEOPLE[k].name}さん</b><span>${k === 'taro' ? '父' : '近所の農家'}</span></div>${sw('watch-' + k, S.watching[k], PEOPLE[k].name + 'さんの知らせを受け取る')}</div>`).join('');
    const farmerSettings = `
      <div class="section pad">位置を見せる人</div>
      <div class="card group">${shareRows}
        <button class="item" data-a="add"><span class="ic">${I.plus}</span><span class="tx"><b>見せる人を追加</b><span>電話番号か招待コードで追加します</span></span><span class="chev">${I.chev}</span></button>
      </div>
      <div class="section pad">見守りの設定</div>
      <div class="card group">
        <div class="item"><span class="ic">${I.clock}</span><span class="tx"><b>帰りの目安</b><span>過ぎても帰らないと知らせます</span></span>
          <span class="stepper"><button data-step="ret:-30" aria-label="30分早く">−</button><output>${hm(S.returnTime)}</output><button data-step="ret:30" aria-label="30分遅く">+</button></span></div>
        <div class="item"><span class="ic">${I.truck}</span><span class="tx"><b>スマホの置き方</b><span>持ち歩くときだけ「動かない」を判定</span></span>
          <span class="seg"><button data-carry="0" aria-pressed="${!carrying()}">軽トラ</button><button data-carry="1" aria-pressed="${carrying()}">持ち歩く</button></span></div>
        <div class="item"><span class="ic">${I.still.replace('#fff', 'currentColor')}</span><span class="tx"><b>動かないときの確認</b><span>この時間動かないと「大丈夫?」と聞きます</span></span>
          <span class="stepper"><button data-step="still:-10" aria-label="10分短く">−</button><output>${S.stillMin}分</output><button data-step="still:10" aria-label="10分長く">+</button></span></div>
      </div>`;
    const watcherSettings = `
      <div class="section pad">見守っている人</div>
      <div class="card group">${watchRows}</div>
      <div class="section pad">知らせの受け取り方</div>
      <div class="card group">
        <div class="item"><span class="ic">${I.bell.replace('#fff', 'currentColor')}</span><span class="tx"><b>アプリの通知</b><span>出発・到着・帰宅、もしものとき</span></span>${sw('n-push', S.notifyPush, 'アプリの通知')}</div>
        <div class="item"><span class="ic">${I.mail}</span><span class="tx"><b>反応がなければSMS</b><span>通知から10分たっても確認がないとき</span></span>${sw('n-sms', S.notifySms, 'SMS')}</div>
      </div>`;
    return `<div class="view">
      <div class="appbar"><h1>マイページ</h1></div>
      <div class="card me-head">${av(me, 64)}<div><b>${me.name}さん</b><span>${S.role === 'farmer' ? '農家として利用中' : '見守る側として利用中'}</span></div></div>
      <div class="section pad">アカウント</div>
      <div class="card group">
        <div class="item"><span class="ic">${I.user}</span><span class="tx"><b>名前</b></span><span class="val">${me.name}</span></div>
        <div class="item"><span class="ic">${I.phone}</span><span class="tx"><b>電話番号</b></span><span class="val">090-0000-0000</span></div>
        <div class="item"><span class="ic">${I.mail}</span><span class="tx"><b>メール</b></span><span class="val">sample@example.com</span></div>
      </div>
      ${S.role === 'farmer' ? farmerSettings : watcherSettings}
      <div class="section pad">その他</div>
      <div class="card group">
        <button class="item" data-a="switch"><span class="ic">${I.swap}</span><span class="tx"><b>${S.role === 'farmer' ? '見守る側の画面を見る' : '農家側の画面を見る'}</b><span>デモ用の切り替え</span></span><span class="chev">${I.chev}</span></button>
        <button class="item" data-a="about"><span class="ic">${I.info}</span><span class="tx"><b>このアプリについて</b></span><span class="chev">${I.chev}</span></button>
        <button class="item" data-a="logout"><span class="ic">${I.back}</span><span class="tx"><b>はじめの画面に戻る</b></span></button>
      </div>
      <p class="foot-note">はたけみまもり デモ版<br>人物・場所・記録はすべて架空です</p>
      <div style="height:80px"></div>
    </div>`;
  }

  // ---------- デモ操作 ----------
  function demoFab() {
    if (!S.role) return '';
    return `<button class="demo-fab ${S.playing ? 'playing' : ''}" data-a="demo" aria-label="デモ操作を開く"><span class="pl">${S.playing ? I.pause : I.play}</span><span>デモ</span><span class="clk" data-bind="fab-clock">${hm(S.t)}</span></button>`;
  }
  function openDemo() {
    const nk = keyTimes()[0];
    openSheet(`
      <h3>デモ操作</h3>
      <p class="d">時間を進めて、1日の流れを再現します。知らせが出たときは自動で止まります。</p>
      <div class="demo-time" data-bind="d-clock">${hm(S.t)}</div>
      <div class="demo-next">${nk != null ? `次の出来事:${hm(nk)}` : 'この日の出来事は終わりました'}</div>
      <div class="demo-ctrl">
        <button class="btn primary" data-d="play">${S.playing ? I.pause + '止める' : I.play + '時間を進める'}</button>
        <button class="btn soft" data-d="next">${I.skip}次の出来事へ</button>
      </div>
      <div class="demo-speed"><span>進む速さ</span><span class="seg">${[[1, 'ゆっくり'], [5, 'ふつう'], [20, '速い']].map(([v, l]) => `<button data-speed="${v}" aria-pressed="${S.speed === v}">${l}</button>`).join('')}</span></div>
      <div class="section">1日の流れを選ぶ</div>
      <div class="scen">${Object.entries(SCENARIOS).map(([k, v], i) => `<button data-scn="${k}" aria-pressed="${S.scenario === k}"><span class="n">${i + 1}</span><span><b>${v.name}</b><span>${v.desc}</span></span></button>`).join('')}</div>
      <div class="demo-ctrl">
        <button class="btn ghost" data-d="reset">最初からやり直す</button>
        <button class="btn ghost" data-d="switch">${I.swap}${S.role === 'farmer' ? '見守る側へ' : '農家側へ'}</button>
      </div>`,
      (sh) => sh.addEventListener('click', (e) => {
        const d = e.target.closest('[data-d]'), sp = e.target.closest('[data-speed]'), sc = e.target.closest('[data-scn]');
        if (sp) { S.speed = +sp.dataset.speed; openDemo(); return; }
        if (sc) { resetDay(sc.dataset.scn); toast(`「${SCENARIOS[sc.dataset.scn].name}」を最初から始めます`); closeSheet(); return; }
        if (!d) return;
        const a = d.dataset.d;
        if (a === 'play') { S.playing ? stopPlay() : startPlay(); closeSheet(); refresh(); }
        if (a === 'next') { closeSheet(); jumpNext(); }
        if (a === 'reset') { resetDay(); closeSheet(); toast('最初からやり直します'); }
        if (a === 'switch') { closeSheet(); switchRole(S.role === 'farmer' ? 'watcher' : 'farmer', true); }
      }));
  }

  // =========================================================
  // 描画
  // =========================================================
  let views = {};
  function render() {
    destroyMaps(); views = {};
    if (!S.role) { app.innerHTML = vWelcome(); layer.innerHTML = ''; return; }
    let html = '';
    if (S.detail != null) html = vDetail();
    else if (S.tab === 'home') html = S.role === 'farmer' ? vFarmerHome() : vWatcherHome();
    else if (S.tab === 'records') html = vRecords();
    else html = vMe();
    app.innerHTML = html + tabbar();
    layer.querySelectorAll('.demo-fab').forEach((e) => e.remove());
    layer.insertAdjacentHTML('beforeend', demoFab());
    mountMaps();
  }

  function mountMaps() {
    const mini = $('#mini'), wmap = $('#wmap'), dmap = $('#dmap');
    if (mini) { views.mini = makeMap(mini, { zoom: 13, interactive: false }); }
    if (wmap) {
      views.wmap = makeMap(wmap, { zoom: 12.4 });
      const sheet = $('#wsheet');
      whenReady(views.wmap, () => views.wmap.map.setPadding({ top: 70, bottom: sheet ? sheet.offsetHeight - 10 : 0, left: 20, right: 20 }));
    }
    if (dmap) {
      const d = dayData(S.detail);
      views.dmap = makeMap(dmap, { zoom: 12.5 });
      views.dmapData = d;
      setTrack(views.dmap, [], d.pts.map((x) => x.p));
      if (d.pts.length) setPerson(views.dmap, d.pts[0].p, '');
      fit(views.dmap, d.pts.map((x) => x.p), 36);
      const sc = $('#scrub'); if (sc) sc.addEventListener('input', () => scrubTo(+sc.value));
    }
    updateMaps(true);
  }

  function updateMaps(first) {
    const coords = S.track.map((x) => x.p);
    if (views.mini) {
      const cur = stateAt(S.t);
      setTrack(views.mini, coords);
      setPerson(views.mini, cur.signal ? cur.p : (S.lastFix ? S.lastFix.p : cur.p), cur.signal ? '' : 'lost');
      whenReady(views.mini, () => views.mini.map.easeTo({ center: cur.signal ? cur.p : S.lastFix.p, zoom: 14.2, duration: first ? 0 : 500 }));
    }
    if (views.wmap) {
      const cur = stateAt(S.t);
      const st = watcherStatus();
      const p = (S.working && !cur.signal) || S.alert ? S.lastFix.p : (S.working ? cur.p : [PL.home.lng, PL.home.lat]);
      setTrack(views.wmap, coords);
      setPerson(views.wmap, p, st.mk, (S.alert || (S.working && !cur.signal)) ? `最後の位置 ${hm(S.lastFix.t)}` : null);
      if (first) fit(views.wmap, coords.length ? coords.concat([p]) : [p, PL.east.field, PL.south.field], 40);
    }
  }

  function scrubTo(i) {
    const d = views.dmapData; if (!d || !d.pts.length) return;
    const pt = d.pts[Math.min(i, d.pts.length - 1)];
    setTrack(views.dmap, d.pts.slice(0, i + 1).map((x) => x.p), d.pts.map((x) => x.p));
    setPerson(views.dmap, pt.p, '');
    const c = $('[data-bind="r-clock"]'); if (c) c.textContent = hm(pt.t);
    const w = $('[data-bind="r-where"]');
    if (w) {
      const near = (a, b) => haversine(a, b) < 260;
      w.textContent = near(pt.p, [PL.home.lng, PL.home.lat]) ? '自宅付近' : near(pt.p, PL.east.field) || near(pt.p, [PL.east.lng, PL.east.lat]) ? `${PL.east.name}にいた` : near(pt.p, PL.south.field) || near(pt.p, [PL.south.lng, PL.south.lat]) ? `${PL.south.name}にいた` : '移動中';
    }
  }
  let replayTimer = null;
  function replay(btn) {
    const sc = $('#scrub'); if (!sc) return;
    if (replayTimer) { clearInterval(replayTimer); replayTimer = null; btn.innerHTML = I.play; return; }
    if (+sc.value >= +sc.max) sc.value = 0;
    btn.innerHTML = I.pause;
    replayTimer = setInterval(() => {
      if (!document.body.contains(sc)) { clearInterval(replayTimer); replayTimer = null; return; }
      sc.value = Math.min(+sc.max, +sc.value + Math.max(1, Math.round(+sc.max / 120)));
      scrubTo(+sc.value);
      if (+sc.value >= +sc.max) { clearInterval(replayTimer); replayTimer = null; btn.innerHTML = I.play; }
    }, 60);
  }

  // 時間が進んだときの更新。画面の構造が変わるときだけ作り直す
  let lastSig = '';
  function signature() {
    const cur = stateAt(S.t);
    return [S.role, S.tab, S.detail, S.working, S.ended, cur.signal, cur.place, !!S.alert, S.alert && S.alert.stage, S.alert && S.alert.acked, S.autoStarted, S.scenario].join('|');
  }
  function refresh(force) {
    if (!S.role) return;
    const sig = signature();
    const onDetailToday = S.detail === 'today';
    if (force || sig !== lastSig) {
      lastSig = sig;
      if (S.detail != null && !onDetailToday && !force) { /* 過去の記録を見ている間は作り直さない */ }
      else {
        const v = $('.view'), y = v ? v.scrollTop : 0;
        render();
        const v2 = $('.view'); if (v2) v2.scrollTop = y;
      }
    } else {
      bind('f-elapsed', S.working ? durShort(S.t - S.workStart) : null);
      bind('f-dist', S.working ? `${(S.dist / 1000).toFixed(1)}<small>km</small>` : null);
      bind('f-sent', S.working ? (stateAt(S.t).signal ? `${hm(S.lastFix.t)} に位置を送りました` : `保存中の記録 ${S.pending}件(電波が戻ると送ります)`) : null);
      if (S.tab === 'home' && S.role === 'watcher' && S.detail == null) {
        // 見守る側は内容が細かく変わるので、シートだけ差し替える
        const sh = $('#wsheet');
        if (sh) { const tmp = document.createElement('div'); tmp.innerHTML = vWatcherHome(); const n = $('#wsheet', tmp); sh.innerHTML = n.innerHTML; }
      }
      updateMaps(false);
    }
    bind('fab-clock', hm(S.t));
    bind('d-clock', hm(S.t));
    const fab = $('.demo-fab', layer);
    if (fab) { fab.classList.toggle('playing', S.playing); const pl = $('.pl', fab); if (pl) pl.innerHTML = S.playing ? I.pause : I.play; }
    if (S.ask && S.role === 'farmer') { const cd = $('[data-bind="cd"]', layer); if (cd) cd.textContent = `あと${Math.max(0, S.ask.at + 5 - S.t)}分で、家族に知らせます`; }
  }
  function bind(key, html) { if (html == null) return; document.querySelectorAll(`[data-bind="${key}"]`).forEach((e) => { e.innerHTML = html; }); }

  function switchRole(role, keep) {
    closeSheet();
    layer.querySelectorAll('.full-alert,.banner').forEach((e) => e.remove());
    S.role = role; S.tab = 'home'; S.detail = null;
    if (!keep) resetDay();
    lastSig = ''; refresh(true);
    if (role === 'watcher' && S.alert) setTimeout(showWatcherAlert, 300);
    if (role === 'farmer' && S.ask) setTimeout(showFarmerAsk, 300);
  }

  // =========================================================
  // 操作
  // =========================================================
  app.addEventListener('click', (e) => {
    const role = e.target.closest('[data-role]');
    if (role) { S.role = role.dataset.role; S.tab = 'home'; resetDay(); setTimeout(() => toast('右下の「デモ」から時間を進められます'), 600); return; }
    const tab = e.target.closest('[data-tab]');
    if (tab) { S.tab = tab.dataset.tab; S.detail = null; refresh(true); $('.view') && ($('.view').scrollTop = 0); return; }
    const day = e.target.closest('[data-day]');
    if (day) { S.detail = day.dataset.day === 'today' ? 'today' : +day.dataset.day; refresh(true); return; }
    const st = e.target.closest('[data-step]');
    if (st) {
      const [k, v] = st.dataset.step.split(':');
      if (k === 'ret') S.returnTime = Math.min(T(21, 0), Math.max(T(15, 0), S.returnTime + +v));
      if (k === 'still') S.stillMin = Math.min(90, Math.max(10, S.stillMin + +v));
      refresh(true); return;
    }
    const cy = e.target.closest('[data-carry]');
    if (cy) {
      if (S.scenario === 'still' && cy.dataset.carry === '0') { toast('「長く動かない日」は、持ち歩く設定で再現しています'); return; }
      S.carry = cy.dataset.carry === '1'; refresh(true); return;
    }
    const a = e.target.closest('[data-a]'); if (!a) return;
    const act = a.dataset.a;
    if (act === 'start') { if (!S.ended) startWork(S.t, false); else toast('今日の記録は終わっています。デモ操作から、最初からやり直せます'); }
    if (act === 'end') openSheet(`
      <h3>作業を終えますか?</h3>
      <p class="d">記録を止めて、家族に「作業を終えた」と知らせます。家に帰ったときは、押さなくても自動で終わります。</p>
      <button class="btn primary block" data-x="yes">${I.stop}作業を終える</button>
      <button class="btn ghost block" style="margin-top:10px" data-x="no">続ける</button>`,
      (sh) => sh.addEventListener('click', (ev) => { const x = ev.target.closest('[data-x]'); if (!x) return; closeSheet(); if (x.dataset.x === 'yes') endWork(S.t, false); }));
    if (act === 'call') callSheet();
    if (act === 'today') { S.tab = 'records'; S.detail = 'today'; refresh(true); }
    if (act === 'center') { if (views.wmap) { const p = S.alert || !stateAt(S.t).signal ? S.lastFix.p : stateAt(S.t).p; whenReady(views.wmap, () => views.wmap.map.easeTo({ center: p, zoom: 15, duration: 700 })); } }
    if (act === 'back') { S.detail = null; refresh(true); }
    if (act === 'replay') replay(a);
    if (act === 'switch') switchRole(S.role === 'farmer' ? 'watcher' : 'farmer', true);
    if (act === 'logout') { stopPlay(); S.role = null; clearOverlays(); render(); }
    if (act === 'add') toast('デモでは追加できません。本物のアプリでは、電話番号か招待コードで追加します');
    if (act === 'about') openSheet(`
      <h3>はたけみまもり について</h3>
      <p class="d">畑で何かあっても、すぐに気づけるようにするアプリです。作業開始を押す(押し忘れても家を出れば自動)だけで、位置と経路を記録し、本人が選んだ家族だけに共有します。帰りの目安を過ぎたときや、長く動かないときは、見守る人に知らせます。</p>
      <p class="d">これは中間発表用のデモ版です。人物・自宅・畑・記録はすべて架空で、位置や通知は実際には動きません。<br>地図データ:© OpenStreetMap contributors / OpenFreeMap</p>
      <button class="btn ghost block" data-x="close">閉じる</button>`,
      (sh) => sh.addEventListener('click', (ev) => { if (ev.target.closest('[data-x]')) closeSheet(); }));
  });
  app.addEventListener('change', (e) => {
    const id = e.target.id || '';
    if (id.startsWith('share-')) { const k = id.slice(6); S.share[k] = e.target.checked; toast(`${PEOPLE[k].short}さんに位置を${e.target.checked ? '見せます' : '見せません'}`); }
    if (id.startsWith('watch-')) { S.watching[id.slice(6)] = e.target.checked; }
    if (id === 'n-push') S.notifyPush = e.target.checked;
    if (id === 'n-sms') { S.notifySms = e.target.checked; toast(e.target.checked ? '反応がないときはSMSも送ります' : 'SMSは送りません'); }
  });
  layer.addEventListener('click', (e) => { if (e.target.closest('[data-a="demo"]')) openDemo(); });

  render();
})();
