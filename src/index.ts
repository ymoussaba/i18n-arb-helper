let months = ['March', '@Jan', 'Jan', 'Feb', 'Dec'];

// months.sort();

months.sort((a, b) => {
    if (a.replace(/^@/, '') === b.replace(/^@/, '')) {
        return -1;
    }
    return a.replace(/^@/, '').localeCompare(b.replace(/^@/, ''));
});
// months.sort((a, b) => {
//     if (a.replace(/^@/, '') === b.replace(/^@/, '')) {
//         return -1;
//     }
//     return a.replace(/^@/, '').localeCompare(b.replace(/^@/, ''));
// });

console.log(months);