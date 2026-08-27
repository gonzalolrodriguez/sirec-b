import React, { useState } from 'react';

export default function BookRaci({ 
  title = "📦 Libro RACI — Adquisiciones, Contrataciones e Inversiones",
  fileRef = "RACI-2026.xls",
  tipoDefault = "bienes_de_uso",
  raciRows, 
  setRaciRows 
}) {
  const [newRow, setNewRow] = useState({
    fecha: '2026-03-01',
    expediente_no: '',
    concepto: '',
    proveedor_cuit: '',
    factura_cae: '',
    compromiso_legal: '',
    compromiso_monto: '',
    devengado_prov: '',
    devengado_monto: '',
    pago_orden: '',
    pago_cheque: '',
    pago_monto: ''
  });

  const handleAddRow = (e) => {
    e.preventDefault();
    if (!newRow.concepto) return;

    setRaciRows(prev => [
      ...prev,
      {
        tipo_raci: tipoDefault,
        fecha: newRow.fecha,
        expediente_no: newRow.expediente_no,
        concepto: newRow.concepto,
        proveedor_cuit: newRow.proveedor_cuit,
        factura_cae: newRow.factura_cae,
        compromiso_legal: newRow.compromiso_legal,
        compromiso_monto: parseFloat(newRow.compromiso_monto) || 0,
        devengado_prov: newRow.devengado_prov,
        devengado_monto: parseFloat(newRow.devengado_monto) || 0,
        pago_orden: newRow.pago_orden,
        pago_cheque: newRow.pago_cheque,
        pago_monto: parseFloat(newRow.pago_monto) || 0
      }
    ]);

    setNewRow({
      fecha: newRow.fecha,
      expediente_no: '',
      concepto: '',
      proveedor_cuit: '',
      factura_cae: '',
      compromiso_legal: '',
      compromiso_monto: '',
      devengado_prov: '',
      devengado_monto: '',
      pago_orden: '',
      pago_cheque: '',
      pago_monto: ''
    });
  };

  const handleDelete = (index) => {
    setRaciRows(prev => prev.filter((_, i) => i !== index));
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
        if (cols.length >= 11) {
          data.push({
            tipo_raci: tipoDefault,
            fecha: cols[1].trim(),
            expediente_no: cols[2].trim(),
            concepto: cols[3].trim(),
            compromiso_legal: cols[4].trim(),
            compromiso_monto: parseFloat(cols[5].trim()) || 0,
            devengado_prov: cols[6].trim(),
            devengado_monto: parseFloat(cols[7].trim()) || 0,
            pago_orden: cols[8].trim(),
            pago_cheque: cols[9].trim(),
            pago_monto: parseFloat(cols[10].trim()) || 0,
            proveedor_cuit: cols[11]?.trim() || '',
            factura_cae: cols[12]?.trim() || ''
          });
        } else if (cols.length >= 4) {
          const etapa = cols[0].trim().toLowerCase();
          const monto = parseFloat(cols[1].trim()) || 0;
          const cuit = cols[2].trim();
          const cae = cols[3].trim();
          
          data.push({
            tipo_raci: tipoDefault,
            fecha: '2026-03-01',
            expediente_no: 'EXP-FALLBACK',
            concepto: 'Registro Fallback',
            compromiso_legal: etapa === 'compromiso' ? 'Fallb. Legal' : '',
            compromiso_monto: etapa === 'compromiso' ? monto : 0,
            devengado_prov: etapa === 'devengado' ? 'Fallb. Prov' : '',
            devengado_monto: etapa === 'devengado' ? monto : 0,
            pago_orden: etapa === 'pago' ? 'Fallb. Orden' : '',
            pago_cheque: '',
            pago_monto: etapa === 'pago' ? monto : 0,
            proveedor_cuit: cuit,
            factura_cae: cae
          });
        }
      }
      if (data.length > 0) setRaciRows(data);
    };
    reader.readAsText(file);
  };

  // Cumulative calculations
  let cumCompromiso = 0;
  let cumDevengado = 0;
  let cumPago = 0;

  const rowsWithCalculations = raciRows.map(r => {
    const comp = parseFloat(r.compromiso_monto) || 0;
    const dev = parseFloat(r.devengado_monto) || 0;
    const pag = parseFloat(r.pago_monto) || 0;
    
    cumCompromiso += comp;
    cumDevengado += dev;
    cumPago += pag;
    
    return {
      ...r,
      compromiso_acum: cumCompromiso,
      devengado_acum: cumDevengado,
      devengado_saldo: cumCompromiso - cumDevengado,
      pago_acum: cumPago,
      pago_saldo: cumDevengado - cumPago
    };
  });

  return (
    <div style={{ background: '#fafafa', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Plantilla compatible: <code>{fileRef}</code></span>
        </div>
        <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          📥 Subir Excel / CSV ({fileRef})
          <input type="file" accept=".csv,.xls,.xlsx" onChange={handleCSV} style={{ display: 'none' }} />
        </label>
      </div>

      <form onSubmit={handleAddRow} style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #cbd5e1' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--gov-blue)', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>Cargar Nuevo Asiento RACI</h4>
        
        {/* Section 1: Datos Generales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Fecha</label>
            <input 
              type="date" 
              className="form-control"
              value={newRow.fecha}
              onChange={e => setNewRow({ ...newRow, fecha: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Expediente N°</label>
            <input 
              type="text" 
              className="form-control font-mono"
              placeholder="Ej: EXP-2026-0044"
              value={newRow.expediente_no}
              onChange={e => setNewRow({ ...newRow, expediente_no: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Concepto</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Ej: Adquisición Insumos de Computación"
              value={newRow.concepto}
              onChange={e => setNewRow({ ...newRow, concepto: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>CUIT Proveedor</label>
            <input 
              type="text" 
              className="form-control font-mono"
              placeholder="30708811229"
              value={newRow.proveedor_cuit}
              onChange={e => setNewRow({ ...newRow, proveedor_cuit: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Factura / CAE</label>
            <input 
              type="text" 
              className="form-control font-mono"
              placeholder="88912389102"
              value={newRow.factura_cae}
              onChange={e => setNewRow({ ...newRow, factura_cae: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Compromiso, Devengado y Pago */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>COMPROMISO</span>
            <div className="form-group" style={{ marginTop: '8px' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="Instr. Legal (Ej: Resol. 12)"
                value={newRow.compromiso_legal}
                onChange={e => setNewRow({ ...newRow, compromiso_legal: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginTop: '4px' }}>
              <input 
                type="number" 
                step="0.01"
                className="form-control"
                placeholder="Monto Compromiso"
                value={newRow.compromiso_monto}
                onChange={e => setNewRow({ ...newRow, compromiso_monto: e.target.value })}
              />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DEVENGADO</span>
            <div className="form-group" style={{ marginTop: '8px' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="Ord. De Prov."
                value={newRow.devengado_prov}
                onChange={e => setNewRow({ ...newRow, devengado_prov: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginTop: '4px' }}>
              <input 
                type="number" 
                step="0.01"
                className="form-control"
                placeholder="Monto Devengado"
                value={newRow.devengado_monto}
                onChange={e => setNewRow({ ...newRow, devengado_monto: e.target.value })}
              />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAGO</span>
            <div className="form-group" style={{ marginTop: '8px' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="Ord. De Pago"
                value={newRow.pago_orden}
                onChange={e => setNewRow({ ...newRow, pago_orden: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="N° Cheque"
                value={newRow.pago_cheque}
                onChange={e => setNewRow({ ...newRow, pago_cheque: e.target.value })}
              />
              <input 
                type="number" 
                step="0.01"
                className="form-control"
                placeholder="Monto Pago"
                value={newRow.pago_monto}
                onChange={e => setNewRow({ ...newRow, pago_monto: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            ➕ Registrar Asiento RACI
          </button>
        </div>
      </form>

      {/* Grouped header table matching Excel layout */}
      <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
        <table className="gov-table" style={{ fontSize: '0.72rem', minWidth: '1500px' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc' }}>
            <tr style={{ background: '#e2e8f0' }}>
              <th rowSpan="2" style={{ width: '40px', verticalAlign: 'middle', borderRight: '1px solid #cbd5e1', textAlign: 'center' }}>As.</th>
              <th rowSpan="2" style={{ width: '90px', verticalAlign: 'middle', borderRight: '1px solid #cbd5e1' }}>Fecha</th>
              <th rowSpan="2" style={{ width: '100px', verticalAlign: 'middle', borderRight: '1px solid #cbd5e1' }}>Expte. N°</th>
              <th rowSpan="2" style={{ width: '220px', verticalAlign: 'middle', borderRight: '1px solid #cbd5e1' }}>Concepto</th>
              <th rowSpan="2" style={{ width: '100px', verticalAlign: 'middle', borderRight: '1px solid #cbd5e1' }}>CUIT / CAE</th>
              
              <th colSpan="3" style={{ textAlign: 'center', background: '#fffbeb', borderRight: '1px solid #cbd5e1' }}>COMPROMISO</th>
              <th colSpan="4" style={{ textAlign: 'center', background: '#eff6ff', borderRight: '1px solid #cbd5e1' }}>DEVENGADO</th>
              <th colSpan="5" style={{ textAlign: 'center', background: '#ecfdf5', borderRight: '1px solid #cbd5e1' }}>PAGO</th>
              
              <th rowSpan="2" style={{ width: '70px', verticalAlign: 'middle', textAlign: 'center' }}>Acción</th>
            </tr>
            <tr style={{ background: '#cbd5e1' }}>
              {/* Compromiso headers */}
              <th style={{ background: '#fef3c7', textAlign: 'left' }}>Instr. Legal</th>
              <th style={{ background: '#fef3c7', textAlign: 'right' }}>Del Mes</th>
              <th style={{ background: '#fde68a', textAlign: 'right', borderRight: '1px solid #94a3b8' }}>Acumulado</th>
              
              {/* Devengado headers */}
              <th style={{ background: '#dbeafe', textAlign: 'left' }}>Ord. Prov.</th>
              <th style={{ background: '#dbeafe', textAlign: 'right' }}>Del Mes</th>
              <th style={{ background: '#bfdbfe', textAlign: 'right' }}>Acumulado</th>
              <th style={{ background: '#93c5fd', textAlign: 'right', borderRight: '1px solid #94a3b8', fontWeight: 700 }}>Saldo</th>
              
              {/* Pago headers */}
              <th style={{ background: '#d1fae5', textAlign: 'left' }}>Ord. Pago</th>
              <th style={{ background: '#d1fae5', textAlign: 'left' }}>N° Cheque</th>
              <th style={{ background: '#d1fae5', textAlign: 'right' }}>Del Mes</th>
              <th style={{ background: '#a7f3d0', textAlign: 'right' }}>Acumulado</th>
              <th style={{ background: '#34d399', textAlign: 'right', borderRight: '1px solid #cbd5e1', fontWeight: 700 }}>Saldo a Pagar</th>
            </tr>
          </thead>
          <tbody>
            {rowsWithCalculations.length === 0 ? (
              <tr>
                <td colSpan="18" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px' }}>
                  Sin asientos registrados en este libro RACI.
                </td>
              </tr>
            ) : (
              rowsWithCalculations.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ borderRight: '1px solid #e2e8f0' }}>{r.fecha}</td>
                  <td style={{ borderRight: '1px solid #e2e8f0', fontFamily: 'monospace' }}>{r.expediente_no || '-'}</td>
                  <td style={{ borderRight: '1px solid #e2e8f0', fontWeight: 500 }}>{r.concepto}</td>
                  <td style={{ borderRight: '1px solid #e2e8f0', fontSize: '0.68rem', lineHeight: 1.2 }}>
                    <div>C: {r.proveedor_cuit || '-'}</div>
                    <div>F: {r.factura_cae || '-'}</div>
                  </td>
                  
                  {/* Compromiso values */}
                  <td style={{ borderRight: '1px solid #e2e8f0' }}>{r.compromiso_legal || '-'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--warning)', fontWeight: 600 }}>
                    {r.compromiso_monto > 0 ? `$ ${r.compromiso_monto.toFixed(2)}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#fffdf5', fontWeight: 700 }}>
                    $ {r.compromiso_acum.toFixed(2)}
                  </td>
                  
                  {/* Devengado values */}
                  <td style={{ borderRight: '1px solid #e2e8f0' }}>{r.devengado_prov || '-'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--primary)', fontWeight: 600 }}>
                    {r.devengado_monto > 0 ? `$ ${r.devengado_monto.toFixed(2)}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', background: '#f5f9ff', fontWeight: 700 }}>
                    $ {r.devengado_acum.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#eff6ff', fontWeight: 700, color: 'var(--primary-hover)' }}>
                    $ {r.devengado_saldo.toFixed(2)}
                  </td>
                  
                  {/* Pago values */}
                  <td style={{ borderRight: '1px solid #e2e8f0' }}>{r.pago_orden || '-'}</td>
                  <td style={{ borderRight: '1px solid #e2e8f0' }}>{r.pago_cheque || '-'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                    {r.pago_monto > 0 ? `$ ${r.pago_monto.toFixed(2)}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', background: '#f6fdf9', fontWeight: 700 }}>
                    $ {r.pago_acum.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#ecfdf5', fontWeight: 700, color: 'var(--success)' }}>
                    $ {r.pago_saldo.toFixed(2)}
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

      <div style={{ marginTop: '16px', background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
        <span style={{ color: 'var(--warning)' }}>Total Compromiso: $ {cumCompromiso.toFixed(2)}</span>
        <span style={{ color: 'var(--primary)' }}>Total Devengado: $ {cumDevengado.toFixed(2)}</span>
        <span style={{ color: 'var(--success)' }}>Total Pagado: $ {cumPago.toFixed(2)}</span>
        <span style={{ color: 'var(--text-main)' }}>Saldo Devengado: $ {(cumCompromiso - cumDevengado).toFixed(2)}</span>
        <span style={{ color: 'var(--text-main)' }}>Saldo a Pagar: $ {(cumDevengado - cumPago).toFixed(2)}</span>
      </div>
    </div>
  );
}
