from django.core.management.base import BaseCommand
from django.db import transaction
import random
from faker import Faker

from django.contrib.auth import get_user_model
from apps.shop.models import Product
from apps.carts.models import Cart, CartItem

User = get_user_model()
fake = Faker("fa_IR")


class Command(BaseCommand):
    help = "📦 تولید داده تستی برای مدل‌های Cart و CartItem"

    def add_arguments(self, parser):
        parser.add_argument(
            "--cart-count",
            type=int,
            default=10,
            help="تعداد سبد خرید تستی که باید ساخته شود (پیش‌فرض: 10)",
        )
        parser.add_argument(
            "--items-range",
            type=str,
            default="1,4",
            help="محدوده تعداد آیتم‌ها در هر سبد، مثلاً 1,4 یعنی بین 1 تا 4 محصول در هر سبد",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        cart_count = options["cart_count"]
        min_items, max_items = map(int, options["items_range"].split(","))

        users = list(User.objects.all())
        products = list(Product.objects.all())

        if not users or not products:
            self.stdout.write(self.style.ERROR("❌ ابتدا کاربران و محصولات تستی را ایجاد کنید."))
            return

        created_carts = 0
        total_items = 0

        for i in range(cart_count):
            user = random.choice(users)
            cart, created = Cart.objects.get_or_create(user=user)

            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ سبد خرید جدید ساخته شد برای {user.username}"))
                created_carts += 1
            else:
                self.stdout.write(self.style.WARNING(f"⚠️ سبد {user.username} از قبل وجود دارد — آیتم‌ها بررسی می‌شوند"))

            num_items = random.randint(min_items, max_items)
            selected_products = random.sample(products, min(num_items, len(products)))

            for product in selected_products:
                qty = random.randint(1, 3)
                item, created_item = CartItem.objects.get_or_create(
                    cart=cart, product=product, defaults={"quantity": qty}
                )
                if not created_item:
                    # اگر آیتم قبلاً بوده، کمی تعدادش زیاد می‌کنیم (حالت واقعی‌تر)
                    item.quantity = min(item.quantity + 1, 5)
                    item.save()
                total_items += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\n🎉 {created_carts} سبد خرید ایجاد شد و مجموعاً {total_items} آیتم به سبدها اضافه گردید ✅"
            )
        )
