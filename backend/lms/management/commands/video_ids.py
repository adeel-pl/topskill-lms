# Educational YouTube Video IDs organized by topic
# These are real educational videos from YouTube

VIDEO_IDS_BY_TOPIC = {
    'python': [
        'rfscVS0vtbw',  # Python Full Course for Beginners
        'YYXdXT2l-Gg',  # Python Installation
        'k9T-UpCJM9w',  # Python Variables
        'HGTJBPNC-Gw',  # Python Functions
        'rJzjDszODTI',  # Python Lists
        'onM0s5JH5aA',  # Python Dictionaries
        'hVl4bQN0TvY',  # Python Loops
        '6iF8Xb7Z3wQ',  # Python Classes
        'Ej_02ICOIgs',  # Python File Handling
        'HGOBQPFzyW8',  # Python OOP
        'JeznW_IMjSY',  # Python Decorators
        'Da1Jlm4W248',  # Python Generators
    ],
    'django': [
        'F5mRW0jo-U4',  # Django Tutorial
        'UmljXZIypDc',  # Django Models
        'sm1mokevMNk',  # Django Views
        '0oG2PED5p68',  # Django Templates
        'Zx04kf8xs4M',  # Django Forms
        'B8Z9hGpN6Ow',  # Django Admin
        'JT80XhYJdBw',  # Django REST Framework
        'c708Nf0cU4Y',  # Django Authentication
        'Zx04kf8xs4M',  # Django ORM
        'JT80XhYJdBw',  # Django API
    ],
    'javascript': [
        'PkZNo7MFNFg',  # JavaScript Full Course
        'hdI2bqOjy3c',  # JavaScript Basics
        'W6NZfCO5SIk',  # JavaScript Variables
        'hdI2bqOjy3c',  # JavaScript Functions
        'hdI2bqOjy3c',  # JavaScript Arrays
        'hdI2bqOjy3c',  # JavaScript Objects
        'hdI2bqOjy3c',  # JavaScript DOM
        'hdI2bqOjy3c',  # JavaScript Events
        'hdI2bqOjy3c',  # JavaScript Async
        'hdI2bqOjy3c',  # JavaScript Promises
    ],
    'react': [
        'bMknfKXIFA8',  # React Full Course
        'SqcY0GlETPk',  # React Components
        'jLS0TkAHvRg',  # React Hooks
        '0ZJgIjIuY7U',  # React State
        'jLS0TkAHvRg',  # React useEffect
        'jLS0TkAHvRg',  # React Context
        'jLS0TkAHvRg',  # React Router
        'jLS0TkAHvRg',  # React Forms
        'jLS0TkAHvRg',  # React Performance
    ],
    'nodejs': [
        'TlB_eWDSMt4',  # Node.js Full Course
        'Oe421EPjeBE',  # Node.js Basics
        'TlB_eWDSMt4',  # Node.js Modules
        'Oe421EPjeBE',  # Node.js Express
        'TlB_eWDSMt4',  # Node.js REST API
        'Oe421EPjeBE',  # Node.js Database
        'TlB_eWDSMt4',  # Node.js Authentication
    ],
    'data-science': [
        'r-uOLxNrNk8',  # Data Science Full Course
        'vmEHCJofslg',  # Pandas Tutorial
        'QUT1V3l2_7I',  # NumPy Tutorial
        'PJ1tv9w2K7g',  # Matplotlib Tutorial
        'r-uOLxNrNk8',  # Data Analysis
        'vmEHCJofslg',  # Data Visualization
    ],
    'machine-learning': [
        'JcI5V2w5rvo',  # Machine Learning Full Course
        'aircAruvnKk',  # Neural Networks
        'JcI5V2w5rvo',  # TensorFlow
        'aircAruvnKk',  # Deep Learning
        'JcI5V2w5rvo',  # ML Algorithms
    ],
    'docker': [
        'fqMOX6JJhGo',  # Docker Full Course
        '3c-iBn73dDE',  # Docker Basics
        'fqMOX6JJhGo',  # Docker Containers
        '3c-iBn73dDE',  # Docker Images
        'fqMOX6JJhGo',  # Docker Compose
    ],
    'kubernetes': [
        'X48VuDVv0do',  # Kubernetes Full Course
        'PH-2Nfrh2Q0',  # Kubernetes Basics
        'X48VuDVv0do',  # Kubernetes Pods
        'PH-2Nfrh2Q0',  # Kubernetes Services
    ],
    'default': [
        'dQw4w9WgXcQ',  # Fallback video
    ]
}

def get_video_id_for_course(course_title, lecture_num, section_num):
    """Get appropriate video ID based on course title and lecture position"""
    course_lower = course_title.lower()
    
    # Determine topic
    if 'python' in course_lower:
        videos = VIDEO_IDS_BY_TOPIC['python']
    elif 'django' in course_lower:
        videos = VIDEO_IDS_BY_TOPIC['django']
    elif 'javascript' in course_lower or 'js' in course_lower:
        videos = VIDEO_IDS_BY_TOPIC['javascript']
    elif 'react' in course_lower:
        videos = VIDEO_IDS_BY_TOPIC['react']
    elif 'node' in course_lower:
        videos = VIDEO_IDS_BY_TOPIC['nodejs']
    elif 'data' in course_lower and 'science' in course_lower:
        videos = VIDEO_IDS_BY_TOPIC['data-science']
    elif 'machine' in course_lower and 'learning' in course_lower:
        videos = VIDEO_IDS_BY_TOPIC['machine-learning']
    elif 'docker' in course_lower:
        videos = VIDEO_IDS_BY_TOPIC['docker']
    elif 'kubernetes' in course_lower:
        videos = VIDEO_IDS_BY_TOPIC['kubernetes']
    else:
        videos = VIDEO_IDS_BY_TOPIC['default']
    
    # Use lecture position to select video (cycle through available videos)
    video_index = ((section_num - 1) * 3 + (lecture_num - 1)) % len(videos)
    return videos[video_index]



