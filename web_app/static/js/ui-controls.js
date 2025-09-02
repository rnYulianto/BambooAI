//--------------------
//  UI CONTROLS MODULE
//--------------------

function initializeUIControls() {
    console.log('Initializing UI controls...');
    
    initializeScrollBehavior();
    initializeMenuOverlay();
    initializePanelCollapse();
    initializeNavigationButtons();
    initializePlanningSwitch();
    initializeSuggestQuestions();
    initializeTextareaResize();
    initializeKeyboardShortcuts();
    initializeGenericToast();
    
    console.log('UI controls initialized');
}

//--------------------
//  SCROLL BEHAVIOR
//--------------------

function initializeScrollBehavior() {
    const streamOutput = document.getElementById('streamOutput');
    const indicator = document.querySelector('.scroll-indicator');
    
    if (streamOutput && indicator) {
        streamOutput.addEventListener('scroll', () => {
            const distanceFromBottom = streamOutput.scrollHeight - streamOutput.scrollTop - streamOutput.clientHeight;
            autoScroll = distanceFromBottom < 50;
            indicator.classList.toggle('visible', !autoScroll);
        });
    }
}

//--------------------
//  MENU SYSTEM
//--------------------

function initializeMenuOverlay() {
    // Create the overlay element
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
    
    // Get menu elements
    const menuButton = document.querySelector('.menu-button');
    const menuPopup = document.querySelector('.menu-popup');
    
    if (!menuButton || !menuPopup) {
        console.error('Menu elements not found');
        return;
    }
    
    // Add click event to the menu button
    menuButton.addEventListener('click', function(event) {
        event.stopPropagation();
        toggleMenu(true);
    });
    
    // Close menu when clicking the overlay
    overlay.addEventListener('click', function() {
        toggleMenu(false);
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            toggleMenu(false);
        }
    });
    
    // Handle menu options
    const newConversationOption = document.querySelector('.new-conversation-option');
    const loginOption = document.querySelector('.login-option');
    const workflowMapOption = document.querySelector('.workflow-map-option');
    
    if (newConversationOption) {
        newConversationOption.addEventListener('click', function() {
            menuPopup.style.display = 'none';
            handleNewConversation();
        });
    }
    
    if (loginOption) {
        loginOption.addEventListener('click', function() {
            menuPopup.style.display = 'none';
            // Add login functionality here
        });
    }
    
    if (workflowMapOption) {
        workflowMapOption.addEventListener('click', function() {
            document.querySelector('.menu-popup').style.display = 'none';
            document.querySelector('.menu-overlay').classList.remove('active');
            if (typeof showWorkflowMap === 'function') {
                showWorkflowMap();
            }
        });
    }
    
    console.log('Menu overlay initialized');
}

function toggleMenu(show) {
    const menuPopup = document.querySelector('.menu-popup');
    const overlay = document.querySelector('.menu-overlay');
    
    if (!menuPopup || !overlay) {
        console.error('Menu elements not found');
        return;
    }
    
    if (show) {
        const buttonRect = menuButton.getBoundingClientRect();
        menuPopup.style.left = `${buttonRect.left}px`;
        menuPopup.style.top = `${buttonRect.bottom + 5}px`; // Position 5px below the button
        
        menuPopup.classList.add('active');
        menuPopup.style.display = 'flex';
        overlay.classList.add('active');
        
        // Initialize threads UI first, then load threads when opening the menu
        if (typeof initializeThreadsUI === 'function') {
            initializeThreadsUI();
        }
    } else {
        menuPopup.classList.remove('active');
        overlay.classList.remove('active');
        
        // Add a slight delay before hiding completely to allow for the transition effect
        setTimeout(() => {
            if (!menuPopup.classList.contains('active')) {
                menuPopup.style.display = 'none';
            }
        }, 200); // Match this to your CSS transition duration
    }
}

