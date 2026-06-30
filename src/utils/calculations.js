export const fp = (v) => (v != null ? (v > 0 ? '+' : '') + v.toFixed(1) + '%' : '—');

export const minD = (p) =>
  p.gift && p.giftMin
    ? '$' + p.giftMin.toLocaleString()
    : p.minInvL >= 1
    ? '₹' + p.minInvL + 'L'
    : '₹' + Math.round(p.minInvL * 100) / 100 + 'L';

export const snap = (p, snapsData, activeMonth) => {
  const entry = snapsData[activeMonth]?.[p.id];
  const hasData = !!entry;
  const s = entry || {};
  return {
    hasData,
    aum: hasData ? s.aum : null,
    ret1: hasData ? s.ret1 : null,
    ret3: hasData ? s.ret3 : null,
    ret5: hasData ? s.ret5 : null,
    retSI: hasData ? s.retSI : null,
    sharpe: hasData ? s.sharpe : null,
    stddev: hasData ? s.stddev : null,
    upCap: hasData ? s.upCap : null,
    downCap: hasData ? s.downCap : null,
    sortino: hasData ? s.sortino : null,
    maxDD: hasData ? s.maxDD : null,
    alpha: hasData ? s.alpha : null,
    beta: hasData ? s.beta : null,
    sectors: hasData && s.sectors && Object.keys(s.sectors).length ? s.sectors : p.sectors || {},
    h5: hasData && s.h5 && s.h5.length ? s.h5 : p.h5 || [],
    holdings: hasData ? s.holdings || 0 : p.holdings || 0,
  };
};

export const calcStats = (filtered, snapsData, activeMonth) => {
  const n = filtered.length;
  if (!n) return { n: 0, ssh: '—', sr3: '—', sdc2: '—', sau: '—', str: '—', sex: '—' };
  
  const avg = (a) => {
    const valid = a.filter((v) => v != null);
    if (!valid.length) return 0;
    return valid.reduce((x, y) => x + y, 0) / valid.length;
  };
  
  const snaps = filtered.map((p) => snap(p, snapsData, activeMonth));
  const withData = snaps.filter((s) => s.hasData);
  
  const sshAvg = withData.length ? avg(withData.map((s) => s.sharpe).filter((v) => v != null)) : 0;
  const ssh = sshAvg > 0 ? sshAvg.toFixed(2) : '—';
  
  const r3 = withData.filter((s) => s.ret3 != null).map((s) => s.ret3);
  const sr3 = r3.length ? avg(r3).toFixed(1) + '%' : '—';
  
  const dc = withData.filter((s) => s.downCap != null).map((s) => s.downCap);
  const sdc2 = dc.length ? avg(dc).toFixed(0) + '%' : '—';
  
  const sau = '₹' + withData.reduce((a, s) => a + (s.aum || 0), 0).toLocaleString();
  
  const str = avg(filtered.map((p) => p.trail)).toFixed(2) + '%';
  const sex = avg(filtered.map((p) => p.expRatio)).toFixed(2) + '%';
  
  return { n, ssh, sr3, sdc2, sau, str, sex };
};
