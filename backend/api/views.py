# api/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer, UserSerializer

class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            user_data = UserSerializer(user).data
            # Ensure admin staff/superusers are labeled as 'admin'
            if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
                user_data['role'] = 'admin'
            return Response(user_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# donation

from rest_framework import viewsets
from .models import Donation
from .serializers import DonationSerializer

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all().order_by('-created_at')
    serializer_class = DonationSerializer


#  waste report

from rest_framework import viewsets, permissions
from .models import WasteReport
from .serializers import WasteReportSerializer

class WasteReportViewSet(viewsets.ModelViewSet):
    queryset = WasteReport.objects.all().order_by('-created_at')
    serializer_class = WasteReportSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })


# parks & campaigns
from .models import Park, Campaign
from .serializers import ParkSerializer, CampaignSerializer

class ParkViewSet(viewsets.ModelViewSet):
    queryset = Park.objects.all().order_by('-created_at')
    serializer_class = ParkSerializer
    permission_classes = [permissions.AllowAny]


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all().order_by('-created_at')
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        organizer = self.request.user
        if not organizer.is_authenticated:
            organizer = User.objects.filter(is_staff=True).first() or User.objects.first()
        serializer.save(organizer=organizer)
