from rest_framework import permissions


def is_instructor(user):
    """Check if user is an instructor (has at least one course as instructor)"""
    if not user or not user.is_authenticated:
        return False
    return user.instructed_courses.exists()


def is_admin(user):
    """Check if user is admin (is_staff)"""
    if not user or not user.is_authenticated:
        return False
    return user.is_staff


def is_admin_or_instructor(user):
    """Check if user is admin or instructor"""
    return is_admin(user) or is_instructor(user)


class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow instructors to edit courses.
    Read permissions are allowed to any request.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to instructors or staff
        return is_admin_or_instructor(request.user)


class IsStudentOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow students to perform certain actions.
    Read permissions are allowed to any request.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to authenticated users (students)
        return request.user.is_authenticated


class IsAdminOrInstructor(permissions.BasePermission):
    """
    Permission class that allows both admin (is_staff) and instructors.
    Instructors can only access their own data.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return is_admin_or_instructor(request.user)
    
    def has_object_permission(self, request, view, obj):
        """Check object-level permission"""
        # Admins can access everything
        if is_admin(request.user):
            return True
        
        # Instructors can only access their own courses and related data
        if is_instructor(request.user):
            # Check if object is a course
            if hasattr(obj, 'instructor'):
                return obj.instructor == request.user
            # Check if object belongs to a course
            if hasattr(obj, 'course'):
                return obj.course.instructor == request.user
            # Check if object is an enrollment (student enrolled in instructor's course)
            if hasattr(obj, 'course'):
                return obj.course.instructor == request.user
        
        return False
