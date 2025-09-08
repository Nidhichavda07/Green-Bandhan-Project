from django.urls import path,include
from .views import register_user
from .views import LoginAPIView


from rest_framework.routers import DefaultRouter
from .views import DonationViewSet, register_user, LoginAPIView
# from .views import WasteReportListCreateView
from .views import current_user
from .views import WasteReportViewSet, ParkViewSet, CampaignViewSet

router = DefaultRouter()
router.register(r'donations', DonationViewSet, basename='donation')
# router.register(r'waste-reports', WasteReportViewSet, basename='waste-reports')
router.register(r'waste-reports', WasteReportViewSet, basename='waste-reports')
router.register(r'parks', ParkViewSet, basename='parks')
router.register(r'campaigns', CampaignViewSet, basename='campaigns')

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', LoginAPIView.as_view(), name='api-login'),
    # path('waste-reports/', WasteReportListCreateView.as_view(), name='waste-reports'),
    path('user/', current_user, name='current-user'),
    path('', include(router.urls)), 
]




