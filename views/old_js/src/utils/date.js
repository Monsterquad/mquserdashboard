/**
 * Formatage de date
 */
export function formatDate(dateString) {
    if (!dateString || dateString === '0000-00-00') return null;

    const date = new Date(dateString);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };

    return date.toLocaleDateString('fr-FR', options);
}