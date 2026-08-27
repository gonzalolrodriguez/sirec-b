import React, { useState } from 'react';

export default function BookBanco({ bancoRows, setBancoRows }) {
  const [newRow, setNewRow] = useState({
    fecha: '2026-03-04',
    cheque: '',
    a_la_orden_de: '',
    depositos: '',
    retiro: ''
  });

  const handleAddRow = (e) => {
    e.preventDefault();
    if (!newRow.a_la_orden_de) return;

    setBancoRows(prev => [
      ...prev,
      {
        fecha: newRow.fecha,
        cheque: newRow.cheque,
        a_la_orden_de: newRow.a_la_orden_de,
        depositos: parseFloat(newRow.depositos) || 0,
        retiro: parseFloat(newRow.retiro) || 0
      }
    ]);

    setNewRow({
      fecha: newRow.fecha,
      cheque: '',
      a_la_orden_de: '',
      depositos: '',
      retiro: ''
    });
  };

  const handleDelete = (index) => {
    setBancoRows(prev => prev.filter((_, i) => i !== index));
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
        if (cols.length >= 5) {
          // Check if we are reading new format (Fecha, Cheque, A la orden de, Depositos, Retiro)
          // or if it's the old format (Fecha, Tipo, Comprobante, Monto, Beneficiario)
          const isNewFormat = !isNaN(parseFloat(cols[3])) && !isNaN(parseFloat(cols[4]));
          if (isNewFormat) {
            data.push({
              fecha: cols[0].trim(),
              cheque: cols[1].trim(),
              a_la_orden_de: cols[2].trim(),
              depositos: parseFloat(cols[3].trim()) || 0,
              retiro: parseFloat(cols[4].trim()) || 0
            });
          } else {
            // Old format fallback
            const tipo = cols[1].trim().toLowerCase();
            const monto = parseFloat(cols[3].trim()) || 0;
            data.push({
              fecha: cols[0].trim(),
              cheque: cols[2].trim(),
              a_la_orden_de: cols[4].trim(),
              depositos: tipo === 'deposito' ? monto : 0,
              retiro: tipo !== 'deposito' ? monto : 0
            });
          }
        }
      }
      if (data.length > 0) setBancoRows(data);
    };
    reader.readAsText(file);
  };

  // running balance
  let runningSaldo = 0;
  const rowsWithSaldo = bancoRows.map(r => {
    const dep = parseFloat(r.depositos) || 0;
    const ret = parseFloat(r.retiro) || 0;
    runningSaldo += dep - ret;
    return {
      ...r,
      saldo: runningSaldo
    };
  });

  const totalDepositos = bancoRows.reduce((acc, r) => acc + (parseFloat(r.depositos) || 0), 0);
  const totalRetiros = bancoRows.reduce((acc, r) => acc + (parseFloat(r.retiro) || 0), 0);

  return (
    <div style={{ background: '#fafafa', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>🏦 Libro Banco — Banco de Formosa</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Plantilla compatible: <code>LIBRO Banco-2026.xls</code></span>
        </div>
        <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          📥 Subir Excel / CSV (Libro Banco)
          <input type="file" accept=".csv,.xls,.xlsx" onChange={handleCSV} style={{ display: 'none' }} />
        </label>
      </div>

      <form onSubmit={handleAddRow} style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #cbd5e1' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--gov-blue)', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>Cargar Nuevo Movimiento</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Fecha Operación</label>
            <input 
              type="date" 
              className="form-control"
              value={newRow.fecha}
              onChange={e => setNewRow({ ...newRow, fecha: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>N° Cheque / Referencia</label>
            <input 
              type="text" 
              className="form-control font-mono"
              placeholder="Ej: 0029312 o CHQ-991"
              value={newRow.cheque}
              onChange={e => setNewRow({ ...newRow, cheque: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>A la Orden De (Beneficiario)</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Ej: Proveedor / Razón Social / Saldo Anterior"
              value={newRow.a_la_orden_de}
              onChange={e => setNewRow({ ...newRow, a_la_orden_de: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--success)' }}>Depósitos (Debe / Ingreso)</label>
            <input 
              type="number" 
              step="0.01"
              className="form-control"
              placeholder="0.00"
              value={newRow.depositos}
              onChange={e => setNewRow({ ...newRow, depositos: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--danger)' }}>Retiro (Haber / Egreso)</label>
            <input 
              type="number" 
              step="0.01"
              className="form-control"
              placeholder="0.00"
              value={newRow.retiro}
              onChange={e => setNewRow({ ...newRow, retiro: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            ➕ Registrar Movimiento Banco
          </button>
        </div>
      </form>

      <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '6px' }}>
        <table className="gov-table" style={{ fontSize: '0.8rem' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr style={{ background: '#e2e8f0' }}>
              <th style={{ width: '50px', textAlign: 'center' }}>#</th>
              <th style={{ width: '120px' }}>Fecha</th>
              <th style={{ width: '120px' }}>Cheque</th>
              <th>A la Orden de</th>
              <th style={{ width: '140px', textAlign: 'right', background: '#ecfdf5' }}>Depósitos (+)</th>
              <th style={{ width: '140px', textAlign: 'right', background: '#fef2f2' }}>Retiro (-)</th>
              <th style={{ width: '165px', textAlign: 'right', background: '#eff6ff', fontWeight: 700 }}>Saldo</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {rowsWithSaldo.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                  Sin movimientos registrados en Libro Banco.
                </td>
              </tr>
            ) : (
              rowsWithSaldo.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{i + 1}</td>
                  <td>{r.fecha}</td>
                  <td className="font-mono">{r.cheque || '-'}</td>
                  <td style={{ fontWeight: 500 }}>{r.a_la_orden_de}</td>
                  <td style={{ textAlign: 'right', color: 'var(--success)' }}>{r.depositos > 0 ? `$ ${r.depositos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{r.retiro > 0 ? `$ ${r.retiro.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--gov-blue)', background: '#f0f9ff' }}>
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
        <span style={{ color: 'var(--success)' }}>Total Depósitos: $ {totalDepositos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        <span style={{ color: 'var(--danger)' }}>Total Retiros: $ {totalRetiros.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        <span style={{ color: 'var(--gov-blue)' }}>Saldo Final: $ {runningSaldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}
