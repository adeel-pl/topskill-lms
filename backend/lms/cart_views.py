from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Cart, CartItem, Course, Enrollment, Payment
from .serializers import CartSerializer, CartItemSerializer, CartItemCreateSerializer
from .services import PayFastService


class CartViewSet(viewsets.ModelViewSet):
    """ViewSet for shopping cart"""
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return Cart.objects.filter(id=cart.id)
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
    def list(self, request, *args, **kwargs):
        """Override list to return single cart object instead of list"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='add-item')
    def add_item(self, request):
        """Add course to cart"""
        course_id = request.data.get('course_id')
        
        if not course_id:
            return Response(
                {'error': 'course_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            course = Course.objects.get(id=course_id, is_active=True)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already enrolled
        if Enrollment.objects.filter(user=request.user, course=course, status__in=['active', 'completed']).exists():
            return Response(
                {'error': 'Already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already in cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, course=course)
        
        if not created:
            return Response(
                {'error': 'Course already in cart'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], url_path='remove-item')
    def remove_item(self, request):
        """Remove course from cart"""
        course_id = request.data.get('course_id')
        
        if not course_id:
            return Response(
                {'error': 'course_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        CartItem.objects.filter(cart=cart, course_id=course_id).delete()
        
        return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='clear')
    def clear_cart(self, request):
        """Clear all items from cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        
        return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        """Checkout cart and create payment"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        items = cart.items.all()
        
        if not items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate total
        total = cart.get_total()
        
        # Check if PayFast is configured
        from django.conf import settings
        if not settings.PAYFAST_MERCHANT_ID or not settings.PAYFAST_MERCHANT_KEY:
            # For development: Auto-enroll without payment
            from .models import Enrollment
            enrollments_created = []
            for item in items:
                enrollment, created = Enrollment.objects.get_or_create(
                    user=request.user,
                    course=item.course,
                    defaults={'status': 'active'}
                )
                if created:
                    enrollments_created.append(enrollment)
            
            # Clear cart after enrollment
            cart.items.all().delete()
            
            return Response({
                'message': 'Payment gateway not configured. Courses enrolled directly for development.',
                'enrolled': True,
                'enrollments_count': len(enrollments_created),
                'total': total,
                'items_count': items.count()
            }, status=status.HTTP_200_OK)
        
        # Create payment
        payment = Payment.objects.create(
            user=request.user,
            cart=cart,
            amount=total,
            status='initiated'
        )
        
        # Generate PayFast payment URL
        try:
            payfast_service = PayFastService()
            payment_url = payfast_service.generate_payment_url(payment)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to generate payment URL: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'payment_id': payment.id,
            'payment_url': payment_url,
            'total': total,
            'items_count': items.count()
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        """Get cart item count"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        return Response({'count': cart.items.count()}, status=status.HTTP_200_OK)



