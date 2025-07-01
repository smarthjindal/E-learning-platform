document.addEventListener('DOMContentLoaded', function() {
    // 1. Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            const isActive = navList.classList.contains('active');
            menuIcon.style.display = isActive ? 'none' : 'block';
            closeIcon.style.display = isActive ? 'block' : 'none';
        });
    }

    // 2. Navigation Highlighting
    function highlightActiveNav() {
        const currentPage = location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            link.classList.toggle('active', 
                currentPage === linkPage || 
                (currentPage.includes('course-detail') && linkPage === 'courses.html')
            );
        });
    }
    highlightActiveNav();
    window.addEventListener('popstate', highlightActiveNav);

    // 3. Module Accordion Functionality
    const moduleHeaders = document.querySelectorAll('.module-header');
    moduleHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('i');
            const isHidden = content.style.display === 'none' || !content.style.display;
            
            content.style.display = isHidden ? 'block' : 'none';
            icon.classList.toggle('fa-chevron-down', !isHidden);
            icon.classList.toggle('fa-chevron-up', isHidden);
        });
    });

    // 4. Open First Module by Default
    const firstModuleContent = document.querySelector('.module-content');
    if (firstModuleContent) {
        firstModuleContent.style.display = 'block';
        const firstIcon = document.querySelector('.module-header i');
        if (firstIcon) {
            firstIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        }
    }

    // 5. Course Card Hover Effects
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-10px)');
        card.addEventListener('mouseleave', () => card.style.transform = '');
    });

    // 6. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 7. Progress Bars Animation
    document.querySelectorAll('.progress').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => bar.style.width = width, 100);
    });

    // 8. Course Progress Tracking
    const courseProgress = {
        init() {
            this.loadProgress();
            this.setupLessonTracking();
            if (document.querySelector('.course-player')) {
                this.updateCourseProgress();
            }
        },
        
        loadProgress() {
            const saved = JSON.parse(localStorage.getItem('courseProgress')) || {};
            document.querySelectorAll('.course-card').forEach(card => {
                const courseId = card.dataset.courseId;
                if (saved[courseId]) {
                    const progressBar = card.querySelector('.progress-bar');
                    const progressText = card.querySelector('.course-progress span');
                    if (progressBar && progressText) {
                        progressBar.style.width = saved[courseId];
                        progressText.textContent = `${saved[courseId]} Complete`;
                    }
                }
            });
        },
        
        setupLessonTracking() {
            document.querySelectorAll('.lesson').forEach(lesson => {
                lesson.addEventListener('click', () => {
                    lesson.classList.toggle('completed');
                    this.updateCourseProgress();
                });
            });
        },
        
        updateCourseProgress() {
            const lessons = document.querySelectorAll('.lesson');
            const completed = document.querySelectorAll('.lesson.completed');
            const percent = Math.round((completed.length / lessons.length) * 100);
            
            const percentElement = document.getElementById('progress-percent');
            const fillElement = document.querySelector('.progress-fill');
            const courseId = document.querySelector('.course-player')?.dataset.courseId;
            
            if (percentElement) percentElement.textContent = `${percent}%`;
            if (fillElement) fillElement.style.width = `${percent}%`;
            if (courseId) this.saveProgress(courseId, `${percent}%`);
        },
        
        saveProgress(courseId, percent) {
            const progress = JSON.parse(localStorage.getItem('courseProgress')) || {};
            progress[courseId] = percent;
            localStorage.setItem('courseProgress', JSON.stringify(progress));
        }
    };
    courseProgress.init();

    // 9. Video Embedding
    const videoPlayer = {
        init() {
            if (!document.querySelector('.video-container')) return;
            
            this.elements = {
                container: document.querySelector('.video-container'),
                placeholder: document.querySelector('.video-placeholder'),
                buttons: document.querySelectorAll('.source-btn')
            };
            
            this.setupSourceButtons();
            this.loadDefaultVideo();
        },
        
        setupSourceButtons() {
            this.elements.buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.elements.buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.loadVideo(
                        btn.dataset.source, 
                        btn.dataset.source === 'selfhosted' ? btn.dataset.videoSrc : btn.dataset.videoId
                    );
                });
            });
        },
        
        loadDefaultVideo() {
            const defaultBtn = document.querySelector('.source-btn.active');
            if (defaultBtn) {
                this.loadVideo(
                    defaultBtn.dataset.source,
                    defaultBtn.dataset.source === 'selfhosted' 
                        ? defaultBtn.dataset.videoSrc 
                        : defaultBtn.dataset.videoId
                );
            }
        },
        
        loadVideo(source, videoId) {
            this.clearExistingVideo();
            this.elements.placeholder.style.display = 'none';
            
            const player = this.createPlayer(source, videoId);
            if (player) {
                this.elements.container.insertBefore(player, this.elements.placeholder);
            }
        },
        
        clearExistingVideo() {
            const existing = this.elements.container.querySelector('iframe, video');
            if (existing) existing.remove();
        },
        
        createPlayer(source, videoId) {
            const player = document.createElement(source === 'selfhosted' ? 'video' : 'iframe');
            
            if (source === 'youtube') {
                player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                player.setAttribute('allowfullscreen', '');
                player.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            } 
            else if (source === 'vimeo') {
                player.src = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
                player.setAttribute('allowfullscreen', '');
                player.setAttribute('allow', 'autoplay; fullscreen');
            }
            else if (source === 'selfhosted') {
                player.src = videoId;
                player.controls = true;
                player.autoplay = true;
            }
            
            return player;
        }
    };
    videoPlayer.init();

    // 10. Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Simple validation
            if (!name || !email || !subject || !message) {
                alert('Please fill in all required fields');
                return;
            }

            // Show success alert
            const alertBox = document.getElementById('formAlert');
            const alertMessage = document.getElementById('alertMessage');
            
            if (alertBox && alertMessage) {
                alertMessage.textContent = `Thank you, ${name}! Your message has been sent.`;
                alertBox.style.display = 'flex';
                
                // Hide form temporarily
                contactForm.style.opacity = '0.5';
                contactForm.style.pointerEvents = 'none';
                
                // Reset form after delay
                setTimeout(() => {
                    contactForm.reset();
                    contactForm.style.opacity = '1';
                    contactForm.style.pointerEvents = 'auto';
                    alertBox.style.display = 'none';
                }, 3000);
            }
            
            // In a real application, you would send the data to a server here
            // fetch('/send-message', {
            //     method: 'POST',
            //     body: JSON.stringify({name, email, subject, message}),
            //     headers: { 'Content-Type': 'application/json' }
            // })
            // .then(response => response.json())
            // .then(data => console.log(data))
            // .catch(error => console.error('Error:', error));
        });
    }

    // 11. Team Member Hover Effects
    document.querySelectorAll('.team-member').forEach(member => {
        member.addEventListener('mouseenter', () => member.style.transform = 'translateY(-5px)');
        member.addEventListener('mouseleave', () => member.style.transform = '');
    });

    // 12. Testimonial Card Hover Effects
    document.querySelectorAll('.testimonial-card').forEach(card => {
        card.addEventListener('mouseenter', () => 
            card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)');
        card.addEventListener('mouseleave', () => 
            card.style.boxShadow = 'var(--box-shadow)');
    });
});

// YouTube API (Add this right before </body> in course-detail.html)
/*
<script>
  let player;
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('course-video', {
      events: { 'onStateChange': onPlayerStateChange }
    });
  }
  function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
      document.querySelector('.lesson.current')?.classList.add('completed');
      // Trigger your progress update function here
    }
  }
</script>
*/
