from app.api import categories, company, enquiries, products, uploads
from app.auth.router import router as auth_router

from .router import api_router

api_router.include_router(auth_router)
api_router.include_router(categories.router)
api_router.include_router(categories.admin_router)
api_router.include_router(products.router)
api_router.include_router(products.admin_router)
api_router.include_router(company.router)
api_router.include_router(company.admin_router)
api_router.include_router(uploads.router)
api_router.include_router(enquiries.router)
api_router.include_router(enquiries.admin_router)
