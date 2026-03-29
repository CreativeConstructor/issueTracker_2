from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IssueViewSet, CommentViewSet, AuthUserView

router = DefaultRouter()
router.register(r'issues', IssueViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/me/', AuthUserView.as_view({'get': 'me'})),
]
