from django.core.management.base import BaseCommand
from faker import Faker
from decimal import Decimal
import random
from django.db import transaction

from django.contrib.auth import get_user_model
from apps.shop.models import Product
from apps.orders.models import Order, OrderItem, OrderStatus
from apps.payments.models import PaymentType

User = get_user_model()
fake = Faker("fa_IR")


class Command(BaseCommand):
    help = "📦 ایجاد داده تستی برای سفارش‌ها و آیتم‌های آن‌ها"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=20,
            help="تعداد سفارش‌های تستی برای ایجاد (پیش‌فرض: 20)",
        )

        parser.add_argument(
            "--max-items",
            type=int,
            default=4,
            help="حداکثر تعداد آیتم در هر سفارش (پیش‌فرض: 4)"
        )

    @transaction.atomic
    def handle(self, *args, **options):
        count = options["count"]
        max_items = options["max_items"]

        users = list(User.objects.all())
        products = list(Product.objects.filter(is_active=True))

        if not users:
            self.stdout.write(self.style.ERROR("⚠️ هیچ کاربری وجود ندارد. ابتدا seed_users را اجرا کن."))
            return

        if not products:
            self.stdout.write(self.style.ERROR("⚠️ هیچ محصول فعالی وجود ندارد. ابتدا seed_products را اجرا کن."))
            return

        created_orders = 0

        for _ in range(count):
            user = random.choice(users)
            order_items = random.sample(products, k=min(len(products), random.randint(1, max_items)))

            total_amount = Decimal(0)
            for p in order_items:
                total_amount += p.price

            order = Order.objects.create(
                user=user,
                shipping_address=fake.address(),
                total_amount=total_amount,
                payment_type=random.choice(PaymentType.values),
                status=random.choice(OrderStatus.values),
            )

            for product in order_items:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    price_at_time_of_purchase=product.price,
                )

            created_orders += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ سفارش {order.id} برای کاربر {user.username} ساخته شد (مجموع: {total_amount:,} ریال)"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(f"\n🎉 {created_orders} سفارش تستی با موفقیت ایجاد شد ✅")
        )
