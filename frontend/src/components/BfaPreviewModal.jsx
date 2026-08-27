import React, { useState } from 'react';

export default function BfaPreviewModal({ receipt, onClose }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!receipt) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: '8px' }}>✅</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gov-blue)', margin: 0 }}>
            Rendición de Cuentas Notarizada Exitosamente
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            La presentación ha sido firmada digitalmente y notariada ante el Tribunal de Cuentas de Formosa.
          </p>
        </div>

        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>N° Expediente:</span>
              <strong className="font-mono" style={{ fontSize: '1rem', color: 'var(--gov-blue)' }}>Expediente #{receipt.expediente_id}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Estampa de Tiempo:</span>
              <strong>{new Date(receipt.bfa_receipt?.bfa_timestamp).toLocaleString('es-AR')}</strong>
            </div>
          </div>
        </div>

        {/* Collapsible Technical Details for IT/SIADA Audit */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            type="button" 
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontSize: '0.82rem', 
              fontWeight: 600, 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {showTechnicalDetails ? '▲ Ocultar Detalles Técnicos Blockchain BFA' : '▼ Ver Detalles Técnicos Blockchain BFA & IPFS (Para Auditoría IT)'}
          </button>

          {showTechnicalDetails && (
            <div style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hash Criptográfico SHA-256:</span>
                <div className="font-mono" style={{ fontSize: '0.78rem', wordBreak: 'break-all', color: 'var(--gov-blue)' }}>
                  {receipt.hash_sha256}
                </div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>IPFS CID:</span>
                <div className="font-mono" style={{ fontSize: '0.78rem', wordBreak: 'break-all', color: 'var(--success)' }}>
                  {receipt.cid_ipfs}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BFA Tx ID:</span>
                <div className="font-mono" style={{ fontSize: '0.78rem', wordBreak: 'break-all', color: 'var(--warning)' }}>
                  {receipt.bfa_receipt?.bfa_tx_id}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1rem' }}>
            Finalizar y Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
