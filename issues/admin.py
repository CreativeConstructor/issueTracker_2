from django.contrib import admin
from .models import Issue, Upvote, Comment

class IssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'urgency', 'status', 'author', 'created_at')
    list_filter = ('status', 'category', 'urgency')
    search_fields = ('title', 'description', 'location')

class CommentAdmin(admin.ModelAdmin):
    list_display = ('issue', 'user', 'created_at')

class UpvoteAdmin(admin.ModelAdmin):
    list_display = ('issue', 'user', 'created_at')

admin.site.register(Issue, IssueAdmin)
admin.site.register(Upvote, UpvoteAdmin)
admin.site.register(Comment, CommentAdmin)
