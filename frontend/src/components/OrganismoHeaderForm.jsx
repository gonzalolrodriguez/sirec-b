import React from 'react';

export default function OrganismoHeaderForm({ headerData, setHeaderData, organismos, user }) {
  const handleChange = (field, value) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
  };

  // Group organismos by tipo_organismo
  const ministerios = organismos.filter(o => o.tipo_organismo === 'ministerio');
  const municipios1a = organismos.filter(o => o.tipo_organismo === 'municipio_1a');
  const municipios2a = organismos.filter(o => o.tipo_organismo === 'municipio_2a');
  const municipios3a = organismos.filter(o => o.tipo_organismo === 'municipio_3a');
  const comisiones = organismos.filter(o => o.tipo_organismo === 'comision_fomento');

  return (
    <div className="gov-card">
      <div className="card-header">
        <div className="card-title">
          <span>🏛️</span> Paso 1: Identificación del Organismo Rindecuentista y Expediente
        </div>
        <span className="badge badge-formosa">Tribunal de Cuentas Formosa</span>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Seleccione la entidad gubernamental (Ministerio, Municipalidad o Comisión de Fomento) y el tipo de rendición.
      </p>

      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label>Organismo / Municipio / Comisión de Fomento</label>
          <select 
            className="form-control"
            value={headerData.id_organismo} 
            onChange={e => handleChange('id_organismo', e.target.value)}
            style={{ fontWeight: 600 }}
            disabled={!!(user && user.rol === 'organismo')}
          >
            {ministerios.length > 0 && (
              <optgroup label="── Ministerios Provinciales ──">
                {ministerios.map(org => (
                  <option key={org.id_organismo} value={org.id_organismo}>{org.nombre}</option>
                ))}
              </optgroup>
            )}

            {municipios1a.length > 0 && (
              <optgroup label="── Municipalidades 1.ª Categoría (2) ──">
                {municipios1a.map(org => (
                  <option key={org.id_organismo} value={org.id_organismo}>{org.nombre}</option>
                ))}
              </optgroup>
            )}

            {municipios2a.length > 0 && (
              <optgroup label="── Municipalidades 2.ª Categoría (7) ──">
                {municipios2a.map(org => (
                  <option key={org.id_organismo} value={org.id_organismo}>{org.nombre}</option>
                ))}
              </optgroup>
            )}

            {municipios3a.length > 0 && (
              <optgroup label="── Municipalidades 3.ª Categoría (18) ──">
                {municipios3a.map(org => (
                  <option key={org.id_organismo} value={org.id_organismo}>{org.nombre}</option>
                ))}
              </optgroup>
            )}

            {comisiones.length > 0 && (
              <optgroup label="── Comisiones de Fomento (10) ──">
                {comisiones.map(org => (
                  <option key={org.id_organismo} value={org.id_organismo}>{org.nombre}</option>
                ))}
              </optgroup>
            )}

            {/* Fallback si no está agrupado */}
            {ministerios.length === 0 && municipios1a.length === 0 && (
              organismos.map(org => (
                <option key={org.id_organismo} value={org.id_organismo}>{org.nombre}</option>
              ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label>Tipo de Rendición de Cuentas</label>
          <select 
            className="form-control"
            value={headerData.tipo_rendicion} 
            onChange={e => handleChange('tipo_rendicion', e.target.value)}
          >
            <option value="completa">Rendición Presupuestaria Completa (Todos los Libros)</option>
            <option value="personal">Gastos en Personal y Haberes (RACI Personal + Banco)</option>
            <option value="bienes_servicios">Adquisiciones y Servicios (RACI Consumo, Uso, Servicios)</option>
            <option value="fondos_especiales">Fondos Especiales y Coparticipación (RAI + Banco)</option>
          </select>
        </div>

        <div className="form-group">
          <label>N° de Expediente Electrónico</label>
          <input 
            type="text" 
            className="form-control font-mono"
            value={headerData.numero_expediente} 
            onChange={e => handleChange('numero_expediente', e.target.value)}
            placeholder="EXP-2026-FSA-0089"
          />
        </div>

        <div className="form-group">
          <label>CUIT del Responsable Autorizado</label>
          <input 
            type="text" 
            className="form-control"
            value={headerData.cuit_responsable} 
            onChange={e => handleChange('cuit_responsable', e.target.value)}
            placeholder="20301112229"
          />
        </div>

        <div className="form-group">
          <label>Ejercicio Fiscal</label>
          <input 
            type="number" 
            className="form-control"
            value={headerData.ejercicio_fiscal} 
            onChange={e => handleChange('ejercicio_fiscal', parseInt(e.target.value) || 2026)}
          />
        </div>

        <div className="form-group">
          <label>Mes / Período Rendido</label>
          <select 
            className="form-control"
            value={headerData.mes_periodo} 
            onChange={e => handleChange('mes_periodo', parseInt(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Mes {i + 1} - {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][i]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
