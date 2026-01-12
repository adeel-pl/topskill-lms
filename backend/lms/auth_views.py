from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from .serializers import UserSerializer, UserRegistrationSerializer, ChangePasswordSerializer
from .models import Cart


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Create cart for user
        Cart.objects.get_or_create(user=user)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Send welcome email
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            result = send_mail(
                subject='Welcome to TopSkill LMS!',
                message=f'''
Hello {user.get_full_name() or user.username},

Welcome to TopSkill LMS! Your account has been successfully created.

You can now:
- Browse and enroll in courses
- Track your learning progress
- Get certificates upon completion
- Connect with instructors and other students

Start your learning journey today!

Best regards,
TopSkill LMS Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email] if user.email else [],
                fail_silently=False,  # Changed to False to see errors in console
            )
            if result:
                logger.info(f'Welcome email sent successfully to {user.email}')
        except Exception as e:
            logger.error(f'Failed to send welcome email to {user.email}: {str(e)}', exc_info=True)
            # Continue anyway - email is optional
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """User login endpoint with JWT - supports both username and email"""
    username_or_email = request.data.get('username')
    password = request.data.get('password')
    
    if not username_or_email or not password:
        return Response(
            {'error': 'Username/email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Try to authenticate - first try as username
    user = authenticate(username=username_or_email, password=password)
    
    # If that fails, try as email
    if user is None:
        try:
            user_obj = User.objects.get(Q(email=username_or_email) | Q(username=username_or_email))
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
    
    if user is None:
        return Response(
            {'error': 'Invalid username/email or password. Please check your credentials and try again.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check if user account is active
    if not user.is_active:
        return Response(
            {'error': 'Your account has been deactivated. Please contact support.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    """User logout endpoint"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """Update user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Send email notification
        try:
            send_mail(
                subject='Password Changed Successfully',
                message=f'Your password has been changed successfully. If you did not make this change, please contact support immediately.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass  # Email sending is optional
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    """Request password reset"""
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(Q(email=email) | Q(username=email))
    except User.DoesNotExist:
        # Don't reveal if user exists or not for security
        return Response(
            {'message': 'If an account exists with this email, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )
    
    # Generate token
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # Create reset link
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
    
    # Send email
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        result = send_mail(
            subject='Password Reset Request',
            message=f'''
Hello {user.get_full_name() or user.username},

You requested to reset your password. Click the link below to reset it:

{reset_link}

This link will expire in 24 hours.

If you did not request this, please ignore this email.

Best regards,
TopSkill LMS Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,  # Changed to False to catch errors
        )
        
        if result:
            logger.info(f'Password reset email sent successfully to {user.email}')
        else:
            logger.warning(f'Password reset email failed to send to {user.email} (no error raised)')
        
        # Always return success message (security: don't reveal if email was sent)
        return Response(
            {'message': 'If an account exists with this email, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        # Log the error but still return success for security
        logger.error(f'Failed to send password reset email to {user.email}: {str(e)}', exc_info=True)
        # Still return success to not reveal if user exists
        return Response(
            {'message': 'If an account exists with this email, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Reset password with token"""
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uid, token, new_password]):
        return Response(
            {'error': 'uid, token, and new_password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'error': 'Invalid reset link'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not default_token_generator.check_token(user, token):
        return Response(
            {'error': 'Invalid or expired reset link'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate password
    from django.contrib.auth.password_validation import validate_password
    try:
        validate_password(new_password, user)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Set new password
    user.set_password(new_password)
    user.save()
    
    # Send confirmation email
    try:
        send_mail(
            subject='Password Reset Successful',
            message=f'''
Hello {user.get_full_name() or user.username},

Your password has been successfully reset. If you did not make this change, please contact support immediately.

Best regards,
TopSkill LMS Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        pass
    
    return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_login(request):
    """Google OAuth login endpoint - accepts ID token from Google Sign-In"""
    from google.oauth2 import id_token
    from google.auth.transport import requests
    import os
    
    # Accept 'token', 'credential', or 'id_token' for compatibility
    token = request.data.get('token') or request.data.get('credential') or request.data.get('id_token')
    
    if not token:
        return Response(
            {'error': 'Google ID token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Verify the token
        GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
        
        if not GOOGLE_CLIENT_ID:
            return Response(
                {'error': 'Google OAuth is not configured on the server'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Verify the ID token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        # Get user info from Google
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        google_id = idinfo.get('sub')
        picture = idinfo.get('picture', '')
        
        if not email:
            return Response(
                {'error': 'Email not provided by Google'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            # Update user info if needed
            if not user.first_name and first_name:
                user.first_name = first_name
            if not user.last_name and last_name:
                user.last_name = last_name
            user.save()
        except User.DoesNotExist:
            # Create new user
            username = email.split('@')[0]
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                is_active=True
            )
            
            # Create cart for new user
            Cart.objects.get_or_create(user=user)
        
        # Check if user account is active
        if not user.is_active:
            return Response(
                {'error': 'Your account has been deactivated. Please contact support.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        # Invalid token
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f'Google token verification error: {str(e)}')
        return Response(
            {'error': f'Invalid Google token: {str(e)}'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        import logging
        import traceback
        logger = logging.getLogger(__name__)
        error_trace = traceback.format_exc()
        logger.error(f'Google login error: {str(e)}\n{error_trace}')
        return Response(
            {'error': f'Google authentication failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )





