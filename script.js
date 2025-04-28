// DOM Elements
const form = document.getElementById('search-form');
const searchTermInput = document.getElementById('search-term');
const phaseFilter = document.getElementById('filter-phase');
const statusFilter = document.getElementById('filter-status');
const resultsTableBody = document.getElementById('results-table-body');
const resultsCount = document.getElementById('results-count');
const loadingIndicator = document.getElementById('loading');
const errorMessageDiv = document.getElementById('error-message');
const errorTextSpan = document.getElementById('error-text');
const paginationDiv = document.getElementById('pagination');
const tableHeaders = document.querySelectorAll('#results-area th[data-sort]');

// Constants and Variables
const API_BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';
const PAGE_SIZE = 25;
let currentNextPageToken = null;
let currentPrevPageToken = null;
let currentSortField = 'StartDate';
let currentSortDirection = 'desc';
let currentSearchTerm = '';
let currentPhaseFilter = '';
let currentStatusFilter = '';

// Helper Functions
function displayError(message) { /* ... */ }
function clearError() { /* ... */ }
function formatDate(dateStr) { /* ... */ }
function formatPhases(phases) { /* ... */ }
function updateSortIndicators() { /* ... */ }

// Display Logic
function displayResults(data) { /* ... */ }

// Pagination Logic
function updatePagination(prevPageToken, nextPageToken) { /* ... */ }

// Data Fetching
async function fetchData(searchTerm, phase, status, pageToken = null) { /* ... */ }

// Event Listeners
form.addEventListener('submit', (event) => { /* ... */ });
tableHeaders.forEach(header => { /* ... */ });

// Initial Setup
resultsTableBody.innerHTML = `<tr><td colspan="10" class="text-center py-6 text-gray-500">Enter search criteria and click Search to begin.</td></tr>`;
updateSortIndicators();
