import { sql } from '@vercel/postgres';

export async function query(queryText, values) {
  try {
    const result = await sql.query(queryText, values);
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
}