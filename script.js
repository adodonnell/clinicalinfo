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
        sort: `${currentSortDirection === 'desc' ? '-' : ''}${currentSortField}`,
        ...(pageToken && { pageToken: pageToken })
    });

    try {
        loadingIndicator.classList.remove('hidden');
        errorMessageDiv.classList.add('hidden');
        
        const response = await fetch(`${API_BASE_URL}?${params}`);
        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        const data = JSON.parse(responseText);
        currentPageToken = data.nextPageToken || null;
        return data;

    } catch (error) {
        console.error('Fetch error:', error);
        errorTextSpan.textContent = error.message;
        errorMessageDiv.classList.remove('hidden');
        throw error;
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const [year, month] = dateStr.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
        });
    } catch {
        return dateStr;
    }
}

function renderResults(data) {
    resultsTableBody.innerHTML = '';
    
    if (!data?.studies?.length) {
        resultsTableBody.innerHTML = `
            <tr><td colspan="6" class="text-center py-6 text-gray-500">No trials found</td></tr>
        `;
        return;
    }

    data.studies.forEach(study => {
        const protocol = study.protocolSection;
        const row = document.createElement('tr');
        row.className = 'text-sm text-gray-700 hover:bg-blue-50';
        row.innerHTML = `
            <td class="font-medium">
                <a href="https://clinicaltrials.gov/study/${protocol.identificationModule.nctId}" 
                   target="_blank" 
                   class="text-indigo-600 hover:underline">
                    ${protocol.identificationModule.nctId}
                </a>
            </td>
            <td class="max-w-[300px]">${protocol.identificationModule.briefTitle}</td>
            <td>${protocol.designModule?.phases?.[0]?.replace('PHASE', 'Phase ') || 'N/A'}</td>
            <td>${protocol.statusModule.overallStatus}</td>
            <td>${protocol.contactsLocationsModule?.locations?.[0]?.city || 'N/A'}</td>
            <td>${formatDate(protocol.statusModule.startDate)}</td>
        `;
        resultsTableBody.appendChild(row);
    });

    resultsCount.textContent = `Showing ${data.studies.length} results`;
    renderPagination(data.nextPageToken);
}

function renderPagination(nextToken) {
    paginationDiv.innerHTML = '';
    
    const prevButton = createPaginationButton('Previous', currentPageToken, !currentPageToken);
    const nextButton = createPaginationButton('Next', nextToken, !nextToken);

    paginationDiv.append(prevButton, nextButton);
}

function createPaginationButton(label, token, isDisabled) {
    const button = document.createElement('button');
    button.textContent = label;
    button.className = `px-4 py-2 rounded-md ${isDisabled 
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`;
    button.disabled = isDisabled;
    
    if (!isDisabled) {
        button.addEventListener('click', () => {
            fetchData(
                searchTermInput.value.trim(),
                phaseFilter.value,
                statusFilter.value,
                token
            ).then(renderResults);
        });
    }
    
    return button;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    currentPageToken = null;
    
    const data = await fetchData(
        searchTermInput.value.trim(),
        phaseFilter.value,
        statusFilter.value
    );
    
    renderResults(data);
});

tableHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const sortField = header.dataset.sort;
        
        if (sortField === currentSortField) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortField = sortField;
            currentSortDirection = 'desc';
        }
        
        fetchData(
            searchTermInput.value.trim(),
            phaseFilter.value,
            statusFilter.value
        ).then(renderResults);
    });
});
