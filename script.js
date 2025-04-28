document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchTermInput = document.getElementById('search-term');
    const filterPhase = document.getElementById('filter-phase');
    const filterStatus = document.getElementById('filter-status');
    const resultsBody = document.getElementById('results-table-body');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const resultsCount = document.getElementById('results-count');
    const paginationDiv = document.getElementById('pagination');

    let currentPage = 1;
    const pageSize = 20;
    let totalStudies = 0;
    let sortField = 'NCTId';
    let sortDirection = 'asc';

    // Form submission handler
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentPage = 1;
        await fetchData();
    });

    // Sort handler
    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const newSortField = header.getAttribute('data-sort');
            if (sortField === newSortField) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = newSortField;
                sortDirection = 'asc';
            }
            fetchData();
        });
    });

    async function fetchData() {
        showLoading();
        hideError();

        const expr = buildExpr();
        const encodedExpr = encodeURIComponent(expr);
        const sortParam = `${sortField}:${sortDirection}`;
        const minRnk = (currentPage - 1) * pageSize + 1;
        const maxRnk = currentPage * pageSize;

        const url = `https://clinicaltrials.gov/api/query/study_fields?expr=${encodedExpr}&fields=NCTId,BriefTitle,Phase,OverallStatus,LocationCity,StartDate&min_rnk=${minRnk}&max_rnk=${maxRnk}&sort=${sortParam}&fmt=json`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            if (data.StudyFieldsResponse) {
                handleResponse(data.StudyFieldsResponse);
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    }

    function buildExpr() {
        let expr = searchTermInput.value.trim();
        const phase = filterPhase.value;
        const status = filterStatus.value;

        if (phase) expr += ` AND AREA[Phase]${phase}`;
        if (status) expr += ` AND AREA[OverallStatus]${status}`;

        return expr || '*'; // Fallback to match all if empty
    }

    function handleResponse(response) {
        const studies = response.StudyFields || [];
        totalStudies = parseInt(response.NStudiesFound) || 0;

        updateResultsCount(totalStudies);
        renderTable(studies);
        renderPagination();
    }

    function renderTable(studies) {
        resultsBody.innerHTML = studies.length === 0 ? 
            '<tr><td colspan="6" class="text-center py-6 text-gray-500">No results found</td></tr>' :
            studies.map(study => {
                const nctId = study.NCTId?.[0] || 'N/A';
                const title = study.BriefTitle?.[0] || 'N/A';
                const phase = study.Phase?.[0] || 'N/A';
                const status = study.OverallStatus?.[0] || 'N/A';
                const location = study.LocationCity?.join(', ') || 'N/A';
                const startDate = study.StartDate?.[0] ? 
                    new Date(study.StartDate[0]).toLocaleDateString() : 'N/A';

                return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-2 text-sm text-gray-700">${nctId}</td>
                        <td class="px-4 py-2 text-sm text-gray-900">${title}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">${phase}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">${status}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">${location}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">${startDate}</td>
                    </tr>
                `;
            }).join('');
    }

    function renderPagination() {
        paginationDiv.innerHTML = '';
        const totalPages = Math.ceil(totalStudies / pageSize);

        if (totalPages <= 1) return;

        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        const prevButton = createPaginationButton('←', currentPage > 1, () => {
            currentPage--;
            fetchData();
        });
        paginationDiv.appendChild(prevButton);

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const button = createPaginationButton(i, true, () => {
                currentPage = i;
                fetchData();
            }, i === currentPage);
            paginationDiv.appendChild(button);
        }

        // Next button
        const nextButton = createPaginationButton('→', currentPage < totalPages, () => {
            currentPage++;
            fetchData();
        });
        paginationDiv.appendChild(nextButton);
    }

    function createPaginationButton(text, enabled, onClick, isActive = false) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `px-3 py-1 rounded-md transition-colors ${
            isActive ? 'bg-indigo-600 text-white' : 
            enabled ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-default'
        }`;
        if (enabled) {
            button.addEventListener('click', onClick);
        }
        return button;
    }

    function showLoading() {
        loading.classList.remove('hidden');
        resultsBody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-gray-500">Loading...</td></tr>';
    }

    function hideLoading() {
        loading.classList.add('hidden');
    }

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    function updateResultsCount(total) {
        resultsCount.textContent = `${total} ${total === 1 ? 'study' : 'studies'} found`;
    }
});