function showModalMessage(message, type = 'default') {
    const messageElement = document.getElementById('modal-message');
    if (!messageElement) return;
    
    // Remove existing type classes
    messageElement.classList.remove('success-message', 'error-message', 'loading-message');
    
    // Add appropriate class and update text
    switch(type) {
        case 'loading':
            messageElement.classList.add('loading-message');
            messageElement.textContent = message;
            break;
        case 'success':
            messageElement.classList.add('success-message');
            messageElement.textContent = '✓ ' + message;
            break;
        case 'error':
            messageElement.classList.add('error-message');
            messageElement.textContent = '✗ ' + message;
            break;
        default:
            messageElement.innerHTML = message; // Use innerHTML for the default warning note
    }
}

function initializeDatePickers() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput || !endDateInput) return;
    
    // Set end date to today
    const today = new Date();
    endDateInput.value = today.toISOString().split('T')[0];
    
    // Set start date to 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    startDateInput.value = threeMonthsAgo.toISOString().split('T')[0];
    
    // Add validation
    startDateInput.addEventListener('change', function() {
        if (endDateInput.value && this.value > endDateInput.value) {
            showModalMessage('Start date must be before end date.', 'error');
            this.value = endDateInput.value;
        }
    });
    
    endDateInput.addEventListener('change', function() {
        if (startDateInput.value && this.value < startDateInput.value) {
            showModalMessage('End date must be after start date.', 'error');
            this.value = startDateInput.value;
        }
    });
}


function getSelectedDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        // Default to last 3 months if dates not selected
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
            days: 90
        };
    }
    
    // Calculate days between dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
        start: startDate,
        end: endDate,
        days: diffDays
    };
}

function initializeMetricSelection() {
    const metricsContainer = document.querySelector('.metrics-selection');
    if (!metricsContainer) return;

    // Attach individual click listeners to each metric option
    const metricOptions = metricsContainer.querySelectorAll('.metric-option');

    metricOptions.forEach((metricOption) => {
        // Remove any existing listeners
        const existingListener = metricOption._clickListener;
        if (existingListener) {
            metricOption.removeEventListener('click', existingListener);
        }

        const clickListener = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const checkbox = metricOption.querySelector('input[type="checkbox"]');
            if (!checkbox) return;
            
            // Toggle the checkbox
            checkbox.checked = !checkbox.checked;
            
            // Update the visual state
            metricOption.classList.toggle('selected', checkbox.checked);
        };

        // Store reference and add listener
        metricOption._clickListener = clickListener;
        metricOption.addEventListener('click', clickListener);
    });

    // Initialize selected class for pre-checked metrics
    metricsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        const label = checkbox.closest('.metric-option');
        if (label) {
            label.classList.add('selected');
        }
    });
}

//--------------------
//  PANEL COLLAPSE
//--------------------

function initializePanelCollapse() {
    const collapseButton = document.getElementById('collapseButton');
    const leftPanel = document.getElementById('leftPanel');
    const rightPanel = document.getElementById('rightPanel');
    
    if (!collapseButton || !leftPanel || !rightPanel) {
        console.warn('Panel collapse elements not found');
        return;
    }
    
    function updateButtonPosition(immediate = false) {
        const update = () => {
            if (leftPanel.classList.contains('collapsed')) {
                collapseButton.style.left = '0px';
                collapseButton.style.transform = 'translateY(-50%) rotate(180deg)';
            } else {
                collapseButton.style.left = (leftPanel.offsetWidth - 12) + 'px';
                collapseButton.style.transform = 'translateY(-50%)';
            }
        };

        if (immediate) {
            update();
        } else {
            setTimeout(update, 200); // Delay to match transition duration
        }
    }

    // Set initial button position
    updateButtonPosition(true);

    collapseButton.addEventListener('click', function() {
        leftPanel.classList.toggle('collapsed');
        rightPanel.classList.toggle('expanded');
        updateButtonPosition();
    });

    // Update button position on window resize
    window.addEventListener('resize', () => updateButtonPosition(true));
}

//--------------------
//  NAVIGATION BUTTONS
//--------------------

