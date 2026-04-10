from rest_framework import serializers
from .models import Issue, Upvote, Comment
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'role')

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ('user', 'issue')

class IssueSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    upvote_count = serializers.SerializerMethodField()
    has_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ('author', 'status')

    def get_upvote_count(self, obj):
        return obj.upvotes.count()

    def get_has_upvoted(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(user=request.user).exists()
        return False
