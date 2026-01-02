import hashlib
import hmac
import urllib.parse
from django.conf import settings
from django.urls import reverse
import requests
import json
from typing import List, Dict, Optional


class PayFastService:
    """Service for PayFast payment integration"""
    
    def __init__(self):
        self.merchant_id = settings.PAYFAST_MERCHANT_ID
        self.merchant_key = settings.PAYFAST_MERCHANT_KEY
        self.passphrase = settings.PAYFAST_PASSPHRASE
        self.sandbox = settings.PAYFAST_SANDBOX
        self.url = settings.PAYFAST_URL
        self.return_url = settings.PAYFAST_RETURN_URL
        self.cancel_url = settings.PAYFAST_CANCEL_URL
        self.notify_url = settings.PAYFAST_NOTIFY_URL
    
    def generate_payment_url(self, payment) -> str:
        """Generate PayFast payment URL"""
        from .models import Payment
        
        # Validate credentials
        if not self.merchant_id or not self.merchant_key:
            raise ValueError(
                "PayFast credentials not configured. Please set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY environment variables."
            )
        
        # Get item name and description from cart or course
        if hasattr(payment, 'cart') and payment.cart:
            # Cart-based payment - use cart items
            items = payment.cart.items.all()
            if items.exists():
                item_names = [item.course.title for item in items[:3]]  # First 3 courses
                item_name = f"Cart: {', '.join(item_names)}"
                item_description = f"{items.count()} course(s) in cart"
            else:
                item_name = "Shopping Cart"
                item_description = "Course enrollment"
        elif hasattr(payment, 'course') and payment.course:
            # Single course payment
            item_name = payment.course.title
            item_description = payment.course.description[:255] if payment.course.description else ''
        else:
            item_name = "Course Enrollment"
            item_description = "Online course"
        
        # Prepare payment data
        data = {
            'merchant_id': self.merchant_id,
            'merchant_key': self.merchant_key,
            'return_url': self.return_url,
            'cancel_url': self.cancel_url,
            'notify_url': self.notify_url,
            'name_first': payment.user.first_name or '',
            'name_last': payment.user.last_name or '',
            'email_address': payment.user.email or '',
            'cell_number': '',  # Add phone number field if needed
            'm_payment_id': str(payment.id),
            'amount': str(payment.amount),
            'item_name': item_name,
            'item_description': item_description,
        }
        
        # Generate signature
        signature = self._generate_signature(data)
        data['signature'] = signature
        
        # Build URL
        query_string = urllib.parse.urlencode(data)
        payment_url = f"{self.url}?{query_string}"
        
        return payment_url
    
    def _generate_signature(self, data: dict) -> str:
        """Generate PayFast signature"""
        # Remove empty values and signature
        pf_param_string = '&'.join([
            f"{key}={value}" for key, value in sorted(data.items())
            if value and key != 'signature'
        ])
        
        # Add passphrase if provided
        if self.passphrase:
            pf_param_string += f"&passphrase={self.passphrase}"
        
        # Generate MD5 hash
        signature = hashlib.md5(pf_param_string.encode()).hexdigest()
        return signature
    
    def verify_signature(self, data: dict) -> bool:
        """Verify PayFast signature"""
        received_signature = data.get('signature', '')
        calculated_signature = self._generate_signature(data)
        return received_signature == calculated_signature
    
    def handle_notification(self, data: dict) -> dict:
        """Handle PayFast payment notification"""
        from .models import Payment
        
        # Verify signature
        if not self.verify_signature(data):
            return {'success': False, 'error': 'Invalid signature'}
        
        payment_id = data.get('m_payment_id')
        payment_status = data.get('payment_status')
        pf_payment_id = data.get('pf_payment_id')
        
        try:
            payment = Payment.objects.get(id=payment_id)
            
            if payment_status == 'COMPLETE':
                payment.status = 'paid'
                payment.payfast_payment_id = pf_payment_id
                payment.payfast_signature = data.get('signature', '')
                payment.metadata = data
                payment.save()
                
                # Activate enrollment if payment successful
                enrollment = payment.user.enrollments.filter(
                    course=payment.course,
                    status='pending'
                ).first()
                
                if enrollment:
                    enrollment.status = 'active'
                    enrollment.save()
                    
                    # Auto-assign to batch if needed
                    if payment.course.modality in ['physical', 'hybrid']:
                        enrollment.assign_to_batch()
                
                return {'success': True, 'payment_id': payment.id}
            else:
                payment.status = 'failed'
                payment.metadata = data
                payment.save()
                return {'success': False, 'error': f'Payment failed: {payment_status}'}
        
        except Payment.DoesNotExist:
            return {'success': False, 'error': 'Payment not found'}


