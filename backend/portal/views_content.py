"""
Course Content Management Views (Sections, Lectures, Questions, etc.)
All CRUD operations for instructors to manage complete course content
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Sum
from django.utils import timezone

from lms.models import (
    Course, CourseSection, Lecture, Quiz, Question, QuestionOption,
    Assignment, Announcement, Resource, QandA, Review
)
from lms.permissions import is_instructor


# ============================================
# COURSE SECTIONS CRUD
# ============================================

@login_required
def instructor_section_create(request, course_id):
    """Create new section for a course"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    
    if request.method == 'POST':
        section = CourseSection.objects.create(
            course=course,
            title=request.POST.get('title'),
            order=request.POST.get('order', 1),
            is_preview=request.POST.get('is_preview') == 'on',
        )
        messages.success(request, f"Section '{section.title}' created successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'form_type': 'create',
    }
    return render(request, 'portal/instructor/sections/section_form.html', context)


@login_required
def instructor_section_edit(request, course_id, section_id):
    """Edit section"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    section = get_object_or_404(CourseSection, id=section_id, course=course)
    
    if request.method == 'POST':
        section.title = request.POST.get('title')
        section.order = request.POST.get('order', 1)
        section.is_preview = request.POST.get('is_preview') == 'on'
        section.save()
        messages.success(request, f"Section '{section.title}' updated successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'section': section,
        'form_type': 'edit',
    }
    return render(request, 'portal/instructor/sections/section_form.html', context)


@login_required
def instructor_section_delete(request, course_id, section_id):
    """Delete section"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    section = get_object_or_404(CourseSection, id=section_id, course=course)
    
    if request.method == 'POST':
        title = section.title
        section.delete()
        messages.success(request, f"Section '{title}' deleted successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'section': section,
    }
    return render(request, 'portal/instructor/sections/section_delete.html', context)


# ============================================
# COURSE LECTURES CRUD
# ============================================

@login_required
def instructor_lecture_create(request, course_id, section_id):
    """Create new lecture"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    section = get_object_or_404(CourseSection, id=section_id, course=course)
    
    if request.method == 'POST':
        lecture = Lecture.objects.create(
            section=section,
            title=request.POST.get('title'),
            description=request.POST.get('description', ''),
            order=request.POST.get('order', 1),
            youtube_video_id=request.POST.get('youtube_video_id', ''),
            content_url=request.POST.get('content_url', ''),
            video_type=request.POST.get('video_type', 'youtube'),
            duration_minutes=request.POST.get('duration_minutes', 0) or 0,
            is_preview=request.POST.get('is_preview') == 'on',
        )
        messages.success(request, f"Lecture '{lecture.title}' created successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'section': section,
        'form_type': 'create',
    }
    return render(request, 'portal/instructor/lectures/lecture_form.html', context)


@login_required
def instructor_lecture_edit(request, course_id, section_id, lecture_id):
    """Edit lecture"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    section = get_object_or_404(CourseSection, id=section_id, course=course)
    lecture = get_object_or_404(Lecture, id=lecture_id, section=section)
    
    if request.method == 'POST':
        lecture.title = request.POST.get('title')
        lecture.description = request.POST.get('description', '')
        lecture.order = request.POST.get('order', 1)
        lecture.youtube_video_id = request.POST.get('youtube_video_id', '')
        lecture.content_url = request.POST.get('content_url', '')
        lecture.video_type = request.POST.get('video_type', 'youtube')
        lecture.duration_minutes = request.POST.get('duration_minutes', 0) or 0
        lecture.is_preview = request.POST.get('is_preview') == 'on'
        lecture.save()
        messages.success(request, f"Lecture '{lecture.title}' updated successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'section': section,
        'lecture': lecture,
        'form_type': 'edit',
    }
    return render(request, 'portal/instructor/lectures/lecture_form.html', context)


