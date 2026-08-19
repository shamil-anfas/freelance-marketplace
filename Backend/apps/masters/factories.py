import factory
from django.utils.text import slugify
from factory.django import DjangoModelFactory

from apps.masters.models import Category, Skill


class CategoryFactory(DjangoModelFactory):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f"Category {n}")
    slug = factory.LazyAttribute(lambda obj: slugify(obj.name))
    description = factory.Faker("sentence")
    is_active = True


class SkillFactory(DjangoModelFactory):
    class Meta:
        model = Skill

    name = factory.Sequence(lambda n: f"Skill {n}")
    slug = factory.LazyAttribute(lambda obj: slugify(obj.name))
    is_active = True
