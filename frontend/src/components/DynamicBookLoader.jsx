import React, { useState, useEffect } from 'react';
import BookRai from './BookRai';
import BookRaci from './BookRaci';
import BookIngresosEgresos from './BookIngresosEgresos';
import BookBanco from './BookBanco';

export default function DynamicBookLoader({ 
  tipoRendicion, 
  raiRows, setRaiRows,
  raciConsumoRows, setRaciConsumoRows,
  raciUsoRows, setRaciUsoRows,
  raciPersonalRows, setRaciPersonalRows,
  raciServiciosRows, setRaciServiciosRows,
  ieRows, setIeRows,
  bancoRows, setBancoRows
}) {
  // Determine active books based on tipoRendicion
  const getActiveBooks = () => {
    switch (tipoRendicion) {
      case 'personal':
        return ['RACI_PERSONAL', 'BANCO', 'INGRESOS_EGRESOS'];
      case 'bienes_servicios':
        return ['RACI_CONSUMO', 'RACI_USO', 'RACI_SERVICIOS', 'BANCO'];
      case 'fondos_especiales':
        return ['RAI', 'BANCO', 'INGRESOS_EGRESOS'];
      case 'completa':
      default:
        return ['RAI', 'RACI_CONSUMO', 'RACI_USO', 'RACI_PERSONAL', 'RACI_SERVICIOS', 'INGRESOS_EGRESOS', 'BANCO'];
    }
  };

  const activeBooks = getActiveBooks();
  const [currentBookTab, setCurrentBookTab] = useState(activeBooks[0] || 'RAI');

  // Ensure currentBookTab is valid when activeBooks changes
  useEffect(() => {
    if (!activeBooks.includes(currentBookTab)) {
      setCurrentBookTab(activeBooks[0] || 'RAI');
    }
  }, [tipoRendicion]);

  const bookLabels = {
    RAI: { name: '💧 Recaudación e Ingresos (RAI)', fileRef: 'RAI 1.xls' },
    RACI_CONSUMO: { name: '🍞 Bienes de Consumo (RACI)', fileRef: 'RACI-2026 Bs Consumo.xls' },
    RACI_USO: { name: '🚜 Bienes de Uso (RACI)', fileRef: 'RACI-2026 Bs Uso.xls' },
    RACI_PERSONAL: { name: '👥 Personal y Haberes (RACI)', fileRef: 'RACI-2026 Personal.xls' },
    RACI_SERVICIOS: { name: '🛠️ Servicios y Obras (RACI)', fileRef: 'RACI-2026 Servicios.xls' },
    INGRESOS_EGRESOS: { name: '📊 Ingresos y Egresos', fileRef: 'Ingresos-Egresos-2026.xlsx' },
    BANCO: { name: '🏦 Libro Banco', fileRef: 'LIBRO Banco-2026.xls' }
  };

  return (
    <div className="gov-card">
      <div className="card-header">
        <div className="card-title">
          <span>📚</span> Paso 2: Libros Contables Requeridos ({activeBooks.length} Libros)
        </div>
        <span className="badge badge-formosa">Normativa TdC Formosa</span>
      </div>

      {/* Select Dropdown for direct selection without scrolling */}
      <div style={{ marginBottom: '16px', background: '#eff6ff', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gov-blue)', display: 'block', marginBottom: '6px' }}>
          📖 Seleccione el Libro Contable a Cargar:
        </label>
        <select
          className="form-control"
          value={currentBookTab}
          onChange={(e) => setCurrentBookTab(e.target.value)}
          style={{ fontWeight: 700, color: 'var(--gov-blue)', fontSize: '0.95rem' }}
        >
          {activeBooks.map(bookKey => (
            <option key={bookKey} value={bookKey}>
              {bookLabels[bookKey]?.name || bookKey}
            </option>
          ))}
        </select>
      </div>

      {/* Wrapped Button Grid (Zero Horizontal Scrollbar) */}
      <div className="book-tabs">
        {activeBooks.map(bookKey => (
          <button
            key={bookKey}
            className={`book-tab-btn ${currentBookTab === bookKey ? 'active' : ''}`}
            onClick={() => setCurrentBookTab(bookKey)}
          >
            {bookLabels[bookKey]?.name || bookKey}
          </button>
        ))}
      </div>

      {/* Active Book View */}
      {currentBookTab === 'RAI' && (
        <BookRai raiRows={raiRows} setRaiRows={setRaiRows} />
      )}

      {currentBookTab === 'RACI_CONSUMO' && (
        <BookRaci 
          title="🍞 RACI — Bienes de Consumo e Insumos"
          fileRef="RACI-2026 Bs Consumo.xls"
          tipoDefault="bienes_de_consumo"
          raciRows={raciConsumoRows} 
          setRaciRows={setRaciConsumoRows} 
        />
      )}

      {currentBookTab === 'RACI_USO' && (
        <BookRaci 
          title="🚜 RACI — Bienes de Uso y Equipamiento"
          fileRef="RACI-2026 Bs Uso.xls"
          tipoDefault="bienes_de_uso"
          raciRows={raciUsoRows} 
          setRaciRows={setRaciUsoRows} 
        />
      )}

      {currentBookTab === 'RACI_PERSONAL' && (
        <BookRaci 
          title="👥 RACI — Gastos en Personal y Contratos"
          fileRef="RACI-2026 Personal.xls"
          tipoDefault="personal"
          raciRows={raciPersonalRows} 
          setRaciRows={setRaciPersonalRows} 
        />
      )}

      {currentBookTab === 'RACI_SERVICIOS' && (
        <BookRaci 
          title="🛠️ RACI — Servicios No Personales y Obras"
          fileRef="RACI-2026 Servicios.xls"
          tipoDefault="servicios"
          raciRows={raciServiciosRows} 
          setRaciRows={setRaciServiciosRows} 
        />
      )}

      {currentBookTab === 'INGRESOS_EGRESOS' && (
        <BookIngresosEgresos ieRows={ieRows} setIeRows={setIeRows} />
      )}

      {currentBookTab === 'BANCO' && (
        <BookBanco bancoRows={bancoRows} setBancoRows={setBancoRows} />
      )}
    </div>
  );
}