function initializeNavigationButtons() {
    const prevButton = document.getElementById('prevResponse');
    const nextButton = document.getElementById('nextResponse');
    
    if (!prevButton || !nextButton) {
        console.error('Navigation buttons not found');
        return;
    }
    
    prevButton.addEventListener('click', () => {
        if (typeof navigateResponses === 'function') {
            navigateResponses(-1);
        }
    });
    
    nextButton.addEventListener('click', () => {
        if (typeof navigateResponses === 'function') {
            navigateResponses(1);
        }
    });
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prevResponse');
    const nextButton = document.getElementById('nextResponse');
    const navContainer = document.querySelector('.tab-navigation');

    if (!prevButton || !nextButton || !navContainer) return;

    if (responses.length <= 1) {
        navContainer.style.display = 'none';
    } else {
        navContainer.style.display = 'block';
        prevButton.disabled = currentResponseIndex <= 0;
        nextButton.disabled = currentResponseIndex >= responses.length - 1;
    }

    console.log('Navigation buttons updated:', {
        prevDisabled: prevButton.disabled,
        nextDisabled: nextButton.disabled
    });
}

//--------------------
//  PLANNING SWITCH
//--------------------

function initializePlanningSwitch() {
    const planningSwitch = document.getElementById('planningSwitch');
    
    if (!planningSwitch) {
        console.warn('Planning switch element not found');
        return;
    }
    
    // Initialize state
    planningSwitch.classList.remove('active');
    
    // Attach click event listener
    planningSwitch.addEventListener('click', function(e) {
        const newState = !this.classList.contains('active');
        
        fetch('/update_planning', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ planning: newState })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Planning state updated:', data);
            if (data.current_state) {
                this.classList.add('active');
            } else {
                this.classList.remove('active');
            }
        })
        .catch(error => {
            console.error('Error updating planning state:', error);
            // Revert visual state on error
            if (newState) {
                this.classList.remove('active');
            } else {
                this.classList.add('active');
            }
        });
    });
    
    // Get initial state
    fetch('/get_planning_state')
        .then(response => response.json())
        .then(data => {
            console.log('Initial planning state:', data);
            if (data.planning_enabled) {
                planningSwitch.classList.add('active');
            } else {
                planningSwitch.classList.remove('active');
            }
        })
        .catch(error => {
            console.error('Error getting planning state:', error);
        });
}

//--------------------
//  SUGGEST QUESTIONS
//--------------------

function initializeSuggestQuestions() {
    const suggestQuestions = document.getElementById('suggestQuestions');
    const branchingSliderPopup = document.getElementById('branchingSliderPopup');
    const branchingIcons = document.querySelectorAll('.branching-icon');
    
    if (!suggestQuestions) {
        console.warn('Suggest questions element not found');
        return;
    }
    
    // Show popup on hover
    suggestQuestions.addEventListener('mouseenter', function() {
        branchingSliderPopup.style.display = 'flex';
    });
    
    // Hide popup when leaving both button and popup
    suggestQuestions.addEventListener('mouseleave', function() {
        setTimeout(() => {
            if (!branchingSliderPopup.matches(':hover') && !suggestQuestions.matches(':hover')) {
                branchingSliderPopup.style.display = 'none';
            }
        }, 100);
    });
    
    branchingSliderPopup.addEventListener('mouseleave', function() {
        setTimeout(() => {
            if (!branchingSliderPopup.matches(':hover') && !suggestQuestions.matches(':hover')) {
                branchingSliderPopup.style.display = 'none';
            }
        }, 100);
    });
    
    // Handle icon clicks
    branchingIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            const branchingCvValue = parseInt(this.getAttribute('data-value'));
            const queryInput = document.getElementById('queryInput');
            
            if (!queryInput) return;
            
            // Clear the input and submit with selected branching_cv
            queryInput.value = 'User requested variations of the enquiry';
            
            if (typeof handleQuerySubmit === 'function') {
                handleQuerySubmit({branching_cv: branchingCvValue});
            }
            answerTabInteractive = true;
            
            // Hide the popup after submission
            branchingSliderPopup.style.display = 'none';
        });
    });
}

