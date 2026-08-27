const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sirec_b_db',
    password: 'postgre',
    port: 5432,
});

async function updateRaciDb() {
    try {
        console.log('Dropping old raci constraint...');
        await pool.query('ALTER TABLE raci DROP CONSTRAINT IF EXISTS raci_tipo_raci_check');
        
        console.log('Adding new raci constraint...');
        await pool.query("ALTER TABLE raci ADD CONSTRAINT raci_tipo_raci_check CHECK (tipo_raci IN ('servicios', 'personal', 'bienes_de_uso', 'bienes_de_consumo'))");
        
        console.log('DB SUCCESS! raci constraint updated.');
    } catch (e) {
        console.log('ERROR:', e.message);
    } finally {
        pool.end();
    }
}

updateRaciDb();
