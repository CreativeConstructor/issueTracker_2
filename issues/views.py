from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Issue, Upvote, Comment
from .serializers import IssueSerializer, CommentSerializer, UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class IsGovEmployeeOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated
        
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'gov_employee'

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [IsGovEmployeeOrReadOnly()]
        elif self.action in ['create', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upvote(self, request, pk=None):
        issue = self.get_object()
        upvote, created = Upvote.objects.get_or_create(user=request.user, issue=issue)
        if not created:
            upvote.delete()
            return Response({'status': 'upvote removed'}, status=status.HTTP_200_OK)
        return Response({'status': 'upvoted'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def comments(self, request, pk=None):
        issue = self.get_object()
        comments = issue.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        issue_id = self.request.data.get('issue')
        issue = Issue.objects.get(id=issue_id)
        serializer.save(user=self.request.user, issue=issue)

class AuthUserView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
