# api/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone', 'address', 'age']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'citizen'),
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            age=validated_data.get('age', None)
        )
        return user

from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid username or password")

#  donation
from rest_framework import serializers
from .models import Donation

class DonationSerializer(serializers.ModelSerializer):
    donor_username = serializers.CharField(source='donor.username', read_only=True)

    class Meta:
        model = Donation
        fields = '__all__'

# waste report

from rest_framework import serializers
from .models import WasteReport

class WasteReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)

    class Meta:
        model = WasteReport
        fields = '__all__'


# parks
from .models import Park, Campaign

class ParkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Park
        fields = '__all__'


class CampaignSerializer(serializers.ModelSerializer):
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)

    class Meta:
        model = Campaign
        fields = '__all__'

