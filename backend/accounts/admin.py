from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Follow, User


class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "display_name", "is_verified", "is_staff")
    search_fields = ("username", "email", "display_name")
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Profile",
            {
                "fields": (
                    "display_name", "bio", "location", "website",
                    "birth_date", "avatar", "banner", "is_verified",
                )
            },
        ),
    )


admin.site.register(User, UserAdmin)
admin.site.register(Follow)
