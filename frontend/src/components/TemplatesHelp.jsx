import React from 'react';

export default function TemplatesHelp() {
  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-title">
          <span>📚</span> Manual de Estructura y Descarga de Plantillas Excel Oficiales — TdC Formosa
        </div>
        <span className="badge badge-formosa">Normativa SIREC-B II</span>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Descargue las plantillas oficiales en formato Microsoft Excel (XLS / XLSX) formateadas según los requisitos del Tribunal de Cuentas de Formosa. 
        Asegúrese de respetar los encabezados de columna y las fórmulas incluidas.
      </p>

      <div className="form-grid" style={{ marginBottom: '24px' }}>
        {/* RAI Template */}
        <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#34d399', marginBottom: '8px' }}>💧 Plantilla Libro RAI</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Formato oficial: <strong>RAI 1.xls</strong><br />
              Contiene la estructura de ingresos diarios, mensuales, acumulados y control de saldos del presupuesto autorizado.
            </p>
          </div>
          <a href="/RAI 1.xls" download className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontSize: '0.82rem', textDecoration: 'none', gap: '8px' }}>
            ⬇️ Descargar RAI 1.xls
          </a>
        </div>

        {/* RACI Templates */}
        <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#60a5fa', marginBottom: '8px' }}>📦 Plantillas Libro RACI</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Registros analíticos de compromisos, devengados y pagos ordenados por categoría de gasto.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <a href="/RACI-2026 Bs Consumo.xls" download className="btn btn-secondary" style={{ fontSize: '0.75rem', textDecoration: 'none', padding: '6px', textAlign: 'center' }}>
              Consumo.xls
            </a>
            <a href="/RACI-2026 Bs Uso.xls" download className="btn btn-secondary" style={{ fontSize: '0.75rem', textDecoration: 'none', padding: '6px', textAlign: 'center' }}>
              Uso.xls
            </a>
            <a href="/RACI-2026 Personal.xls" download className="btn btn-secondary" style={{ fontSize: '0.75rem', textDecoration: 'none', padding: '6px', textAlign: 'center' }}>
              Personal.xls
            </a>
            <a href="/RACI-2026 Servicios.xls" download className="btn btn-secondary" style={{ fontSize: '0.75rem', textDecoration: 'none', padding: '6px', textAlign: 'center' }}>
              Servicios.xls
            </a>
          </div>
        </div>

        {/* Ingresos/Egresos Template */}
        <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#f59e0b', marginBottom: '8px' }}>📊 Plantilla Ingresos y Egresos</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Formato oficial: <strong>Ingresos-Egresos-2026.xlsx</strong><br />
              Contiene la conciliación por incisos de erogaciones y el control de flujos de caja y banco del ejercicio.
            </p>
          </div>
          <a href="/Ingresos-Egresos-2026.xlsx" download className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontSize: '0.82rem', textDecoration: 'none', gap: '8px' }}>
            ⬇️ Descargar Ingresos-Egresos.xlsx
          </a>
        </div>

        {/* Libro Banco Template */}
        <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#c084fc', marginBottom: '8px' }}>🏦 Plantilla Libro Banco</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Formato oficial: <strong>LIBRO Banco-2026.xls</strong><br />
              Diseñado para la conciliación de cheques, transferencias, depósitos y saldos acumulados de la cuenta corriente.
            </p>
          </div>
          <a href="/LIBRO Banco-2026.xls" download className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontSize: '0.82rem', textDecoration: 'none', gap: '8px' }}>
            ⬇️ Descargar LIBRO Banco.xls
          </a>
        </div>
      </div>

      <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
        <h4 style={{ fontSize: '0.9rem', color: '#c084fc', marginBottom: '6px' }}>🔐 Requisitos de Seguridad Criptográfica y Firma BFA</h4>
        <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>Todos los registros son empaquetados y firmados mediante un Hash SHA-256 generado en el navegador del Organismo.</li>
          <li>Los documentos PDF adjuntos son almacenados en IPFS para asegurar su disponibilidad descentralizada.</li>
          <li>El recibo de estampa de tiempo es otorgado por el Nodo <strong>ARSAT-FORMOSA-NODE-01</strong> dentro de la Blockchain Federal Argentina.</li>
        </ul>
      </div>
    </div>
  );
}
