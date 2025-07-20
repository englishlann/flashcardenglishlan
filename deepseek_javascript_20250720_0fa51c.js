// Global variables
let wordsData = {};
let notesData = [];
let progressData = [];
let testData = {
    descriptive: [],
    multipleChoice: [],
    fillBlank: []
};
let currentTab = 'home';
let calendarMode = 'persian'; // 'persian' or 'gregorian'
let calculatorDisplayValue = '0';
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();
let currentPersianDate = getCurrentPersianDate();
let currentPersianMonth = currentPersianDate.month;
let currentPersianYear = currentPersianDate.year;
let mcTestInterval;
let mcTestTimeLeft = 0;
let isDarkMode = false;
let editingNoteId = null;
let noteImageFile = null;
let wordImageFile = null;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const sidebarClose = document.getElementById('sidebarClose');
const homeBtn = document.getElementById('homeBtn');
const tabContents = document.querySelectorAll('.tab-content');
const tabLinks = document.querySelectorAll('.sidebar-menu li');
const iranClock = document.getElementById('iranClock');
const nyClock = document.getElementById('nyClock');
const londonClock = document.getElementById('londonClock');
const calendarTitle = document.getElementById('calendarTitle');
const calendarToggle = document.getElementById('calendarToggle');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const calendarBody = document.getElementById('calendarBody');
const wordForm = document.getElementById('wordForm');
const wordCategories = document.getElementById('wordCategories');
const wordModal = document.getElementById('wordModal');
const closeModal = document.getElementById('closeModal');
const plannerContainer = document.getElementById('plannerContainer');
const progressBars = document.getElementById('progressBars');
const testTabs = document.querySelectorAll('.test-tab');
const testContents = document.querySelectorAll('.test-content');
const themeColors = document.querySelectorAll('.theme-color');
const calculatorDisplay = document.getElementById('calculatorDisplay');
const darkModeToggle = document.getElementById('darkModeToggle');
const languageSelect = document.getElementById('languageSelect');
const profilePictureHeader = document.getElementById('profilePictureHeader');
const wordImageUpload = document.getElementById('wordImageUpload');
const wordImagePreview = document.getElementById('wordImagePreview');
const noteImageUpload = document.getElementById('noteImageUpload');
const noteImagePreview = document.getElementById('noteImagePreview');

// Initialize the app
function init() {
    // Load saved data from localStorage
    loadData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize clocks
    updateClocks();
    setInterval(updateClocks, 1000);
    
    // Initialize calendar
    renderCalendar();
    
    // Initialize word categories
    renderWordCategories();
    
    // Initialize planner notes
    renderNotes();
    
    // Initialize progress chart
    renderProgressChart();
    
    // Initialize test questions
    renderTestQuestions();
    
    // Set initial theme
    updateTheme();
}

// Set up event listeners
function setupEventListeners() {
    // Sidebar toggle
    menuBtn.addEventListener('click', toggleSidebar);
    sidebarClose.addEventListener('click', toggleSidebar);
    
    // Home button
    homeBtn.addEventListener('click', () => {
        showTab('home');
        toggleSidebar();
    });
    
    // Tab navigation
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const tabId = e.currentTarget.id.replace('Tab', '');
            showTab(tabId);
            toggleSidebar();
            
            // Update active tab in sidebar
            tabLinks.forEach(item => item.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
    
    // Calendar toggle and navigation
    calendarToggle.addEventListener('click', toggleCalendarMode);
    prevMonthBtn.addEventListener('click', navigateCalendarMonth);
    nextMonthBtn.addEventListener('click', navigateCalendarMonth);
    
    // Word form submission
    wordForm.addEventListener('submit', saveWord);
    
    // Word modal close
    closeModal.addEventListener('click', () => {
        wordModal.style.display = 'none';
    });
    
    // Test tab switching
    testTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTestTab(tabName);
        });
    });
    
    // Theme color selection
    themeColors.forEach(color => {
        color.addEventListener('click', () => {
            themeColors.forEach(c => c.classList.remove('selected'));
            color.classList.add('selected');
            const colorCode = color.getAttribute('data-color');
            document.documentElement.style.setProperty('--primary', `#${colorCode}`);
            localStorage.setItem('primaryColor', colorCode);
        });
    });
    
    // Dark mode toggle
    darkModeToggle.addEventListener('change', toggleDarkMode);
    
    // Language select
    languageSelect.addEventListener('change', changeLanguage);
    
    // Profile picture upload
    document.getElementById('profilePictureUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('profilePicture').src = event.target.result;
                profilePictureHeader.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Word image upload
    wordImageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            wordImageFile = file;
            const reader = new FileReader();
            reader.onload = function(event) {
                wordImagePreview.src = event.target.result;
                wordImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Note image upload
    noteImageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            noteImageFile = file;
            const reader = new FileReader();
            reader.onload = function(event) {
                noteImagePreview.src = event.target.result;
                noteImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === wordModal) {
            wordModal.style.display = 'none';
        }
    });
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('active');
    menuBtn.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
}