class GroqAIService:
    """Service for Groq AI integration"""
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.api_url = settings.GROQ_API_URL
    
    def get_course_recommendations(self, course_id: int, user_enrollments: List[int], limit: int = 5) -> List[int]:
        """Get AI-powered course recommendations"""
        from .models import Course
        
        if not self.api_key:
            # Fallback to simple recommendations if API key not set
            return self._get_simple_recommendations(course_id, user_enrollments, limit)
        
        try:
            # Get course details
            course = Course.objects.get(id=course_id)
            
            # Get user's enrolled courses
            enrolled_courses = Course.objects.filter(id__in=user_enrollments)
            
            # Prepare prompt
            prompt = self._build_recommendation_prompt(course, enrolled_courses)
            
            # Call Groq API
            response = self._call_groq_api(prompt)
            
            # Parse response and get course IDs
            recommended_ids = self._parse_recommendations(response, limit)
            
            return recommended_ids
        
        except Exception as e:
            # Fallback to simple recommendations on error
            return self._get_simple_recommendations(course_id, user_enrollments, limit)
    
    def _build_recommendation_prompt(self, course, enrolled_courses) -> str:
        """Build prompt for Groq API"""
        enrolled_titles = [c.title for c in enrolled_courses]
        
        prompt = f"""Based on the following course and user's enrollment history, recommend similar courses.

Current Course: {course.title}
Description: {course.description[:500] if course.description else 'N/A'}
Categories: {', '.join([cat.name for cat in course.categories.all()[:3]])}

User's Enrolled Courses: {', '.join(enrolled_titles[:5]) if enrolled_titles else 'None'}

Please recommend courses that:
1. Are related to the current course topic
2. Complement the user's learning path
3. Are suitable for someone interested in {course.title}

Return only course titles, one per line."""
        
        return prompt
    
    def _call_groq_api(self, prompt: str) -> dict:
        """Call Groq API"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': 'llama-3.1-70b-versatile',
            'messages': [
                {'role': 'system', 'content': 'You are a helpful course recommendation assistant.'},
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.7,
            'max_tokens': 500
        }
        
        response = requests.post(self.api_url, headers=headers, json=data, timeout=10)
        response.raise_for_status()
        
        return response.json()
    
    def _parse_recommendations(self, response: dict, limit: int) -> List[int]:
        """Parse Groq API response and get course IDs"""
        from .models import Course
        
        try:
            content = response['choices'][0]['message']['content']
            recommended_titles = [line.strip() for line in content.split('\n') if line.strip()][:limit]
            
            # Find courses by title
            course_ids = []
            for title in recommended_titles:
                course = Course.objects.filter(
                    title__icontains=title,
                    is_active=True
                ).first()
                if course:
                    course_ids.append(course.id)
            
            return course_ids[:limit]
        
        except (KeyError, IndexError):
            return []
    
    def _get_simple_recommendations(self, course_id: int, user_enrollments: List[int], limit: int) -> List[int]:
        """Fallback simple recommendation algorithm"""
        from .models import Course
        
        try:
            course = Course.objects.get(id=course_id)
            
            # Get courses in same categories
            categories = course.categories.all()
            recommended = Course.objects.filter(
                categories__in=categories,
                is_active=True
            ).exclude(
                id__in=[course_id] + user_enrollments
            ).distinct()[:limit]
            
            return list(recommended.values_list('id', flat=True))
        
        except Course.DoesNotExist:
            return []
    
    def generate_chatbot_response(self, user_message: str, context: Optional[Dict] = None) -> str:
        """Generate chatbot response using Groq AI"""
        if not self.api_key:
            return "I'm sorry, the AI assistant is not available at the moment."
        
        try:
            system_prompt = """You are a helpful assistant for TopSkill LMS. You help students with:
- Course information and schedules
- Enrollment questions
- Batch assignments
- Progress tracking
- General LMS navigation

Be friendly, concise, and helpful."""
            
            user_prompt = user_message
            if context:
                user_prompt += f"\n\nContext: {json.dumps(context)}"
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': 'llama-3.1-70b-versatile',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt}
                ],
                'temperature': 0.7,
                'max_tokens': 500
            }
            
            response = requests.post(self.api_url, headers=headers, json=data, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            return result['choices'][0]['message']['content']
        
        except Exception as e:
            return f"I'm sorry, I encountered an error. Please try again later."



