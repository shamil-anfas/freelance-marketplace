from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import (
    IsFreelancer,
    IsProposalOwner,
    IsProposalProjectOwner,
)
from apps.common.responses import SuccessResponse

from .models import Proposal
from .serializers import ProposalCreateSerializer, ProposalListSerializer
from .services import ProposalService


class ProposalCreateView(GenericAPIView):
    """
    POST /proposals/
    Submit a new proposal. Only authenticated FREELANCERs with a complete
    profile may submit. All business-rule guards run inside the service.
    """

    serializer_class = ProposalCreateSerializer
    permission_classes = [IsAuthenticated, IsFreelancer]
    throttle_scope = "proposal-create"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        proposal = ProposalService.create_proposal(
            validated_data=serializer.validated_data,
            user=request.user,
        )

        response_serializer = ProposalListSerializer(
            proposal, context={"request": request}
        )
        return SuccessResponse(
            data=response_serializer.data,
            message="Proposal submitted successfully.",
            status=status.HTTP_201_CREATED,
        )


class ProposalListView(GenericAPIView):
    """
    GET /proposals/list/
    Return proposals scoped to the authenticated user's role.
    - FREELANCER : their own proposals.
    - CLIENT     : proposals on their projects.
    - Admin      : all proposals.
    """

    serializer_class = ProposalListSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        proposals = ProposalService.list_proposals(user=request.user)

        page = self.paginate_queryset(proposals)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(proposals, many=True)
        return SuccessResponse(data=serializer.data, status=status.HTTP_200_OK)


class ProposalDetailView(GenericAPIView):
    """
    GET /proposals/<uuid>/
    Retrieve a single proposal by UUID.
    - FREELANCER : only their own.
    - CLIENT     : only proposals on their projects.
    - Admin      : any.
    """

    serializer_class = ProposalListSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            proposal = ProposalService.get_proposal(proposal_id=pk, user=request.user)
        except Proposal.DoesNotExist:
            raise NotFound("Proposal not found.")

        serializer = self.get_serializer(proposal)
        return SuccessResponse(
            data=serializer.data,
            message="Proposal fetched successfully.",
            status=status.HTTP_200_OK,
        )


class ProposalUpdateView(GenericAPIView):
    """
    PATCH /proposals/update/<uuid>/
    Partially update a proposal.
    Only the owning FREELANCER may update, and only while PENDING.
    Allowed fields: cover_letter, bid_amount, estimated_days.
    """

    serializer_class = ProposalCreateSerializer
    permission_classes = [IsAuthenticated, IsProposalOwner]

    def patch(self, request, pk):
        try:
            proposal = Proposal.objects.get(pk=pk)
        except Proposal.DoesNotExist:
            raise NotFound("Proposal not found.")

        # Object-level permission check (IsProposalOwner.has_object_permission)
        self.check_object_permissions(request, proposal)

        serializer = self.get_serializer(proposal, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_proposal = ProposalService.update_proposal(
            proposal=proposal,
            validated_data=serializer.validated_data,
            user=request.user,
        )

        response_serializer = ProposalListSerializer(
            updated_proposal, context={"request": request}
        )
        return SuccessResponse(
            data=response_serializer.data,
            message="Proposal updated successfully.",
            status=status.HTTP_200_OK,
        )


class ProposalWithdrawView(GenericAPIView):
    """
    DELETE /proposals/withdraw/<uuid>/
    Withdraw a proposal (soft delete — sets status to WITHDRAWN).
    Only the owning FREELANCER may withdraw, and only while PENDING.
    """

    serializer_class = ProposalListSerializer
    permission_classes = [IsAuthenticated, IsProposalOwner]

    def delete(self, request, pk):
        try:
            proposal = Proposal.objects.get(pk=pk)
        except Proposal.DoesNotExist:
            raise NotFound("Proposal not found.")

        # Object-level permission check (IsProposalOwner.has_object_permission)
        self.check_object_permissions(request, proposal)

        ProposalService.withdraw_proposal(proposal=proposal, user=request.user)

        return SuccessResponse(
            message="Proposal withdrawn successfully.",
            status=status.HTTP_200_OK,
        )


class ProposalAcceptView(GenericAPIView):
    """
    PATCH /proposals/<uuid>/accept/
    Accept a pending proposal. Only the client who owns the project may call this.
    Accepting also moves the project to IN_PROGRESS and bulk-rejects every other
    pending proposal on the same project.
    """

    permission_classes = [IsAuthenticated, IsProposalProjectOwner]

    def patch(self, request, pk):
        try:
            proposal = Proposal.objects.select_related("project").get(pk=pk)
        except Proposal.DoesNotExist:
            raise NotFound("Proposal not found.")

        # Object-level permission check (IsProposalProjectOwner.has_object_permission)
        self.check_object_permissions(request, proposal)

        ProposalService.accept_proposal(proposal=proposal, user=request.user)

        return SuccessResponse(
            message="Proposal accepted successfully.",
            status=status.HTTP_200_OK,
        )


class ProposalRejectView(GenericAPIView):
    """
    PATCH /proposals/<uuid>/reject/
    Reject a single pending proposal. Only the client who owns the project
    may call this.
    """

    permission_classes = [IsAuthenticated, IsProposalProjectOwner]

    def patch(self, request, pk):
        try:
            proposal = Proposal.objects.select_related("project").get(pk=pk)
        except Proposal.DoesNotExist:
            raise NotFound("Proposal not found.")

        # Object-level permission check (IsProposalProjectOwner.has_object_permission)
        self.check_object_permissions(request, proposal)

        ProposalService.reject_proposal(proposal=proposal, user=request.user)

        return SuccessResponse(
            message="Proposal rejected successfully.",
            status=status.HTTP_200_OK,
        )
