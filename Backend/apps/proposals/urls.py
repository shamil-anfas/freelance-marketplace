from django.urls import path

from .views import (
    ProposalAcceptView,
    ProposalCreateView,
    ProposalDetailView,
    ProposalListView,
    ProposalRejectView,
    ProposalUpdateView,
    ProposalWithdrawView,
)

urlpatterns = [
    # POST   /proposals/
    path("", ProposalCreateView.as_view(), name="proposal-create"),
    # GET    /proposals/list/
    path("list/", ProposalListView.as_view(), name="proposal-list"),
    # GET    /proposals/<uuid>/
    path("<uuid:pk>/", ProposalDetailView.as_view(), name="proposal-detail"),
    # PATCH  /proposals/update/<uuid>/
    path("update/<uuid:pk>/", ProposalUpdateView.as_view(), name="proposal-update"),
    # DELETE /proposals/withdraw/<uuid>/
    path(
        "withdraw/<uuid:pk>/", ProposalWithdrawView.as_view(), name="proposal-withdraw"
    ),
    # PATCH  /proposals/<uuid>/accept/
    path("accept/<uuid:pk>/", ProposalAcceptView.as_view(), name="proposal-accept"),
    # PATCH  /proposals/<uuid>/reject/
    path("reject/<uuid:pk>/", ProposalRejectView.as_view(), name="proposal-reject"),
]
