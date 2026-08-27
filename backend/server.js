const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer');
const { Pool } = require('pg');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Configure CORS to support sending cookies/credentials
app.use(cors({
    origin: 'http://localhost:3000', // Allow React app port
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev')); // Agregado para ver las peticiones HTTP en la terminal

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'sirec_b_db',
    password: process.env.DB_PASSWORD || 'postgre',
    port: process.env.DB_PORT || 5432,
});

// Initialize database tables
async function initDb() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                cuit_cuil VARCHAR(11) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                rol VARCHAR(50) NOT NULL CHECK (rol IN ('organismo', 'auditor')),
                id_organismo VARCHAR(50),
                intentos_fallidos INTEGER DEFAULT 0,
                bloqueado_hasta TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Tabla de usuarios inicializada correctamente.');
    } catch (err) {
        console.warn('Advertencia en inicialización de DB (modo simulación activo):', err.message);
    }
}
initDb();

const upload = multer({ storage: multer.memoryStorage() });

// AUTH UTILITIES & MIDDLEWARES

// Mock in-memory DB for simulation fallback mode
const mockUsers = [];

// Validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CUIT_REGEX = /^\d{11}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{12,}$/;

// IP Rate limiter against Brute Force
const rateLimits = {};
function authRateLimiter(req, res, next) {
    const ip = req.ip;
    const now = Date.now();
    if (!rateLimits[ip]) {
        rateLimits[ip] = [];
    }
    rateLimits[ip] = rateLimits[ip].filter(t => now - t < 15 * 60 * 1000);
    if (rateLimits[ip].length >= 10) {
        return res.status(429).json({ success: false, error: 'Demasiados intentos desde esta IP. Inténtelo más tarde.' });
    }
    rateLimits[ip].push(now);
    next();
}

// Authentication check middleware
function authenticateToken(req, res, next) {
    let token = null;
    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
            const parts = c.split('=');
            if (parts.length >= 2) {
                acc[parts[0].trim()] = parts.slice(1).join('=').trim();
            }
            return acc;
        }, {});
        token = cookies['sirec_session'];
    }
    
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'Acceso denegado. No se proporcionó token de sesión.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sirec_b_super_secret_key_2026');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, error: 'Sesión expirada o token inválido.' });
    }
}

// AUTHENTICATION API ENDPOINTS

// 1. REGISTER
app.post('/api/v1/auth/register', authRateLimiter, async (req, res) => {
    const { cuit_cuil, email, password, rol, id_organismo } = req.body;

    // Validate inputs strictly
    if (!cuit_cuil || !email || !password || !rol) {
        return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios.' });
    }

    if (!CUIT_REGEX.test(cuit_cuil)) {
        return res.status(400).json({ success: false, error: 'El CUIT/CUIL debe tener exactamente 11 números.' });
    }

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ success: false, error: 'Formato de correo electrónico no válido.' });
    }

    if (!PWD_REGEX.test(password)) {
        return res.status(400).json({ 
            success: false, 
            error: 'La contraseña debe tener al menos 12 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&.).' 
        });
    }

    if (rol !== 'organismo' && rol !== 'auditor') {
        return res.status(400).json({ success: false, error: 'Rol no válido.' });
    }

    try {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        let userCreated = false;
        try {
            // Attempt persistent PostgreSQL insert
            await pool.query(
                `INSERT INTO usuarios (cuit_cuil, email, password_hash, rol, id_organismo)
                 VALUES ($1, $2, $3, $4, $5)`,
                [cuit_cuil, email, passwordHash, rol, rol === 'organismo' ? id_organismo : null]
            );
            userCreated = true;
        } catch (dbErr) {
            if (dbErr.code === '23505') {
                return res.status(409).json({ success: false, error: 'El CUIT/CUIL o Email ya se encuentra registrado.' });
            }
            console.warn('DB Fallback: creando usuario en memoria de simulación.');
            // Fallback mock DB checks
            const exists = mockUsers.find(u => u.cuit_cuil === cuit_cuil || u.email === email);
            if (exists) {
                return res.status(409).json({ success: false, error: 'El CUIT/CUIL o Email ya se encuentra registrado.' });
            }
            mockUsers.push({
                cuit_cuil,
                email,
                password_hash: passwordHash,
                rol,
                id_organismo: rol === 'organismo' ? id_organismo : null,
                intentos_fallidos: 0,
                bloqueado_hasta: null
            });
            userCreated = true;
        }

        res.status(201).json({ success: true, message: 'Usuario registrado exitosamente.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error del servidor al registrar el usuario.' });
    }
});

