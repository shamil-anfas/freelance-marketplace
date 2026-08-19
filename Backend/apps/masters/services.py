import logging

from django.core.cache import cache
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from django.utils.text import slugify

from .models import Category, Skill
from .serializers import CategorySerializer

logger = logging.getLogger(__name__)

CATEGORY_LIST_CACHE_KEY = "categories:all"
CATEGORY_CACHE_TTL = 60 * 5  # 5 minutes


class CategoryService:
    """Handles Category business logic (create, update, soft-delete, list, get)."""

    @staticmethod
    def create_category(validated_data: dict) -> Category:
        """Create a new category with a slug auto-generated from the name.

        Args:
            validated_data: Validated data from CategorySerializer.

        Returns:
            The newly created Category instance.
        """
        validated_data["slug"] = slugify(validated_data["name"])
        category = Category.objects.create(**validated_data)
        cache.delete(CATEGORY_LIST_CACHE_KEY)
        logger.info("Category '%s' created — cache invalidated.", category.name)
        return category

    @staticmethod
    def update_category(instance: Category, validated_data: dict) -> Category:
        """Update an existing category. Slug is regenerated from updated name.

        Args:
            instance: The Category instance to update.
            validated_data: Validated data from CategorySerializer.

        Returns:
            The updated Category instance.
        """
        if "name" in validated_data:
            validated_data["slug"] = slugify(validated_data["name"])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        cache.delete(CATEGORY_LIST_CACHE_KEY)
        logger.info("Category '%s' updated — cache invalidated.", instance.name)
        return instance

    @staticmethod
    def delete_category(instance: Category) -> None:
        """Soft-delete a category by setting is_active to False.

        Args:
            instance: The Category instance to soft-delete.
        """
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
        cache.delete(CATEGORY_LIST_CACHE_KEY)
        logger.info("Category '%s' deleted — cache invalidated.", instance.name)

    @staticmethod
    def list_categories() -> list[dict]:
        """Return all categories, served from Redis cache when available.

        Flow:
            1. Check Redis for cached data.
            2. If cache hit  → return cached list of dicts directly.
            3. If cache miss → query PostgreSQL, serialize, store in Redis,
               then return the serialized list of dicts.

        Returns:
            A list of serialized category dicts.
        """
        # 1. Check Redis
        cached = cache.get(CATEGORY_LIST_CACHE_KEY)

        # 2. Cache hit — return immediately
        if cached is not None:
            logger.debug("Cache HIT for '%s'.", CATEGORY_LIST_CACHE_KEY)
            return cached

        # 3. Cache miss — query PostgreSQL
        logger.debug(
            "Cache MISS for '%s' — querying PostgreSQL.", CATEGORY_LIST_CACHE_KEY
        )
        queryset = Category.objects.all()

        # 4. Serialize
        data = CategorySerializer(queryset, many=True).data
        # Convert OrderedDicts to plain dicts so json.dumps works later if needed
        serialized: list[dict] = list(data)

        # 5. Store in Redis
        cache.set(CATEGORY_LIST_CACHE_KEY, serialized, timeout=CATEGORY_CACHE_TTL)
        logger.info(
            "Cached %d categories under '%s' (TTL=%ds).",
            len(serialized),
            CATEGORY_LIST_CACHE_KEY,
            CATEGORY_CACHE_TTL,
        )

        # 6. Return response
        return serialized

    @staticmethod
    def get_category(slug: str) -> Category:
        """Retrieve a specific category by its slug.

        Args:
            slug: The unique slug of the category.

        Returns:
            The matching Category instance.

        Raises:
            Http404: If no category with the given slug exists.
        """
        return get_object_or_404(Category, slug=slug)


class SkillService:
    """Handles Skill business logic (create, update, soft-delete, list, get)."""

    @staticmethod
    def create_skill(validated_data: dict) -> Skill:
        """Create a new skill with a slug auto-generated from the name.

        Args:
            validated_data: Validated data from SkillSerializer.

        Returns:
            The newly created Skill instance.
        """
        validated_data["slug"] = slugify(validated_data["name"])
        return Skill.objects.create(**validated_data)

    @staticmethod
    def update_skill(instance: Skill, validated_data: dict) -> Skill:
        """Update an existing skill. Slug is regenerated from updated name.

        Args:
            instance: The Skill instance to update.
            validated_data: Validated data from SkillSerializer.

        Returns:
            The updated Skill instance.
        """
        if "name" in validated_data:
            validated_data["slug"] = slugify(validated_data["name"])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    @staticmethod
    def delete_skill(instance: Skill) -> None:
        """Soft-delete a skill by setting is_active to False.

        Args:
            instance: The Skill instance to soft-delete.
        """
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    @staticmethod
    def list_skills() -> "QuerySet[Skill]":
        """Return all skills.

        Returns:
            QuerySet of all Skill objects ordered by name.
        """
        return Skill.objects.all()

    @staticmethod
    def get_skill(slug: str) -> Skill:
        """Retrieve a specific skill by its slug.

        Args:
            slug: The unique slug of the skill.

        Returns:
            The matching Skill instance.

        Raises:
            Http404: If no skill with the given slug exists.
        """
        return get_object_or_404(Skill, slug=slug)
