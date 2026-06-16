import json
from collections import defaultdict
from datetime import date, datetime
from functools import lru_cache
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from .models import (
        DateAggItem,
        DateAggResponse,
        ProductAggItem,
        ProductAggResponse,
        SalesRecord,
        SalesResponse,
        SummaryResponse,
    )
except ImportError:  # pragma: no cover
    from models import (
        DateAggItem,
        DateAggResponse,
        ProductAggItem,
        ProductAggResponse,
        SalesRecord,
        SalesResponse,
        SummaryResponse,
    )

app = FastAPI(title="Sales Dashboard API")

DATA_FILE = Path(__file__).with_name("sample_data.json")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Sales Dashboard API"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


def parse_iso_date(value: str) -> date:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).date()
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format: {value}. Expected ISO format.",
        ) from exc


@lru_cache(maxsize=1)
def load_sample_data() -> list[SalesRecord]:
    with DATA_FILE.open(encoding="utf-8") as file:
        data = json.load(file)
    return [SalesRecord.model_validate(item) for item in data]


def filter_sales(
    sales: list[SalesRecord],
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    product_name: Optional[str] = None,
) -> list[SalesRecord]:
    start = parse_iso_date(start_date) if start_date else None
    end = parse_iso_date(end_date) if end_date else None
    product_query = product_name.casefold() if product_name else None

    filtered_sales: list[SalesRecord] = []
    for record in sales:
        record_date = parse_iso_date(record.date)
        if start and record_date < start:
            continue
        if end and record_date > end:
            continue
        if product_query and product_query not in record.product_name.casefold():
            continue
        filtered_sales.append(record)

    return filtered_sales


def aggregate_sales_by_product(items: list[SalesRecord]) -> list[ProductAggItem]:
    aggregated_by_product: dict[str, dict[str, float | int]] = defaultdict(
        lambda: {"total_sales": 0.0, "order_count": 0}
    )
    for record in items:
        product_totals = aggregated_by_product[record.product_name]
        product_totals["total_sales"] += record.quantity * record.unit_price
        product_totals["order_count"] += 1

    return sorted(
        [
            ProductAggItem(
                product_name=record_product_name,
                total_sales=product_totals["total_sales"],
                order_count=product_totals["order_count"],
            )
            for record_product_name, product_totals in aggregated_by_product.items()
        ],
        key=lambda item: item.total_sales,
        reverse=True,
    )


@app.get("/api/sales", response_model=SalesResponse)
async def get_sales(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    product_name: Optional[str] = None,
) -> SalesResponse:
    items = filter_sales(
        load_sample_data(),
        start_date=start_date,
        end_date=end_date,
        product_name=product_name,
    )
    return SalesResponse(items=items, count=len(items))


@app.get("/api/dashboard/summary", response_model=SummaryResponse)
async def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    product_name: Optional[str] = None,
) -> SummaryResponse:
    items = filter_sales(
        load_sample_data(),
        start_date=start_date,
        end_date=end_date,
        product_name=product_name,
    )
    total_sales = sum(record.quantity * record.unit_price for record in items)
    return SummaryResponse(total_sales=total_sales, order_count=len(items))


@app.get("/api/dashboard/by-product", response_model=ProductAggResponse)
async def get_by_product(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    product_name: Optional[str] = None,
) -> ProductAggResponse:
    items = filter_sales(
        load_sample_data(),
        start_date=start_date,
        end_date=end_date,
        product_name=product_name,
    )
    return ProductAggResponse(items=aggregate_sales_by_product(items))


@app.get("/api/dashboard/by-date", response_model=DateAggResponse)
async def get_by_date(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    product_name: Optional[str] = None,
) -> DateAggResponse:
    items = filter_sales(
        load_sample_data(),
        start_date=start_date,
        end_date=end_date,
        product_name=product_name,
    )

    aggregated_by_date: dict[str, dict[str, float | int]] = defaultdict(
        lambda: {"total_sales": 0.0, "order_count": 0}
    )
    for record in items:
        daily_totals = aggregated_by_date[record.date]
        daily_totals["total_sales"] += record.quantity * record.unit_price
        daily_totals["order_count"] += 1

    aggregated_items = [
        DateAggItem(
            date=record_date,
            total_sales=daily_totals["total_sales"],
            order_count=daily_totals["order_count"],
        )
        for record_date, daily_totals in sorted(aggregated_by_date.items())
    ]

    return DateAggResponse(items=aggregated_items)
