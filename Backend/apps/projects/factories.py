import factory
from django.utils.text import slugify
from factory.django import DjangoModelFactory

from apps.masters.factories import CategoryFactory, SkillFactory  # noqa: F401
from apps.projects.models import Project, ProjectStatus
from apps.users.factories import UserFactory


class ProjectFactory(DjangoModelFactory):
    class Meta:
        model = Project

    title = factory.Faker("sentence", nb_words=5)
    slug = factory.LazyAttribute(lambda obj: slugify(obj.title))
    description = factory.Faker("paragraph")
    client = factory.SubFactory(UserFactory, role="CLIENT")
    category = factory.SubFactory(CategoryFactory)
    budget_min = factory.Faker(
        "pydecimal", left_digits=5, right_digits=2, positive=True
    )
    budget_max = factory.LazyAttribute(lambda obj: obj.budget_min + 500)
    deadline = factory.Faker("future_date", end_date="+180d")
    status = ProjectStatus.OPEN

    @factory.post_generation
    def skills(self, create, extracted, **kwargs):
        """
        Add skills to the project after it has been saved.

        Usage:
            # Use default 3 auto-created skills
            ProjectFactory()

            # Pass specific skill instances
            ProjectFactory(skills=[skill1, skill2])

            # Create with no skills
            ProjectFactory(skills=[])
        """
        if not create:
            # In build strategy, M2M relations cannot be set
            return

        if extracted is not None:
            # Caller provided explicit skill instances (or empty list)
            for skill in extracted:
                self.skills.add(skill)
        else:
            # Default: create and attach 3 random skills
            skills = SkillFactory.create_batch(3)
            for skill in skills:
                self.skills.add(skill)
