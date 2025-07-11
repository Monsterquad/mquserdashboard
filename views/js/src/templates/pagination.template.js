
    /**
     * Affiche la pagination
     */
    export const paginationTemplate = (pagination) => {
        const { page, pages } = pagination;
        let paginationHtml = '<div class="pagination-wrapper"><ul class="pagination">';

        // Bouton précédent
        paginationHtml += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="dashboardManager.goToOrderPage(${page - 1}); return false;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </a>
            </li>
        `;

        // Numéros de page avec ellipses
        const maxVisible = 5;
        let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
        let endPage = Math.min(pages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // Première page si nécessaire
        if (startPage > 1) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="dashboardManager.goToOrderPage(1); return false;">1</a>
                </li>
            `;
            if (startPage > 2) {
                paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Pages visibles
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="dashboardManager.goToOrderPage(${i}); return false;">${i}</a>
                </li>
            `;
        }

        // Dernière page si nécessaire
        if (endPage < pages) {
            if (endPage < pages - 1) {
                paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="dashboardManager.goToOrderPage(${pages}); return false;">${pages}</a>
                </li>
            `;
        }

        // Bouton suivant
        paginationHtml += `
            <li class="page-item ${page === pages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="dashboardManager.goToOrderPage(${page + 1}); return false;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
            </li>
        `;

        paginationHtml += '</ul></div>';
        return paginationHtml;
    }