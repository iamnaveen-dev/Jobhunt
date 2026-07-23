from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, JobSeekerProfile, RecruiterProfile
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    JobSeekerProfileSerializer,
    RecruiterProfileSerializer,
    ChangePasswordSerializer,
)
from .permissions import IsJobSeeker, IsRecruiter


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Account created successfully.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.check_password(password):
        return Response(
            {'error': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {'error': 'Account is disabled. Contact support.'},
            status=status.HTTP_403_FORBIDDEN
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        'message': f'Welcome back {user.username}!',
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {'message': 'Logged out successfully.'}
        )
    except Exception:
        return Response(
            {'error': 'Invalid token.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    data = UserSerializer(user).data

    if user.role == 'job_seeker':
        try:
            profile = user.seeker_profile
            data['profile'] = JobSeekerProfileSerializer(profile).data
        except JobSeekerProfile.DoesNotExist:
            data['profile'] = None

    elif user.role == 'recruiter':
        try:
            profile = user.recruiter_profile
            data['profile'] = RecruiterProfileSerializer(profile).data
        except RecruiterProfile.DoesNotExist:
            data['profile'] = None

    return Response(data)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsJobSeeker])
def jobseeker_profile_view(request):
    try:
        profile = request.user.seeker_profile
    except JobSeekerProfile.DoesNotExist:
        return Response(
            {'error': 'Profile not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = JobSeekerProfileSerializer(profile)
        return Response(serializer.data)

    serializer = JobSeekerProfileSerializer(
        profile,
        data=request.data,
        partial=request.method == 'PATCH'
    )
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully.',
            'profile': serializer.data
        })
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsRecruiter])
def recruiter_profile_view(request):
    try:
        profile = request.user.recruiter_profile
    except RecruiterProfile.DoesNotExist:
        return Response(
            {'error': 'Profile not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = RecruiterProfileSerializer(profile)
        return Response(serializer.data)

    serializer = RecruiterProfileSerializer(
        profile,
        data=request.data,
        partial=request.method == 'PATCH'
    )
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully.',
            'profile': serializer.data
        })
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data)

    if serializer.is_valid():
        user = request.user

        if not user.check_password(
            serializer.validated_data['old_password']
        ):
            return Response(
                {'error': 'Old password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(
            serializer.validated_data['new_password']
        )
        user.save()

        return Response(
            {'message': 'Password changed successfully.'}
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )