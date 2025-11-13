from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile, Address

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    # add_form = CustomUserCreationForm
    list_display = ("username","email", "is_active", "is_staff", "is_superuser")
    list_filter = ("username","email", "is_active", "is_superuser")
    searching_field = ("email",)
    ordering = ("email",)
    fieldsets = (
        (
            "Authentication",
            {
                "fields": ("username", "password"),
            },
        ),
        (
            "Permissions",
            {
                "fields": ("is_active", "is_staff", "is_superuser", ),
            },
        ),
        (
            "Groups Permissions",
            {
                "fields": ("groups", "user_permissions"),
            },
        ),
        (
            "Important Dates",
            {
                "fields": ("last_login",),
            },
        ),
    )
    add_fieldsets = (
        (
            "Authentication",
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )

admin.site.register(Profile)
admin.site.register(Address)

