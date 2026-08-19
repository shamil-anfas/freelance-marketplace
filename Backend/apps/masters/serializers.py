from rest_framework import serializers

from .models import Category, Skill


class CategorySerializer(serializers.ModelSerializer):
    # Read-only response fields
    id = serializers.UUIDField(read_only=True)
    slug = serializers.SlugField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "created_at", "updated_at"]

    def validate_name(self, value):
        """Case-insensitive unique name validation."""
        qs = Category.objects.filter(name__iexact=value)
        # Exclude current instance on update
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "A category with this name already exists."
            )
        return value


class SkillSerializer(serializers.ModelSerializer):
    # Read-only response fields
    id = serializers.UUIDField(read_only=True)
    slug = serializers.SlugField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Skill
        fields = ["id", "name", "slug", "created_at", "updated_at"]

    def validate_name(self, value):
        """Case-insensitive unique name validation."""
        qs = Skill.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A skill with this name already exists.")
        return value
