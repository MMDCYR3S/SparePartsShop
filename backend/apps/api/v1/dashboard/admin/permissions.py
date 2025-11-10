from rest_framework import permissions

class IsAdminOrSuperUser(permissions.BasePermission):
    """
    فقط به کاربرانی که is_staff یا is_superuser هستند اجازه دسترسی می‌دهد.
    """
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)