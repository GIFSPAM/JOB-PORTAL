import pool from '../config/db.js';

const TABLES_IN_ORDER = [
    'SavedJobs',
    'Applications',
    'JobSkills',
    'SeekerSkills',
    'Jobs',
    'Skills',
    'AdminLogs',
    'JobSeekers',
    'Employers',
    'Users'
];

async function resetDatabase() {
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');

        for (const tableName of TABLES_IN_ORDER) {
            try {
                await conn.query(`TRUNCATE TABLE ${tableName}`);
                console.log(`Truncated ${tableName}`);
            } catch (error) {
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    console.log(`Skipped ${tableName} (table not found)`);
                    continue;
                }
                throw error;
            }
        }

        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Database reset complete.');
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

resetDatabase().catch(async (error) => {
    console.error('Reset failed:', error.message);
    try {
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch {
        // no-op
    }
    await pool.end();
    process.exit(1);
});