//--------------------
//  TEXTAREA RESIZE
//--------------------

function initializeTextareaResize() {
    const queryInput = document.getElementById('queryInput');
    
    if (!queryInput) {
        console.warn('Query input element not found');
        return;
    }
    
    queryInput.addEventListener('input', function() {
        this.style.height = '60px';  // Reset to minimum height
        const newHeight = Math.max(60, this.scrollHeight); // Don't go below 60px
        this.style.height = newHeight + 'px';
    });
}

//--------------------
//  KEYBOARD SHORTCUTS
//--------------------

function initializeKeyboardShortcuts() {
    const queryInput = document.getElementById('queryInput');
    
    // Handle query submission with Ctrl+Enter or Cmd+Enter
    if (queryInput) {
        queryInput.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (typeof handleQuerySubmit === 'function') {
                    handleQuerySubmit();
                }
            }
        });
    }
    
    // Handle show workflow map with Ctrl+M or Cmd+M
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            if (typeof showWorkflowMap === 'function') {
                showWorkflowMap();
            }
        }
    });
}

//--------------------
//  NEW CONVERSATION
//--------------------

async function handleNewConversation() {
    try {
        const response = await fetch('/new_conversation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok when starting new conversation');
        }
        
        const data = await response.json();
        console.log('New conversation started:', data);
        
        // Clear local JS state variables
        responses = [];
        await localforage.removeItem('responses');
        currentResponseIndex = -1;
        currentDatasetName = null; 
        auxiliaryDatasetCount = 0; 

        currentOntologyState.isActive = false;
        currentOntologyState.fileName = null;
        currentOntologyState.pillId = null;

        // Clear the visual pills container
        const pillsContainer = document.getElementById('datasetStatusPillsContainer');
        if (pillsContainer) {
            pillsContainer.innerHTML = ''; 
        }

        updateNavigationButtons();
        
        // Reload the page with a flag indicating new conversation
        window.location.href = window.location.pathname + '?new=true';
    } catch (error) {
        console.error('Error starting new conversation:', error);
        alert('Error starting new conversation: ' + error.message);
    }
}

//--------------------
//  GENERIC TOAST SYSTEM
//--------------------

function initializeGenericToast() {
    const toast = document.getElementById('summaryPopup');
    const closeButton = toast.querySelector('.close-button');

    if (!toast || !closeButton) {
        console.warn('Generic toast elements not found');
        return;
    }

    closeButton.addEventListener('click', closeGenericToast);

    // Prevent auto-hide when hovering over the toast
    toast.addEventListener('mouseenter', function() {
        if (popupTimeout) {
            clearTimeout(popupTimeout);
            popupTimeout = null;
        }
    });

    // Restart auto-hide timer when leaving the toast
    toast.addEventListener('mouseleave', function() {
        startToastTimer();
    });
}

function showGenericToast(message, duration = 5000) {
    const toast = document.getElementById('summaryPopup');
    const toastContent = document.getElementById('summaryContent');

    if (!toast || !toastContent) {
        console.error('Generic toast elements not found');
        return;
    }

    if (popupTimeout) {
        clearTimeout(popupTimeout);
        popupTimeout = null;
    }

    toastContent.innerHTML = message;

    toast.className = 'summary-popup';
    toast.classList.add('system-message');

    toast.style.display = 'block';

    if (duration > 0) {
        popupTimeout = setTimeout(() => {
            closeGenericToast();
        }, duration);
    }
}

function startToastTimer(duration = 5000) {
    if (popupTimeout) {
        clearTimeout(popupTimeout);
    }

    popupTimeout = setTimeout(() => {
        closeGenericToast();
    }, duration);
}

function closeGenericToast() {
    const toast = document.getElementById('summaryPopup');

    if (toast) {
        toast.style.display = 'none';
    }

    if (popupTimeout) {
        clearTimeout(popupTimeout);
        popupTimeout = null;
    }
}