// 2. LOGIN WITH LOCKOUT & SECURE SESSION TOKEN
app.post('/api/v1/auth/login', authRateLimiter, async (req, res) => {
    const { cuit_cuil, password } = req.body;

    if (!cuit_cuil || !password) {
        return res.status(400).json({ success: false, error: 'CUIT/CUIL y contraseña son requeridos.' });
    }

    try {
        let user = null;
        let isDb = true;

        try {
            const result = await pool.query('SELECT * FROM usuarios WHERE cuit_cuil = $1', [cuit_cuil]);
            if (result.rows.length > 0) {
                user = result.rows[0];
            }
        } catch (dbErr) {
            isDb = false;
            user = mockUsers.find(u => u.cuit_cuil === cuit_cuil);
        }

        // Generic error response to prevent user enumeration
        const authFailedResponse = () => res.status(401).json({ success: false, error: 'Credenciales inválidas.' });

        if (!user) {
            return authFailedResponse();
        }

        const now = new Date();

        // Check if user is locked out
        if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > now) {
            const timeLeft = Math.ceil((new Date(user.bloqueado_hasta) - now) / 60000);
            return res.status(423).json({ 
                success: false, 
                error: `Cuenta temporalmente bloqueada por demasiados intentos fallidos. Intente nuevamente en ${timeLeft} minutos.` 
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            // Increment failed attempts
            const newFailedAttempts = (user.intentos_fallidos || 0) + 1;
            let bloqueadoHasta = null;

            if (newFailedAttempts >= 5) {
                bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000); // 15 mins block
            }

            if (isDb) {
                await pool.query(
                    'UPDATE usuarios SET intentos_fallidos = $1, bloqueado_hasta = $2 WHERE cuit_cuil = $3',
                    [newFailedAttempts, bloqueadoHasta, cuit_cuil]
                );
            } else {
                user.intentos_fallidos = newFailedAttempts;
                user.bloqueado_hasta = bloqueadoHasta;
            }

            if (bloqueadoHasta) {
                return res.status(423).json({ 
                    success: false, 
                    error: 'Demasiados intentos fallidos. Su cuenta ha sido bloqueada por 15 minutos.' 
                });
            }

            return authFailedResponse();
        }

        // Reset failed attempts on successful login
        if (isDb) {
            await pool.query(
                'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE cuit_cuil = $1',
                [cuit_cuil]
            );
        } else {
            user.intentos_fallidos = 0;
            user.bloqueado_hasta = null;
        }

        // Sign JWT payload
        const token = jwt.sign(
            { cuit_cuil: user.cuit_cuil, rol: user.rol, id_organismo: user.id_organismo },
            process.env.JWT_SECRET || 'sirec_b_super_secret_key_2026',
            { expiresIn: '15m' } // 15 minutes expiration
        );

        // Set HttpOnly secure cookie
        res.cookie('sirec_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in production (requires HTTPS)
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.json({
            success: true,
            user: {
                cuit_cuil: user.cuit_cuil,
                email: user.email,
                rol: user.rol,
                id_organismo: user.id_organismo
            },
            // Also return token in body for client fallback (e.g. mobile or headers-based flow)
            token
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error del servidor durante el inicio de sesión.' });
    }
});

// 3. ME - GET CURRENT USER
app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
    res.json({ success: true, user: req.user });
});

// 4. LOGOUT
app.post('/api/v1/auth/logout', (req, res) => {
    res.clearCookie('sirec_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ success: true, message: 'Sesión cerrada.' });
});


function guardarEnIPFSLocal(buffer) {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return `QmSirecB${hash.substring(0, 40)}`;
}

function notarizarBFA(hashHex, cid, cuit) {
    return {
        status: 'SUCCESS',
        bfa_tx_id: `0xbfa_sirec_${crypto.randomBytes(16).toString('hex')}`,
        bfa_timestamp: new Date().toISOString(),
        stamp: {
            hash: hashHex,
            cid: cid,
            firmante_cuit: cuit,
            nodo: 'ARSAT-FORMOSA-NODE-01',
            red: 'Blockchain Federal Argentina (BFA)'
        }
    };
}

// CATÁLOGOS BASE
app.get('/api/v1/organismos', async (req, res) => {
    const defaultOrganismos = [
        // Provincial
        { id_organismo: 'M-MIN-SALUD', nombre: 'Ministerio de Desarrollo Humano Formosa', tipo_organismo: 'ministerio', jurisdiccion: 'Provincial' },
        { id_organismo: 'M-MIN-ECON', nombre: 'Ministerio de Economía, Hacienda y Finanzas', tipo_organismo: 'ministerio', jurisdiccion: 'Provincial' },
        { id_organismo: 'M-MIN-GOB', nombre: 'Ministerio de Gobierno, Justicia, Seguridad y Trabajo', tipo_organismo: 'ministerio', jurisdiccion: 'Provincial' },
        { id_organismo: 'M-MIN-PLAN', nombre: 'Ministerio de Planificación, Inversión, Obras y Servicios Públicos', tipo_organismo: 'ministerio', jurisdiccion: 'Provincial' },

        // Municipalidades 1.ª Categoría
        { id_organismo: 'MUN-FORMOSA', nombre: 'Municipalidad de la Ciudad de Formosa (Depto. Formosa)', tipo_organismo: 'municipio_1a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-CLORINDA', nombre: 'Municipalidad de Clorinda (Depto. Pilcomayo)', tipo_organismo: 'municipio_1a', jurisdiccion: 'Municipal' },

        // Municipalidades 2.ª Categoría
        { id_organismo: 'MUN-ELCOLORADO', nombre: 'Municipalidad de El Colorado (Depto. Pirané)', tipo_organismo: 'municipio_2a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-ESTANISLAO', nombre: 'Municipalidad de Estanislao del Campo (Depto. Patiño)', tipo_organismo: 'municipio_2a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-IBARRETA', nombre: 'Municipalidad de Ibarreta (Depto. Patiño)', tipo_organismo: 'municipio_2a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-INGJUAREZ', nombre: 'Municipalidad de Ing. Guillermo Nicasio Juárez (Depto. Matacos)', tipo_organismo: 'municipio_2a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-LAGBLANCA', nombre: 'Municipalidad de Laguna Blanca (Depto. Pilcomayo)', tipo_organismo: 'municipio_2a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-LASLOMITAS', nombre: 'Municipalidad de Las Lomitas (Depto. Patiño)', tipo_organismo: 'municipio_2a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-PIRANE', nombre: 'Municipalidad de Pirané (Depto. Pirané)', tipo_organismo: 'municipio_2a', jurisdiccion: 'Municipal' },

        // Municipalidades 3.ª Categoría
        { id_organismo: 'MUN-FONTANA', nombre: 'Municipalidad de Comandante Fontana (Depto. Patiño)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-ELCHORRO', nombre: 'Municipalidad de El Chorro / Gral. E. Mosconi (Depto. Ramón Lista)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-ESPINILLO', nombre: 'Municipalidad de El Espinillo (Depto. Pilagás)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-MANSILLA', nombre: 'Municipalidad de General Lucio V. Mansilla (Depto. Laishí)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-BELGRANO', nombre: 'Municipalidad de General Manuel Belgrano (Depto. Patiño)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-HERRADURA', nombre: 'Municipalidad de Herradura (Depto. Laishí)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-NAINECK', nombre: 'Municipalidad de Laguna Naineck (Depto. Pilcomayo)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-LAGYEMA', nombre: 'Municipalidad de Laguna Yema (Depto. Bermejo)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-VILLAFAÑE', nombre: 'Municipalidad de Mayor Vicente Villafañe (Depto. Pirané)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-LAISHI', nombre: 'Municipalidad de Misión San Francisco de Laishí (Depto. Laishí)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-TACAAGLE', nombre: 'Municipalidad de Misión Tacaaglé (Depto. Pilagás)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-PALOSANTO', nombre: 'Municipalidad de Palo Santo (Depto. Pirané)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-POZOTIGRE', nombre: 'Municipalidad de Pozo del Tigre (Depto. Patiño)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-RIACHOHEHE', nombre: 'Municipalidad de Riacho He-Hé (Depto. Pilcomayo)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-SANMARTIN2', nombre: 'Municipalidad de San Martín Dos (Depto. Patiño)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-VILLA13', nombre: 'Municipalidad de Villa Dos Trece (Depto. Pirané)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-VILLAESCOLAR', nombre: 'Municipalidad de Villa Escolar (Depto. Laishí)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },
        { id_organismo: 'MUN-GUEMES', nombre: 'Municipalidad de Villa General Güemes (Depto. Patiño)', tipo_organismo: 'municipio_3a', jurisdiccion: 'Municipal' },

        // Comisiones de Fomento
        { id_organismo: 'CF-BUENAVISTA', nombre: 'Comisión de Fomento de Buena Vista (Depto. Pilagás)', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' },
        { id_organismo: 'CF-PASTORIL', nombre: 'Comisión de Fomento de Colonia Pastoril (Depto. Formosa)', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' },
        { id_organismo: 'CF-LUGONES', nombre: 'Comisión de Fomento de Fortín Lugones (Depto. Patiño)', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' },
        { id_organismo: 'CF-GRANDGUARDIA', nombre: 'Comisión de Fomento de Gran Guardia (Depto. Formosa)', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' },
        { id_organismo: 'CF-CHIRIGUANOS', nombre: 'Comisión de Fomento de Los Chiriguanos (Depto. Bermejo)', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' },
        { id_organismo: 'CF-POZOMAZA', nombre: 'Comisión de Fomento de Pozo de Maza (Depto. Bermejo)', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' },
        { id_organismo: 'CF-SANHILARIO', nombre: 'Comisión de Fomento de San Hilario (Depto. Formosa)', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' },
        { id_organismo: 'CF-SIETEPALMAS', nombre: 'Comisión de Fomento de Siete Palmas (Depto. Pilcomayo)', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' },
        { id_organismo: 'CF-PERIN', nombre: 'Comisión de Fomento de Subteniente Perín (Depto. Patiño)', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' },
        { id_organismo: 'CF-TRESLAGUNAS', nombre: 'Comisión de Fomento de Tres Lagunas (Depto. Pilagás)', tipo_organismo: 'comision_fomento', jurisdiccion: 'Municipal' }
    ];

    try {
        const result = await pool.query('SELECT * FROM organismos ORDER BY nombre ASC');
        if (result.rows.length > 0) {
            return res.json({ success: true, data: result.rows });
        }
        res.json({ success: true, data: defaultOrganismos });
    } catch (err) {
        res.json({ success: true, data: defaultOrganismos });
    }
});

app.get('/api/v1/responsables', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM responsables ORDER BY nombre_apellido ASC');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.json({
            success: true,
            data: [
                { cuit_cuil: '20301112229', nombre_apellido: 'Lic. Roberto Gomez', cargo: 'Contador', tipo_responsabilidad: 'primigenio', id_organismo: 'M-MIN-SALUD' },
                { cuit_cuil: '20283334449', nombre_apellido: 'Dra. Maria Fernandez', cargo: 'Tesorero', tipo_responsabilidad: 'subresponsable', id_organismo: 'M-MIN-SALUD' }
            ]
        });
    }
});

// NOTARIZACIÓN Y REGISTRO COMPLETO DE RENDICIÓN
app.post('/api/v1/rendiciones/notarizar', upload.array('archivos_pdf'), async (req, res) => {
    let client;
    let useDb = true;

    try {
        client = await pool.connect();
    } catch (dbErr) {
        useDb = false;
        console.warn('PostgreSQL no está disponible localmente. Se responderá en modo simulación de notarización.');
    }

    try {
        const metadata = typeof req.body.metadata === 'string' ? JSON.parse(req.body.metadata) : req.body.metadata;
        const { id_organismo, cuit_responsable, ejercicio_fiscal, mes_periodo, numero_expediente, tipo_rendicion, libros } = metadata;

        const payloadString = JSON.stringify({ metadata, adjuntos_count: req.files ? req.files.length : 0 });
        const hashSHA256 = crypto.createHash('sha256').update(payloadString).digest('hex');

        const ipfsCid = guardarEnIPFSLocal(Buffer.from(payloadString));
        const reciboBFA = notarizarBFA(hashSHA256, ipfsCid, cuit_responsable);

        let expedienteId = Math.floor(Math.random() * 1000) + 1;

        if (useDb && client) {
            await client.query('BEGIN');

            let responsableId = 1;
            const respRes = await client.query('SELECT id FROM responsables WHERE cuit_cuil = $1', [cuit_responsable]);
            if (respRes.rows.length > 0) {
                responsableId = respRes.rows[0].id;
            }

            const expRes = await client.query(`
                INSERT INTO expedientes_rendicion 
                (numero_expediente, ejercicio_fiscal, mes_periodo, id_organismo, id_responsable, hash_bfa, cid_ipfs, bfa_tx_id, bfa_timestamp)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
            `, [
                numero_expediente, ejercicio_fiscal, mes_periodo, id_organismo, responsableId,
                hashSHA256, ipfsCid, reciboBFA.bfa_tx_id, reciboBFA.bfa_timestamp
            ]);

            expedienteId = expRes.rows[0].id;

            if (libros.rai && libros.rai.length > 0) {
                for (let r of libros.rai) {
                    await client.query(`
                        INSERT INTO rai (id_expediente, id_responsable, id_cuenta_bancaria, fecha_ingreso, concepto, monto, comprobante_id)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [expedienteId, responsableId, r.id_cuenta_bancaria || 1, r.fecha || '2026-03-01', r.concepto, r.monto, r.comprobante_id]);
                }
            }

            if (libros.raci && libros.raci.length > 0) {
                for (let r of libros.raci) {
                    await client.query(`
                        INSERT INTO raci (id_expediente, id_responsable, id_cuenta_bancaria, id_partida, tipo_raci, etapa, monto, proveedor_cuit, factura_cae)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    `, [expedienteId, responsableId, r.id_cuenta_bancaria || 1, r.id_partida || 1, r.tipo_raci || 'bienes_de_uso', r.etapa || 'pago', r.monto, r.proveedor_cuit || '30708811229', r.factura_cae || '88912389102']);
                }
            }

            if (libros.ingresos_egresos && libros.ingresos_egresos.length > 0) {
                for (let r of libros.ingresos_egresos) {
                    await client.query(`
                        INSERT INTO ingresos_egresos (id_expediente, id_responsable, id_cuenta_bancaria, fecha, tipo_movimiento, monto, inciso, detalle)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [expedienteId, responsableId, r.id_cuenta_bancaria || 1, r.fecha || '2026-03-01', r.tipo_movimiento || 'egreso', r.monto, r.inciso || 'Servicios', r.detalle || 'Detalle']);
                }
            }

            if (libros.libro_banco && libros.libro_banco.length > 0) {
                for (let r of libros.libro_banco) {
                    await client.query(`
                        INSERT INTO libro_banco (id_expediente, id_responsable, id_cuenta_bancaria, fecha_movimiento, tipo_operacion, numero_comprobante, monto, beneficiario)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [expedienteId, responsableId, r.id_cuenta_bancaria || 1, r.fecha || '2026-03-01', r.tipo_operacion || 'transferencia', r.numero_comprobante, r.monto, r.beneficiario]);
                }
            }

            await client.query('COMMIT');
        }

        res.json({
            success: true,
            message: 'Rendición procesada por SIREC-B II y notarizada en la BFA',
            expediente_id: expedienteId,
            hash_sha256: hashSHA256,
            cid_ipfs: ipfsCid,
            bfa_receipt: reciboBFA,
            modo_persistente: useDb ? 'PostgreSQL Database' : 'In-Memory / Simulation'
        });

    } catch (err) {
        if (useDb && client) await client.query('ROLLBACK');
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (useDb && client) client.release();
    }
});

// API REST EXPOSICIÓN PARA SIADA
app.get('/api/v1/siada/expedientes', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                e.id as expediente_id, e.numero_expediente, e.ejercicio_fiscal, e.mes_periodo,
                e.hash_bfa, e.cid_ipfs, e.bfa_tx_id, e.bfa_timestamp,
                o.id_organismo, o.nombre as organismo_nombre, o.tipo_organismo,
                r.cuit_cuil as responsable_cuit, r.nombre_apellido as responsable_nombre
            FROM expedientes_rendicion e
            JOIN organismos o ON e.id_organismo = o.id_organismo
            JOIN responsables r ON e.id_responsable = r.id
            ORDER BY e.fecha_carga DESC
        `);
        res.json({
            success: true,
            origen: 'SIREC-B II REST API Interface (Formosa BFA)',
            total_records: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        // Mock dataset para pruebas SIADA si DB no está activa
        res.json({
            success: true,
            origen: 'SIREC-B II REST API Interface (Mock Fallback)',
            total_records: 2,
            data: [
                {
                    expediente_id: 101,
                    numero_expediente: 'EXP-2026-FSA-0089',
                    ejercicio_fiscal: 2026,
                    mes_periodo: 3,
                    hash_bfa: 'a5f8b91928374610293847561029384756102938475610293847561029384756',
                    cid_ipfs: 'QmSirecB89012389102389102839102839102839102',
                    bfa_tx_id: '0xbfa_sirec_89a12c34e56f78901234567890abcdef',
                    bfa_timestamp: new Date().toISOString(),
                    id_organismo: 'M-MIN-SALUD',
                    organismo_nombre: 'Ministerio de Desarrollo Humano Formosa',
                    tipo_organismo: 'ministerio',
                    responsable_cuit: '20301112229',
                    responsable_nombre: 'Lic. Roberto Gomez'
                }
            ]
        });
    }
});

app.get('/api/v1/siada/expediente/:id/dataset', async (req, res) => {
    const expedienteId = req.params.id;
    try {
        const exp = await pool.query('SELECT * FROM expedientes_rendicion WHERE id = $1', [expedienteId]);
        if (exp.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Expediente no encontrado' });
        }

        const rai = await pool.query('SELECT * FROM rai WHERE id_expediente = $1', [expedienteId]);
        const raci = await pool.query('SELECT * FROM raci WHERE id_expediente = $1', [expedienteId]);
        const ie = await pool.query('SELECT * FROM ingresos_egresos WHERE id_expediente = $1', [expedienteId]);
        const banco = await pool.query('SELECT * FROM libro_banco WHERE id_expediente = $1', [expedienteId]);

        res.json({
            success: true,
            expediente: exp.rows[0],
            verificacion_bfa: {
                hash_notarizado: exp.rows[0].hash_bfa,
                bfa_tx_id: exp.rows[0].bfa_tx_id,
                timestamp: exp.rows[0].bfa_timestamp,
                nodo_notarizador: 'ARSAT-FORMOSA-NODE-01'
            },
            payload_para_ml: {
                registros_rai: rai.rows,
                registros_raci: raci.rows,
                registros_ingresos_egresos: ie.rows,
                registros_libro_banco: banco.rows
            }
        });
    } catch (err) {
        res.json({
            success: true,
            expediente_id: expedienteId,
            verificacion_bfa: {
                hash_notarizado: '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
                bfa_tx_id: '0xbfa_sirec_99a112233445566778899aabbccddeeff',
                timestamp: new Date().toISOString(),
                nodo_notarizador: 'ARSAT-FORMOSA-NODE-01'
            },
            payload_para_ml: {
                registros_rai: [
                    { fecha_ingreso: '2026-03-01', concepto: 'Fondos Coparticipables de Salud', monto: 3200000.00, comprobante_id: 'REC-90812' }
                ],
                registros_raci: [
                    { tipo_raci: 'bienes_de_uso', etapa: 'pago', monto: 1100000.00, proveedor_cuit: '30708811229', factura_cae: '88912389102' }
                ],
                registros_ingresos_egresos: [
                    { fecha: '2026-03-02', tipo_movimiento: 'egreso', monto: 450000.00, inciso: 'Bienes de Consumo', detalle: 'Adquisición Insumos de Laboratorio' }
                ],
                registros_libro_banco: [
                    { fecha_movimiento: '2026-03-04', tipo_operacion: 'transferencia', numero_comprobante: 'TRF-11928', monto: 1100000.00, beneficiario: 'Licitación Equipamiento Hospitalario' }
                ]
            }
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend SIREC-B II (PERN) escuchando en puerto ${PORT}`));

