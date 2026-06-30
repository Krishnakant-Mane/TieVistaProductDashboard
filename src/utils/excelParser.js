import * as XLSX from "xlsx";

export function parseExcelFile(file, setProducts, setSnaps, setActiveMonth, setUploadStatus) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const wb2 = XLSX.read(e.target.result, { type: 'array' });

      function sheetToRows(sheetName, headerRow) {
        const ws = wb2.Sheets[sheetName];
        if (!ws) return [];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        const hdrs = raw[headerRow - 1] || [];
        const rows = [];
        for (let i = headerRow; i < raw.length; i++) {
          const r = raw[i];
          if (!r || r.every((v) => v === '')) continue;
          const obj = {};
          hdrs.forEach((h, ci) => {
            if (h) obj[String(h).trim()] = r[ci] ?? '';
          });
          rows.push(obj);
        }
        return rows;
      }

      const prodRows = sheetToRows('🏢 PRODUCTS', 4);
      const feeRows = sheetToRows('🏷 FEE CLASSES', 4);
      const mdRows = sheetToRows('📅 MONTHLY DATA', 4);

      if (!prodRows.length) {
        alert('Could not find 🏢 PRODUCTS sheet. Check file.');
        return;
      }

      const feeMap = {};
      feeRows.forEach((r) => {
        const pid = String(r['Product ID'] || '').trim();
        if (!pid) return;
        if (!feeMap[pid]) feeMap[pid] = [];
        feeMap[pid].push({
          cls: String(r['Class Name'] || '').trim(),
          minInv: String(r['Min Label'] || '') + (r['Max Label'] ? ' – ' + r['Max Label'] : '+'),
          mgmtFee: String(Number(r['Mgmt Fee %'] || 0).toFixed(2)) + '%',
          perfFee: r['Perf Fee %'] ? String(Number(r['Perf Fee %']).toFixed(1)) + '%' : 'None',
          hurdle: r['Hurdle %'] ? String(r['Hurdle %']) + '%' : '—',
          hwm: String(r['HWM'] || '—'),
          note: String(r['Notes'] || ''),
        });
      });

      const elig_keys = {
        'Indian Resident': 'e_ind', 'US NRI': 'e_us', 'Canadian NRI': 'e_ca',
        'UK NRI': 'e_uk', 'Singapore NRI': 'e_sg', 'UAE NRI': 'e_uae',
        'Foreign Investor': 'e_for', 'Institution': 'e_inst', 'HNI': 'e_hni',
        'UHNI / Family Office': 'e_uhni', 'UHNI/Family Office': 'e_uhni',
      };
      const elig_display_keys = {
        'e_ind': 'Indian Resident', 'e_us': 'US NRI', 'e_ca': 'Canadian NRI',
        'e_uk': 'UK NRI', 'e_sg': 'Singapore NRI', 'e_uae': 'UAE NRI',
        'e_for': 'Foreign Investor', 'e_inst': 'Institution', 'e_hni': 'HNI', 'e_uhni': 'UHNI',
      };
      
      const newP = [];
      let idCounter = 1;
      
      prodRows.forEach((r) => {
        const pid = String(r['Product ID'] || '').trim();
        const name = String(r['Product Name'] || '').trim();
        if (!pid || !name) return;
        if (String(r['Active (Y/N)'] || 'Y').trim().toUpperCase() === 'N') return;

        const elig = [];
        Object.entries(elig_keys).forEach(([col, key]) => {
          if (String(r[col] || '').trim().toUpperCase() === 'Y') {
            elig.push(elig_display_keys[key] || col);
          }
        });

        const feeClasses = feeMap[pid] || [{
          cls: 'Standard', minInv: '—', mgmtFee: String(r['Mgmt Fee % (base)'] || '—') + '%',
          perfFee: '—', hurdle: '—', hwm: '—', note: ''
        }];

        const p = {
          id: idCounter++,
          pid: pid,
          name: name,
          amc: String(r['AMC / Fund House'] || '').trim(),
          type: String(r['Product Type'] || '').trim(),
          structure: String(r['Legal Structure'] || '').trim(),
          category: String(r['Strategy'] || r['Strategy / Category'] || '').trim(),
          approach: String(r['Approach'] || '').trim(),
          capBias: String(r['Cap Bias'] || '').trim(),
          currency: String(r['Currency'] || 'INR').trim(),
          benchmark: String(r['Benchmark'] || '').trim(),
          inception: String(r['Inception'] || '').trim(),
          manager: String(r['Fund Manager'] || '').trim(),
          managerExp: Number(r['Manager Exp (Yrs)'] || 0),
          minInvL: Number(r['Min Investment'] ? String(r['Min Investment']).replace(/[₹$,LCr\s]/g, '') : 0) || 0.05,
          minInvDisp: String(r['Min Investment'] || '').trim(),
          lock: String(r['Lock-in Period'] || 'None').trim(),
          gift: String(r['Product Type'] || '').includes('GIFT'),
          intl: String(r['Product Type'] || '').includes('International'),
          giftDenom: String(r['GC Denomination'] || '').trim(),
          giftMin: Number(r['GC Min Inv ($)'] || 0),
          giftTax: String(r['GC Tax Treatment'] || '').trim(),
          giftRepat: String(r['GC Repatriation'] || '').trim(),
          giftDomicile: 'GIFT City IFSC, Gujarat',
          giftRegulator: 'IFSCA',
          intlDomicile: String(r['Intl Domicile'] || '').trim(),
          intlStructure: String(r['Intl Structure'] || '').trim(),
          intlTax: String(r['Intl Tax (India)'] || '').trim(),
          intlRegulator: 'SEBI (feeder)',
          intlCurrency: String(r['Currency'] || 'INR') + ' underlying',
          expRatio: Number(r['Expense Ratio %'] || 0),
          mgmtFee: Number(r['Mgmt Fee % (base)'] || 0),
          perfFee: Number(r['Perf Fee % (base)'] || 0),
          hurdle: r['Hurdle Rate %'] !== '' ? Number(r['Hurdle Rate %']) : null,
          hwm: String(r['High Watermark'] || 'No').trim(),
          trail: Number(r['Trail Comm %'] || 0),
          upfront: Number(r['Upfront Comm %'] || 0),
          perfShare: Number(r['Perf Fee Share %'] || 0),
          revModel: String(r['Revenue Model'] || '').trim(),
          clawback: String(r['Clawback'] || 'No').trim(),
          revSplit: String(r['TV Rev Split %'] || '100') + '% TV',
          exitLoad: String(r['Exit Load'] || '').trim(),
          feeClasses: feeClasses,
          elig: elig,
        };
        newP.push(p);
      });

      const pidMap = {};
      newP.forEach((p) => { pidMap[p.pid] = p.id; });

      const newSNAPS = {};
      mdRows.forEach((r) => {
        const month = String(r['Month'] || '').trim();
        const pname_r = String(r['Product Name'] || r['Product Name (auto)'] || '').trim();
        const pid_r = String(r['Product ID (auto)'] || r['Product ID'] || '').trim();
        let id = null;
        if (pid_r && pidMap[pid_r]) id = pidMap[pid_r];
        else if (pname_r) { const p2 = newP.find((x) => x.name === pname_r); if (p2) id = p2.id; }
        
        if (!month || !id) return;
        if (!newSNAPS[month]) newSNAPS[month] = {};
        
        const sectors = {};
        for (let si = 1; si <= 5; si++) {
          const sn = String(r['Sector ' + si + ' Name'] || '').trim();
          const sp = r['Sector ' + si + ' %'];
          if (sn && sp !== '' && sp != null) sectors[sn] = Number(sp);
        }

        const h5 = ['Holding 1 (Name Wt%)', 'Holding 2', 'Holding 3', 'Holding 4', 'Holding 5']
          .map((k) => String(r[k] || '').trim()).filter(Boolean);

        newSNAPS[month][id] = {
          aum: Number(r['AUM (\u20b9Cr / $M)'] || r['AUM (Rs.Cr / $M)'] || 0),
          ret1: r['1Y Ret %'] !== '' ? Number(r['1Y Ret %']) : null,
          ret3: r['3Y Ret %'] !== '' ? Number(r['3Y Ret %']) : null,
          ret5: r['5Y Ret %'] !== '' ? Number(r['5Y Ret %']) : null,
          retSI: r['SI Ret %'] !== '' ? Number(r['SI Ret %']) : null,
          sharpe: r['Sharpe'] !== '' ? Number(r['Sharpe']) : null,
          stddev: r['Std Dev %'] !== '' ? Number(r['Std Dev %']) : null,
          upCap: r['Up Capture %'] !== '' ? Number(r['Up Capture %']) : null,
          downCap: r['Down Capture %'] !== '' ? Number(r['Down Capture %']) : null,
          sortino: r['Sortino'] !== '' ? Number(r['Sortino']) : null,
          maxDD: r['Max Drawdown %'] !== '' ? Number(r['Max Drawdown %']) : null,
          alpha: r['Alpha %'] !== '' ? Number(r['Alpha %']) : null,
          beta: r['Beta'] !== '' ? Number(r['Beta']) : null,
          sectors: sectors,
          h5: h5,
          holdings: Number(r['Holdings Count'] || 0),
        };
      });

      setProducts(newP);
      setSnaps(newSNAPS);
      
      const newMonths = Object.keys(newSNAPS);
      if (newMonths.length > 0) {
        setActiveMonth(newMonths[newMonths.length - 1]);
      }
      
      if (setUploadStatus) {
        setUploadStatus({
          show: true,
          msg: 'Data loaded successfully',
          detail: `${newP.length} products | ${newMonths.length} months data`
        });
        setTimeout(() => setUploadStatus(prev => ({...prev, show: false})), 5000);
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing Excel file. See console for details.');
    }
  };
  reader.readAsArrayBuffer(file);
}
