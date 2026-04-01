from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    databricks_server_hostname: str
    databricks_http_path: str
    databricks_token: str
    databricks_catalog: str = "hive_metastore"
    databricks_schema: str = "delta_db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
