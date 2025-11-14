from django.core.management.base import BaseCommand
from faker import Faker
import random
from decimal import Decimal

from apps.payments.models import Payment, PaymentType, PaymentStatus
from apps.orders.models import Order

fake = Faker("fa_IR")

class Command(BaseCommand):
    help = "💳 تولید داده تستی برای پرداخت‌های سفارش‌ها"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=20,
            help="تعداد پرداخت تستی برای ایجاد (پیش‌فرض: 20)"
        )

    def handle(self, *args, **options):
        count = options["count"]
        orders = list(Order.objects.all())

        if not orders:
            self.stdout.write(self.style.ERROR("⚠️ هیچ سفارشی در سیستم موجود نیست."))
            return

        created = 0
        for order in random.sample(orders, k=min(count, len(orders))):
            # Skip if payment already exists
            if hasattr(order, "payment"):
                self.stdout.write(f"⚠️ پرداخت برای سفارش {order.id} از قبل وجود دارد.")
                continue

            payment_type = random.choice(PaymentType.values)
            # منطق طبیعی‌تر: پرداخت نقدی معمولاً Completed یا Pending است، چکی معمولاً Pending
            if payment_type == PaymentType.CASH:
                status = random.choices(
                    [PaymentStatus.COMPLETED, PaymentStatus.PENDING, PaymentStatus.FAILED],
                    weights=[0.6, 0.3, 0.1],
                )[0]
            else:  # چک معمولاً در انتظار
                status = random.choices(
                    [PaymentStatus.PENDING, PaymentStatus.COMPLETED, PaymentStatus.FAILED],
                    weights=[0.7, 0.2, 0.1],
                )[0]

            amount = Decimal(random.randint(500_000, 20_000_000))
            transaction_id = (
                fake.uuid4() if status != PaymentStatus.FAILED else None
            )

            Payment.objects.create(
                order=order,
                payment_type=payment_type,
                status=status,
                transaction_id=transaction_id,
                amount=amount,
            )

            created += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ پرداخت سفارش {order.id} → نوع: {payment_type}, وضعیت: {status}"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(f"\n🎉 {created} پرداخت تستی ثبت شد ✅")
        )
