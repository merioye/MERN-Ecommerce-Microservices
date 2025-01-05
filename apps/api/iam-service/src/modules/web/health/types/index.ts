/**
 * Type that represents the health of the application.
 *
 * @property {string} message - A message describing the health of the application.
 * @property {string} status - A string indicating the health of the application. Can be
 *   either 'ok' or any other value.
 * @property {string} database.message - A message describing the health of the database.
 * @property {string} database.status - A string indicating the health of the database. Can be
 *   either 'ok' or any other value.
 */
type Health = {
  message: string;
  status: string;
  database: {
    message: string;
    status: string;
  };
};

export type { Health };
