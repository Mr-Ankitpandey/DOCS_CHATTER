from functools import lru_cache

from supabase import Client, create_client

from app.core.config import settings


@lru_cache
def get_supabase() -> Client:
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY.get_secret_value(),
    )


def get_bucket():
    """Storage bucket where uploaded documents live."""
    return get_supabase().storage.from_(settings.SUPABASE_BUCKET)
