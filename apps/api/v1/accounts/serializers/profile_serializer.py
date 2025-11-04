from rest_framework import serializers

from apps.accounts.models import Profile, User

# ========= Profile Serializer ========= #
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    
    class Meta:
        model = Profile
        fields = ('first_name', 'last_name', 'username', 'email', 'phone', 'landline', 'address', 'photo')