@login_required
def instructor_lecture_delete(request, course_id, section_id, lecture_id):
    """Delete lecture"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    section = get_object_or_404(CourseSection, id=section_id, course=course)
    lecture = get_object_or_404(Lecture, id=lecture_id, section=section)
    
    if request.method == 'POST':
        title = lecture.title
        lecture.delete()
        messages.success(request, f"Lecture '{title}' deleted successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'section': section,
        'lecture': lecture,
    }
    return render(request, 'portal/instructor/lectures/lecture_delete.html', context)


# ============================================
# QUIZ QUESTIONS CRUD
# ============================================

@login_required
def instructor_question_create(request, quiz_id):
    """Create new question for a quiz"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    quiz = get_object_or_404(Quiz, id=quiz_id, course__instructor=request.user)
    
    if request.method == 'POST':
        question_type = request.POST.get('question_type', 'multiple_choice')
        
        question = Question.objects.create(
            quiz=quiz,
            question_text=request.POST.get('question_text'),
            question_type=question_type,
            points=request.POST.get('points', 1),
            order=request.POST.get('order', 1),
        )
        
        # Handle options based on question type
        if question_type == 'multiple_choice':
            # Create options
            option_texts = request.POST.getlist('option_text')
            is_corrects = request.POST.getlist('is_correct')
            
            for idx, option_text in enumerate(option_texts):
                if option_text.strip():
                    QuestionOption.objects.create(
                        question=question,
                        option_text=option_text,
                        is_correct=str(idx) in is_corrects,
                        order=idx + 1,
                    )
        elif question_type == 'true_false':
            # Create True/False options
            correct_answer = request.POST.get('true_false_answer') == 'true'
            QuestionOption.objects.create(question=question, option_text='True', is_correct=correct_answer, order=1)
            QuestionOption.objects.create(question=question, option_text='False', is_correct=not correct_answer, order=2)
        elif question_type == 'short_answer':
            # Store correct answer in correct_answer field
            question.correct_answer = request.POST.get('short_answer_text', '')
            question.save()
        
        messages.success(request, f"Question created successfully!")
        return redirect('portal:instructor_quiz_detail', quiz_id=quiz.id)
    
    context = {
        'quiz': quiz,
        'form_type': 'create',
    }
    return render(request, 'portal/instructor/questions/question_form.html', context)


@login_required
def instructor_question_edit(request, quiz_id, question_id):
    """Edit question"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    quiz = get_object_or_404(Quiz, id=quiz_id, course__instructor=request.user)
    question = get_object_or_404(Question, id=question_id, quiz=quiz)
    
    if request.method == 'POST':
        question_type = request.POST.get('question_type', 'multiple_choice')
        
        question.question_text = request.POST.get('question_text')
        question.question_type = question_type
        question.points = request.POST.get('points', 1)
        question.order = request.POST.get('order', 1)
        question.save()
        
        # Delete old options
        question.options.all().delete()
        
        # Create new options
        if question_type == 'multiple_choice':
            option_texts = request.POST.getlist('option_text')
            is_corrects = request.POST.getlist('is_correct')
            
            for idx, option_text in enumerate(option_texts):
                if option_text.strip():
                    QuestionOption.objects.create(
                        question=question,
                        option_text=option_text,
                        is_correct=str(idx) in is_corrects,
                        order=idx + 1,
                    )
        elif question_type == 'true_false':
            correct_answer = request.POST.get('true_false_answer') == 'true'
            QuestionOption.objects.create(question=question, option_text='True', is_correct=correct_answer, order=1)
            QuestionOption.objects.create(question=question, option_text='False', is_correct=not correct_answer, order=2)
        elif question_type == 'short_answer':
            question.correct_answer = request.POST.get('short_answer_text', '')
            question.save()
        
        messages.success(request, f"Question updated successfully!")
        return redirect('portal:instructor_quiz_detail', quiz_id=quiz.id)
    
    context = {
        'quiz': quiz,
        'question': question,
        'form_type': 'edit',
    }
    return render(request, 'portal/instructor/questions/question_form.html', context)


@login_required
def instructor_question_delete(request, quiz_id, question_id):
    """Delete question"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    quiz = get_object_or_404(Quiz, id=quiz_id, course__instructor=request.user)
    question = get_object_or_404(Question, id=question_id, quiz=quiz)
    
    if request.method == 'POST':
        question.delete()
        messages.success(request, "Question deleted successfully!")
        return redirect('portal:instructor_quiz_detail', quiz_id=quiz.id)
    
    context = {
        'quiz': quiz,
        'question': question,
    }
    return render(request, 'portal/instructor/questions/question_delete.html', context)


# ============================================
# ANNOUNCEMENTS CRUD
# ============================================

