"""seed initial data

Revision ID: 002_seed
Revises: 001_initial
Create Date: 2026-07-13
"""

import uuid
import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from passlib.context import CryptContext
from sqlalchemy.dialects import postgresql

from app.core.config import get_settings

revision: str = "002_seed"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

CATEGORIES = [
    {"name": "Protection", "slug": "protection", "sort_order": 1},
    {"name": "Control", "slug": "control", "sort_order": 2},
    {"name": "Automation", "slug": "automation", "sort_order": 3},
    {"name": "Distribution", "slug": "distribution", "sort_order": 4},
]

PRODUCTS = [
    {
        "slug": "mccb-400",
        "sku": "VC-MCCB-400A",
        "name": "Molded Case Circuit Breaker",
        "category_slug": "protection",
        "rating": "400A · 690V · 65kA",
        "description": "Thermal-magnetic protection for LV distribution networks with integrated arc-flash mitigation.",
        "price": 1284,
        "specifications": {"current": "400A", "voltage": "690V", "breaking_capacity": "65kA"},
        "is_featured": True,
        "sort_order": 1,
    },
    {
        "slug": "cont-95",
        "sku": "VC-CT-95A",
        "name": "Industrial Contactor",
        "category_slug": "control",
        "rating": "95A · 45kW · AC-3",
        "description": "Heavy-duty three-pole contactor with auxiliary contacts and 24V DC coil actuation.",
        "price": 342,
        "specifications": {"current": "95A", "power": "45kW", "duty": "AC-3"},
        "is_featured": True,
        "sort_order": 2,
    },
    {
        "slug": "vfd-75",
        "sku": "VC-VFD-75kW",
        "name": "Variable Frequency Drive",
        "category_slug": "automation",
        "rating": "75kW · IP20 · Modbus",
        "description": "Sensorless vector-control drive with sinusoidal filter and Ethernet/IP fieldbus.",
        "price": 4820,
        "specifications": {"power": "75kW", "ip_rating": "IP20", "protocol": "Modbus"},
        "is_featured": True,
        "sort_order": 3,
    },
    {
        "slug": "plc-c8",
        "sku": "VC-PLC-C8",
        "name": "Compact PLC Controller",
        "category_slug": "automation",
        "rating": "32 I/O · Ethernet · CODESYS",
        "description": "IEC 61131-3 programmable controller with expandable I/O and OPC UA server.",
        "price": 1650,
        "specifications": {"io_count": 32, "protocol": "Ethernet", "runtime": "CODESYS"},
        "is_featured": False,
        "sort_order": 4,
    },
    {
        "slug": "bb-1600",
        "sku": "VC-BB-1600A",
        "name": "Copper Busbar System",
        "category_slug": "distribution",
        "rating": "1600A · 3P+N+PE · IP55",
        "description": "Compact busbar trunking with tin-plated copper conductors and plug-in tap-off units.",
        "price": 6420,
        "specifications": {"current": "1600A", "phases": "3P+N+PE", "ip_rating": "IP55"},
        "is_featured": False,
        "sort_order": 5,
    },
    {
        "slug": "spd-t2",
        "sku": "VC-SPD-T2",
        "name": "Type 2 Surge Protector",
        "category_slug": "protection",
        "rating": "40kA · 275V · Class II",
        "description": "MOV-based surge protection with remote signaling and pluggable modules.",
        "price": 289,
        "specifications": {"surge_current": "40kA", "voltage": "275V", "class": "II"},
        "is_featured": False,
        "sort_order": 6,
    },
]


def upgrade() -> None:
    settings = get_settings()
    conn = op.get_bind()

    admin_id = uuid.uuid4()
    conn.execute(
        sa.text(
            """
            INSERT INTO admin_users (id, email, password_hash, full_name, is_active)
            VALUES (:id, :email, :password_hash, :full_name, true)
            """
        ),
        {
            "id": admin_id,
            "email": settings.admin_email,
            "password_hash": pwd_context.hash(settings.admin_password),
            "full_name": settings.admin_full_name,
        },
    )

    category_ids: dict[str, uuid.UUID] = {}
    for cat in CATEGORIES:
        cat_id = uuid.uuid4()
        category_ids[cat["slug"]] = cat_id
        conn.execute(
            sa.text(
                """
                INSERT INTO categories (id, name, slug, sort_order, is_active)
                VALUES (:id, :name, :slug, :sort_order, true)
                """
            ),
            {"id": cat_id, **cat},
        )

    for product in PRODUCTS:
        conn.execute(
            sa.text(
                """
                INSERT INTO products (
                    id, slug, sku, name, category_id, rating, description,
                    price, specifications, is_featured, is_active, sort_order
                )
                VALUES (
                    :id, :slug, :sku, :name, :category_id, :rating, :description,
                    :price, CAST(:specifications AS jsonb), :is_featured, true, :sort_order
                )
                """
            ),
            {
                "id": uuid.uuid4(),
                "slug": product["slug"],
                "sku": product["sku"],
                "name": product["name"],
                "category_id": category_ids[product["category_slug"]],
                "rating": product["rating"],
                "description": product["description"],
                "price": product["price"],
                "specifications": json.dumps(product["specifications"]),
                "is_featured": product["is_featured"],
                "sort_order": product["sort_order"],
            },
        )

    conn.execute(
        sa.text(
            """
            INSERT INTO company_info (id, name, phone, email, about, address)
            VALUES (:id, :name, :phone, :email, :about, :address)
            """
        ),
        {
            "id": uuid.uuid4(),
            "name": "VOLTCORE Industrial Supply",
            "phone": "+1 (713) 555-0142",
            "email": "orders@voltcore.io",
            "about": (
                "VOLTCORE is a family-owned industrial electrical distributor. For nearly "
                "four decades we've supplied the switchgear, drives, and controls that keep "
                "refineries, data centers, mines, and utilities on-line."
            ),
            "address": "Houston, TX · Distribution Centre",
        },
    )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM product_images"))
    op.execute(sa.text("DELETE FROM products"))
    op.execute(sa.text("DELETE FROM categories"))
    op.execute(sa.text("DELETE FROM company_info"))
    op.execute(sa.text("DELETE FROM refresh_tokens"))
    op.execute(sa.text("DELETE FROM admin_users"))