// Show specific tab content
function showTab(tabId) {
    // Hide all tab contents
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabId}Content`).classList.add('active');
    
    // Update current tab
    currentTab = tabId;
    
    // Special cases
    if (tabId === 'wordList') {
        renderWordCategories();
    } else if (tabId === 'planner') {
        renderNotes();
    } else if (tabId === 'progress') {
        renderProgressChart();
    } else if (tabId === 'test') {
        renderTestQuestions();
    }
}

// Update clocks with correct time zones
function updateClocks() {
    // Tehran time (UTC+3:30)
    const tehranTime = new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Tehran',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    iranClock.textContent = tehranTime;
    
    // New York time (UTC-4 or UTC-5 depending on DST)
    const nyTime = new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    nyClock.textContent = nyTime;
    
    // London time (UTC+0 or UTC+1 depending on DST)
    const londonTime = new Date().toLocaleTimeString('en-US', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    londonClock.textContent = londonTime;
}

// Toggle calendar mode between Persian and Gregorian
function toggleCalendarMode() {
    calendarMode = calendarMode === 'persian' ? 'gregorian' : 'persian';
    renderCalendar();
}

// Navigate calendar months
function navigateCalendarMonth(e) {
    if (calendarMode === 'gregorian') {
        if (e.currentTarget.id === 'prevMonthBtn') {
            currentCalendarMonth--;
            if (currentCalendarMonth < 0) {
                currentCalendarMonth = 11;
                currentCalendarYear--;
            }
        } else {
            currentCalendarMonth++;
            if (currentCalendarMonth > 11) {
                currentCalendarMonth = 0;
                currentCalendarYear++;
            }
        }
    } else {
        if (e.currentTarget.id === 'prevMonthBtn') {
            currentPersianMonth--;
            if (currentPersianMonth < 1) {
                currentPersianMonth = 12;
                currentPersianYear--;
            }
        } else {
            currentPersianMonth++;
            if (currentPersianMonth > 12) {
                currentPersianMonth = 1;
                currentPersianYear++;
            }
        }
    }
    renderCalendar();
}

// Render calendar based on current mode
function renderCalendar() {
    if (calendarMode === 'persian') {
        renderPersianCalendar();
        calendarTitle.textContent = `Persian Calendar ${currentPersianYear}/${currentPersianMonth}`;
        calendarToggle.textContent = 'Switch to Gregorian';
    } else {
        renderGregorianCalendar();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        calendarTitle.textContent = `Gregorian Calendar ${monthNames[currentCalendarMonth]} ${currentCalendarYear}`;
        calendarToggle.textContent = 'Switch to Persian';
    }
}

// Get current Persian date
function getCurrentPersianDate() {
    // This uses the Persian calendar algorithm
    const gregDate = new Date();
    const gYear = gregDate.getFullYear();
    const gMonth = gregDate.getMonth() + 1;
    const gDay = gregDate.getDate();
    
    // Persian calendar constants
    const pYear = gYear - 621;
    const pArray = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    
    // Calculate Persian month and day
    let pMonth, pDay;
    if (gMonth > 2 || (gMonth === 2 && gDay > 20)) {
        // After Farvardin 1st
        if (gDay > 20) {
            pDay = gDay - 20;
            pMonth = gMonth - 1;
        } else {
            pDay = gDay + 10;
            pMonth = gMonth - 2;
        }
    } else {
        // Before Farvardin 1st
        if (gMonth === 1) {
            pDay = gDay + 10;
            pMonth = 10;
        } else {
            pDay = gDay + 11;
            pMonth = 11;
        }
    }
    
    // Adjust for leap years
    if ((pYear % 4 === 3 && pMonth === 12 && pDay === 30) || 
        (pYear % 4 !== 3 && pMonth === 12 && pDay === 29)) {
        pMonth = 1;
        pDay = 1;
    }
    
    return { year: pYear, month: pMonth, day: pDay };
}

// Render Persian calendar
function renderPersianCalendar() {
    const persianMonths = [
        "Farvardin", "Ordibehesht", "Khordad", 
        "Tir", "Mordad", "Shahrivar", 
        "Mehr", "Aban", "Azar", 
        "Dey", "Bahman", "Esfand"
    ];
    
    const monthName = persianMonths[currentPersianMonth - 1];
    const today = getCurrentPersianDate();
    
    // Clear previous calendar
    calendarBody.innerHTML = '';
    
    // Create header row
    const headerRow = document.createElement('tr');
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    calendarBody.appendChild(headerRow);
    
    // Calculate first day of month
    const firstDay = new Date(
        currentPersianYear + 621, 
        currentPersianMonth < 7 ? currentPersianMonth + 5 : currentPersianMonth - 7,
        1
    ).getDay();
    
    // Days in Persian month
    let daysInMonth;
    if (currentPersianMonth <= 6) {
        daysInMonth = 31;
    } else if (currentPersianMonth <= 11) {
        daysInMonth = 30;
    } else {
        // Check if it's a leap year (Esfand has 30 days in leap years)
        daysInMonth = (currentPersianYear % 4 === 3) ? 30 : 29;
    }
    
    let date = 1;
    for (let i = 0; i < 6; i++) {
        // Stop making rows if we've run out of days
        if (date > daysInMonth) break;
        
        const row = document.createElement('tr');
        
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if (i === 0 && j < firstDay) {
                // Empty cells before first day
                cell.textContent = '';
            } else if (date > daysInMonth) {
                // Empty cells after last day
                cell.textContent = '';
            } else {
                cell.textContent = date;
                if (date === today.day && currentPersianMonth === today.month && currentPersianYear === today.year) {
                    cell.classList.add('today');
                }
                date++;
            }
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
    }
}

// Render Gregorian calendar
function renderGregorianCalendar() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Get first day of month and total days in month
    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
    const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
    const today = new Date();
    
    // Clear previous calendar
    calendarBody.innerHTML = '';
    
    // Create header row
    const headerRow = document.createElement('tr');
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    calendarBody.appendChild(headerRow);
    
    let date = 1;
    for (let i = 0; i < 6; i++) {
        // Stop making rows if we've run out of days
        if (date > daysInMonth) break;
        
        const row = document.createElement('tr');
        
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if (i === 0 && j < firstDay) {
                // Empty cells before first day
                cell.textContent = '';
            } else if (date > daysInMonth) {
                // Empty cells after last day
                cell.textContent = '';
            } else {
                cell.textContent = date;
                if (date === today.getDate() && currentCalendarMonth === today.getMonth() && currentCalendarYear === today.getFullYear()) {
                    cell.classList.add('today');
                }
                date++;
            }
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
    }
}

// Save word to dictionary
function saveWord(e) {
    e.preventDefault();
    
    const wordTitle = document.getElementById('wordTitle').value.trim();
    if (!wordTitle) {
        alert('Please enter a word/title');
        return;
    }
    
    const wordData = {
        title: wordTitle,
        phonetic: document.getElementById('wordPhonetic').value.trim(),
        meaning: document.getElementById('wordMeaning').value.trim(),
        synonyms: document.getElementById('wordSynonyms').value.trim(),
        antonyms: document.getElementById('wordAntonyms').value.trim(),
        example: document.getElementById('wordExample').value.trim(),
        translation: document.getElementById('wordTranslation').value.trim(),
        date: new Date().toLocaleDateString('fa-IR')
    };
    
    // Add image if uploaded
    if (wordImageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            wordData.image = event.target.result;
            saveWordToCategory(wordData);
        };
        reader.readAsDataURL(wordImageFile);
    } else {
        saveWordToCategory(wordData);
    }
}

function saveWordToCategory(wordData) {
    // Get category
    let category = document.getElementById('wordCategory').value;
    const newCategory = document.getElementById('newCategory').value.trim();
    if (newCategory) {
        category = newCategory.toLowerCase().replace(/\s+/g, '-');
        document.getElementById('newCategory').value = '';
    }
    
    // Initialize category if it doesn't exist
    if (!wordsData[category]) {
        wordsData[category] = [];
    }
    
    // Check if word already exists in this category
    const wordExists = wordsData[category].some(word => word.title.toLowerCase() === wordData.title.toLowerCase());
    if (wordExists) {
        alert(`"${wordData.title}" already exists in the ${formatCategoryName(category)} category!`);
        return;
    }
    
    // Add word to category
    wordsData[category].push(wordData);
    
    // Save to localStorage
    saveData();
    
    // Reset form
    wordForm.reset();
    wordImagePreview.style.display = 'none';
    wordImageFile = null;
    
    // Show success message
    alert(`"${wordData.title}" has been saved to ${formatCategoryName(category)} category!`);
    
    // Update word list if we're on that tab
    if (currentTab === 'wordList') {
        renderWordCategories();
    }
}

// Render word categories
function renderWordCategories() {
    wordCategories.innerHTML = '';
    
    if (Object.keys(wordsData).length === 0) {
        wordCategories.innerHTML = '<p>No words saved yet. Create your first word!</p>';
        return;
    }
    
    for (const category in wordsData) {
        if (wordsData[category].length > 0) {
            const categoryBox = document.createElement('div');
            categoryBox.className = 'category-box';
            categoryBox.innerHTML = `
                <div class="category-title">
                    <span>${formatCategoryName(category)}</span>
                    <span>(${wordsData[category].length} words)</span>
                </div>
                <ul class="word-list">
                    ${wordsData[category].map(word => `
                        <li class="word-item" data-category="${category}" data-title="${word.title}">
                            <div class="word-item-header">
                                <div class="word-item-title">
                                    <span>${word.title}</span>
                                    <button class="pronounce-btn" onclick="pronounceWord('${word.title}')" title="Pronounce">
                                        <i class="fas fa-volume-up"></i>
                                    </button>
                                </div>
                                <div class="word-actions">
                                    <button class="btn btn-sm" onclick="viewWordDetail('${category}', '${word.title}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteWord('${category}', '${word.title}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            ${word.translation ? `<div class="word-translation">${word.translation}</div>` : ''}
                            ${word.image ? `<img src="${word.image}" class="word-item-image">` : ''}
                        </li>
                    `).join('')}
                </ul>
            `;
            wordCategories.appendChild(categoryBox);
        }
    }
}

// Pronounce word using Web Speech API
function pronounceWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech is not supported in your browser');
    }
}

// Search words
function searchWords() {
    const searchTerm = document.getElementById('wordSearch').value.toLowerCase();
    const wordItems = document.querySelectorAll('.word-item');
    
    wordItems.forEach(item => {
        const wordTitle = item.getAttribute('data-title').toLowerCase();
        if (wordTitle.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Search notes
function searchNotes() {
    const searchTerm = document.getElementById('noteSearch').value.toLowerCase();
    const notes = document.querySelectorAll('.planner-note');
    
    notes.forEach(note => {
        const title = note.querySelector('.planner-note-title span:first-child').textContent.toLowerCase();
        const content = note.querySelector('.planner-note-content').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || content.includes(searchTerm)) {
            note.style.display = 'block';
        } else {
            note.style.display = 'none';
        }
    });
}

// Format category name for display
function formatCategoryName(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// View word detail
function viewWordDetail(category, title) {
    // Find the word in our data
    const word = wordsData[category].find(w => w.title === title);
    
    if (word) {
        // Update modal content
        document.getElementById('modalWordTitle').textContent = word.title;
        
        const modalContent = document.getElementById('modalWordContent');
        modalContent.innerHTML = `
            ${word.image ? `<img src="${word.image}" class="word-detail-image" id="modalWordImage" style="display: block;">` : ''}
            <div class="word-detail-section">
                <h3>Phonetic:</h3>
                <p>${word.phonetic || 'N/A'}</p>
            </div>
            <div class="word-detail-section">
                <h3>Meaning:</h3>
                <p>${word.meaning || 'N/A'}</p>
            </div>
            <div class="word-detail-section">
                <h3>Synonyms:</h3>
                <p>${word.synonyms || 'N/A'}</p>
            </div>
            <div class="word-detail-section">
                <h3>Antonyms:</h3>
                <p>${word.antonyms || 'N/A'}</p>
            </div>
            <div class="word-detail-section">
                <h3>Example:</h3>
                <p>${word.example || 'N/A'}</p>
            </div>
            <div class="word-detail-section">
                <h3>Translation:</h3>
                <p>${word.translation || 'N/A'}</p>
            </div>
            <div class="word-detail-section">
                <h3>Date Added:</h3>
                <p>${word.date || 'N/A'}</p>
            </div>
            <button class="btn" onclick="pronounceWord('${word.title}')">
                <i class="fas fa-volume-up"></i> Pronounce Word
            </button>
        `;
        
        // Show modal
        wordModal.style.display = 'flex';
    }
}

// Delete word
function deleteWord(category, title) {
    if (confirm(`Are you sure you want to delete "${title}" from ${formatCategoryName(category)}?`)) {
        wordsData[category] = wordsData[category].filter(word => word.title !== title);
        
        // Remove category if empty
        if (wordsData[category].length === 0) {
            delete wordsData[category];
        }
        
        // Save to localStorage
        saveData();
        
        // Re-render word list
        renderWordCategories();
    }
}

// Format text in planner
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('noteContent').focus();
}

// Save note to planner
function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').innerHTML.trim();
    
    if (!title || !content) {
        alert('Please enter both title and content');
        return;
    }
    
    if (editingNoteId) {
        // Update existing note
        const noteIndex = notesData.findIndex(note => note.id === editingNoteId);
        if (noteIndex !== -1) {
            notesData[noteIndex].title = title;
            notesData[noteIndex].content = content;
            notesData[noteIndex].date = new Date().toLocaleString();
            
            // Update image if uploaded
            if (noteImageFile) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    notesData[noteIndex].image = event.target.result;
                    saveData();
                    renderNotes();
                    resetNoteForm();
                };
                reader.readAsDataURL(noteImageFile);
            } else {
                saveData();
                renderNotes();
                resetNoteForm();
            }
        }
    } else {
        // Create new note
        const note = {
            id: Date.now(),
            title,
            content,
            date: new Date().toLocaleString()
        };
        
        // Add image if uploaded
        if (noteImageFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                note.image = event.target.result;
                notesData.push(note);
                saveData();
                renderNotes();
                resetNoteForm();
            };
            reader.readAsDataURL(noteImageFile);
        } else {
            notesData.push(note);
            saveData();
            renderNotes();
            resetNoteForm();
        }
    }
}

// Reset note form
function resetNoteForm() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').innerHTML = '';
    noteImagePreview.style.display = 'none';
    noteImageFile = null;
    editingNoteId = null;
}

// Edit note
function editNote(id) {
    const note = notesData.find(n => n.id === id);
    if (note) {
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').innerHTML = note.content;
        
        if (note.image) {
            noteImagePreview.src = note.image;
            noteImagePreview.style.display = 'block';
        } else {
            noteImagePreview.style.display = 'none';
        }
        
        editingNoteId = id;
        document.getElementById('noteTitle').focus();
    }
}

// Render planner notes
function renderNotes() {
    plannerContainer.innerHTML = '';
    
    if (notesData.length === 0) {
        plannerContainer.innerHTML = '<p>No notes yet. Create your first note!</p>';
        return;
    }
    
    notesData.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'planner-note';
        noteElement.innerHTML = `
            <div class="planner-note-title">
                <span>${note.title}</span>
                <span>${note.date}</span>
            </div>
            ${note.image ? `<img src="${note.image}" class="planner-note-image">` : ''}
            <div class="planner-note-content">${note.content}</div>
            <div class="planner-note-actions">
                <button class="btn btn-warning" onclick="editNote(${note.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteNote(${note.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        plannerContainer.appendChild(noteElement);
    });
}

