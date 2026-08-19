from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated

from apps.common.responses import SuccessResponse
from apps.users.serializers import (
    CurrentUserSerializer,
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
)
from apps.users.services import UserService


class RegisterView(GenericAPIView):
    """Handle user registration."""

    serializer_class = RegisterSerializer
    throttle_scope = "register"

    @extend_schema(
        tags=["Authentication"],
        request=RegisterSerializer,
        responses={201: None},
        summary="Register user",
        description="Registers a new user with the provided credentials.",
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        UserService.register_user(serializer.validated_data)

        return SuccessResponse(
            message="Registration successful.",
            status=status.HTTP_201_CREATED,
        )


class LoginView(GenericAPIView):
    """Handle user login and return JWT tokens."""

    serializer_class = LoginSerializer
    throttle_scope = "login"

    @extend_schema(
        tags=["Authentication"],
        request=LoginSerializer,
        responses={200: None},
        summary="Login user",
        description="Logs in a user with the provided credentials.",
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = UserService.login_user(serializer.validated_data)

        user = result["user"]

        return SuccessResponse(
            data={
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "is_active": user.is_active,
                },
                "access": result["access"],
                "refresh": result["refresh"],
            },
            message="Login successful.",
            status=status.HTTP_200_OK,
        )


class CurrentUserView(GenericAPIView):
    """Return the profile of the currently authenticated user."""

    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Authentication"],
        request=CurrentUserSerializer,
        responses={200: None},
        summary="Get current user",
        description="Gets the profile of the currently authenticated user.",
    )
    def get(self, request):
        serializer = self.get_serializer(request.user)
        return SuccessResponse(
            data=serializer.data,
            message="User data fetched successfully.",
            status=status.HTTP_200_OK,
        )


class LogoutView(GenericAPIView):
    """Blacklist the provided refresh token to log the user out."""

    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Authentication"],
        request=LogoutSerializer,
        responses={200: None},
        summary="Logout user",
        description="Logs out a user by blacklisting the provided refresh token.",
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        UserService.logout_user(serializer.validated_data["refresh"])

        return SuccessResponse(
            message="Logout successful. See you next time!",
            status=status.HTTP_200_OK,
        )
