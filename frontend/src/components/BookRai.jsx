import React, { useState } from 'react';

export default function BookRai({ raiRows, setRaiRows }) {
  const [presupuestoAutorizado, setPresupuestoAutorizado] = useState(754800000.00);
  const [newRow, setNewRow] = useState({
    fecha: '2026-03-01',
    comprobante_id: '',
    concepto: '',
    monto: ''
  });

  const handleAddRow = (e) => {
    e.preventDefault();
    if (!newRow.concepto || !newRow.monto || !newRow.comprobante_id) return;
    setRaiRows(prev => [...prev, { ...newRow, monto: parseFloat(newRow.monto) || 0 }]);
    setNewRow({ fecha: newRow.fecha, concepto: '', monto: '', comprobante_id: '' });
  };

  const handleDelete = (index) => {
    setRaiRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const lines = evt.target.result.split('\n');
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(',');
        if (cols.length >= 4) {
          data.push({
            fecha: cols[0].trim(),
            concepto: cols[1].trim(),
            monto: parseFloat(cols[2].trim()) || 0,
            comprobante_id: cols[3].trim()
          });
        }
      }
      if (data.length > 0) setRaiRows(data);
    };
    reader.readAsText(file);
  };

  // Dynamic calculations for cumulative and balances
  let runningAcumulado = 0;
  const monthlyTotals = {}; // Tracks running monthly totals

  const rowsWithCalculations = raiRows.map((r) => {
    const dailyMonto = parseFloat(r.monto) || 0;
    runningAcumulado += dailyMonto;
    
    // Group monthly total by year-month (YYYY-MM)
    const yearMonth = r.fecha ? r.fecha.substring(0, 7) : '2026-03';
    monthlyTotals[yearMonth] = (monthlyTotals[yearMonth] || 0) + dailyMonto;
    
    return {
      ...r,
      ingresos_mensuales: monthlyTotals[yearMonth],
      ingresos_acumulados: runningAcumulado,
      saldo: presupuestoAutorizado - runningAcumulado
    };
  });

  const totalMonto = raiRows.reduce((acc, r) => acc + (r.monto || 0), 0);

  return (
    <div style={{ background: '#fafafa', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>💧 Libro RAI — Recaudación e Ingresos</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Plantilla compatible: <code>RAI 1.xls</code></span>
        </div>
        <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          📥 Subir Excel / CSV (Libro RAI)
          <input type="file" accept=".csv,.xls,.xlsx" onChange={handleCSV} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '6px', border: '1px solid #bfdbfe', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gov-blue)' }}>🏛️ Presupuesto de Recursos Autorizado:</span>
        <input 
          type="number" 
          className="form-control" 
          style={{ width: '220px', fontWeight: 'bold', border: '1px solid #93c5fd' }} 
          value={presupuestoAutorizado} 
          onChange={e => setPresupuestoAutorizado(parseFloat(e.target.value) || 0)} 
        />
      </div>

      <form onSubmit={handleAddRow} style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #cbd5e1' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--gov-blue)', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>Cargar Nuevo Ingreso</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Fecha Ingreso</label>
            <input 
              type="date" 
              className="form-control"
              value={newRow.fecha}
              onChange={e => setNewRow({ ...newRow, fecha: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Planilla N° / Comprobante</label>
            <input 
              type="text" 
              className="form-control font-mono"
              placeholder="Ej: PLAN-902 o REC-0981"
              value={newRow.comprobante_id}
              onChange={e => setNewRow({ ...newRow, comprobante_id: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Concepto / Origen Recurso</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Ej: Coparticipación Provincial / Tasas de Cementerio"
              value={newRow.concepto}
              onChange={e => setNewRow({ ...newRow, concepto: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Monto Ingresado ($)</label>
            <input 
              type="number" 
              step="0.01"
              className="form-control"
              placeholder="0.00"
              value={newRow.monto}
              onChange={e => setNewRow({ ...newRow, monto: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            ➕ Registrar Ingreso RAI
          </button>
        </div>
      </form>

      <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '6px' }}>
        <table className="gov-table" style={{ fontSize: '0.8rem' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr style={{ background: '#e2e8f0' }}>
              <th style={{ width: '50px', textAlign: 'center' }}>As.</th>
              <th style={{ width: '120px' }}>Fecha</th>
              <th style={{ width: '130px' }}>Planilla N°</th>
              <th>Concepto</th>
              <th style={{ width: '140px', textAlign: 'right', background: '#ecfdf5' }}>Ingresos Diarios</th>
              <th style={{ width: '150px', textAlign: 'right' }}>Ingresos Mensuales</th>
              <th style={{ width: '160px', textAlign: 'right', background: '#eff6ff' }}>Ingresos Acumulados</th>
              <th style={{ width: '160px', textAlign: 'right', background: '#fef2f2', fontWeight: 700 }}>Saldo</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {rowsWithCalculations.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                  Sin ingresos registrados en Libro RAI.
                </td>
              </tr>
            ) : (
              rowsWithCalculations.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{i + 1}</td>
                  <td>{r.fecha}</td>
                  <td className="font-mono">{r.comprobante_id}</td>
                  <td style={{ fontWeight: 500 }}>{r.concepto}</td>
                  <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                    $ {r.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                    $ {r.ingresos_mensuales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--gov-blue)', background: '#f0f9ff' }}>
                    $ {r.ingresos_acumulados.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)', background: '#fef2f2' }}>
                    $ {r.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDelete(i)} className="btn-danger-sm" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
        <span style={{ color: 'var(--gov-blue)' }}>Presupuesto Inicial: $ {presupuestoAutorizado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        <span style={{ color: 'var(--success)' }}>Total Recaudado: $ {totalMonto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        <span style={{ color: 'var(--danger)' }}>Saldo Presupuestario: $ {(presupuestoAutorizado - totalMonto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}
