export function getTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffTime = Math.abs(now - past);

    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffSeconds < 60) {
        return `${diffSeconds} second${diffSeconds > 1 ? 's' : ''} ago`;
    } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
}