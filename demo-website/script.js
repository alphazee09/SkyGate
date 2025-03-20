document.addEventListener('DOMContentLoaded', function() {
    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
    
    // File upload functionality
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const resultArea = document.getElementById('resultArea');
    const loadingArea = document.getElementById('loadingArea');
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');
    const previewImage = document.getElementById('previewImage');
    const resultVerdict = document.getElementById('resultVerdict');
    const confidenceBar = document.getElementById('confidenceBar');
    const confidenceText = document.getElementById('confidenceText');
    const vitScore = document.getElementById('vitScore');
    const resnetScore = document.getElementById('resnetScore');
    const metadataScore = document.getElementById('metadataScore');
    const pixelScore = document.getElementById('pixelScore');
    
    // Upload area click handler
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // File input change handler
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            handleFile(this.files[0]);
        }
    });
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    // New analysis button handler
    newAnalysisBtn.addEventListener('click', function() {
        resultArea.style.display = 'none';
        uploadArea.style.display = 'block';
        fileInput.value = '';
    });
    
    // Handle the uploaded file
    function handleFile(file) {
        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please upload an image file');
            return;
        }
        
        // Display loading state
        uploadArea.style.display = 'none';
        loadingArea.style.display = 'block';
        
        // Create a URL for the file
        const fileURL = URL.createObjectURL(file);
        previewImage.src = fileURL;
        
        // Simulate API call with setTimeout
        setTimeout(function() {
            // Hide loading, show results
            loadingArea.style.display = 'none';
            resultArea.style.display = 'block';
            
            // Generate random detection results for demo purposes
            const isAI = Math.random() > 0.5;
            const confidenceScore = Math.random() * 0.3 + (isAI ? 0.7 : 0.2); // Higher confidence for AI
            
            // Set verdict
            resultVerdict.className = isAI ? 'result-verdict verdict-ai' : 'result-verdict verdict-real';
            resultVerdict.textContent = isAI ? 'AI-Generated Content Detected' : 'Real Content Detected';
            
            // Set confidence score
            const confidencePercent = Math.round(confidenceScore * 100);
            confidenceBar.style.width = `${confidencePercent}%`;
            confidenceBar.style.backgroundColor = isAI ? var(--error-color) : var(--success-color);
            confidenceText.textContent = `${confidencePercent}%`;
            
            // Set individual method scores
            const vitScoreValue = Math.round((Math.random() * 0.2 + (isAI ? 0.7 : 0.1)) * 100);
            const resnetScoreValue = Math.round((Math.random() * 0.2 + (isAI ? 0.6 : 0.2)) * 100);
            const metadataScoreValue = Math.round((Math.random() * 0.3 + (isAI ? 0.5 : 0.1)) * 100);
            const pixelScoreValue = Math.round((Math.random() * 0.2 + (isAI ? 0.7 : 0.2)) * 100);
            
            vitScore.textContent = `${vitScoreValue}%`;
            resnetScore.textContent = `${resnetScoreValue}%`;
            metadataScore.textContent = `${metadataScoreValue}%`;
            pixelScore.textContent = `${pixelScoreValue}%`;
            
            // Set score colors
            vitScore.style.color = vitScoreValue > 50 ? var(--error-color) : var(--success-color);
            resnetScore.style.color = resnetScoreValue > 50 ? var(--error-color) : var(--success-color);
            metadataScore.style.color = metadataScoreValue > 50 ? var(--error-color) : var(--success-color);
            pixelScore.style.color = pixelScoreValue > 50 ? var(--error-color) : var(--success-color);
        }, 2000); // 2 second delay to simulate processing
    }
    
    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    const submitBtn = document.getElementById('submitBtn');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            // Simple validation
            if (!nameInput.value || !emailInput.value || !messageInput.value) {
                alert('Please fill in all fields');
                return;
            }
            
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            // Simulate form submission
            setTimeout(function() {
                // Reset form
                contactForm.reset();
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
                
                // Show success message
                alert('Thank you for your message! We will get back to you soon.');
            }, 1500);
        });
    }
    
    // Fix CSS variable reference in the handleFile function
    const root = document.documentElement;
    const errorColor = getComputedStyle(root).getPropertyValue('--error-color').trim();
    const successColor = getComputedStyle(root).getPropertyValue('--success-color').trim();
    
    // Replace the var(--color) references with actual values
    window.var = function(varName) {
        if (varName === '--error-color') return errorColor;
        if (varName === '--success-color') return successColor;
        return '';
    };
});
