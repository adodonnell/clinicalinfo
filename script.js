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
const tableHeaders = document.querySelectorAll('th[data-sort]');

const API_BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';
const PAGE_SIZE = 25;
let currentSortField = 'StartDate';
let currentSortDirection = 'desc';
let currentPageToken = null;

async function fetchData(searchTerm, phase, status, pageToken = null) {
    const params = new URLSearchParams({
        pageSize: PAGE_SIZE,
        fields: 'NCTId,BriefTitle,Phase,OverallStatus,LocationCity,LocationFacility,StartDate',
        ...(searchTerm && { 'query.term': searchTerm }),
        ...(phase && { 'filter.phase': phase }),
        ...(status && { 'filter.overallStatus': status }),
        sort: `${currentSortDirection ===
