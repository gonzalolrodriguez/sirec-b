const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sirec_b_db',
    password: 'postgre',
    port: 5432,
});

async function updateDb() {
    try {
        console.log('Dropping old constraint...');
        await pool.query('ALTER TABLE organismos DROP CONSTRAINT IF EXISTS organismos_tipo_organismo_check');
        
        console.log('Adding new constraint...');
        await pool.query("ALTER TABLE organismos ADD CONSTRAINT organismos_tipo_organismo_check CHECK (tipo_organismo IN ('ministerio', 'municipio', 'municipio_1a', 'municipio_2a', 'municipio_3a', 'comision_fomento', 'empresa_estatal'))");
        
        console.log('Reading sql file...');
        const sql = fs.readFileSync('../database/sirec_b.sql', 'utf8');
        
        console.log('Executing sql file...');
        await pool.query(sql);
        
        const res = await pool.query('SELECT COUNT(*) FROM organismos');
        console.log(`DB SUCCESS! Total organismos en PostgreSQL: ${res.rows[0].count}`);
    } catch (e) {
        console.log('ERROR:', e.message);
    } finally {
        pool.end();
    }
}

updateDb();
