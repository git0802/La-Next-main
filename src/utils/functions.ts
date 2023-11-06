export function formatDateToRelative(dateString: string): string {
    const currentDate = new Date();
    const dateToCompare = new Date(dateString);

    const timeDifference = currentDate.getTime() - dateToCompare.getTime();
    const secondsDifference = Math.floor(timeDifference / 1000);
    const minutesDifference = Math.floor(secondsDifference / 60);
    const hoursDifference = Math.floor(minutesDifference / 60);
    const daysDifference = Math.floor(hoursDifference / 24);

    if (secondsDifference < 60) {
        return `now`;
    } else if (minutesDifference === 1) {
        return "1 minute ago";
    } else if (minutesDifference < 60) {
        return `${minutesDifference} minutes ago`;
    } else if (hoursDifference === 1) {
        return "1 hour ago";
    } else if (hoursDifference < 24) {
        return `${hoursDifference} hours ago`;
    } else if (daysDifference === 1) {
        return "1 day ago";
    } else if (daysDifference < 5) {
        return `${daysDifference} days ago`;
    } else if (dateToCompare.getFullYear() === currentDate.getFullYear()) {
        const month = dateToCompare.toLocaleString('default', { month: 'short' });
        const day = dateToCompare.getDate();
        return `${day} ${month}`;
    } else {
        const year = dateToCompare.getFullYear();
        const month = dateToCompare.toLocaleString('default', { month: 'short' });
        const day = dateToCompare.getDate();
        return `${day} ${month} ${year}`;
    }
}