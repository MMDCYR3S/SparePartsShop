from django.core.management.base import BaseCommand
from faker import Faker
import random
from apps.shop.models import Category

fake = Faker("fa_IR")

ROOT_CATEGORIES = [
    "چاپ دیجیتال",
    "تجهیزات اداری",
    "لوازم تحریر",
    "هدایای تبلیغاتی",
    "خدمات طراحی گرافیک",
    "بسته‌بندی",
]


class Command(BaseCommand):
    help = "📦 تولید داده تستی برای مدل Category (دسته‌‌بندی و زیر‌دسته‌بندی‌ها)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--root-count",
            type=int,
            default=6,
            help="تعداد دسته‌های والد اصلی (پیش‌فرض: 6)",
        )
        parser.add_argument(
            "--child-range",
            type=str,
            default="1,3",
            help="محدوده تعداد زیردسته برای هر والد، مثلاً 1,3 یعنی بین 1 تا 3 زیر‌دسته",
        )

    def handle(self, *args, **options):
        root_count = options["root_count"]
        min_child, max_child = map(int, options["child_range"].split(","))

        created_categories = []

        for i in range(root_count):
            name = ROOT_CATEGORIES[i] if i < len(ROOT_CATEGORIES) else fake.word()
            cat, created = Category.objects.get_or_create(name=name, parent=None)
            created_categories.append(cat)

            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ دسته‌بندی اصلی ساخته شد: {cat.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️ دسته‌بندی '{cat.name}' از قبل وجود دارد."))

            num_children = random.randint(min_child, max_child)
            for _ in range(num_children):
                sub_name = fake.word()
                subcategory, created_sub = Category.objects.get_or_create(
                    name=sub_name, parent=cat
                )
                created_categories.append(subcategory)
                if created_sub:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"   ↳ زیر‌دسته ساخته شد: {sub_name} ← والد: {cat.name}"
                        )
                    )

        self.stdout.write(
            self.style.SUCCESS(f"\n🎉 {len(created_categories)} دسته و زیردسته ساخته شدند ✅")
        )
