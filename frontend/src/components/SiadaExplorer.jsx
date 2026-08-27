import React, { useState, useEffect } from 'react';

export default function SiadaExplorer() {
  const [expedientes, setExpedientes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [datasetJson, setDatasetJson] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpedientes();
  }, []);

  const fetchExpedientes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/siada/expedientes');
      const data = await res.json();
      if (data.data) {
        setExpedientes(data.data);
        if (data.data.length > 0) {
          fetchDataset(data.data[0].expediente_id || data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching SIADA expedientes:', err);
    }
  };

  const fetchDataset = async (id) => {
    setSelectedId(id);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/siada/expediente/${id}/dataset`);
      const data = await res.json();
      setDatasetJson(data);
    } catch (err) {
      console.error('Error fetching SIADA dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-title">
          <span>🧠</span> Interfaz de Exposición de Datos para SIADA (Machine Learning & Predictive Engine)
        </div>
        <span className="badge badge-siada">API REST `/api/v1/siada/*`</span>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Esta pestaña simula el punto de acceso donde el sistema <strong>SIADA</strong> realiza la extracción automatizada 
        de datos notarizados en la Blockchain Federal Argentina (BFA) para auditar inconsistencias y alimentar sus modelos predictivos.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Expedientes Notarizados Disponibles:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expedientes.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                No se encontraron expedientes. Realice una rendición en la pestaña principal.
              </div>
            ) : (
              expedientes.map((exp) => (
                <div
                  key={exp.expediente_id || exp.id}
                  onClick={() => fetchDataset(exp.expediente_id || exp.id)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedId === (exp.expediente_id || exp.id) ? 'var(--bg-input)' : 'rgba(255,255,255,0.03)',
                    border: selectedId === (exp.expediente_id || exp.id) ? '1px solid var(--primary)' : '1px solid var(--bg-card-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa' }} className="font-mono">
                    {exp.numero_expediente}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    {exp.organismo_nombre || exp.id_organismo}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#c084fc', marginTop: '4px' }} className="font-mono">
                    BFA: {exp.hash_bfa ? exp.hash_bfa.substring(0, 16) + '...' : 'Verificado'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Payload Estructurado para SIADA (ID #{selectedId}):
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#34d399' }}>
              {loading ? 'Cargando...' : '✓ Inmutable BFA'}
            </span>
          </div>

          {datasetJson ? (
            <pre className="json-viewer" style={{ maxHeight: '420px' }}>
              {JSON.stringify(datasetJson, null, 2)}
            </pre>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
              Seleccione un expediente para inspeccionar su estructura JSON para SIADA.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
