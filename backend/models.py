"""Pydantic models for the sales dashboard API."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, computed_field


class APIModel(BaseModel):
    """Base API model configuration."""

    model_config = ConfigDict(extra="forbid")


class SalesRecord(APIModel):
    """Sales data record."""

    id: str
    date: str
    product_name: str
    category: Optional[str] = None
    quantity: int
    unit_price: float
    customer_name: Optional[str] = None

    @computed_field(return_type=float)
    @property
    def sales_amount(self) -> float:
        return self.quantity * self.unit_price


class FilterParams(APIModel):
    """Query filters for sales endpoints."""

    start_date: Optional[str] = None
    end_date: Optional[str] = None
    product_name: Optional[str] = None


class SalesResponse(APIModel):
    """Response for sales list API."""

    items: list[SalesRecord]
    count: int


class SummaryResponse(APIModel):
    """Response for dashboard summary API."""

    total_sales: float
    order_count: int


class ProductAggItem(APIModel):
    """Aggregated sales data by product."""

    product_name: str
    total_sales: float
    order_count: int


class ProductAggResponse(APIModel):
    """Response for product aggregation API."""

    items: list[ProductAggItem]


class DateAggItem(APIModel):
    """Aggregated sales data by date."""

    date: str
    total_sales: float
    order_count: int


class DateAggResponse(APIModel):
    """Response for date aggregation API."""

    items: list[DateAggItem]