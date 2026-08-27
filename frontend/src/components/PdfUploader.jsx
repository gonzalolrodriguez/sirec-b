import React from 'react';

export default function PdfUploader({ pdfFiles, setPdfFiles }) {
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setPdfFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemove = (index) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="gov-card">
      <div className="card-header">
        <div className="card-title">
          <span>📄</span> Paso 3: Documentación Digital de Respaldo (Archivos PDF)
        </div>
        <span className="badge badge-bfa">Almacenamiento Blockchain / IPFS</span>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Adjunte los extractos bancarios, facturas, decretos y planillas de sueldos escaneadas en formato PDF.
      </p>

      <div 
        style={{
          border: '2px dashed #94a3b8',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
          background: '#f8fafc',
          cursor: 'pointer'
        }}
        onClick={() => document.getElementById('pdf-input').click()}
      >
        <div style={{ fontSize: '2rem', marginBottom: '6px' }}>📑</div>
        <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>Haga clic aquí o arrastre sus documentos PDF</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Formatos aceptados: .pdf (Máximo 25MB por archivo)
        </p>
        <input 
          id="pdf-input" 
          type="file" 
          multiple 
          accept=".pdf" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
      </div>

      {pdfFiles.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Documentos PDF Adjuntos ({pdfFiles.length}):
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pdfFiles.map((file, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: '#ffffff', 
                  padding: '10px 14px', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #cbd5e1' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📕</span>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{file.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button onClick={() => handleRemove(idx)} className="btn-danger-sm">
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