@login_required
def instructor_announcement_create(request, course_id):
    """Create announcement"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    
    if request.method == 'POST':
        announcement = Announcement.objects.create(
            course=course,
            title=request.POST.get('title'),
            content=request.POST.get('content', ''),
            is_pinned=request.POST.get('is_pinned') == 'on',
            is_active=request.POST.get('is_active') == 'on',
            created_by=request.user,
        )
        messages.success(request, f"Announcement '{announcement.title}' created successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'form_type': 'create',
    }
    return render(request, 'portal/instructor/announcements/announcement_form.html', context)


@login_required
def instructor_announcement_edit(request, course_id, announcement_id):
    """Edit announcement"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    announcement = get_object_or_404(Announcement, id=announcement_id, course=course)
    
    if request.method == 'POST':
        announcement.title = request.POST.get('title')
        announcement.content = request.POST.get('content', '')
        announcement.is_pinned = request.POST.get('is_pinned') == 'on'
        announcement.is_active = request.POST.get('is_active') == 'on'
        announcement.save()
        messages.success(request, f"Announcement '{announcement.title}' updated successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'announcement': announcement,
        'form_type': 'edit',
    }
    return render(request, 'portal/instructor/announcements/announcement_form.html', context)


@login_required
def instructor_announcement_delete(request, course_id, announcement_id):
    """Delete announcement"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    announcement = get_object_or_404(Announcement, id=announcement_id, course=course)
    
    if request.method == 'POST':
        title = announcement.title
        announcement.delete()
        messages.success(request, f"Announcement '{title}' deleted successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'announcement': announcement,
    }
    return render(request, 'portal/instructor/announcements/announcement_delete.html', context)


# ============================================
# RESOURCES CRUD
# ============================================

@login_required
def instructor_resource_create(request, course_id):
    """Create resource"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    
    if request.method == 'POST':
        resource = Resource.objects.create(
            course=course,
            title=request.POST.get('title'),
            description=request.POST.get('description', ''),
            resource_type=request.POST.get('resource_type', 'other'),
            external_url=request.POST.get('external_url', ''),
            is_active=request.POST.get('is_active') == 'on',
            order=request.POST.get('order', 1),
        )
        
        if 'file' in request.FILES:
            resource.file = request.FILES['file']
            resource.save()
        
        messages.success(request, f"Resource '{resource.title}' created successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'form_type': 'create',
    }
    return render(request, 'portal/instructor/resources/resource_form.html', context)


@login_required
def instructor_resource_edit(request, course_id, resource_id):
    """Edit resource"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    resource = get_object_or_404(Resource, id=resource_id, course=course)
    
    if request.method == 'POST':
        resource.title = request.POST.get('title')
        resource.description = request.POST.get('description', '')
        resource.resource_type = request.POST.get('resource_type', 'other')
        resource.external_url = request.POST.get('external_url', '')
        resource.is_active = request.POST.get('is_active') == 'on'
        resource.order = request.POST.get('order', 1)
        
        if 'file' in request.FILES:
            resource.file = request.FILES['file']
        
        resource.save()
        messages.success(request, f"Resource '{resource.title}' updated successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'resource': resource,
        'form_type': 'edit',
    }
    return render(request, 'portal/instructor/resources/resource_form.html', context)


@login_required
def instructor_resource_delete(request, course_id, resource_id):
    """Delete resource"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    resource = get_object_or_404(Resource, id=resource_id, course=course)
    
    if request.method == 'POST':
        title = resource.title
        resource.delete()
        messages.success(request, f"Resource '{title}' deleted successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'resource': resource,
    }
    return render(request, 'portal/instructor/resources/resource_delete.html', context)


# ============================================
# Q&A CRUD
# ============================================

@login_required
def instructor_qa_create(request, course_id):
    """Create Q&A"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    
    if request.method == 'POST':
        qa = QandA.objects.create(
            course=course,
            question=request.POST.get('question'),
            answer=request.POST.get('answer', ''),
            order=request.POST.get('order', 1),
            is_active=request.POST.get('is_active') == 'on',
        )
        messages.success(request, f"Q&A created successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'form_type': 'create',
    }
    return render(request, 'portal/instructor/qas/qa_form.html', context)


@login_required
def instructor_qa_edit(request, course_id, qa_id):
    """Edit Q&A"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    qa = get_object_or_404(QandA, id=qa_id, course=course)
    
    if request.method == 'POST':
        qa.question = request.POST.get('question')
        qa.answer = request.POST.get('answer', '')
        qa.order = request.POST.get('order', 1)
        qa.is_active = request.POST.get('is_active') == 'on'
        qa.save()
        messages.success(request, f"Q&A updated successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'qa': qa,
        'form_type': 'edit',
    }
    return render(request, 'portal/instructor/qas/qa_form.html', context)


@login_required
def instructor_qa_delete(request, course_id, qa_id):
    """Delete Q&A"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    qa = get_object_or_404(QandA, id=qa_id, course=course)
    
    if request.method == 'POST':
        qa.delete()
        messages.success(request, "Q&A deleted successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'qa': qa,
    }
    return render(request, 'portal/instructor/qas/qa_delete.html', context)

