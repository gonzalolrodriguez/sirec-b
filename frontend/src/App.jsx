import React, { useState, useEffect } from 'react';
import OrganismoHeaderForm from './components/OrganismoHeaderForm';
import DynamicBookLoader from './components/DynamicBookLoader';
import PdfUploader from './components/PdfUploader';
import BfaPreviewModal from './components/BfaPreviewModal';
import SiadaExplorer from './components/SiadaExplorer';
import TemplatesHelp from './components/TemplatesHelp';

function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default function AppSirecB() {
  const [currentStep, setCurrentStep] = useLocalStorageState('sirec_step', 1);
  const [activeTab, setActiveTab] = useLocalStorageState('sirec_active_tab', 'rendicion');

  const [organismos, setOrganismos] = useState([
    { id_organismo: 'M-MIN-SALUD', nombre: 'Ministerio de Desarrollo Humano Formosa', tipo_organismo: 'ministerio', jurisdiccion: 'Provincial' },
    { id_organismo: 'MUN-CLORINDA', nombre: 'Municipalidad de Clorinda', tipo_organismo: 'municipio_1a', jurisdiccion: 'Municipal' },
    { id_organismo: 'MUN-FORMOSA', nombre: 'Municipalidad de Formosa Capital', tipo_organismo: 'municipio_1a', jurisdiccion: 'Municipal' },
    { id_organismo: 'COM-ELCOLORADO', nombre: 'Comisión de Fomento El Colorado', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' }
  ]);

  const [headerData, setHeaderData] = useLocalStorageState('sirec_header', {
    id_organismo: 'M-MIN-SALUD',
    cuit_responsable: '20301112229',
    tipo_rendicion: 'completa',
    numero_expediente: 'EXP-2026-FSA-0089',
    ejercicio_fiscal: 2026,
    mes_periodo: 3
  });

  // State for all 7 books matching libros tribunal
  const [raiRows, setRaiRows] = useLocalStorageState('sirec_rai', [
    { fecha: '2026-03-01', concepto: 'Fondos Coparticipables de Salud', monto: 3200000.00, comprobante_id: 'REC-90812' }
  ]);

  const [raciConsumoRows, setRaciConsumoRows] = useLocalStorageState('sirec_raci_consumo', [
    {
      tipo_raci: 'bienes_de_consumo',
      fecha: '2026-03-01',
      expediente_no: 'EXP-2026-0010',
      concepto: 'Adquisición de Resmas y Papelería',
      proveedor_cuit: '30708811229',
      factura_cae: '88912389102',
      compromiso_legal: 'Resolución DEM-102',
      compromiso_monto: 450000.00,
      devengado_prov: 'OP-4412',
      devengado_monto: 450000.00,
      pago_orden: 'OP-4412',
      pago_cheque: 'CHQ-90123',
      pago_monto: 450000.00
    }
  ]);

  const [raciUsoRows, setRaciUsoRows] = useLocalStorageState('sirec_raci_uso', [
    {
      tipo_raci: 'bienes_de_uso',
      fecha: '2026-03-01',
      expediente_no: 'EXP-2026-0011',
      concepto: 'Compra de Notebooks Administrativas',
      proveedor_cuit: '30708811229',
      factura_cae: '88912389103',
      compromiso_legal: 'Resolución DEM-103',
      compromiso_monto: 1100000.00,
      devengado_prov: 'OP-4413',
      devengado_monto: 1100000.00,
      pago_orden: 'OP-4413',
      pago_cheque: 'CHQ-90124',
      pago_monto: 1100000.00
    }
  ]);

  const [raciPersonalRows, setRaciPersonalRows] = useLocalStorageState('sirec_raci_personal', [
    {
      tipo_raci: 'personal',
      fecha: '2026-03-01',
      expediente_no: 'EXP-2026-0012',
      concepto: 'Haberes Personal Contratado',
      proveedor_cuit: '20301112229',
      factura_cae: 'PAY-89102',
      compromiso_legal: 'Resolución DEM-104',
      compromiso_monto: 2800000.00,
      devengado_prov: 'OP-4414',
      devengado_monto: 2800000.00,
      pago_orden: 'OP-4414',
      pago_cheque: 'TRF-88912',
      pago_monto: 2800000.00
    }
  ]);

  const [raciServiciosRows, setRaciServiciosRows] = useLocalStorageState('sirec_raci_servicios', [
    {
      tipo_raci: 'servicios',
      fecha: '2026-03-01',
      expediente_no: 'EXP-2026-0013',
      concepto: 'Servicio de Limpieza y Mantenimiento',
      proveedor_cuit: '30554433228',
      factura_cae: '77812399101',
      compromiso_legal: 'Contrato 88-FSA',
      compromiso_monto: 350000.00,
      devengado_prov: 'OP-4415',
      devengado_monto: 350000.00,
      pago_orden: 'OP-4415',
      pago_cheque: 'TRF-88913',
      pago_monto: 0
    }
  ]);

  const [ieRows, setIeRows] = useLocalStorageState('sirec_ie', [
    {
      fecha: '2026-03-02',
      concepto: 'Adquisición Insumos de Laboratorio',
      cheque_no: 'TRF-9921',
      comprobante: 'FAC-0001-00028',
      caja_debe: 0,
      caja_haber: 0,
      banco_debe: 0,
      banco_haber: 450000.00,
      egreso_inciso: 'Inciso 2 - Bienes de Consumo',
      egreso_monto: 450000.00,
      ingreso_tipo: '',
      ingreso_monto: 0,
      cuentas_varias_concepto: '',
      cuentas_varias_debe: 0,
      cuentas_varias_haber: 0
    }
  ]);

  const [bancoRows, setBancoRows] = useLocalStorageState('sirec_banco', [
    {
      fecha: '2026-03-04',
      cheque: 'TRF-11928',
      a_la_orden_de: 'Licitación Equipamiento Hospitalario',
      depositos: 0,
      retiro: 1100000.00
    }
  ]);

  const [pdfFiles, setPdfFiles] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [notarizationReceipt, setNotarizationReceipt] = useState(null);

  // Authentication State Variables
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [loginCuit, setLoginCuit] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regCuit, setRegCuit] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRol, setRegRol] = useState('organismo');
  const [regOrganismo, setRegOrganismo] = useState('M-MIN-SALUD');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Fetch session on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/v1/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
          if (data.user.rol === 'auditor') {
            setActiveTab('siada');
          } else {
            setHeaderData(prev => ({
              ...prev,
              cuit_responsable: data.user.cuit_cuil,
              id_organismo: data.user.id_organismo || prev.id_organismo
            }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuit_cuil: loginCuit, password: loginPassword }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setAuthSuccess('Sesión iniciada con éxito.');
        if (data.user.rol === 'auditor') {
          setActiveTab('siada');
        } else {
          setActiveTab('rendicion');
          setHeaderData(prev => ({
            ...prev,
            cuit_responsable: data.user.cuit_cuil,
            id_organismo: data.user.id_organismo || prev.id_organismo
          }));
        }
      } else {
        setAuthError(data.error || 'Credenciales inválidas.');
      }
    } catch (err) {
      setAuthError('Error de conexión con el servidor.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (regPassword !== regConfirmPassword) {
      setAuthError('Las contraseñas no coinciden.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuit_cuil: regCuit,
          email: regEmail,
          password: regPassword,
          rol: regRol,
          id_organismo: regRol === 'organismo' ? regOrganismo : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setAuthSuccess('Usuario registrado con éxito. Ya puede iniciar sesión.');
        setAuthMode('login');
        setLoginCuit(regCuit);
        // Reset fields
        setRegCuit('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
      } else {
        setAuthError(data.error || 'Error al registrar el usuario.');
      }
    } catch (err) {
      setAuthError('Error de conexión con el servidor.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    setAuthSuccess('');
    setAuthError('');
    setLoginPassword('');
  };

  // Fetch organismos catalog from backend
  useEffect(() => {
    fetch('http://localhost:5000/api/v1/organismos')
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) setOrganismos(data.data);
      })
      .catch(() => console.log('Utilizando catálogo local fallback de Organismos'));
  }, []);

  const submitRendicion = async () => {
    setLoading(true);

    const mappedIeRows = ieRows.map(r => {
      let tipo_movimiento = 'egreso';
      let monto = 0;
      let inciso = 'Otros';
      
      if (r.egreso_monto > 0) {
        tipo_movimiento = 'egreso';
        monto = r.egreso_monto;
        inciso = r.egreso_inciso || 'Otros';
      } else if (r.ingreso_monto > 0) {
        tipo_movimiento = 'ingreso';
        monto = r.ingreso_monto;
        inciso = r.ingreso_tipo === 'municipal' ? 'Jurisdicción Municipal' : 'Otras Jurisdicciones';
      } else if (r.caja_haber > 0 || r.banco_haber > 0 || r.cuentas_varias_haber > 0) {
        tipo_movimiento = 'egreso';
        monto = r.caja_haber || r.banco_haber || r.cuentas_varias_haber;
        inciso = 'Movimiento de Caja/Banco/Cuentas Varias';
      } else {
        tipo_movimiento = 'ingreso';
        monto = r.caja_debe || r.banco_debe || r.cuentas_varias_debe || 0;
        inciso = 'Movimiento de Caja/Banco/Cuentas Varias';
      }

      return {
        fecha: r.fecha || '2026-03-02',
        tipo_movimiento,
        monto,
        inciso,
        detalle: r.concepto || 'Sin detalle'
      };
    });

    const mappedBancoRows = bancoRows.map(r => {
      const isDeposit = (parseFloat(r.depositos) || 0) > 0;
      const monto = isDeposit ? parseFloat(r.depositos) : parseFloat(r.retiro);
      let tipo_operacion = 'transferencia';
      if (isDeposit) {
        tipo_operacion = 'deposito';
      } else if (r.cheque && (r.cheque.toLowerCase().includes('chq') || !isNaN(r.cheque))) {
        tipo_operacion = 'cheque';
      }
      return {
        fecha: r.fecha || '2026-03-04',
        tipo_operacion,
        numero_comprobante: r.cheque || 'S/N',
        monto: monto || 0,
        beneficiario: r.a_la_orden_de || 'Sin beneficiario'
      };
    });

    const mapRaciRows = (rows) => {
      const result = [];
      rows.forEach(r => {
        const common = {
          tipo_raci: r.tipo_raci,
          proveedor_cuit: r.proveedor_cuit || '30708811229',
          factura_cae: r.factura_cae || '88912389102'
        };
        
        if (parseFloat(r.compromiso_monto) > 0) {
          result.push({
            ...common,
            etapa: 'compromiso',
            monto: parseFloat(r.compromiso_monto)
          });
        }
        if (parseFloat(r.devengado_monto) > 0) {
          result.push({
            ...common,
            etapa: 'devengado',
            monto: parseFloat(r.devengado_monto)
          });
        }
        if (parseFloat(r.pago_monto) > 0) {
          result.push({
            ...common,
            etapa: 'pago',
            monto: parseFloat(r.pago_monto)
          });
        }

        if (!(parseFloat(r.compromiso_monto) > 0) && !(parseFloat(r.devengado_monto) > 0) && !(parseFloat(r.pago_monto) > 0)) {
          result.push({
            ...common,
            etapa: 'pago',
            monto: 0
          });
        }
      });
      return result;
    };

    const metadata = {
      ...headerData,
      libros: {
        rai: raiRows,
        raci: [
          ...mapRaciRows(raciConsumoRows),
          ...mapRaciRows(raciUsoRows),
          ...mapRaciRows(raciPersonalRows),
          ...mapRaciRows(raciServiciosRows)
        ],
        ingresos_egresos: mappedIeRows,
        libro_banco: mappedBancoRows
      }
    };

    const formData = new FormData();
    formData.append('metadata', JSON.stringify(metadata));
    for (let file of pdfFiles) {
      formData.append('archivos_pdf', file);
    }

    try {
      const res = await fetch('http://localhost:5000/api/v1/rendiciones/notarizar', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setNotarizationReceipt(data);
      } else {
        alert('Error en servidor: ' + (data.error || 'No se pudo procesar'));
      }
    } catch (err) {
      alert('Error de conexión con el backend SIREC-B II.');
    } finally {
      setLoading(false);
    }
  };

  const totalRegistros = raiRows.length + raciConsumoRows.length + raciUsoRows.length + raciPersonalRows.length + raciServiciosRows.length + ieRows.length + bancoRows.length;

  return (
    <div className="app-container">
      {/* Official Government Header */}
      <header className="gov-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="header-title-group">
          <h1>
            <span>🏛️</span> Tribunal de Cuentas de Formosa
          </h1>
          <p>SIREC-B II — Portal Oficial de Rendición de Cuentas para Organismos y Municipios</p>
        </div>
        {user && (
          <div style={{ textAlign: 'right', color: 'white', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '4px', fontSize: '0.82rem' }}>
            <span>👤 CUIT: <strong>{user.cuit_cuil}</strong> ({user.rol === 'auditor' ? 'Auditor' : 'Organismo'})</span>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '0.75rem', background: '#dc3545', color: 'white', border: 'none' }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </header>

      {/* Conditionally Render Authentication Screen if not logged in */}
      {!user ? (
        <div className="gov-card" style={{ maxWidth: '500px', margin: '40px auto', padding: '30px' }}>
          <div className="card-header" style={{ borderBottom: '2px solid var(--gov-blue)', paddingBottom: '12px', marginBottom: '20px' }}>
            <div className="card-title" style={{ fontSize: '1.25rem', color: 'var(--gov-blue)' }}>
              <span>🔒</span> {authMode === 'login' ? 'Acceso Seguro Portal SIREC-B II' : 'Registro de Nuevo Usuario Portal'}
            </div>
          </div>

          {authError && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', border: '1px solid #f5c6cb' }}>
              <strong>Error:</strong> {authError}
            </div>
          )}

          {authSuccess && (
            <div style={{ background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', border: '1px solid #c3e6cb' }}>
              {authSuccess}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 'bold' }}>CUIT / CUIL (sin guiones)</label>
                <input 
                  type="text" 
                  value={loginCuit} 
                  onChange={(e) => setLoginCuit(e.target.value.replace(/\D/g,''))} 
                  placeholder="Ej. 20301112229" 
                  maxLength={11}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 'bold' }}>Contraseña</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  placeholder="••••••••••••"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 'bold' }}
              >
                🔑 Ingresar al Portal
              </button>

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
                ¿No tiene usuario registrado?{' '}
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
                  style={{ border: 'none', background: 'none', color: 'var(--gov-blue)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  Registrarse aquí
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 'bold' }}>CUIT / CUIL (11 dígitos)</label>
                <input 
                  type="text" 
                  value={regCuit} 
                  onChange={(e) => setRegCuit(e.target.value.replace(/\D/g,''))} 
                  placeholder="Ej. 20301112229" 
                  maxLength={11}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 'bold' }}>Correo Electrónico Oficial</label>
                <input 
                  type="email" 
                  value={regEmail} 
                  onChange={(e) => setRegEmail(e.target.value)} 
                  placeholder="organismo@formosa.gob.ar" 
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 'bold' }}>Rol en el Sistema</label>
                <select 
                  value={regRol} 
                  onChange={(e) => setRegRol(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                >
                  <option value="organismo">Organismo (Rendición de Cuentas)</option>
                  <option value="auditor">Auditor (Tribunal de Cuentas)</option>
                </select>
              </div>

              {regRol === 'organismo' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 'bold' }}>Organismo Asignado</label>
                  <select 
                    value={regOrganismo} 
                    onChange={(e) => setRegOrganismo(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  >
                    {organismos.map(org => (
                      <option key={org.id_organismo} value={org.id_organismo}>
                        {org.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 'bold' }}>Contraseña (mínimo 12 caracteres, mayúsculas, minúsculas, números y símbolos)</label>
                <input 
                  type="password" 
                  value={regPassword} 
                  onChange={(e) => setRegPassword(e.target.value)} 
                  placeholder="••••••••••••"
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 'bold' }}>Confirmar Contraseña</label>
                <input 
                  type="password" 
                  value={regConfirmPassword} 
                  onChange={(e) => setRegConfirmPassword(e.target.value)} 
                  placeholder="••••••••••••"
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-success" 
                style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 'bold' }}
              >
                📝 Registrarse
              </button>

              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
                ¿Ya posee una cuenta?{' '}
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                  style={{ border: 'none', background: 'none', color: 'var(--gov-blue)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <>
          {/* Premium Navbar */}
          <nav className="gov-navbar">
            {user.rol === 'organismo' && (
              <>
                <button 
                  onClick={() => setActiveTab('rendicion')} 
                  className={`gov-nav-link ${activeTab === 'rendicion' ? 'active' : ''}`}
                >
                  📂 Rendición de Cuentas
                </button>
                <button 
                  onClick={() => setActiveTab('plantillas')} 
                  className={`gov-nav-link ${activeTab === 'plantillas' ? 'active' : ''}`}
                >
                  📥 Plantillas Excel Oficiales
                </button>
              </>
            )}
            <button 
              onClick={() => setActiveTab('siada')} 
              className={`gov-nav-link ${activeTab === 'siada' ? 'active' : ''}`}
            >
              🔍 Auditoría SIADA API
            </button>
          </nav>

          {/* View Rendering */}
          {activeTab === 'siada' && (
            <div style={{ marginBottom: '24px' }}>
              {user.rol === 'organismo' && (
                <div style={{ marginBottom: '12px' }}>
                  <button onClick={() => setActiveTab('rendicion')} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                    ⬅️ Volver al Asistente de Rendición
                  </button>
                </div>
              )}
              <SiadaExplorer />
            </div>
          )}

          {activeTab === 'plantillas' && user.rol === 'organismo' && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px' }}>
                <button onClick={() => setActiveTab('rendicion')} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                  ⬅️ Volver al Asistente de Rendición
                </button>
              </div>
              <TemplatesHelp />
            </div>
          )}

          {/* Step Tracker Wizard */}
          {activeTab === 'rendicion' && user.rol === 'organismo' && (
            <>
              <div className="wizard-tracker">
                <div 
                  className={`wizard-step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(1)}
                >
                  <div className="wizard-step-number">{currentStep > 1 ? '✓' : '1'}</div>
                  <div className="wizard-step-title">Identificación</div>
                </div>

                <div 
                  className={`wizard-step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(2)}
                >
                  <div className="wizard-step-number">{currentStep > 2 ? '✓' : '2'}</div>
                  <div className="wizard-step-title">Libros Contables</div>
                </div>

                <div 
                  className={`wizard-step ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(3)}
                >
                  <div className="wizard-step-number">{currentStep > 3 ? '✓' : '3'}</div>
                  <div className="wizard-step-title">Comprobantes PDF</div>
                </div>

                <div 
                  className={`wizard-step ${currentStep === 4 ? 'active' : ''}`}
                  onClick={() => setCurrentStep(4)}
                >
                  <div className="wizard-step-number">4</div>
                  <div className="wizard-step-title">Confirmar y Enviar</div>
                </div>
              </div>

              {/* STEP 1: IDENTIFICACIÓN */}
              {currentStep === 1 && (
                <>
                  <OrganismoHeaderForm 
                    headerData={headerData} 
                    setHeaderData={setHeaderData} 
                    organismos={organismos} 
                    user={user}
                  />
                  <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <button onClick={() => setCurrentStep(2)} className="btn btn-primary" style={{ padding: '12px 28px' }}>
                      Continuar al Paso 2: Libros Contables ➔
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2: LIBROS CONTABLES DINÁMICOS */}
              {currentStep === 2 && (
                <>
                  <DynamicBookLoader 
                    tipoRendicion={headerData.tipo_rendicion}
                    raiRows={raiRows} setRaiRows={setRaiRows}
                    raciConsumoRows={raciConsumoRows} setRaciConsumoRows={setRaciConsumoRows}
                    raciUsoRows={raciUsoRows} setRaciUsoRows={setRaciUsoRows}
                    raciPersonalRows={raciPersonalRows} setRaciPersonalRows={setRaciPersonalRows}
                    raciServiciosRows={raciServiciosRows} setRaciServiciosRows={setRaciServiciosRows}
                    ieRows={ieRows} setIeRows={setIeRows}
                    bancoRows={bancoRows} setBancoRows={setBancoRows}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
                      ⬅️ Volver a Paso 1
                    </button>
                    <button onClick={() => setCurrentStep(3)} className="btn btn-primary" style={{ padding: '12px 28px' }}>
                      Continuar al Paso 3: Comprobantes PDF ➔
                    </button>
                  </div>
                </>
              )}

              {/* STEP 3: COMPROBANTES PDF */}
              {currentStep === 3 && (
                <>
                  <PdfUploader pdfFiles={pdfFiles} setPdfFiles={setPdfFiles} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">
                      ⬅️ Volver a Paso 2
                    </button>
                    <button onClick={() => setCurrentStep(4)} className="btn btn-primary" style={{ padding: '12px 28px' }}>
                      Continuar al Paso 4: Confirmación ➔
                    </button>
                  </div>
                </>
              )}

              {/* STEP 4: CONFIRMACIÓN Y ENVÍO */}
              {currentStep === 4 && (
                <div className="gov-card">
                  <div className="card-header">
                    <div className="card-title">
                      <span>📋</span> Paso 4: Resumen de la Presentación
                    </div>
                    <span className="badge badge-formosa">Revisión Final</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--gov-blue)', marginBottom: '12px' }}>
                      Detalles del Expediente #{headerData.numero_expediente}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      <div><strong>Organismo:</strong> {headerData.id_organismo}</div>
                      <div><strong>CUIT Responsable:</strong> {headerData.cuit_responsable}</div>
                      <div><strong>Ejercicio / Período:</strong> {headerData.ejercicio_fiscal} - Mes {headerData.mes_periodo}</div>
                      <div><strong>Total Registros Cargados:</strong> {totalRegistros} filas contables</div>
                      <div><strong>Archivos PDF Adjuntos:</strong> {pdfFiles.length} documentos</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => setCurrentStep(3)} className="btn btn-secondary">
                      ⬅️ Modificar Datos
                    </button>
                    <button 
                      onClick={submitRendicion} 
                      disabled={loading}
                      className="btn btn-success" 
                      style={{ padding: '14px 32px', fontSize: '1.05rem' }}
                    >
                      {loading ? '⏳ Firmando y Notarizando...' : '🔒 Confirmar y Enviar Rendición al Tribunal'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <BfaPreviewModal 
        receipt={notarizationReceipt} 
        onClose={() => { setNotarizationReceipt(null); setCurrentStep(1); }} 
      />

      {/* Majestic Government Footer */}
      <footer className="gov-footer">
        <div className="footer-cols" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div className="footer-col">
            <h4>🏛️ Tribunal de Cuentas de Formosa</h4>
            <p style={{ fontSize: '0.78rem' }}>
              📍 Av. 25 de Mayo 1045, Formosa, Capital<br />
              📞 Tel: +54 (370) 443-6100<br />
              🕒 Horario: Lunes a Viernes 07:00 a 13:00 hs.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>🔗 Enlaces del Portal</h4>
            <ul className="footer-links">
              <li><button onClick={() => { if (user) { setActiveTab('rendicion'); } }} style={{ border: 'none', background: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>📂 Iniciar Rendición</button></li>
              <li><button onClick={() => { if (user) { setActiveTab('plantillas'); } }} style={{ border: 'none', background: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>📥 Descargar Plantillas XLS</button></li>
              <li><button onClick={() => { if (user) { setActiveTab('siada'); } }} style={{ border: 'none', background: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>🔍 Explorador SIADA</button></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 Tribunal de Cuentas de la Provincia de Formosa — Portal SIREC-B II. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

