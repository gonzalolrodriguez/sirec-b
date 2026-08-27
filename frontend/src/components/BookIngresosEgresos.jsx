import React, { useState } from 'react';

export default function BookIngresosEgresos({ ieRows, setIeRows }) {
  const [newRow, setNewRow] = useState({
    fecha: '2026-03-02',
    concepto: '',
    cheque_no: '',
    comprobante: '',
    caja_debe: '',
    caja_haber: '',
    banco_debe: '',
    banco_haber: '',
    egreso_inciso: '',
    egreso_monto: '',
    ingreso_tipo: '',
    ingreso_monto: '',
    cuentas_varias_concepto: '',
    cuentas_varias_debe: '',
    cuentas_varias_haber: ''
  });

  const handleAddRow = (e) => {
    e.preventDefault();
    if (!newRow.concepto) return;

    setIeRows(prev => [
      ...prev,
      {
        fecha: newRow.fecha,
        concepto: newRow.concepto,
        cheque_no: newRow.cheque_no,
        comprobante: newRow.comprobante,
        caja_debe: parseFloat(newRow.caja_debe) || 0,
        caja_haber: parseFloat(newRow.caja_haber) || 0,
        banco_debe: parseFloat(newRow.banco_debe) || 0,
        banco_haber: parseFloat(newRow.banco_haber) || 0,
        egreso_inciso: newRow.egreso_inciso,
        egreso_monto: parseFloat(newRow.egreso_monto) || 0,
        ingreso_tipo: newRow.ingreso_tipo,
        ingreso_monto: parseFloat(newRow.ingreso_monto) || 0,
        cuentas_varias_concepto: newRow.cuentas_varias_concepto,
        cuentas_varias_debe: parseFloat(newRow.cuentas_varias_debe) || 0,
        cuentas_varias_haber: parseFloat(newRow.cuentas_varias_haber) || 0
      }
    ]);

    setNewRow({
      fecha: newRow.fecha,
      concepto: '',
      cheque_no: '',
      comprobante: '',
      caja_debe: '',
      caja_haber: '',
      banco_debe: '',
      banco_haber: '',
      egreso_inciso: '',
      egreso_monto: '',
      ingreso_tipo: '',
      ingreso_monto: '',
      cuentas_varias_concepto: '',
      cuentas_varias_debe: '',
      cuentas_varias_haber: ''
    });
  };

  const handleDelete = (index) => {
    setIeRows(prev => prev.filter((_, i) => i !== index));
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
        if (cols.length >= 15) {
          data.push({
            fecha: cols[0].trim(),
            concepto: cols[1].trim(),
            cheque_no: cols[2].trim(),
            comprobante: cols[3].trim(),
            caja_debe: parseFloat(cols[4].trim()) || 0,
            caja_haber: parseFloat(cols[5].trim()) || 0,
            banco_debe: parseFloat(cols[6].trim()) || 0,
            banco_haber: parseFloat(cols[7].trim()) || 0,
            egreso_inciso: cols[8].trim(),
            egreso_monto: parseFloat(cols[9].trim()) || 0,
            ingreso_tipo: cols[10].trim(),
            ingreso_monto: parseFloat(cols[11].trim()) || 0,
            cuentas_varias_concepto: cols[12].trim(),
            cuentas_varias_debe: parseFloat(cols[13].trim()) || 0,
            cuentas_varias_haber: parseFloat(cols[14].trim()) || 0
          });
        } else if (cols.length >= 5) {
          // Fallback layout mapping
          const tipo = cols[1].trim().toLowerCase();
          const monto = parseFloat(cols[2].trim()) || 0;
          const inciso = cols[3].trim();
          const detalle = cols[4].trim();
          
          data.push({
            fecha: cols[0].trim(),
            concepto: detalle,
            cheque_no: '',
            comprobante: '',
            caja_debe: tipo === 'ingreso' ? monto : 0,
            caja_haber: tipo === 'egreso' ? monto : 0,
            banco_debe: 0,
            banco_haber: 0,
            egreso_inciso: tipo === 'egreso' ? inciso : '',
            egreso_monto: tipo === 'egreso' ? monto : 0,
            ingreso_tipo: tipo === 'ingreso' ? 'municipal' : '',
            ingreso_monto: tipo === 'ingreso' ? monto : 0,
            cuentas_varias_concepto: '',
            cuentas_varias_debe: 0,
            cuentas_varias_haber: 0
          });
        }
      }
      if (data.length > 0) setIeRows(data);
    };
    reader.readAsText(file);
  };

  // running balance
  let runningCaja = 0;
  let runningBanco = 0;
  const rowsWithSaldos = ieRows.map(r => {
    const c_debe = parseFloat(r.caja_debe) || 0;
    const c_haber = parseFloat(r.caja_haber) || 0;
    const b_debe = parseFloat(r.banco_debe) || 0;
    const b_haber = parseFloat(r.banco_haber) || 0;
    runningCaja += c_debe - c_haber;
    runningBanco += b_debe - b_haber;
    return {
      ...r,
      caja_saldo: runningCaja,
      banco_saldo: runningBanco
    };
  });

  const totalCajaDebe = ieRows.reduce((acc, r) => acc + (parseFloat(r.caja_debe) || 0), 0);
  const totalCajaHaber = ieRows.reduce((acc, r) => acc + (parseFloat(r.caja_haber) || 0), 0);
  const totalBancoDebe = ieRows.reduce((acc, r) => acc + (parseFloat(r.banco_debe) || 0), 0);
  const totalBancoHaber = ieRows.reduce((acc, r) => acc + (parseFloat(r.banco_haber) || 0), 0);
  
  const totalEgresoInc1 = ieRows.filter(r => r.egreso_inciso === 'Inciso 1 - Gastos en Personal').reduce((acc, r) => acc + (r.egreso_monto || 0), 0);
  const totalEgresoInc2 = ieRows.filter(r => r.egreso_inciso === 'Inciso 2 - Bienes de Consumo').reduce((acc, r) => acc + (r.egreso_monto || 0), 0);
  const totalEgresoInc3 = ieRows.filter(r => r.egreso_inciso === 'Inciso 3 - Servicios No Personales').reduce((acc, r) => acc + (r.egreso_monto || 0), 0);
  const totalEgresoInc4 = ieRows.filter(r => r.egreso_inciso === 'Inciso 4 - Bienes de Uso').reduce((acc, r) => acc + (r.egreso_monto || 0), 0);
  const totalEgresoInc5 = ieRows.filter(r => r.egreso_inciso === 'Inciso 5 - Transferencias').reduce((acc, r) => acc + (r.egreso_monto || 0), 0);

  const totalIngresoMunicipal = ieRows.filter(r => r.ingreso_tipo === 'municipal').reduce((acc, r) => acc + (r.ingreso_monto || 0), 0);
  const totalIngresoOtras = ieRows.filter(r => r.ingreso_tipo === 'otras').reduce((acc, r) => acc + (r.ingreso_monto || 0), 0);

  return (
    <div style={{ background: '#fafafa', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>📊 Libro de Ingresos y Egresos (Tribunal de Cuentas)</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estructura oficial compatible con <code>Ingresos-Egresos-2026.xlsx</code></span>
        </div>
        <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          📥 Subir Excel / CSV (Ingresos-Egresos)
          <input type="file" accept=".csv,.xls,.xlsx" onChange={handleCSV} style={{ display: 'none' }} />
        </label>
      </div>

      <form onSubmit={handleAddRow} style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #cbd5e1' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--gov-blue)', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>Cargar Nuevo Registro</h4>
        
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
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Concepto / Detalle</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Ej: Saldo Inicial / Adquisición Insumos"
              value={newRow.concepto}
              onChange={e => setNewRow({ ...newRow, concepto: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Cheque N°</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Opcional"
              value={newRow.cheque_no}
              onChange={e => setNewRow({ ...newRow, cheque_no: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Comprobante</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Opcional"
              value={newRow.comprobante}
              onChange={e => setNewRow({ ...newRow, comprobante: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Caja y Banco */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--success)' }}>Caja Debe (Ingreso)</label>
            <input 
              type="number" 
              step="0.01"
              className="form-control"
              placeholder="0.00"
              value={newRow.caja_debe}
              onChange={e => setNewRow({ ...newRow, caja_debe: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--danger)' }}>Caja Haber (Egreso)</label>
            <input 
              type="number" 
              step="0.01"
              className="form-control"
              placeholder="0.00"
              value={newRow.caja_haber}
              onChange={e => setNewRow({ ...newRow, caja_haber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--success)' }}>Banco Debe (Ingreso)</label>
            <input 
              type="number" 
              step="0.01"
              className="form-control"
              placeholder="0.00"
              value={newRow.banco_debe}
              onChange={e => setNewRow({ ...newRow, banco_debe: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--danger)' }}>Banco Haber (Egreso)</label>
            <input 
              type="number" 
              step="0.01"
              className="form-control"
              placeholder="0.00"
              value={newRow.banco_haber}
              onChange={e => setNewRow({ ...newRow, banco_haber: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Imputación Presupuestaria e Ingresos / Cuentas Varias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>EGRESOS (Clasificación)</span>
            <div className="form-group" style={{ marginTop: '8px' }}>
              <select 
                className="form-control"
                value={newRow.egreso_inciso}
                onChange={e => setNewRow({ ...newRow, egreso_inciso: e.target.value })}
              >
                <option value="">-- Sin Inciso --</option>
                <option value="Inciso 1 - Gastos en Personal">Inciso 1 - Personal</option>
                <option value="Inciso 2 - Bienes de Consumo">Inciso 2 - Bienes Consumo</option>
                <option value="Inciso 3 - Servicios No Personales">Inciso 3 - Servicios</option>
                <option value="Inciso 4 - Bienes de Uso">Inciso 4 - Bienes Uso</option>
                <option value="Inciso 5 - Transferencias">Inciso 5 - Transferencias</option>
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '4px' }}>
              <input 
                type="number" 
                step="0.01"
                className="form-control"
                placeholder="Monto Egreso"
                value={newRow.egreso_monto}
                onChange={e => setNewRow({ ...newRow, egreso_monto: e.target.value })}
              />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>INGRESOS (Origen)</span>
            <div className="form-group" style={{ marginTop: '8px' }}>
              <select 
                className="form-control"
                value={newRow.ingreso_tipo}
                onChange={e => setNewRow({ ...newRow, ingreso_tipo: e.target.value })}
              >
                <option value="">-- Sin Ingreso Presupuestario --</option>
                <option value="municipal">Jurisdicción Municipal</option>
                <option value="otras">Otras Jurisdicciones</option>
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '4px' }}>
              <input 
                type="number" 
                step="0.01"
                className="form-control"
                placeholder="Monto Ingreso"
                value={newRow.ingreso_monto}
                onChange={e => setNewRow({ ...newRow, ingreso_monto: e.target.value })}
              />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUENTAS VARIAS</span>
            <div className="form-group" style={{ marginTop: '8px' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="Concepto Cuenta Varia"
                value={newRow.cuentas_varias_concepto}
                onChange={e => setNewRow({ ...newRow, cuentas_varias_concepto: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
              <input 
                type="number" 
                step="0.01"
                className="form-control"
                placeholder="Debe"
                value={newRow.cuentas_varias_debe}
                onChange={e => setNewRow({ ...newRow, cuentas_varias_debe: e.target.value })}
              />
              <input 
                type="number" 
                step="0.01"
                className="form-control"
                placeholder="Haber"
                value={newRow.cuentas_varias_haber}
                onChange={e => setNewRow({ ...newRow, cuentas_varias_haber: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            ➕ Registrar Operación
          </button>
        </div>
      </form>

      {/* Grid view matches the double-header of Excel */}
      <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
        <table className="gov-table" style={{ fontSize: '0.75rem', minWidth: '1500px' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc' }}>
            <tr style={{ background: '#e2e8f0' }}>
              <th rowSpan="2" style={{ width: '40px', verticalAlign: 'middle', borderRight: '1px solid #cbd5e1' }}>#</th>
              <th rowSpan="2" style={{ width: '90px', verticalAlign: 'middle', borderRight: '1px solid #cbd5e1' }}>Fecha</th>
              <th rowSpan="2" style={{ width: '220px', verticalAlign: 'middle', borderRight: '1px solid #cbd5e1' }}>Concepto</th>
              <th rowSpan="2" style={{ width: '80px', verticalAlign: 'middle', borderRight: '1px solid #cbd5e1' }}>Cheque N°</th>
              <th rowSpan="2" style={{ width: '85px', verticalAlign: 'middle', borderRight: '1px solid #cbd5e1' }}>Comprob.</th>
              
              <th colSpan="3" style={{ textAlign: 'center', background: '#ecfdf5', borderRight: '1px solid #cbd5e1' }}>CAJA</th>
              <th colSpan="3" style={{ textAlign: 'center', background: '#eff6ff', borderRight: '1px solid #cbd5e1' }}>BANCO</th>
              
              <th colSpan="5" style={{ textAlign: 'center', background: '#fffbeb', borderRight: '1px solid #cbd5e1' }}>EGRESOS (INCISOS)</th>
              <th colSpan="2" style={{ textAlign: 'center', background: '#fef2f2', borderRight: '1px solid #cbd5e1' }}>INGRESOS</th>
              
              <th colSpan="3" style={{ textAlign: 'center', background: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>CUENTAS VARIAS</th>
              
              <th rowSpan="2" style={{ width: '70px', verticalAlign: 'middle', textAlign: 'center' }}>Acción</th>
            </tr>
            <tr style={{ background: '#cbd5e1' }}>
              {/* Caja subheaders */}
              <th style={{ background: '#d1fae5', textAlign: 'right' }}>Debe</th>
              <th style={{ background: '#d1fae5', textAlign: 'right' }}>Haber</th>
              <th style={{ background: '#a7f3d0', textAlign: 'right', borderRight: '1px solid #94a3b8' }}>Saldo</th>
              {/* Banco subheaders */}
              <th style={{ background: '#dbeafe', textAlign: 'right' }}>Debe</th>
              <th style={{ background: '#dbeafe', textAlign: 'right' }}>Haber</th>
              <th style={{ background: '#bfdbfe', textAlign: 'right', borderRight: '1px solid #94a3b8' }}>Saldo</th>
              {/* Egresos subheaders */}
              <th style={{ background: '#fef3c7', textAlign: 'right' }}>Inc. 1</th>
              <th style={{ background: '#fef3c7', textAlign: 'right' }}>Inc. 2</th>
              <th style={{ background: '#fef3c7', textAlign: 'right' }}>Inc. 3</th>
              <th style={{ background: '#fef3c7', textAlign: 'right' }}>Inc. 4</th>
              <th style={{ background: '#fef3c7', textAlign: 'right', borderRight: '1px solid #94a3b8' }}>Inc. 5</th>
              {/* Ingresos subheaders */}
              <th style={{ background: '#fee2e2', textAlign: 'right' }}>Municipal</th>
              <th style={{ background: '#fee2e2', textAlign: 'right', borderRight: '1px solid #94a3b8' }}>Otras Juris.</th>
              {/* Cuentas varias subheaders */}
              <th style={{ background: '#f1f5f9', textAlign: 'left' }}>Concepto</th>
              <th style={{ background: '#f1f5f9', textAlign: 'right' }}>Debe</th>
              <th style={{ background: '#f1f5f9', textAlign: 'right', borderRight: '1px solid #94a3b8' }}>Haber</th>
            </tr>
          </thead>
          <tbody>
            {rowsWithSaldos.length === 0 ? (
              <tr>
                <td colSpan="22" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px' }}>
                  Sin registros contables cargados en el Libro de Ingresos y Egresos.
                </td>
              </tr>
            ) : (
              rowsWithSaldos.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ borderRight: '1px solid #e2e8f0' }}>{r.fecha}</td>
                  <td style={{ borderRight: '1px solid #e2e8f0', fontWeight: 500, color: 'var(--text-main)' }}>{r.concepto}</td>
                  <td style={{ borderRight: '1px solid #e2e8f0' }}>{r.cheque_no || '-'}</td>
                  <td style={{ borderRight: '1px solid #e2e8f0' }}>{r.comprobante || '-'}</td>
                  
                  {/* Caja values */}
                  <td style={{ textAlign: 'right', color: 'var(--success)' }}>{r.caja_debe > 0 ? `$ ${r.caja_debe.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{r.caja_haber > 0 ? `$ ${r.caja_haber.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right', borderRight: '1px solid #cbd5e1', fontWeight: 700, background: '#f0fdf4' }}>
                    $ {r.caja_saldo.toFixed(2)}
                  </td>
                  
                  {/* Banco values */}
                  <td style={{ textAlign: 'right', color: 'var(--success)' }}>{r.banco_debe > 0 ? `$ ${r.banco_debe.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{r.banco_haber > 0 ? `$ ${r.banco_haber.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right', borderRight: '1px solid #cbd5e1', fontWeight: 700, background: '#f0f9ff' }}>
                    $ {r.banco_saldo.toFixed(2)}
                  </td>
                  
                  {/* Egresos (Incisos) values */}
                  <td style={{ textAlign: 'right' }}>{r.egreso_inciso === 'Inciso 1 - Gastos en Personal' && r.egreso_monto > 0 ? `$ ${r.egreso_monto.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right' }}>{r.egreso_inciso === 'Inciso 2 - Bienes de Consumo' && r.egreso_monto > 0 ? `$ ${r.egreso_monto.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right' }}>{r.egreso_inciso === 'Inciso 3 - Servicios No Personales' && r.egreso_monto > 0 ? `$ ${r.egreso_monto.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right' }}>{r.egreso_inciso === 'Inciso 4 - Bienes de Uso' && r.egreso_monto > 0 ? `$ ${r.egreso_monto.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                    {r.egreso_inciso === 'Inciso 5 - Transferencias' && r.egreso_monto > 0 ? `$ ${r.egreso_monto.toFixed(2)}` : '-'}
                  </td>
                  
                  {/* Ingresos values */}
                  <td style={{ textAlign: 'right' }}>{r.ingreso_tipo === 'municipal' && r.ingreso_monto > 0 ? `$ ${r.ingreso_monto.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                    {r.ingreso_tipo === 'otras' && r.ingreso_monto > 0 ? `$ ${r.ingreso_monto.toFixed(2)}` : '-'}
                  </td>
                  
                  {/* Cuentas varias values */}
                  <td style={{ textAlign: 'left' }}>{r.cuentas_varias_concepto || '-'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--success)' }}>{r.cuentas_varias_debe > 0 ? `$ ${r.cuentas_varias_debe.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)', borderRight: '1px solid #cbd5e1' }}>
                    {r.cuentas_varias_haber > 0 ? `$ ${r.cuentas_varias_haber.toFixed(2)}` : '-'}
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

      {/* Totals panel */}
      <div style={{ marginTop: '16px', background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gov-blue)', marginBottom: '8px' }}>Resumen General de Saldos</h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
          <div>
            <strong>Total Caja:</strong> Debe: <span style={{ color: 'var(--success)' }}>${totalCajaDebe.toFixed(2)}</span> | Haber: <span style={{ color: 'var(--danger)' }}>${totalCajaHaber.toFixed(2)}</span>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>Saldo Caja: ${runningCaja.toFixed(2)}</div>
          </div>
          <div>
            <strong>Total Banco:</strong> Debe: <span style={{ color: 'var(--success)' }}>${totalBancoDebe.toFixed(2)}</span> | Haber: <span style={{ color: 'var(--danger)' }}>${totalBancoHaber.toFixed(2)}</span>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>Saldo Banco: ${runningBanco.toFixed(2)}</div>
          </div>
          <div>
            <strong>Total Egresos (Incisos):</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Inc 1: ${totalEgresoInc1.toFixed(2)} | Inc 2: ${totalEgresoInc2.toFixed(2)} | Inc 3: ${totalEgresoInc3.toFixed(2)} | Inc 4: ${totalEgresoInc4.toFixed(2)} | Inc 5: ${totalEgresoInc5.toFixed(2)}
            </div>
          </div>
          <div>
            <strong>Total Ingresos:</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Muni: ${totalIngresoMunicipal.toFixed(2)} | Otras: ${totalIngresoOtras.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