// Delete note
function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notesData = notesData.filter(note => note.id !== id);
        saveData();
        renderNotes();
    }
}

// Add progress item
function addProgressItem() {
    const title = document.getElementById('progressTitle').value.trim();
    const value = parseInt(document.getElementById('progressValue').value);
    const date = document.getElementById('progressDate').value;
    
    if (!title || isNaN(value) || value < 0 || value > 100 || !date) {
        alert('Please enter valid title, progress value (0-100) and date');
        return;
    }
    
    // Create new progress item
    const item = {
        id: Date.now(),
        title,
        value,
        date
    };
    
    // Add to progress array
    progressData.push(item);
    
    // Save to localStorage
    saveData();
    
    // Reset form
    document.getElementById('progressTitle').value = '';
    document.getElementById('progressValue').value = '';
    document.getElementById('progressDate').value = '';
    
    // Render progress chart
    renderProgressChart();
}

// Delete progress item
function deleteProgressItem(id) {
    if (confirm('Are you sure you want to delete this progress item?')) {
        progressData = progressData.filter(item => item.id !== id);
        saveData();
        renderProgressChart();
    }
}

// Render progress chart
function renderProgressChart() {
    progressBars.innerHTML = '';
    
    if (progressData.length === 0) {
        progressBars.innerHTML = '<p>No progress data yet. Add your first progress item!</p>';
        return;
    }
    
    // Sort by date
    progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Limit to 40 items for better performance
    const itemsToShow = progressData.slice(-40);
    
    itemsToShow.forEach(item => {
        const barContainer = document.createElement('div');
        barContainer.className = 'progress-bar';
        barContainer.style.height = `${item.value}%`;
        barContainer.innerHTML = `
            <button class="progress-delete-btn" onclick="deleteProgressItem(${item.id})" title="Delete">
                <i class="fas fa-times"></i>
            </button>
            <div class="progress-value">${item.value}%</div>
            <div class="progress-label">${item.title}<br>${formatDate(item.date)}</div>
        `;
        progressBars.appendChild(barContainer);
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Switch between test tabs
function switchTestTab(tabName) {
    // Update active tab
    testTabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update active content
    testContents.forEach(content => {
        if (content.id === `${tabName}Content`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Save descriptive question
function saveDescriptiveQuestion() {
    const question = document.getElementById('descriptiveQuestion').value.trim();
    const answer = document.getElementById('descriptiveAnswer').value.trim();
    
    if (!question || !answer) {
        alert('Please enter both question and answer');
        return;
    }
    
    // Create new question
    const newQuestion = {
        id: Date.now(),
        question,
        answer
    };
    
    // Add to test data
    testData.descriptive.push(newQuestion);
    
    // Save to localStorage
    saveData();
    
    // Reset form
    document.getElementById('descriptiveQuestion').value = '';
    document.getElementById('descriptiveAnswer').value = '';
    
    // Render questions
    renderTestQuestions();
}

// Save multiple choice question
function saveMCQuestion() {
    const question = document.getElementById('mcQuestion').value.trim();
    const options = Array.from(document.querySelectorAll('.mc-option')).map(opt => opt.value.trim());
    const correctAnswer = parseInt(document.getElementById('mcCorrectAnswer').value);
    const timeLimit = parseInt(document.getElementById('mcTimeLimit').value);
    
    if (!question || options.some(opt => !opt) || isNaN(correctAnswer) || correctAnswer < 1 || correctAnswer > 4 || isNaN(timeLimit)) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    // Create new question
    const newQuestion = {
        id: Date.now(),
        question,
        options,
        correctAnswer,
        timeLimit
    };
    
    // Add to test data
    testData.multipleChoice.push(newQuestion);
    
    // Save to localStorage
    saveData();
    
    // Reset form
    document.getElementById('mcQuestion').value = '';
    document.querySelectorAll('.mc-option').forEach(opt => opt.value = '');
    document.getElementById('mcCorrectAnswer').value = '';
    document.getElementById('mcTimeLimit').value = '5';
    
    // Render questions
    renderTestQuestions();
}

// Start multiple choice test
function startMCTest() {
    if (testData.multipleChoice.length === 0) {
        alert('No multiple choice questions available. Please create some questions first.');
        return;
    }
    
    // Hide question list and show test container
    document.getElementById('mcQuestionsList').style.display = 'none';
    document.getElementById('mcTestContainer').style.display = 'block';
    document.getElementById('mcTestResult').style.display = 'none';
    
    // Set up timer
    mcTestTimeLeft = testData.multipleChoice[0].timeLimit * 60;
    updateMCTestTimer();
    mcTestInterval = setInterval(updateMCTestTimer, 1000);
    
    // Display questions
    const testQuestionsContainer = document.getElementById('mcTestQuestions');
    testQuestionsContainer.innerHTML = '';
    
    testData.multipleChoice.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'test-question';
        questionElement.innerHTML = `
            <div class="test-question-text">${index + 1}. ${question.question}</div>
            <div class="test-question-options">
                ${question.options.map((option, i) => `
                    <div class="test-question-option">
                        <input type="radio" name="mc_${question.id}" id="mc_${question.id}_${i}" value="${i + 1}">
                        <label for="mc_${question.id}_${i}">${option}</label>
                    </div>
                `).join('')}
            </div>
        `;
        testQuestionsContainer.appendChild(questionElement);
    });
}

// Update multiple choice test timer
function updateMCTestTimer() {
    const minutes = Math.floor(mcTestTimeLeft / 60);
    const seconds = mcTestTimeLeft % 60;
    document.getElementById('mcTestTimer').textContent = `Time left: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (mcTestTimeLeft <= 0) {
        clearInterval(mcTestInterval);
        submitMCTest();
    } else {
        mcTestTimeLeft--;
    }
}

// Submit multiple choice test
function submitMCTest() {
    clearInterval(mcTestInterval);
    
    let score = 0;
    testData.multipleChoice.forEach(question => {
        const selectedOption = document.querySelector(`input[name="mc_${question.id}"]:checked`);
        if (selectedOption && parseInt(selectedOption.value) === question.correctAnswer) {
            score++;
        }
    });
    
    const percentage = Math.round((score / testData.multipleChoice.length) * 100);
    const resultClass = percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'danger';
    
    // Show results
    document.getElementById('mcTestContainer').style.display = 'none';
    const resultContainer = document.getElementById('mcTestResult');
    resultContainer.style.display = 'block';
    resultContainer.innerHTML = `
        <h3>Test Results</h3>
        <p>You scored ${score} out of ${testData.multipleChoice.length} (${percentage}%)</p>
        <div class="progress" style="height: 20px; margin: 20px 0; background-color: #e9ecef; border-radius: 4px;">
            <div class="progress-bar bg-${resultClass}" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <button class="btn" onclick="retakeMCTest()">
            <i class="fas fa-redo"></i> Retake Test
        </button>
        <button class="btn btn-success" onclick="backToMCQuestions()">
            <i class="fas fa-list"></i> Back to Questions
        </button>
    `;
}

// Retake multiple choice test
function retakeMCTest() {
    startMCTest();
}

// Back to multiple choice questions
function backToMCQuestions() {
    document.getElementById('mcTestContainer').style.display = 'none';
    document.getElementById('mcTestResult').style.display = 'none';
    document.getElementById('mcQuestionsList').style.display = 'block';
}

// Save fill in the blank question
function saveFillBlankQuestion() {
    const question = document.getElementById('fillBlankQuestion').value.trim();
    const answer = document.getElementById('fillBlankAnswer').value.trim();
    
    if (!question || !answer) {
        alert('Please enter both question and answer');
        return;
    }
    
    // Create new question
    const newQuestion = {
        id: Date.now(),
        question,
        answer
    };
    
    // Add to test data
    testData.fillBlank.push(newQuestion);
    
    // Save to localStorage
    saveData();
    
    // Reset form
    document.getElementById('fillBlankQuestion').value = '';
    document.getElementById('fillBlankAnswer').value = '';
    
    // Render questions
    renderTestQuestions();
}

// Start fill in the blank test
function startFillBlankTest() {
    if (testData.fillBlank.length === 0) {
        alert('No fill in the blank questions available. Please create some questions first.');
        return;
    }
    
    // Hide question list and show test container
    document.getElementById('fillBlankQuestionsList').style.display = 'none';
    document.getElementById('fillBlankTestContainer').style.display = 'block';
    document.getElementById('fillBlankTestResult').style.display = 'none';
    
    // Display questions
    const testQuestionsContainer = document.getElementById('fillBlankTestQuestions');
    testQuestionsContainer.innerHTML = '';
    
    testData.fillBlank.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'test-question';
        
        // Split question at blanks and create input fields
        const parts = question.question.split('___');
        let questionHTML = `<div class="test-question-text">${index + 1}. `;
        
        parts.forEach((part, i) => {
            questionHTML += part;
            if (i < parts.length - 1) {
                questionHTML += `<input type="text" class="form-control fill-blank-input" data-answer="${question.answer}" style="display: inline-block; width: 150px; margin: 0 5px;">`;
            }
        });
        
        questionHTML += `</div>`;
        questionElement.innerHTML = questionHTML;
        testQuestionsContainer.appendChild(questionElement);
    });
}

// Show answers for fill in the blank test
function showFillBlankAnswers() {
    const inputs = document.querySelectorAll('.fill-blank-input');
    
    inputs.forEach(input => {
        input.value = input.dataset.answer;
        input.style.borderColor = 'var(--success)';
    });
}

// Submit fill in the blank test
function submitFillBlankTest() {
    let score = 0;
    const inputs = document.querySelectorAll('.fill-blank-input');
    
    inputs.forEach(input => {
        if (input.value.trim().toLowerCase() === input.dataset.answer.toLowerCase()) {
            score++;
            input.style.borderColor = 'var(--success)';
        } else {
            input.style.borderColor = 'var(--danger)';
        }
    });
    
    const percentage = Math.round((score / inputs.length) * 100);
    const resultClass = percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'danger';
    
    // Show results
    document.getElementById('fillBlankTestContainer').style.display = 'none';
    const resultContainer = document.getElementById('fillBlankTestResult');
    resultContainer.style.display = 'block';
    resultContainer.innerHTML = `
        <h3>Test Results</h3>
        <p>You scored ${score} out of ${inputs.length} (${percentage}%)</p>
        <div class="progress" style="height: 20px; margin: 20px 0; background-color: #e9ecef; border-radius: 4px;">
            <div class="progress-bar bg-${resultClass}" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <button class="btn" onclick="retakeFillBlankTest()">
            <i class="fas fa-redo"></i> Retake Test
        </button>
        <button class="btn btn-success" onclick="backToFillBlankQuestions()">
            <i class="fas fa-list"></i> Back to Questions
        </button>
    `;
}

// Retake fill in the blank test
function retakeFillBlankTest() {
    startFillBlankTest();
}

// Back to fill in the blank questions
function backToFillBlankQuestions() {
    document.getElementById('fillBlankTestContainer').style.display = 'none';
    document.getElementById('fillBlankTestResult').style.display = 'none';
    document.getElementById('fillBlankQuestionsList').style.display = 'block';
}

// Render test questions
function renderTestQuestions() {
    // Descriptive questions
    const descriptiveList = document.getElementById('descriptiveQuestionsList');
    descriptiveList.innerHTML = testData.descriptive.length > 0 ? 
        testData.descriptive.map(q => `
            <div class="question-item">
                <div class="question-text">${q.question}</div>
                <p>Answer: ${q.answer}</p>
                <div class="test-actions">
                    <button class="btn btn-danger" onclick="deleteTestQuestion('descriptive', ${q.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('') : '<p>No descriptive questions yet.</p>';
    
    // Multiple choice questions
    const mcList = document.getElementById('mcQuestionsList');
    mcList.innerHTML = testData.multipleChoice.length > 0 ? 
        testData.multipleChoice.map(q => `
            <div class="question-item">
                <div class="question-text">${q.question}</div>
                <ul class="options-list">
                    ${q.options.map((opt, i) => `
                        <li class="option-item">
                            <input type="radio" name="mc_${q.id}" id="mc_${q.id}_${i}" ${i + 1 === q.correctAnswer ? 'checked' : ''} disabled>
                            <label for="mc_${q.id}_${i}">${opt}</label>
                        </li>
                    `).join('')}
                </ul>
                <p>Time limit: ${q.timeLimit} minutes</p>
                <div class="test-actions">
                    <button class="btn btn-danger" onclick="deleteTestQuestion('multipleChoice', ${q.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <button class="btn btn-success" onclick="startMCTest()">
                        <i class="fas fa-play"></i> Start Test
                    </button>
                </div>
            </div>
        `).join('') : '<p>No multiple choice questions yet.</p>';
    
    // Fill in the blank questions
    const fillBlankList = document.getElementById('fillBlankQuestionsList');
    fillBlankList.innerHTML = testData.fillBlank.length > 0 ? 
        testData.fillBlank.map(q => `
            <div class="question-item">
                <div class="question-text">${q.question.replace(/___/g, '__________')}</div>
                <p>Answer: ${q.answer}</p>
                <div class="test-actions">
                    <button class="btn btn-danger" onclick="deleteTestQuestion('fillBlank', ${q.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <button class="btn btn-success" onclick="startFillBlankTest()">
                        <i class="fas fa-play"></i> Start Test
                    </button>
                </div>
            </div>
        `).join('') : '<p>No fill in the blank questions yet.</p>';
}

// Delete test question
function deleteTestQuestion(type, id) {
    if (confirm('Are you sure you want to delete this question?')) {
        testData[type] = testData[type].filter(q => q.id !== id);
        saveData();
        renderTestQuestions();
    }
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = darkModeToggle.checked;
    document.body.classList.toggle('dark-theme', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
}

// Change language
function changeLanguage() {
    const language = languageSelect.value;
    localStorage.setItem('language', language);
    // In a real app, you would implement language switching logic here
    alert('Language changed. Page will refresh to apply changes.');
    location.reload();
}

// Update theme based on saved preferences
function updateTheme() {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        isDarkMode = true;
        document.body.classList.add('dark-theme');
        darkModeToggle.checked = true;
    }
    
    // Check for saved primary color
    const savedPrimaryColor = localStorage.getItem('primaryColor') || '4361ee';
    document.documentElement.style.setProperty('--primary', `#${savedPrimaryColor}`);
    
    // Update selected color in theme colors
    themeColors.forEach(color => {
        if (color.getAttribute('data-color') === savedPrimaryColor) {
            color.classList.add('selected');
        } else {
            color.classList.remove('selected');
        }
    });
    
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language') || 'en';
    languageSelect.value = savedLanguage;
}

// Save profile
function saveProfile() {
    const profile = {
        name: document.getElementById('profileName').value,
        lastName: document.getElementById('profileLastName').value,
        password: document.getElementById('profilePassword').value,
        birthYear: document.getElementById('profileBirthYear').value,
        birthMonth: document.getElementById('profileBirthMonth').value,
        birthDay: document.getElementById('profileBirthDay').value,
        picture: document.getElementById('profilePicture').src
    };
    
    // Save to localStorage
    localStorage.setItem('profile', JSON.stringify(profile));
    
    // Update profile picture in header
    profilePictureHeader.src = profile.picture;
    
    alert('Profile saved successfully!');
}

// Load profile
function loadProfile() {
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileLastName').value = profile.lastName || '';
        document.getElementById('profilePassword').value = profile.password || '';
        document.getElementById('profileBirthYear').value = profile.birthYear || '';
        document.getElementById('profileBirthMonth').value = profile.birthMonth || '';
        document.getElementById('profileBirthDay').value = profile.birthDay || '';
        
        if (profile.picture) {
            document.getElementById('profilePicture').src = profile.picture;
            profilePictureHeader.src = profile.picture;
        }
    }
}

// Calculator functions
function calculatorInput(value) {
    if (calculatorDisplayValue === '0' && value !== '.') {
        calculatorDisplayValue = value;
    } else {
        calculatorDisplayValue += value;
    }
    calculatorDisplay.textContent = calculatorDisplayValue;
}

function calculatorClear() {
    calculatorDisplayValue = '0';
    calculatorDisplay.textContent = calculatorDisplayValue;
}

function calculatorCalculate() {
    try {
        calculatorDisplayValue = eval(calculatorDisplayValue).toString();
        calculatorDisplay.textContent = calculatorDisplayValue;
    } catch (e) {
        calculatorDisplay.textContent = 'Error';
        calculatorDisplayValue = '0';
    }
}

// Save all data to localStorage
function saveData() {
    localStorage.setItem('wordsData', JSON.stringify(wordsData));
    localStorage.setItem('notesData', JSON.stringify(notesData));
    localStorage.setItem('progressData', JSON.stringify(progressData));
    localStorage.setItem('testData', JSON.stringify(testData));
}

// Load all data from localStorage
function loadData() {
    const savedWords = localStorage.getItem('wordsData');
    const savedNotes = localStorage.getItem('notesData');
    const savedProgress = localStorage.getItem('progressData');
    const savedTests = localStorage.getItem('testData');
    
    if (savedWords) wordsData = JSON.parse(savedWords);
    if (savedNotes) notesData = JSON.parse(savedNotes);
    if (savedProgress) progressData = JSON.parse(savedProgress);
    if (savedTests) testData = JSON.parse(savedTests);
    
    loadProfile();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);