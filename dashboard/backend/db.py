import contextlib
from typing import Generator

from databricks import sql
from databricks.sql.client import Connection, Cursor

from config import settings


def get_connection() -> Connection:
    """Open a new Databricks SQL connection."""
    return sql.connect(
        server_hostname=settings.databricks_server_hostname,
        http_path=settings.databricks_http_path,
        access_token=settings.databricks_token,
    )


@contextlib.contextmanager
def get_cursor() -> Generator[Cursor, None, None]:
    """Context manager that yields a cursor and cleans up automatically."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            yield cursor
    finally:
        conn.close()


def execute_query(query: str, parameters: dict | None = None) -> list[dict]:
    """
    Execute a parameterised SQL query and return results as a list of dicts.

    Parameters are passed as a dict and substituted positionally using Python's
    DB-API 2.0 style (%s placeholders in the query).  The databricks-sql-connector
    handles escaping, so this is safe against SQL injection.
    """
    with get_cursor() as cursor:
        if parameters:
            cursor.execute(query, list(parameters.values()))
        else:
            cursor.execute(query)

        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        return [dict(zip(columns, row)) for row in rows]
